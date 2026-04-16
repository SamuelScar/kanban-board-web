(function startApp(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const {
    addCard,
    addColumn,
    createInitialBoardState,
    removeCard,
    removeColumn,
    updateCardTitle,
    updateColumnTitle,
  } = Kanban.state;
  const { confirmCardRemoval, confirmColumnRemoval } = Kanban.alerts;
  const { loadBoardState, saveBoardState } = Kanban.storage;
  const { renderBoard } = Kanban.ui;

  function bootstrap() {
    const boardRoot = document.querySelector("[data-board-root]");

    if (!boardRoot) {
      throw new Error("O container principal do quadro nao foi encontrado.");
    }

    let boardState = loadBoardState() || createInitialBoardState();

    function syncBoard() {
      renderBoard(boardRoot, boardState);
      saveBoardState(boardState);
    }

    function findColumnById(columnId) {
      return boardState.columns.find(function matchColumn(column) {
        return column.id === columnId;
      });
    }

    async function handleBoardClick(event) {
      const removeCardButton = event.target.closest('[data-action="remove-card"]');

      if (removeCardButton instanceof HTMLButtonElement) {
        const columnElement = removeCardButton.closest("[data-column-id]");

        if (!(columnElement instanceof HTMLElement)) {
          return;
        }

        const shouldRemoveCard = await confirmCardRemoval();

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
          column.cards.length
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
      }
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
    syncBoard();
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})(window);
