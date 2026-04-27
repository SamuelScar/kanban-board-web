/**
 * Encapsula a integracao com o SortableJS.
 * Este modulo cuida da criacao, limpeza e traducao dos eventos de arraste
 * para payloads simples consumidos pela aplicacao.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function anexarArraste(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const Ordenavel = global.Sortable;
  let arrastesCartoes = [];
  let arrasteColunas = null;

  /**
   * Remove a instancia atual responsavel por reordenar colunas.
   *
   * @returns {void}
   */
  function limparArrasteColunas() {
    if (!arrasteColunas) {
      return;
    }

    arrasteColunas.destroy();
    arrasteColunas = null;
  }

  /**
   * Remove todas as instancias atuais responsaveis pelo arraste dos cartoes.
   *
   * @returns {void}
   */
  function limparArrasteCartoes() {
    arrastesCartoes.forEach(function limparInstanciaArraste(instanciaArraste) {
      instanciaArraste.destroy();
    });
    arrastesCartoes = [];
  }

  /**
   * Desativa qualquer recurso de arraste que esteja ligado no momento.
   *
   * @returns {void}
   */
  function desativarArraste() {
    limparArrasteCartoes();
    limparArrasteColunas();
  }

  /**
   * Traduz o evento do SortableJS para um payload independente da biblioteca.
   *
   * @param {Sortable.SortableEvent} evento Evento bruto do SortableJS.
   * @returns {{
   *   idColunaOrigem: string,
   *   idColunaDestino: string,
   *   idCartao: string,
   *   indiceOrigem: number,
   *   indiceDestino: number
   * } | null} Dados necessarios para mover um cartao no estado.
   */
  function criarDadosMovimentacaoCartao(evento) {
    if (
      !(evento.from instanceof HTMLElement) ||
      !(evento.to instanceof HTMLElement) ||
      !(evento.item instanceof HTMLElement)
    ) {
      return null;
    }

    const idColunaOrigem = evento.from.dataset.colunaId;
    const idColunaDestino = evento.to.dataset.colunaId;
    const idCartao = evento.item.dataset.cartaoId;

    if (
      !idColunaOrigem ||
      !idColunaDestino ||
      !idCartao ||
      typeof evento.oldIndex !== "number" ||
      typeof evento.newIndex !== "number"
    ) {
      return null;
    }

    return {
      idColunaOrigem,
      idColunaDestino,
      idCartao,
      indiceOrigem: evento.oldIndex,
      indiceDestino: evento.newIndex,
    };
  }

  /**
   * Traduz o evento de arraste de colunas para um payload simples.
   * O codigo considera tanto os indices padrao quanto os `draggableIndex`
   * usados pela biblioteca em alguns cenarios.
   *
   * @param {Sortable.SortableEvent} evento Evento bruto do SortableJS.
   * @returns {{ idColuna: string, indiceOrigem: number, indiceDestino: number } | null} Dados da movimentacao.
   */
  function criarDadosMovimentacaoColuna(evento) {
    if (!(evento.item instanceof HTMLElement)) {
      return null;
    }

    const idColuna = evento.item.dataset.colunaId;
    const indiceOrigem =
      typeof evento.oldDraggableIndex === "number"
        ? evento.oldDraggableIndex
        : evento.oldIndex;
    const indiceDestino =
      typeof evento.newDraggableIndex === "number"
        ? evento.newDraggableIndex
        : evento.newIndex;

    if (
      !idColuna ||
      typeof indiceOrigem !== "number" ||
      typeof indiceDestino !== "number"
    ) {
      return null;
    }

    return {
      idColuna,
      indiceOrigem,
      indiceDestino,
    };
  }

  /**
   * Ativa o arraste horizontal das colunas do quadro.
   *
   * @param {HTMLElement} elementoQuadro Elemento que contem as colunas.
   * @param {object} callbacks Callbacks opcionais para o ciclo de arraste.
   * @returns {void}
   */
  function ativarArrasteColunas(elementoQuadro, callbacks) {
    limparArrasteColunas();

    if (!Ordenavel) {
      return;
    }

    const acoes = callbacks || {};

    arrasteColunas = Ordenavel.create(elementoQuadro, {
      animation: 150,
      direction: "horizontal",
      draggable: ".coluna",
      handle: ".coluna__cabecalho",
      filter: "input, button",
      preventOnFilter: false,
      onEnd: function aoEncerrar(evento) {
        const dadosMovimentacao = criarDadosMovimentacaoColuna(evento);

        if (!dadosMovimentacao) {
          return;
        }

        if (
          dadosMovimentacao.indiceOrigem !== dadosMovimentacao.indiceDestino &&
          typeof acoes.aoSoltarColuna === "function"
        ) {
          acoes.aoSoltarColuna(dadosMovimentacao);
        }
      },
    });
  }

  /**
   * Ativa o arraste de cartoes em todas as colunas visiveis no momento.
   *
   * @param {HTMLElement} elementoQuadro Elemento que contem as listas de cartoes.
   * @param {object} callbacks Callbacks opcionais para o ciclo de arraste.
   * @returns {void}
   */
  function ativarArrasteCartoes(elementoQuadro, callbacks) {
    limparArrasteCartoes();

    if (!Ordenavel) {
      console.warn(
        "SortableJS nao foi carregado. O arraste de cartoes ficara indisponivel."
      );
      return;
    }

    const acoes = callbacks || {};
    const listasCartoes = elementoQuadro.querySelectorAll(".coluna__cartoes");

    arrastesCartoes = Array.from(listasCartoes).map(function criarArraste(listaCartoes) {
      return Ordenavel.create(listaCartoes, {
        group: "kanban-cartoes",
        animation: 150,
        draggable: ".cartao",
        filter: "input, button",
        preventOnFilter: false,
        onEnd: function aoEncerrar(evento) {
          if (typeof acoes.aoEncerrarArraste === "function") {
            acoes.aoEncerrarArraste();
          }

          const dadosMovimentacao = criarDadosMovimentacaoCartao(evento);

          if (!dadosMovimentacao) {
            return;
          }

          const houveMudanca =
            dadosMovimentacao.idColunaOrigem !== dadosMovimentacao.idColunaDestino ||
            dadosMovimentacao.indiceOrigem !== dadosMovimentacao.indiceDestino;

          if (houveMudanca && typeof acoes.aoSoltarCartao === "function") {
            acoes.aoSoltarCartao(dadosMovimentacao);
          }
        },
      });
    });
  }

  Kanban.arraste = {
    ativarArrasteCartoes,
    ativarArrasteColunas,
    desativarArraste,
  };
})(window);
