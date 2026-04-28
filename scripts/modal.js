/**
 * Controla a criacao e a reutilizacao do modal de texto usado pela aplicacao.
 * O mesmo componente atende cenarios de confirmacao e edicao textual.
 */
var Kanban = window.Kanban || (window.Kanban = {});
const ID_MODAL = "kanban-dialogo";
let referenciasModal = null;

/**
 * Cria o elemento `<dialog>` e guarda referencias para os controles internos.
 * Isso evita buscar os mesmos elementos repetidamente a cada abertura.
 *
 * @returns {{
 *   modal: HTMLDialogElement,
 *   subtitulo: HTMLElement | null,
 *   titulo: HTMLElement | null,
 *   descricao: HTMLElement | null,
 *   blocoDescricao: HTMLElement | null,
 *   rotuloDescricao: HTMLElement | null,
 *   campoDescricao: HTMLTextAreaElement | null,
 *   botaoCancelar: HTMLButtonElement | null,
 *   botaoConfirmar: HTMLButtonElement | null
 * }} Referencias reutilizadas pelo modulo.
 */
function criarEstruturaModal() {
  const modal = document.createElement("dialog");
  modal.className = "modal-texto";
  modal.id = ID_MODAL;
  modal.setAttribute("aria-labelledby", ID_MODAL + "-titulo");
  modal.setAttribute("aria-describedby", ID_MODAL + "-descricao");
  modal.innerHTML =
    '<form method="dialog" class="modal-texto__formulario">' +
    '  <div class="modal-texto__cabecalho">' +
    '    <p class="modal-texto__subtitulo">Edicao</p>' +
    '    <h2 class="modal-texto__titulo" id="' +
    ID_MODAL +
    '-titulo"></h2>' +
    '    <p class="modal-texto__descricao" id="' +
    ID_MODAL +
    '-descricao"></p>' +
    "  </div>" +
    '  <label class="modal-texto__campo">' +
    '    <span class="modal-texto__rotulo"></span>' +
    '    <textarea class="modal-texto__campo-descricao" rows="7"></textarea>' +
    "  </label>" +
    '  <div class="modal-texto__acoes">' +
    '    <button type="submit" value="cancelar" class="modal-texto__botao modal-texto__botao--secundario"></button>' +
    '    <button type="submit" value="confirmar" class="modal-texto__botao modal-texto__botao--primario"></button>' +
    "  </div>" +
    "</form>";

  document.body.append(modal);

  return {
    modal,
    subtitulo: modal.querySelector(".modal-texto__subtitulo"),
    titulo: modal.querySelector(".modal-texto__titulo"),
    descricao: modal.querySelector(".modal-texto__descricao"),
    blocoDescricao: modal.querySelector(".modal-texto__campo"),
    rotuloDescricao: modal.querySelector(".modal-texto__rotulo"),
    campoDescricao: modal.querySelector(".modal-texto__campo-descricao"),
    botaoCancelar: modal.querySelector('[value="cancelar"]'),
    botaoConfirmar: modal.querySelector('[value="confirmar"]'),
  };
}

/**
 * Garante que exista apenas uma instancia do modal no DOM.
 *
 * @returns {ReturnType<typeof criarEstruturaModal>} Referencias do modal.
 */
function garantirModal() {
  if (referenciasModal) {
    return referenciasModal;
  }

  referenciasModal = criarEstruturaModal();
  return referenciasModal;
}

/**
 * Posiciona o cursor ao final do texto para facilitar a edicao.
 *
 * @param {HTMLTextAreaElement} campoDescricao Campo de edicao da descricao.
 * @returns {void}
 */
function focarCampoDescricao(campoDescricao) {
  campoDescricao.focus();

  const quantidadeCaracteres = campoDescricao.value.length;
  campoDescricao.setSelectionRange(quantidadeCaracteres, quantidadeCaracteres);
}

/**
 * Devolve o foco ao controle que abriu o modal, quando ele ainda existe no DOM.
 *
 * @param {Element | null | undefined} gatilhoFoco Elemento que deve recuperar o foco.
 * @returns {void}
 */
function restaurarFoco(gatilhoFoco) {
  if (gatilhoFoco instanceof HTMLElement && gatilhoFoco.isConnected) {
    gatilhoFoco.focus();
  }
}

/**
 * Define qual controle recebe foco ao abrir o modal.
 * Em confirmacoes, prioriza o botao de cancelar para evitar exclusoes acidentais.
 *
 * @param {"confirmacao" | "texto"} modo Modo atual do modal.
 * @param {{ botaoCancelar: HTMLButtonElement | null, campoDescricao: HTMLTextAreaElement | null }} referencias Referencias necessarias para o foco inicial.
 * @returns {void}
 */
function focarControleInicial(modo, referencias) {
  if (modo === "confirmacao") {
    referencias.botaoCancelar.focus();
    return;
  }

  focarCampoDescricao(referencias.campoDescricao);
}

/**
 * Abre o modal configurando titulo, descricao, campos e textos dos botoes.
 * O retorno e sempre uma `Promise`, permitindo tratar confirmacoes e edicoes
 * com o mesmo fluxo assincrono.
 *
 * @param {{
 *   titulo: string,
 *   modo?: "confirmacao" | "texto",
 *   subtitulo?: string,
 *   descricao?: string,
 *   rotulo?: string,
 *   placeholder?: string,
 *   textoConfirmar?: string,
 *   textoCancelar?: string,
 *   valorInicial?: string,
 *   variacao?: string,
 *   gatilhoFoco?: Element | null
 * }} opcoes Configuracao visual e comportamental do modal.
 * @returns {Promise<boolean | string | null>} Resultado da interacao.
 */
function abrirModal(opcoes) {
  const {
    modal,
    subtitulo,
    titulo,
    descricao,
    blocoDescricao,
    rotuloDescricao,
    campoDescricao,
    botaoCancelar,
    botaoConfirmar,
  } = garantirModal();
  const gatilhoFoco = opcoes.gatilhoFoco;
  const modo = opcoes.modo || "confirmacao";

  if (
    typeof modal.showModal !== "function" ||
    typeof modal.close !== "function"
  ) {
    throw new Error("HTMLDialogElement nao esta disponivel neste navegador.");
  }

  if (modal.open) {
    modal.close("cancelar");
  }

  modal.classList.toggle("modal-texto--confirmacao", modo === "confirmacao");
  modal.classList.toggle(
    "modal-texto--destrutivo",
    opcoes.variacao === "destrutiva"
  );
  subtitulo.textContent = opcoes.subtitulo || "Edicao";
  titulo.textContent = opcoes.titulo;
  descricao.textContent = opcoes.descricao || "";
  descricao.hidden = !opcoes.descricao;
  blocoDescricao.hidden = modo !== "texto";
  rotuloDescricao.textContent = opcoes.rotulo || "";
  campoDescricao.value = opcoes.valorInicial || "";
  campoDescricao.placeholder = opcoes.placeholder || "";
  botaoCancelar.textContent = opcoes.textoCancelar || "Cancelar";
  botaoConfirmar.textContent = opcoes.textoConfirmar || "Salvar";
  modal.returnValue = "";

  return new Promise(function processarFechamento(resolve) {
    modal.addEventListener(
      "close",
      function aoFecharModal() {
        const confirmou = modal.returnValue === "confirmar";
        const resultado = confirmou
          ? modo === "texto"
            ? campoDescricao.value
            : true
          : modo === "texto"
            ? null
            : false;

        if (!confirmou) {
          restaurarFoco(gatilhoFoco);
        }

        resolve(resultado);
      },
      { once: true }
    );

    modal.showModal();
    window.requestAnimationFrame(function focarControle() {
      focarControleInicial(modo, {
        botaoCancelar,
        campoDescricao,
      });
    });
  });
}

/**
 * Atalho para abrir o modal no modo de confirmacao simples.
 *
 * @param {object} opcoes Configuracoes complementares do modal.
 * @returns {Promise<boolean>} `true` quando a acao foi confirmada.
 */
function abrirModalConfirmacao(opcoes) {
  return abrirModal({
    modo: "confirmacao",
    subtitulo: "Confirmacao",
    textoConfirmar: "Confirmar",
    textoCancelar: "Cancelar",
    ...opcoes,
  });
}

/**
 * Abre o editor de descricao de um cartao.
 *
 * @param {string} tituloCartao Titulo do cartao sendo editado.
 * @param {string} descricaoAtual Descricao atual do cartao.
 * @param {Element | null | undefined} gatilhoFoco Elemento que deve recuperar foco.
 * @returns {Promise<string | null>} Novo texto ou `null` quando cancelado.
 */
function editarDescricaoCartao(tituloCartao, descricaoAtual, gatilhoFoco) {
  return abrirModal({
    modo: "texto",
    subtitulo: "Edicao",
    titulo: "Editar descricao",
    descricao: 'Cartao: "' + tituloCartao + '"',
    rotulo: "Descricao do cartao",
    placeholder: "Digite a descricao do cartao",
    textoConfirmar: "Salvar",
    textoCancelar: "Cancelar",
    valorInicial: descricaoAtual,
    gatilhoFoco,
  });
}

/**
 * Solicita confirmacao antes de remover um cartao.
 *
 * @param {Element | null | undefined} gatilhoFoco Elemento que abre o modal.
 * @returns {Promise<boolean>} `true` quando o cartao deve ser removido.
 */
function confirmarRemocaoCartao(gatilhoFoco) {
  return abrirModalConfirmacao({
    variacao: "destrutiva",
    titulo: "Excluir cartao?",
    descricao: "Essa acao nao pode ser desfeita.",
    textoConfirmar: "Excluir",
    gatilhoFoco,
  });
}

/**
 * Solicita confirmacao antes de remover uma coluna, incluindo o impacto
 * sobre a quantidade de cartoes contidos nela.
 *
 * @param {string} tituloColuna Titulo da coluna.
 * @param {number} quantidadeCartoes Quantidade de cartoes dentro da coluna.
 * @param {Element | null | undefined} gatilhoFoco Elemento que abre o modal.
 * @returns {Promise<boolean>} `true` quando a coluna deve ser removida.
 */
function confirmarRemocaoColuna(tituloColuna, quantidadeCartoes, gatilhoFoco) {
  return abrirModalConfirmacao({
    variacao: "destrutiva",
    titulo: "Excluir coluna?",
    descricao:
      quantidadeCartoes === 0
        ? 'A coluna "' + tituloColuna + '" sera removida.'
        : 'A coluna "' +
          tituloColuna +
          '" e seus ' +
          quantidadeCartoes +
          " cartoes serao removidos.",
    textoConfirmar: "Excluir",
    gatilhoFoco,
  });
}

Kanban.modal = {
  confirmarRemocaoCartao,
  confirmarRemocaoColuna,
  editarDescricaoCartao,
};
