(function startApp(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const {
    addCard,
    addColumn,
    createInitialBoardState,
    moveColumn,
    moveCard,
    removeCard,
    removeColumn,
    updateCardColor,
    updateCardDescription,
    updateCardTitle,
    updateColumnTitle,
  } = Kanban.state;
  const {
    confirmCardRemoval,
    confirmColumnRemoval,
    editCardDescription,
  } = Kanban.modal;
  const { bindBoardSortable, bindCardSortables, destroySortables } = Kanban.dragDrop;
  const { loadBoardState, saveBoardState } = Kanban.storage;
  const { renderBoard } = Kanban.ui;

  function bootstrap() {
    const boardRoot = document.querySelector("[data-board-root]");

    if (!boardRoot) {
      throw new Error("O container principal do quadro nao foi encontrado.");
    }

    let boardState = loadBoardState() || createInitialBoardState();
    let preventCardOpenUntil = 0;

    function syncBoard() {
      renderBoard(boardRoot, boardState);
      saveBoardState(boardState);
      bindBoardSortable(boardRoot, {
        onColumnDragStart: function handleColumnDragStart() {
          boardRoot.classList.add("board--column-dragging");
        },
        onColumnDragEnd: function handleColumnDragEnd() {
          boardRoot.classList.remove("board--column-dragging");
        },
        onColumnDrop: function handleColumnDrop(movePayload) {
          boardState = moveColumn(
            boardState,
            movePayload.columnId,
            movePayload.targetIndex
          );
          global.requestAnimationFrame(syncBoard);
        },
      });
      bindCardSortables(boardRoot, {
        onDragStart: function handleDragStart() {
          boardRoot.classList.add("board--dragging");
        },
        onDragEnd: function handleDragEnd() {
          boardRoot.classList.remove("board--dragging");
          preventCardOpenUntil = Date.now() + 250;
        },
        onCardDrop: function handleCardDrop(movePayload) {
          boardState = moveCard(
            boardState,
            movePayload.sourceColumnId,
            movePayload.cardId,
            movePayload.targetColumnId,
            movePayload.targetIndex
          );
          global.requestAnimationFrame(syncBoard);
        },
      });
    }

    function findColumnById(columnId) {
      return boardState.columns.find(function matchColumn(column) {
        return column.id === columnId;
      });
    }

    function findCardByIds(columnId, cardId) {
      const column = findColumnById(columnId);

      if (!column) {
        return null;
      }

      return column.cards.find(function matchCard(card) {
        return card.id === cardId;
      });
    }

    async function handleBoardClick(event) {
      const setCardColorButton = event.target.closest('[data-action="set-card-color"]');

      if (setCardColorButton instanceof HTMLButtonElement) {
        const columnElement = setCardColorButton.closest("[data-column-id]");

        if (!(columnElement instanceof HTMLElement)) {
          return;
        }

        boardState = updateCardColor(
          boardState,
          columnElement.dataset.columnId,
          setCardColorButton.dataset.cardId,
          setCardColorButton.dataset.colorValue || ""
        );

        const colorPickerElement = setCardColorButton.closest(".card__color-picker");

        if (colorPickerElement instanceof HTMLDetailsElement) {
          colorPickerElement.removeAttribute("open");
        }

        syncBoard();
        return;
      }

      if (event.target.closest(".card__color-picker")) {
        return;
      }

      const removeCardButton = event.target.closest('[data-action="remove-card"]');

      if (removeCardButton instanceof HTMLButtonElement) {
        const columnElement = removeCardButton.closest("[data-column-id]");

        if (!(columnElement instanceof HTMLElement)) {
          return;
        }

        const shouldRemoveCard = await confirmCardRemoval(removeCardButton);

        if (!shouldRemoveCard) {
          return;
        }

        boardState = removeCard(
          boardState,
          columnElement.dataset.columnId,
          removeCardButton.dataset.cardId
        );
        syncBoard();
        return;
      }

      const removeColumnButton = event.target.closest(
        '[data-action="remove-column"]'
      );

      if (removeColumnButton instanceof HTMLButtonElement) {
        const column = findColumnById(removeColumnButton.dataset.columnId);

        if (!column) {
          return;
        }

        const shouldRemoveColumn = await confirmColumnRemoval(
          column.title,
          column.cards.length,
          removeColumnButton
        );

        if (!shouldRemoveColumn) {
          return;
        }

        boardState = removeColumn(boardState, column.id);
        syncBoard();
        return;
      }

      const addCardButton = event.target.closest('[data-action="add-card"]');

      if (addCardButton instanceof HTMLButtonElement) {
        boardState = addCard(boardState, addCardButton.dataset.columnId);
        syncBoard();
        return;
      }

      const addColumnButton = event.target.closest('[data-action="add-column"]');

      if (addColumnButton instanceof HTMLButtonElement) {
        boardState = addColumn(boardState);
        syncBoard();
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (Date.now() < preventCardOpenUntil) {
        return;
      }

      const cardElement = event.target.closest(".card");

      if (!(cardElement instanceof HTMLElement)) {
        return;
      }

      const columnElement = cardElement.closest("[data-column-id]");

      if (!(columnElement instanceof HTMLElement)) {
        return;
      }

      const card = findCardByIds(
        columnElement.dataset.columnId,
        cardElement.dataset.cardId
      );

      if (!card) {
        return;
      }

      const nextDescription = await editCardDescription(
        card.title,
        card.description || "",
        cardElement
      );

      if (nextDescription === null) {
        return;
      }

      boardState = updateCardDescription(
        boardState,
        columnElement.dataset.columnId,
        card.id,
        nextDescription
      );
      syncBoard();
    }

    function handleBoardChange(event) {
      const target = event.target;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      if (target.dataset.columnTitleInput === "true") {
        boardState = updateColumnTitle(
          boardState,
          target.dataset.columnId,
          target.value
        );
        syncBoard();
        return;
      }

      if (target.dataset.cardTitleInput === "true") {
        const columnElement = target.closest("[data-column-id]");

        if (!(columnElement instanceof HTMLElement)) {
          return;
        }

        boardState = updateCardTitle(
          boardState,
          columnElement.dataset.columnId,
          target.dataset.cardId,
          target.value
        );
        syncBoard();
        return;
      }
    }

    function handleBoardKeyDown(event) {
      const target = event.target;

      if (
        target instanceof HTMLInputElement &&
        event.key === "Enter" &&
        (target.dataset.columnTitleInput === "true" ||
          target.dataset.cardTitleInput === "true")
      ) {
        event.preventDefault();
        target.blur();
      }
    }

    boardRoot.addEventListener("click", handleBoardClick);
    boardRoot.addEventListener("change", handleBoardChange);
    boardRoot.addEventListener("keydown", handleBoardKeyDown);
    global.addEventListener("beforeunload", destroySortables);
    syncBoard();
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})(window);
