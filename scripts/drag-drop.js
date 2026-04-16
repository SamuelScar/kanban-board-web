(function attachDragAndDrop(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const Sortable = global.Sortable;
  let cardSortables = [];
  let boardSortable = null;

  function destroyBoardSortable() {
    if (!boardSortable) {
      return;
    }

    boardSortable.destroy();
    boardSortable = null;
  }

  function destroyCardSortables() {
    cardSortables.forEach(function destroySortable(sortableInstance) {
      sortableInstance.destroy();
    });
    cardSortables = [];
  }

  function createMovePayload(event) {
    if (
      !(event.from instanceof HTMLElement) ||
      !(event.to instanceof HTMLElement) ||
      !(event.item instanceof HTMLElement)
    ) {
      return null;
    }

    const sourceColumnId = event.from.dataset.columnId;
    const targetColumnId = event.to.dataset.columnId;
    const cardId = event.item.dataset.cardId;

    if (
      !sourceColumnId ||
      !targetColumnId ||
      !cardId ||
      typeof event.oldIndex !== "number" ||
      typeof event.newIndex !== "number"
    ) {
      return null;
    }

    return {
      sourceColumnId,
      targetColumnId,
      cardId,
      sourceIndex: event.oldIndex,
      targetIndex: event.newIndex,
    };
  }

  function createColumnMovePayload(event) {
    if (!(event.item instanceof HTMLElement)) {
      return null;
    }

    const columnId = event.item.dataset.columnId;
    const sourceIndex =
      typeof event.oldDraggableIndex === "number"
        ? event.oldDraggableIndex
        : event.oldIndex;
    const targetIndex =
      typeof event.newDraggableIndex === "number"
        ? event.newDraggableIndex
        : event.newIndex;

    if (
      !columnId ||
      typeof sourceIndex !== "number" ||
      typeof targetIndex !== "number"
    ) {
      return null;
    }

    return {
      columnId,
      sourceIndex,
      targetIndex,
    };
  }

  function bindBoardSortable(rootElement, handlers) {
    destroyBoardSortable();

    if (!Sortable) {
      return;
    }

    const callbacks = handlers || {};

    boardSortable = Sortable.create(rootElement, {
      animation: 180,
      direction: "horizontal",
      draggable: ".column",
      handle: ".column__header",
      filter: "input, button",
      preventOnFilter: false,
      ghostClass: "column--ghost",
      chosenClass: "column--chosen",
      dragClass: "column--dragging",
      onStart: function handleStart() {
        if (typeof callbacks.onColumnDragStart === "function") {
          callbacks.onColumnDragStart();
        }
      },
      onEnd: function handleEnd(event) {
        if (typeof callbacks.onColumnDragEnd === "function") {
          callbacks.onColumnDragEnd();
        }

        const movePayload = createColumnMovePayload(event);

        if (!movePayload) {
          return;
        }

        if (
          movePayload.sourceIndex !== movePayload.targetIndex &&
          typeof callbacks.onColumnDrop === "function"
        ) {
          callbacks.onColumnDrop(movePayload);
        }
      },
    });
  }

  function bindCardSortables(rootElement, handlers) {
    destroyCardSortables();

    if (!Sortable) {
      console.warn(
        "SortableJS nao foi carregado. O arraste de cards ficara indisponivel."
      );
      return;
    }

    const callbacks = handlers || {};
    const listElements = rootElement.querySelectorAll(".column__cards");

    cardSortables = Array.from(listElements).map(function createSortable(listElement) {
      return Sortable.create(listElement, {
        group: "kanban-cards",
        animation: 180,
        delay: 180,
        delayOnTouchOnly: false,
        touchStartThreshold: 4,
        draggable: ".card",
        filter: "input, button",
        preventOnFilter: false,
        ghostClass: "card--ghost",
        chosenClass: "card--chosen",
        dragClass: "card--dragging",
        emptyInsertThreshold: 48,
        onStart: function handleStart() {
          if (typeof callbacks.onDragStart === "function") {
            callbacks.onDragStart();
          }
        },
        onEnd: function handleEnd(event) {
          if (typeof callbacks.onDragEnd === "function") {
            callbacks.onDragEnd();
          }

          const movePayload = createMovePayload(event);

          if (!movePayload) {
            return;
          }

          const didPositionChange =
            movePayload.sourceColumnId !== movePayload.targetColumnId ||
            movePayload.sourceIndex !== movePayload.targetIndex;

          if (
            didPositionChange &&
            typeof callbacks.onCardDrop === "function"
          ) {
            callbacks.onCardDrop(movePayload);
          }
        },
      });
    });
  }

  Kanban.dragDrop = {
    bindBoardSortable,
    bindCardSortables,
    destroyCardSortables: function destroySortables() {
      destroyCardSortables();
      destroyBoardSortable();
    },
  };
})(window);
