  (function attachStorage(global) {
    const Kanban = (global.Kanban = global.Kanban || {});
    const STORAGE_KEY = "kanban-board-web:state";
    const { normalizeHexColor } = Kanban.utils;

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function isValidCard(card) {
    return Boolean(
      card &&
        typeof card === "object" &&
        isNonEmptyString(card.id) &&
        isNonEmptyString(card.title) &&
        (card.description === undefined || typeof card.description === "string") &&
        (card.color === undefined || normalizeHexColor(card.color).length > 0)
    );
  }

  function isValidColumn(column) {
    return Boolean(
      column &&
        typeof column === "object" &&
        isNonEmptyString(column.id) &&
        isNonEmptyString(column.title) &&
        Array.isArray(column.cards) &&
        column.cards.every(isValidCard)
    );
  }

  function isValidBoardState(value) {
    return Boolean(
      value &&
        typeof value === "object" &&
        isNonEmptyString(value.id) &&
        isNonEmptyString(value.title) &&
        Array.isArray(value.columns) &&
        value.columns.every(isValidColumn)
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
