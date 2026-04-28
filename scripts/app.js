/**
 * Orquestra a inicializacao da aplicacao, conectando estado, interface,
 * persistencia, modal e arrastar-e-soltar. Este e o ponto em que os modulos
 * independentes passam a trabalhar juntos.
 */
var Kanban = window.Kanban || (window.Kanban = {});
const estadoKanban = Kanban.estado;
const modalKanban = Kanban.modal;
const arrasteKanban = Kanban.arraste;
const armazenamentoKanban = Kanban.armazenamento;
const interfaceKanban = Kanban.interface;

/**
 * Prepara a aplicacao depois que o DOM foi carregado.
 * A maior parte das funcoes internas existe aqui porque depende do estado
 * vivo do quadro e da referencia do elemento raiz.
 *
 * @returns {void}
 */
function inicializar() {
  const elementoQuadro = document.querySelector("[data-quadro]");

  if (!elementoQuadro) {
    throw new Error("O container principal do quadro nao foi encontrado.");
  }

  let estadoQuadro = armazenamentoKanban.carregarQuadro() || estadoKanban.criarQuadroInicial();
  let liberarAberturaCartaoEm = 0;

  /**
   * Agenda uma nova sincronizacao visual no proximo frame de animacao.
   * Isso evita re-render imediato durante o ciclo do drag-and-drop.
   *
   * @returns {void}
   */
  function agendarSincronizacaoQuadro() {
    window.requestAnimationFrame(sincronizarQuadro);
  }

  /**
   * Reconstroi a interface atual e persiste o estado correspondente.
   *
   * @returns {void}
   */
  function renderizarEPersistirQuadro() {
    interfaceKanban.renderizarQuadro(elementoQuadro, estadoQuadro);
    armazenamentoKanban.salvarQuadro(estadoQuadro);
  }

  /**
   * Marca visualmente que o usuario iniciou o arraste de uma coluna.
   *
   * @returns {void}
   */
  function aoIniciarArrasteColuna() {
    elementoQuadro.classList.add("quadro--arrastando-coluna");
  }

  /**
   * Remove o estado visual de arraste de coluna.
   *
   * @returns {void}
   */
  function aoEncerrarArrasteColuna() {
    elementoQuadro.classList.remove("quadro--arrastando-coluna");
  }

  /**
   * Atualiza o estado apos a soltura de uma coluna em nova posicao.
   *
   * @param {{ idColuna: string, indiceDestino: number }} dadosMovimentacao Dados da movimentacao.
   * @returns {void}
   */
  function aoSoltarColuna(dadosMovimentacao) {
    estadoQuadro = estadoKanban.moverColuna(
      estadoQuadro,
      dadosMovimentacao.idColuna,
      dadosMovimentacao.indiceDestino
    );
    agendarSincronizacaoQuadro();
  }

  /**
   * Marca visualmente o arraste de cartoes para destacar os alvos de drop.
   *
   * @returns {void}
   */
  function aoIniciarArrasteCartao() {
    elementoQuadro.classList.add("quadro--arrastando");
  }

  /**
   * Finaliza o estado visual de arraste e bloqueia por alguns milissegundos
   * a abertura do modal do cartao, evitando cliques acidentais apos o drop.
   *
   * @returns {void}
   */
  function aoEncerrarArrasteCartao() {
    elementoQuadro.classList.remove("quadro--arrastando");
    liberarAberturaCartaoEm = Date.now() + 250;
  }

  /**
   * Atualiza o estado apos mover um cartao dentro do quadro.
   *
   * @param {{
   *   idColunaOrigem: string,
   *   idCartao: string,
   *   idColunaDestino: string,
   *   indiceDestino: number
   * }} dadosMovimentacao Dados da movimentacao.
   * @returns {void}
   */
  function aoSoltarCartao(dadosMovimentacao) {
    estadoQuadro = estadoKanban.moverCartao(
      estadoQuadro,
      dadosMovimentacao.idColunaOrigem,
      dadosMovimentacao.idCartao,
      dadosMovimentacao.idColunaDestino,
      dadosMovimentacao.indiceDestino
    );
    agendarSincronizacaoQuadro();
  }

  /**
   * Vincula ou recria todos os comportamentos de arrastar-e-soltar apos cada render.
   *
   * @returns {void}
   */
  function ativarInteracoesQuadro() {
    arrasteKanban.ativarArrasteColunas(elementoQuadro, {
      aoEncerrarArrasteColuna,
      aoIniciarArrasteColuna,
      aoSoltarColuna,
    });

    arrasteKanban.ativarArrasteCartoes(elementoQuadro, {
      aoEncerrarArraste: aoEncerrarArrasteCartao,
      aoIniciarArraste: aoIniciarArrasteCartao,
      aoSoltarCartao,
    });
  }

  /**
   * Mantem a interface sincronizada com o estado em memoria.
   * Toda mudanca relevante termina chamando esta funcao.
   *
   * @returns {void}
   */
  function sincronizarQuadro() {
    renderizarEPersistirQuadro();
    ativarInteracoesQuadro();
  }

  /**
   * Busca uma coluna pelo identificador.
   *
   * @param {string} idColuna Coluna procurada.
   * @returns {object | undefined} Coluna encontrada.
   */
  function encontrarColunaPorId(idColuna) {
    return estadoQuadro.colunas.find(function localizarColuna(coluna) {
      return coluna.id === idColuna;
    });
  }

  /**
   * Localiza um cartao a partir do par coluna + cartao.
   *
   * @param {string} idColuna Coluna onde a busca deve acontecer.
   * @param {string} idCartao Cartao procurado.
   * @returns {object | null} Cartao encontrado ou `null`.
   */
  function encontrarCartaoPorIds(idColuna, idCartao) {
    const coluna = encontrarColunaPorId(idColuna);

    if (!coluna) {
      return null;
    }

    return coluna.cartoes.find(function localizarCartao(cartao) {
      return cartao.id === idCartao;
    });
  }

  /**
   * Faz `closest` com protecao de tipo para evitar erros quando o alvo do
   * evento nao e um elemento DOM.
   *
   * @param {EventTarget | null} alvo Alvo bruto do evento.
   * @param {string} seletor Seletor CSS usado na busca.
   * @returns {HTMLElement | null} Elemento encontrado ou `null`.
   */
  function obterElementoMaisProximo(alvo, seletor) {
    if (!(alvo instanceof Element)) {
      return null;
    }

    const elemento = alvo.closest(seletor);
    return elemento instanceof HTMLElement ? elemento : null;
  }

  /**
   * Variante de `obterElementoMaisProximo` que garante retorno do tipo botao.
   *
   * @param {EventTarget | null} alvo Alvo bruto do evento.
   * @param {string} seletor Seletor CSS usado na busca.
   * @returns {HTMLButtonElement | null} Botao encontrado ou `null`.
   */
  function obterBotaoMaisProximo(alvo, seletor) {
    const elemento = obterElementoMaisProximo(alvo, seletor);
    return elemento instanceof HTMLButtonElement ? elemento : null;
  }

  /**
   * Sobe no DOM ate encontrar a coluna mais proxima do alvo informado.
   *
   * @param {EventTarget | null} alvo Alvo do evento ou elemento de referencia.
   * @returns {HTMLElement | null} Elemento da coluna.
   */
  function obterElementoColuna(alvo) {
    return obterElementoMaisProximo(alvo, "[data-coluna-id]");
  }

  /**
   * Reune em um unico objeto o cartao clicado, o elemento visual dele e
   * a coluna em que ele esta.
   *
   * @param {EventTarget | null} alvo Alvo do evento.
   * @returns {{ cartao: object, elementoCartao: HTMLElement, elementoColuna: HTMLElement } | null} Contexto do cartao.
   */
  function obterContextoCartao(alvo) {
    const elementoCartao = obterElementoMaisProximo(alvo, ".cartao");

    if (!elementoCartao) {
      return null;
    }

    const elementoColuna = obterElementoColuna(elementoCartao);

    if (!elementoColuna) {
      return null;
    }

    const cartao = encontrarCartaoPorIds(
      elementoColuna.dataset.colunaId,
      elementoCartao.dataset.cartaoId
    );

    return cartao
      ? {
          cartao,
          elementoCartao,
          elementoColuna,
        }
      : null;
  }

  /**
   * Atualiza a cor de um cartao e fecha o seletor de cores em seguida.
   *
   * @param {HTMLButtonElement} elementoBotao Botao clicado na paleta.
   * @returns {void}
   */
  function aoClicarAlterarCorCartao(elementoBotao) {
    const elementoColuna = obterElementoColuna(elementoBotao);

    if (!elementoColuna) {
      return;
    }

    estadoQuadro = estadoKanban.atualizarCorCartao(
      estadoQuadro,
      elementoColuna.dataset.colunaId,
      elementoBotao.dataset.cartaoId,
      elementoBotao.dataset.valorCor || ""
    );

    const elementoSeletorCor = obterElementoMaisProximo(
      elementoBotao,
      ".cartao__seletor-cor"
    );

    if (elementoSeletorCor instanceof HTMLDetailsElement) {
      elementoSeletorCor.removeAttribute("open");
    }

    sincronizarQuadro();
  }

  /**
   * Pede confirmacao e remove um cartao quando a resposta e positiva.
   *
   * @param {HTMLButtonElement} elementoBotao Botao que disparou a exclusao.
   * @returns {Promise<void>}
   */
  async function aoClicarRemoverCartao(elementoBotao) {
    const elementoColuna = obterElementoColuna(elementoBotao);

    if (!elementoColuna) {
      return;
    }

    const confirmouRemocaoCartao = await modalKanban.confirmarRemocaoCartao(
      elementoBotao
    );

    if (!confirmouRemocaoCartao) {
      return;
    }

    estadoQuadro = estadoKanban.removerCartao(
      estadoQuadro,
      elementoColuna.dataset.colunaId,
      elementoBotao.dataset.cartaoId
    );
    sincronizarQuadro();
  }

  /**
   * Pede confirmacao e remove uma coluna inteira quando a resposta e positiva.
   *
   * @param {HTMLButtonElement} elementoBotao Botao que disparou a exclusao.
   * @returns {Promise<void>}
   */
  async function aoClicarRemoverColuna(elementoBotao) {
    const coluna = encontrarColunaPorId(elementoBotao.dataset.colunaId);

    if (!coluna) {
      return;
    }

    const confirmouRemocaoColuna = await modalKanban.confirmarRemocaoColuna(
      coluna.titulo,
      coluna.cartoes.length,
      elementoBotao
    );

    if (!confirmouRemocaoColuna) {
      return;
    }

    estadoQuadro = estadoKanban.removerColuna(estadoQuadro, coluna.id);
    sincronizarQuadro();
  }

  /**
   * Cria um novo cartao na coluna indicada pelo botao clicado.
   *
   * @param {HTMLButtonElement} elementoBotao Botao de adicao de cartao.
   * @returns {void}
   */
  function aoClicarAdicionarCartao(elementoBotao) {
    estadoQuadro = estadoKanban.adicionarCartao(
      estadoQuadro,
      elementoBotao.dataset.colunaId
    );
    sincronizarQuadro();
  }

  /**
   * Cria uma nova coluna ao final do quadro.
   *
   * @returns {void}
   */
  function aoClicarAdicionarColuna() {
    estadoQuadro = estadoKanban.adicionarColuna(estadoQuadro);
    sincronizarQuadro();
  }

  /**
   * Centraliza o roteamento das acoes disparadas por botoes com `data-acao`.
   *
   * @param {HTMLButtonElement} elementoBotao Botao acionado pelo usuario.
   * @returns {Promise<void>}
   */
  async function aoClicarAcao(elementoBotao) {
    switch (elementoBotao.dataset.acao) {
      case "alterar-cor-cartao":
        aoClicarAlterarCorCartao(elementoBotao);
        return;
      case "remover-cartao":
        await aoClicarRemoverCartao(elementoBotao);
        return;
      case "remover-coluna":
        await aoClicarRemoverColuna(elementoBotao);
        return;
      case "adicionar-cartao":
        aoClicarAdicionarCartao(elementoBotao);
        return;
      case "adicionar-coluna":
        aoClicarAdicionarColuna();
        return;
    }
  }

  /**
   * Abre o modal de descricao do cartao clicado, respeitando a janela
   * de bloqueio logo apos um drag-and-drop.
   *
   * @param {EventTarget | null} alvo Alvo original do clique.
   * @returns {Promise<void>}
   */
  async function aoAbrirCartao(alvo) {
    if (Date.now() < liberarAberturaCartaoEm) {
      return;
    }

    const contextoCartao = obterContextoCartao(alvo);

    if (!contextoCartao) {
      return;
    }

    const proximaDescricao = await modalKanban.editarDescricaoCartao(
      contextoCartao.cartao.titulo,
      contextoCartao.cartao.descricao || "",
      contextoCartao.elementoCartao
    );

    if (proximaDescricao === null) {
      return;
    }

    estadoQuadro = estadoKanban.atualizarDescricaoCartao(
      estadoQuadro,
      contextoCartao.elementoColuna.dataset.colunaId,
      contextoCartao.cartao.id,
      proximaDescricao
    );
    sincronizarQuadro();
  }

  /**
   * Trata todos os cliques do quadro usando delegacao de eventos.
   * Primeiro tenta identificar uma acao explicita; se nao houver,
   * o clique pode significar abertura do editor de descricao.
   *
   * @param {MouseEvent} evento Evento de clique no quadro.
   * @returns {Promise<void>}
   */
  async function aoClicarQuadro(evento) {
    const alvo = evento.target;
    const elementoBotaoAcao = obterBotaoMaisProximo(alvo, "[data-acao]");

    if (elementoBotaoAcao) {
      await aoClicarAcao(elementoBotaoAcao);
      return;
    }

    if (obterElementoMaisProximo(alvo, ".cartao__seletor-cor")) {
      return;
    }

    if (
      alvo instanceof HTMLInputElement ||
      alvo instanceof HTMLSelectElement
    ) {
      return;
    }

    await aoAbrirCartao(alvo);
  }

  /**
   * Atualiza o titulo de uma coluna a partir do input editavel.
   *
   * @param {HTMLInputElement} elementoEntrada Campo de titulo da coluna.
   * @returns {void}
   */
  function aoAlterarTituloColuna(elementoEntrada) {
    estadoQuadro = estadoKanban.atualizarTituloColuna(
      estadoQuadro,
      elementoEntrada.dataset.colunaId,
      elementoEntrada.value
    );
    sincronizarQuadro();
  }

  /**
   * Atualiza o titulo de um cartao a partir do input editavel.
   *
   * @param {HTMLInputElement} elementoEntrada Campo de titulo do cartao.
   * @returns {void}
   */
  function aoAlterarTituloCartao(elementoEntrada) {
    const elementoColuna = obterElementoColuna(elementoEntrada);

    if (!elementoColuna) {
      return;
    }

    estadoQuadro = estadoKanban.atualizarTituloCartao(
      estadoQuadro,
      elementoColuna.dataset.colunaId,
      elementoEntrada.dataset.cartaoId,
      elementoEntrada.value
    );
    sincronizarQuadro();
  }

  /**
   * Trata eventos `change` disparados pelos inputs editaveis do quadro.
   *
   * @param {Event} evento Evento de alteracao.
   * @returns {void}
   */
  function aoAlterarQuadro(evento) {
    const alvo = evento.target;

    if (!(alvo instanceof HTMLInputElement)) {
      return;
    }

    if (alvo.dataset.campoTituloColuna === "true") {
      aoAlterarTituloColuna(alvo);
      return;
    }

    if (alvo.dataset.campoTituloCartao === "true") {
      aoAlterarTituloCartao(alvo);
    }
  }

  /**
   * Faz o Enter finalizar a edicao dos titulos sem inserir quebra de linha.
   *
   * @param {KeyboardEvent} evento Evento de teclado disparado no quadro.
   * @returns {void}
   */
  function aoPressionarTeclaQuadro(evento) {
    const alvo = evento.target;

    if (
      alvo instanceof HTMLInputElement &&
      evento.key === "Enter" &&
      (alvo.dataset.campoTituloColuna === "true" ||
        alvo.dataset.campoTituloCartao === "true")
    ) {
      evento.preventDefault();
      alvo.blur();
    }
  }

  elementoQuadro.addEventListener("click", aoClicarQuadro);
  elementoQuadro.addEventListener("change", aoAlterarQuadro);
  elementoQuadro.addEventListener("keydown", aoPressionarTeclaQuadro);
  window.addEventListener("beforeunload", arrasteKanban.desativarArraste);
  sincronizarQuadro();
}

document.addEventListener("DOMContentLoaded", inicializar);
