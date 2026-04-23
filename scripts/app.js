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

    function queueSyncBoard() {
      global.requestAnimationFrame(syncBoard);
    }

    function renderAndPersistBoard() {
      renderBoard(boardRoot, boardState);
      saveBoardState(boardState);
    }

    function handleColumnDragStart() {
      boardRoot.classList.add("board--column-dragging");
    }

    function handleColumnDragEnd() {
      boardRoot.classList.remove("board--column-dragging");
    }

    function handleColumnDrop(movePayload) {
      boardState = moveColumn(boardState, movePayload.columnId, movePayload.targetIndex);
      queueSyncBoard();
    }

    function handleCardDragStart() {
      boardRoot.classList.add("board--dragging");
    }

    function handleCardDragEnd() {
      boardRoot.classList.remove("board--dragging");
      preventCardOpenUntil = Date.now() + 250;
    }

    function handleCardDrop(movePayload) {
      boardState = moveCard(
        boardState,
        movePayload.sourceColumnId,
        movePayload.cardId,
        movePayload.targetColumnId,
        movePayload.targetIndex
      );
      queueSyncBoard();
    }

    function bindBoardInteractions() {
      bindBoardSortable(boardRoot, {
        onColumnDragStart: handleColumnDragStart,
        onColumnDragEnd: handleColumnDragEnd,
        onColumnDrop: handleColumnDrop,
      });

      bindCardSortables(boardRoot, {
        onDragStart: handleCardDragStart,
        onDragEnd: handleCardDragEnd,
        onCardDrop: handleCardDrop,
      });
    }

    function syncBoard() {
      renderAndPersistBoard();
      bindBoardInteractions();
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

    function getClosestElement(target, selector) {
      if (!(target instanceof Element)) {
        return null;
      }

      const element = target.closest(selector);
      return element instanceof HTMLElement ? element : null;
    }

    function getClosestButton(target, selector) {
      const element = getClosestElement(target, selector);
      return element instanceof HTMLButtonElement ? element : null;
    }

    function getColumnElement(target) {
      return getClosestElement(target, "[data-column-id]");
    }

    function getCardContext(target) {
      const cardElement = getClosestElement(target, ".card");

      if (!cardElement) {
        return null;
      }

      const columnElement = getColumnElement(cardElement);

      if (!columnElement) {
        return null;
      }

      const card = findCardByIds(columnElement.dataset.columnId, cardElement.dataset.cardId);

      return card
        ? {
            card,
            cardElement,
            columnElement,
          }
        : null;
    }

    function handleSetCardColorClick(buttonElement) {
      const columnElement = getColumnElement(buttonElement);

      if (!columnElement) {
        return;
      }

      boardState = updateCardColor(
        boardState,
        columnElement.dataset.columnId,
        buttonElement.dataset.cardId,
        buttonElement.dataset.colorValue || ""
      );

      const colorPickerElement = getClosestElement(buttonElement, ".card__color-picker");

      if (colorPickerElement instanceof HTMLDetailsElement) {
        colorPickerElement.removeAttribute("open");
      }

      syncBoard();
    }

    async function handleRemoveCardClick(buttonElement) {
      const columnElement = getColumnElement(buttonElement);

      if (!columnElement) {
        return;
      }

      const shouldRemoveCard = await confirmCardRemoval(buttonElement);

      if (!shouldRemoveCard) {
        return;
      }

      boardState = removeCard(
        boardState,
        columnElement.dataset.columnId,
        buttonElement.dataset.cardId
      );
      syncBoard();
    }

    async function handleRemoveColumnClick(buttonElement) {
      const column = findColumnById(buttonElement.dataset.columnId);

      if (!column) {
        return;
      }

      const shouldRemoveColumn = await confirmColumnRemoval(
        column.title,
        column.cards.length,
        buttonElement
      );

      if (!shouldRemoveColumn) {
        return;
      }

      boardState = removeColumn(boardState, column.id);
      syncBoard();
    }

    function handleAddCardClick(buttonElement) {
      boardState = addCard(boardState, buttonElement.dataset.columnId);
      syncBoard();
    }

    function handleAddColumnClick() {
      boardState = addColumn(boardState);
      syncBoard();
    }

    async function handleActionClick(buttonElement) {
      switch (buttonElement.dataset.action) {
        case "set-card-color":
          handleSetCardColorClick(buttonElement);
          return;
        case "remove-card":
          await handleRemoveCardClick(buttonElement);
          return;
        case "remove-column":
          await handleRemoveColumnClick(buttonElement);
          return;
        case "add-card":
          handleAddCardClick(buttonElement);
          return;
        case "add-column":
          handleAddColumnClick();
          return;
      }
    }

    async function handleCardOpen(target) {
      if (Date.now() < preventCardOpenUntil) {
        return;
      }

      const cardContext = getCardContext(target);

      if (!cardContext) {
        return;
      }

      const nextDescription = await editCardDescription(
        cardContext.card.title,
        cardContext.card.description || "",
        cardContext.cardElement
      );

      if (nextDescription === null) {
        return;
      }

      boardState = updateCardDescription(
        boardState,
        cardContext.columnElement.dataset.columnId,
        cardContext.card.id,
        nextDescription
      );
      syncBoard();
    }

    async function handleBoardClick(event) {
      const target = event.target;
      const actionButton = getClosestButton(target, "[data-action]");

      if (actionButton) {
        await handleActionClick(actionButton);
        return;
      }

      if (getClosestElement(target, ".card__color-picker")) {
        return;
      }

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      await handleCardOpen(target);
    }

    function handleColumnTitleChange(inputElement) {
      boardState = updateColumnTitle(
        boardState,
        inputElement.dataset.columnId,
        inputElement.value
      );
      syncBoard();
    }

    function handleCardTitleChange(inputElement) {
      const columnElement = getColumnElement(inputElement);

      if (!columnElement) {
        return;
      }

      boardState = updateCardTitle(
        boardState,
        columnElement.dataset.columnId,
        inputElement.dataset.cardId,
        inputElement.value
      );
      syncBoard();
    }

    function handleBoardChange(event) {
      const target = event.target;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      if (target.dataset.columnTitleInput === "true") {
        handleColumnTitleChange(target);
        return;
      }

      if (target.dataset.cardTitleInput === "true") {
        handleCardTitleChange(target);
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
