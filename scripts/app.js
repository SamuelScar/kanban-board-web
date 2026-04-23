/**
 * Orquestra a inicializacao da aplicacao, conectando estado, interface,
 * persistencia, modal e drag-and-drop. Este e o ponto em que os modulos
 * independentes passam a trabalhar juntos.
 *
 * @param {Window} global Objeto global do navegador.
 */
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

  /**
   * Prepara a aplicacao depois que o DOM foi carregado.
   * A maior parte das funcoes internas existe aqui porque depende do estado
   * vivo do board e da referencia do elemento raiz.
   *
   * @returns {void}
   */
  function bootstrap() {
    const boardRoot = document.querySelector("[data-board-root]");

    if (!boardRoot) {
      throw new Error("O container principal do quadro nao foi encontrado.");
    }

    let boardState = loadBoardState() || createInitialBoardState();
    let preventCardOpenUntil = 0;

    /**
     * Agenda uma nova sincronizacao visual no proximo frame de animacao.
     * Isso evita re-render imediato durante o ciclo do drag-and-drop.
     *
     * @returns {void}
     */
    function queueSyncBoard() {
      global.requestAnimationFrame(syncBoard);
    }

    /**
     * Reconstroi a interface atual e persiste o estado correspondente.
     *
     * @returns {void}
     */
    function renderAndPersistBoard() {
      renderBoard(boardRoot, boardState);
      saveBoardState(boardState);
    }

    /**
     * Marca visualmente que o usuario iniciou o arraste de uma coluna.
     *
     * @returns {void}
     */
    function handleColumnDragStart() {
      boardRoot.classList.add("board--column-dragging");
    }

    /**
     * Remove o estado visual de arraste de coluna.
     *
     * @returns {void}
     */
    function handleColumnDragEnd() {
      boardRoot.classList.remove("board--column-dragging");
    }

    /**
     * Atualiza o estado apos a soltura de uma coluna em nova posicao.
     *
     * @param {{ columnId: string, targetIndex: number }} movePayload Dados da movimentacao.
     * @returns {void}
     */
    function handleColumnDrop(movePayload) {
      boardState = moveColumn(boardState, movePayload.columnId, movePayload.targetIndex);
      queueSyncBoard();
    }

    /**
     * Marca visualmente o arraste de cards para destacar os alvos de drop.
     *
     * @returns {void}
     */
    function handleCardDragStart() {
      boardRoot.classList.add("board--dragging");
    }

    /**
     * Finaliza o estado visual de arraste e bloqueia por alguns milissegundos
     * a abertura do modal do card, evitando cliques acidentais apos o drop.
     *
     * @returns {void}
     */
    function handleCardDragEnd() {
      boardRoot.classList.remove("board--dragging");
      preventCardOpenUntil = Date.now() + 250;
    }

    /**
     * Atualiza o estado apos mover um card dentro do quadro.
     *
     * @param {{
     *   sourceColumnId: string,
     *   cardId: string,
     *   targetColumnId: string,
     *   targetIndex: number
     * }} movePayload Dados da movimentacao.
     * @returns {void}
     */
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

    /**
     * Vincula ou recria todos os comportamentos de drag-and-drop apos cada render.
     *
     * @returns {void}
     */
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

    /**
     * Mantem a interface sincronizada com o estado em memoria.
     * Toda mudanca relevante termina chamando esta funcao.
     *
     * @returns {void}
     */
    function syncBoard() {
      renderAndPersistBoard();
      bindBoardInteractions();
    }

    /**
     * Busca uma coluna pelo identificador.
     *
     * @param {string} columnId Coluna procurada.
     * @returns {object | undefined} Coluna encontrada.
     */
    function findColumnById(columnId) {
      return boardState.columns.find(function matchColumn(column) {
        return column.id === columnId;
      });
    }

    /**
     * Localiza um card a partir do par coluna + card.
     *
     * @param {string} columnId Coluna onde a busca deve acontecer.
     * @param {string} cardId Card procurado.
     * @returns {object | null} Card encontrado ou `null`.
     */
    function findCardByIds(columnId, cardId) {
      const column = findColumnById(columnId);

      if (!column) {
        return null;
      }

      return column.cards.find(function matchCard(card) {
        return card.id === cardId;
      });
    }

    /**
     * Faz `closest` com protecao de tipo para evitar erros quando o alvo do
     * evento nao e um elemento DOM.
     *
     * @param {EventTarget | null} target Alvo bruto do evento.
     * @param {string} selector Seletor CSS usado na busca.
     * @returns {HTMLElement | null} Elemento encontrado ou `null`.
     */
    function getClosestElement(target, selector) {
      if (!(target instanceof Element)) {
        return null;
      }

      const element = target.closest(selector);
      return element instanceof HTMLElement ? element : null;
    }

    /**
     * Variante de `getClosestElement` que garante retorno do tipo botao.
     *
     * @param {EventTarget | null} target Alvo bruto do evento.
     * @param {string} selector Seletor CSS usado na busca.
     * @returns {HTMLButtonElement | null} Botao encontrado ou `null`.
     */
    function getClosestButton(target, selector) {
      const element = getClosestElement(target, selector);
      return element instanceof HTMLButtonElement ? element : null;
    }

    /**
     * Sobe no DOM ate encontrar a coluna mais proxima do alvo informado.
     *
     * @param {EventTarget | null} target Alvo do evento ou elemento de referencia.
     * @returns {HTMLElement | null} Elemento da coluna.
     */
    function getColumnElement(target) {
      return getClosestElement(target, "[data-column-id]");
    }

    /**
     * Reune em um unico objeto o card clicado, o elemento visual dele e
     * a coluna em que ele esta.
     *
     * @param {EventTarget | null} target Alvo do evento.
     * @returns {{ card: object, cardElement: HTMLElement, columnElement: HTMLElement } | null} Contexto do card.
     */
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

    /**
     * Atualiza a cor de um card e fecha o seletor de cores em seguida.
     *
     * @param {HTMLButtonElement} buttonElement Botao clicado na paleta.
     * @returns {void}
     */
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

    /**
     * Pede confirmacao e remove um card quando a resposta e positiva.
     *
     * @param {HTMLButtonElement} buttonElement Botao que disparou a exclusao.
     * @returns {Promise<void>}
     */
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

    /**
     * Pede confirmacao e remove uma coluna inteira quando a resposta e positiva.
     *
     * @param {HTMLButtonElement} buttonElement Botao que disparou a exclusao.
     * @returns {Promise<void>}
     */
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

    /**
     * Cria um novo card na coluna indicada pelo botao clicado.
     *
     * @param {HTMLButtonElement} buttonElement Botao de adicao de card.
     * @returns {void}
     */
    function handleAddCardClick(buttonElement) {
      boardState = addCard(boardState, buttonElement.dataset.columnId);
      syncBoard();
    }

    /**
     * Cria uma nova coluna ao final do board.
     *
     * @returns {void}
     */
    function handleAddColumnClick() {
      boardState = addColumn(boardState);
      syncBoard();
    }

    /**
     * Centraliza o roteamento das acoes disparadas por botoes com `data-action`.
     *
     * @param {HTMLButtonElement} buttonElement Botao acionado pelo usuario.
     * @returns {Promise<void>}
     */
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

    /**
     * Abre o modal de descricao do card clicado, respeitando a janela
     * de bloqueio logo apos um drag-and-drop.
     *
     * @param {EventTarget | null} target Alvo original do clique.
     * @returns {Promise<void>}
     */
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

    /**
     * Trata todos os cliques do board usando delegacao de eventos.
     * Primeiro tenta identificar uma acao explicita; se nao houver,
     * o clique pode significar abertura do editor de descricao.
     *
     * @param {MouseEvent} event Evento de clique no quadro.
     * @returns {Promise<void>}
     */
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

    /**
     * Atualiza o titulo de uma coluna a partir do input editavel.
     *
     * @param {HTMLInputElement} inputElement Campo de titulo da coluna.
     * @returns {void}
     */
    function handleColumnTitleChange(inputElement) {
      boardState = updateColumnTitle(
        boardState,
        inputElement.dataset.columnId,
        inputElement.value
      );
      syncBoard();
    }

    /**
     * Atualiza o titulo de um card a partir do input editavel.
     *
     * @param {HTMLInputElement} inputElement Campo de titulo do card.
     * @returns {void}
     */
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

    /**
     * Trata eventos `change` disparados pelos inputs editaveis do board.
     *
     * @param {Event} event Evento de alteracao.
     * @returns {void}
     */
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

    /**
     * Faz o Enter finalizar a edicao dos titulos sem inserir quebra de linha.
     *
     * @param {KeyboardEvent} event Evento de teclado disparado no board.
     * @returns {void}
     */
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
