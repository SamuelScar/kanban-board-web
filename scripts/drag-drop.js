/**
 * Encapsula a integracao com o SortableJS.
 * Este modulo cuida da criacao, destruicao e traducao dos eventos de arraste
 * para payloads simples consumidos pela aplicacao.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function attachDragAndDrop(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const Sortable = global.Sortable;
  let cardSortables = [];
  let boardSortable = null;

  /**
   * Remove a instancia responsavel por ordenar colunas.
   *
   * @returns {void}
   */
  function destroyBoardSortable() {
    if (!boardSortable) {
      return;
    }

    boardSortable.destroy();
    boardSortable = null;
  }

  /**
   * Remove todas as instancias responsaveis pelo arraste dos cards.
   *
   * @returns {void}
   */
  function destroyCardSortables() {
    cardSortables.forEach(function destroySortable(sortableInstance) {
      sortableInstance.destroy();
    });
    cardSortables = [];
  }

  /**
   * Limpa todas as instancias do Sortable antes de uma nova vinculacao
   * ou antes de sair da pagina.
   *
   * @returns {void}
   */
  function destroySortables() {
    destroyCardSortables();
    destroyBoardSortable();
  }

  /**
   * Traduz o evento do SortableJS para um payload independente da biblioteca.
   *
   * @param {Sortable.SortableEvent} event Evento bruto do SortableJS.
   * @returns {{
   *   sourceColumnId: string,
   *   targetColumnId: string,
   *   cardId: string,
   *   sourceIndex: number,
   *   targetIndex: number
   * } | null} Dados necessarios para mover um card no estado.
   */
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

  /**
   * Traduz o evento de arraste de colunas para um payload simples.
   * O codigo considera tanto os indices padrao quanto os `draggableIndex`
   * usados pela biblioteca em alguns cenarios.
   *
   * @param {Sortable.SortableEvent} event Evento bruto do SortableJS.
   * @returns {{ columnId: string, sourceIndex: number, targetIndex: number } | null} Dados da movimentacao.
   */
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

  /**
   * Ativa o arraste horizontal das colunas do quadro.
   *
   * @param {HTMLElement} rootElement Elemento raiz que contem as colunas.
   * @param {object} handlers Callbacks opcionais para o ciclo de arraste.
   * @returns {void}
   */
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
      filter: "input, button, select, summary",
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

  /**
   * Ativa o arraste de cards em todas as colunas visiveis no momento.
   *
   * @param {HTMLElement} rootElement Elemento raiz que contem as listas de cards.
   * @param {object} handlers Callbacks opcionais para o ciclo de arraste.
   * @returns {void}
   */
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
        filter: "input, button, select, summary",
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
    destroySortables,
  };
})(window);
