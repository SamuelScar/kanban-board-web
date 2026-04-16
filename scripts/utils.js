(function attachUtils(global) {
  const Kanban = (global.Kanban = global.Kanban || {});

  function createId(prefix) {
    return prefix + "-" + global.crypto.randomUUID();
  }

  function formatCardCount(count) {
    return count === 1 ? "1 card" : count + " cards";
  }

  Kanban.utils = {
    createId,
    formatCardCount,
  };
})(window);
