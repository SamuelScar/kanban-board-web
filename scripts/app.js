(function startApp(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const { createInitialBoardState } = Kanban.state;
  const { loadBoardState, saveBoardState } = Kanban.storage;
  const { renderBoard } = Kanban.ui;

  function bootstrap() {
    const boardRoot = document.querySelector("[data-board-root]");

    if (!boardRoot) {
      throw new Error("O container principal do quadro nao foi encontrado.");
    }

    const boardState = loadBoardState() || createInitialBoardState();
    saveBoardState(boardState);
    renderBoard(boardRoot, boardState);
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})(window);
