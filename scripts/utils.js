(function attachUtils(global) {
  const Kanban = (global.Kanban = global.Kanban || {});

  function createId(prefix) {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return prefix + "-" + global.crypto.randomUUID();
    }

    return (
      prefix +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function formatCardCount(count) {
    return count === 1 ? "1 card" : count + " cards";
  }

  Kanban.utils = {
    createId,
    normalizeText,
    formatCardCount,
  };
})(window);
