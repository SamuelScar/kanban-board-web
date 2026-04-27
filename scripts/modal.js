/**
 * Controla a criacao e a reutilizacao do dialogo modal usado pela aplicacao.
 * O mesmo componente atende cenarios de confirmacao e edicao textual.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function anexarModal(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const ID_DIALOGO = "kanban-dialogo";
  let referenciasDialogo = null;

  /**
   * Cria o elemento `<dialog>` e guarda referencias para os controles internos.
   * Isso evita buscar os mesmos elementos repetidamente a cada abertura.
   *
   * @returns {{
   *   elementoDialogo: HTMLDialogElement,
   *   elementoSobretitulo: HTMLElement | null,
   *   elementoTitulo: HTMLElement | null,
   *   elementoDescricao: HTMLElement | null,
   *   elementoCampo: HTMLElement | null,
   *   elementoRotulo: HTMLElement | null,
   *   elementoAreaTexto: HTMLTextAreaElement | null,
   *   botaoCancelar: HTMLButtonElement | null,
   *   botaoConfirmar: HTMLButtonElement | null
   * }} Referencias reutilizadas pelo modulo.
   */
  function criarElementoDialogo() {
    const elementoDialogo = document.createElement("dialog");
    elementoDialogo.className = "dialogo-texto";
    elementoDialogo.id = ID_DIALOGO;
    elementoDialogo.setAttribute("aria-labelledby", ID_DIALOGO + "-titulo");
    elementoDialogo.setAttribute("aria-describedby", ID_DIALOGO + "-descricao");
    elementoDialogo.innerHTML =
      '<form method="dialog" class="dialogo-texto__formulario">' +
      '  <div class="dialogo-texto__cabecalho">' +
      '    <p class="dialogo-texto__sobretitulo">Edicao</p>' +
      '    <h2 class="dialogo-texto__titulo" id="' +
      ID_DIALOGO +
      '-titulo"></h2>' +
      '    <p class="dialogo-texto__descricao" id="' +
      ID_DIALOGO +
      '-descricao"></p>' +
      "  </div>" +
      '  <label class="dialogo-texto__campo">' +
      '    <span class="dialogo-texto__rotulo"></span>' +
      '    <textarea class="dialogo-texto__area-texto" rows="7"></textarea>' +
      "  </label>" +
      '  <div class="dialogo-texto__acoes">' +
      '    <button type="submit" value="cancelar" class="dialogo-texto__botao dialogo-texto__botao--secundario"></button>' +
      '    <button type="submit" value="confirmar" class="dialogo-texto__botao dialogo-texto__botao--primario"></button>' +
      "  </div>" +
      "</form>";

    document.body.append(elementoDialogo);

    return {
      elementoDialogo,
      elementoSobretitulo: elementoDialogo.querySelector(".dialogo-texto__sobretitulo"),
      elementoTitulo: elementoDialogo.querySelector(".dialogo-texto__titulo"),
      elementoDescricao: elementoDialogo.querySelector(".dialogo-texto__descricao"),
      elementoCampo: elementoDialogo.querySelector(".dialogo-texto__campo"),
      elementoRotulo: elementoDialogo.querySelector(".dialogo-texto__rotulo"),
      elementoAreaTexto: elementoDialogo.querySelector(".dialogo-texto__area-texto"),
      botaoCancelar: elementoDialogo.querySelector('[value="cancelar"]'),
      botaoConfirmar: elementoDialogo.querySelector('[value="confirmar"]'),
    };
  }

  /**
   * Garante que exista apenas uma instancia do dialogo no DOM.
   *
   * @returns {ReturnType<typeof criarElementoDialogo>} Referencias do dialogo.
   */
  function garantirDialogo() {
    if (referenciasDialogo) {
      return referenciasDialogo;
    }

    referenciasDialogo = criarElementoDialogo();
    return referenciasDialogo;
  }

  /**
   * Posiciona o cursor ao final do texto para facilitar a edicao.
   *
   * @param {HTMLTextAreaElement} elementoAreaTexto Campo de edicao do dialogo.
   * @returns {void}
   */
  function focarAreaTexto(elementoAreaTexto) {
    elementoAreaTexto.focus();

    const quantidadeCaracteres = elementoAreaTexto.value.length;
    elementoAreaTexto.setSelectionRange(quantidadeCaracteres, quantidadeCaracteres);
  }

  /**
   * Devolve o foco ao controle que abriu o modal, quando ele ainda existe no DOM.
   *
   * @param {Element | null | undefined} elemento Elemento que deve recuperar o foco.
   * @returns {void}
   */
  function restaurarFoco(elemento) {
    if (elemento instanceof HTMLElement && elemento.isConnected) {
      elemento.focus();
    }
  }

  /**
   * Define qual controle recebe foco ao abrir o dialogo.
   * Em confirmacoes, prioriza o botao de cancelar para evitar exclusoes acidentais.
   *
   * @param {"confirmacao" | "texto"} modo Modo atual do dialogo.
   * @param {{ botaoCancelar: HTMLButtonElement | null, elementoAreaTexto: HTMLTextAreaElement | null }} referencias Referencias necessarias para o foco inicial.
   * @returns {void}
   */
  function focarControleInicial(modo, referencias) {
    if (modo === "confirmacao") {
      referencias.botaoCancelar.focus();
      return;
    }

    focarAreaTexto(referencias.elementoAreaTexto);
  }

  /**
   * Abre o dialogo configurando titulo, descricao, campos e textos dos botoes.
   * O retorno e sempre uma `Promise`, permitindo tratar confirmacoes e edicoes
   * com o mesmo fluxo assincrono.
   *
   * @param {{
   *   titulo: string,
   *   modo?: "confirmacao" | "texto",
   *   sobretitulo?: string,
   *   descricao?: string,
   *   rotulo?: string,
   *   placeholder?: string,
   *   textoConfirmar?: string,
   *   textoCancelar?: string,
   *   valorInicial?: string,
   *   variacao?: string,
   *   elementoRestaurarFoco?: Element | null
   * }} opcoes Configuracao visual e comportamental do dialogo.
   * @returns {Promise<boolean | string | null>} Resultado da interacao.
   */
  function abrirDialogo(opcoes) {
    const {
      elementoDialogo,
      elementoSobretitulo,
      elementoTitulo,
      elementoDescricao,
      elementoCampo,
      elementoRotulo,
      elementoAreaTexto,
      botaoCancelar,
      botaoConfirmar,
    } = garantirDialogo();
    const elementoRestaurarFoco = opcoes.elementoRestaurarFoco;
    const modo = opcoes.modo || "confirmacao";

    if (
      typeof elementoDialogo.showModal !== "function" ||
      typeof elementoDialogo.close !== "function"
    ) {
      throw new Error("HTMLDialogElement nao esta disponivel neste navegador.");
    }

    if (elementoDialogo.open) {
      elementoDialogo.close("cancelar");
    }

    elementoDialogo.classList.toggle("dialogo-texto--confirmacao", modo === "confirmacao");
    elementoDialogo.classList.toggle(
      "dialogo-texto--destrutivo",
      opcoes.variacao === "destrutiva"
    );
    elementoSobretitulo.textContent = opcoes.sobretitulo || "Edicao";
    elementoTitulo.textContent = opcoes.titulo;
    elementoDescricao.textContent = opcoes.descricao || "";
    elementoDescricao.hidden = !opcoes.descricao;
    elementoCampo.hidden = modo !== "texto";
    elementoRotulo.textContent = opcoes.rotulo || "";
    elementoAreaTexto.value = opcoes.valorInicial || "";
    elementoAreaTexto.placeholder = opcoes.placeholder || "";
    botaoCancelar.textContent = opcoes.textoCancelar || "Cancelar";
    botaoConfirmar.textContent = opcoes.textoConfirmar || "Salvar";
    elementoDialogo.returnValue = "";

    return new Promise(function processarDialogo(resolve) {
      elementoDialogo.addEventListener(
        "close",
        function aoFecharDialogo() {
          const confirmou = elementoDialogo.returnValue === "confirmar";
          const resultado = confirmou
            ? modo === "texto"
              ? elementoAreaTexto.value
              : true
            : modo === "texto"
              ? null
              : false;

          if (!confirmou) {
            restaurarFoco(elementoRestaurarFoco);
          }

          resolve(resultado);
        },
        { once: true }
      );

      elementoDialogo.showModal();
      global.requestAnimationFrame(function focarControle() {
        focarControleInicial(modo, {
          botaoCancelar,
          elementoAreaTexto,
        });
      });
    });
  }

  /**
   * Atalho para abrir o dialogo no modo de confirmacao simples.
   *
   * @param {object} opcoes Configuracoes complementares do modal.
   * @returns {Promise<boolean>} `true` quando a acao foi confirmada.
   */
  function abrirDialogoConfirmacao(opcoes) {
    return abrirDialogo({
      modo: "confirmacao",
      sobretitulo: "Confirmacao",
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
   * @param {Element | null | undefined} elementoRestaurarFoco Elemento que deve recuperar foco.
   * @returns {Promise<string | null>} Novo texto ou `null` quando cancelado.
   */
  function editarDescricaoCartao(tituloCartao, descricaoAtual, elementoRestaurarFoco) {
    return abrirDialogo({
      modo: "texto",
      sobretitulo: "Edicao",
      titulo: "Editar descricao",
      descricao: 'Cartao: "' + tituloCartao + '"',
      rotulo: "Descricao do cartao",
      placeholder: "Digite a descricao do cartao",
      textoConfirmar: "Salvar",
      textoCancelar: "Cancelar",
      valorInicial: descricaoAtual,
      elementoRestaurarFoco,
    });
  }

  /**
   * Solicita confirmacao antes de remover um cartao.
   *
   * @param {Element | null | undefined} elementoRestaurarFoco Elemento que abre o modal.
   * @returns {Promise<boolean>} `true` quando o cartao deve ser removido.
   */
  function confirmarRemocaoCartao(elementoRestaurarFoco) {
    return abrirDialogoConfirmacao({
      variacao: "destrutiva",
      titulo: "Excluir cartao?",
      descricao: "Essa acao nao pode ser desfeita.",
      textoConfirmar: "Excluir",
      elementoRestaurarFoco,
    });
  }

  /**
   * Solicita confirmacao antes de remover uma coluna, incluindo o impacto
   * sobre a quantidade de cartoes contidos nela.
   *
   * @param {string} tituloColuna Titulo da coluna.
   * @param {number} quantidadeCartoes Quantidade de cartoes dentro da coluna.
   * @param {Element | null | undefined} elementoRestaurarFoco Elemento que abre o modal.
   * @returns {Promise<boolean>} `true` quando a coluna deve ser removida.
   */
  function confirmarRemocaoColuna(tituloColuna, quantidadeCartoes, elementoRestaurarFoco) {
    return abrirDialogoConfirmacao({
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
      elementoRestaurarFoco,
    });
  }

  Kanban.modal = {
    confirmarRemocaoCartao,
    confirmarRemocaoColuna,
    editarDescricaoCartao,
  };
})(window);
