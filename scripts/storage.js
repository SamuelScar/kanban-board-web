(function attachStorage(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const STORAGE_KEY = "kanban-board-web:state";

  function isValidBoardState(value) {
    return Boolean(
      value &&
        typeof value === "object" &&
        Array.isArray(value.columns) &&
        value.columns.every(function validateColumn(column) {
          return (
            column &&
            typeof column === "object" &&
            typeof column.title === "string" &&
            Array.isArray(column.cards)
          );
        })
    );
  }

  function loadBoardState() {
    try {
      const serializedState = global.localStorage.getItem(STORAGE_KEY);

      if (!serializedState) {
        return null;
      }

      const parsedState = JSON.parse(serializedState);
      return isValidBoardState(parsedState) ? parsedState : null;
    } catch (error) {
      console.warn("Nao foi possivel carregar o estado salvo.", error);
      return null;
    }
  }

  function saveBoardState(boardState) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(boardState));
    } catch (error) {
      console.warn("Nao foi possivel salvar o estado atual.", error);
    }
  }

  Kanban.storage = {
    loadBoardState,
    saveBoardState,
  };
})(window);
