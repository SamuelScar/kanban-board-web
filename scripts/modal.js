/**
 * Controla a criacao e a reutilizacao do dialogo modal usado pela aplicacao.
 * O mesmo componente atende cenarios de confirmacao e edicao textual.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function attachModal(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const DIALOG_ID = "kanban-dialog";
  let dialogRefs = null;

  /**
   * Cria o elemento `<dialog>` e guarda referencias para os controles internos.
   * Isso evita buscar os mesmos elementos repetidamente a cada abertura.
   *
   * @returns {{
   *   dialogElement: HTMLDialogElement,
   *   eyebrowElement: HTMLElement | null,
   *   titleElement: HTMLElement | null,
   *   descriptionElement: HTMLElement | null,
   *   fieldElement: HTMLElement | null,
   *   labelElement: HTMLElement | null,
   *   textareaElement: HTMLTextAreaElement | null,
   *   cancelButton: HTMLButtonElement | null,
   *   confirmButton: HTMLButtonElement | null
   * }} Referencias reutilizadas pelo modulo.
   */
  function createDialogElement() {
    const dialogElement = document.createElement("dialog");
    dialogElement.className = "text-dialog";
    dialogElement.id = DIALOG_ID;
    dialogElement.setAttribute("aria-labelledby", DIALOG_ID + "-title");
    dialogElement.setAttribute("aria-describedby", DIALOG_ID + "-description");
    dialogElement.innerHTML =
      '<form method="dialog" class="text-dialog__form">' +
      '  <div class="text-dialog__header">' +
      '    <p class="text-dialog__eyebrow">Edicao</p>' +
      '    <h2 class="text-dialog__title" id="' +
      DIALOG_ID +
      '-title"></h2>' +
      '    <p class="text-dialog__description" id="' +
      DIALOG_ID +
      '-description"></p>' +
      "  </div>" +
      '  <label class="text-dialog__field">' +
      '    <span class="text-dialog__label"></span>' +
      '    <textarea class="text-dialog__textarea" rows="7"></textarea>' +
      "  </label>" +
      '  <div class="text-dialog__actions">' +
      '    <button type="submit" value="cancel" class="text-dialog__button text-dialog__button--secondary"></button>' +
      '    <button type="submit" value="confirm" class="text-dialog__button text-dialog__button--primary"></button>' +
      "  </div>" +
      "</form>";

    document.body.append(dialogElement);

    return {
      dialogElement,
      eyebrowElement: dialogElement.querySelector(".text-dialog__eyebrow"),
      titleElement: dialogElement.querySelector(".text-dialog__title"),
      descriptionElement: dialogElement.querySelector(".text-dialog__description"),
      fieldElement: dialogElement.querySelector(".text-dialog__field"),
      labelElement: dialogElement.querySelector(".text-dialog__label"),
      textareaElement: dialogElement.querySelector(".text-dialog__textarea"),
      cancelButton: dialogElement.querySelector('[value="cancel"]'),
      confirmButton: dialogElement.querySelector('[value="confirm"]'),
    };
  }

  /**
   * Garante que exista apenas uma instancia do dialogo no DOM.
   *
   * @returns {ReturnType<typeof createDialogElement>} Referencias do dialogo.
   */
  function ensureDialog() {
    if (dialogRefs) {
      return dialogRefs;
    }

    dialogRefs = createDialogElement();
    return dialogRefs;
  }

  /**
   * Posiciona o cursor ao final do texto para facilitar a edicao.
   *
   * @param {HTMLTextAreaElement} textareaElement Campo de edicao do dialogo.
   * @returns {void}
   */
  function focusTextarea(textareaElement) {
    textareaElement.focus();

    const textLength = textareaElement.value.length;
    textareaElement.setSelectionRange(textLength, textLength);
  }

  /**
   * Devolve o foco ao controle que abriu o modal, quando ele ainda existe no DOM.
   *
   * @param {Element | null | undefined} element Elemento que deve recuperar o foco.
   * @returns {void}
   */
  function restoreFocus(element) {
    if (element instanceof HTMLElement && element.isConnected) {
      element.focus();
    }
  }

  /**
   * Define qual controle recebe foco ao abrir o dialogo.
   * Em confirmacoes, prioriza o botao de cancelar para evitar exclusoes acidentais.
   *
   * @param {"confirm" | "text"} mode Modo atual do dialogo.
   * @param {{ cancelButton: HTMLButtonElement | null, textareaElement: HTMLTextAreaElement | null }} refs Referencias necessarias para o foco inicial.
   * @returns {void}
   */
  function focusInitialControl(mode, refs) {
    if (mode === "confirm") {
      refs.cancelButton.focus();
      return;
    }

    focusTextarea(refs.textareaElement);
  }

  /**
   * Abre o dialogo configurando titulo, descricao, campos e textos dos botoes.
   * O retorno e sempre uma `Promise`, permitindo tratar confirmacoes e edicoes
   * com o mesmo fluxo assicrono.
   *
   * @param {{
   *   title: string,
   *   mode?: "confirm" | "text",
   *   eyebrow?: string,
   *   description?: string,
   *   label?: string,
   *   placeholder?: string,
   *   confirmText?: string,
   *   cancelText?: string,
   *   initialValue?: string,
   *   variant?: string,
   *   restoreFocusElement?: Element | null
   * }} options Configuracao visual e comportamental do dialogo.
   * @returns {Promise<boolean | string | null>} Resultado da interacao.
   */
  function openDialog(options) {
    const {
      dialogElement,
      eyebrowElement,
      titleElement,
      descriptionElement,
      fieldElement,
      labelElement,
      textareaElement,
      cancelButton,
      confirmButton,
    } = ensureDialog();
    const restoreFocusElement = options.restoreFocusElement;
    const mode = options.mode || "confirm";

    if (
      typeof dialogElement.showModal !== "function" ||
      typeof dialogElement.close !== "function"
    ) {
      throw new Error("HTMLDialogElement nao esta disponivel neste navegador.");
    }

    if (dialogElement.open) {
      dialogElement.close("cancel");
    }

    dialogElement.classList.toggle("text-dialog--confirm", mode === "confirm");
    dialogElement.classList.toggle(
      "text-dialog--destructive",
      options.variant === "destructive"
    );
    eyebrowElement.textContent = options.eyebrow || "Edicao";
    titleElement.textContent = options.title;
    descriptionElement.textContent = options.description || "";
    descriptionElement.hidden = !options.description;
    fieldElement.hidden = mode !== "text";
    labelElement.textContent = options.label || "";
    textareaElement.value = options.initialValue || "";
    textareaElement.placeholder = options.placeholder || "";
    cancelButton.textContent = options.cancelText || "Cancelar";
    confirmButton.textContent = options.confirmText || "Salvar";
    dialogElement.returnValue = "";

    return new Promise(function handleDialog(resolve) {
      dialogElement.addEventListener(
        "close",
        function handleClose() {
          const isConfirmed = dialogElement.returnValue === "confirm";
          const result = isConfirmed
            ? mode === "text"
              ? textareaElement.value
              : true
            : mode === "text"
              ? null
              : false;

          if (!isConfirmed) {
            restoreFocus(restoreFocusElement);
          }

          resolve(result);
        },
        { once: true }
      );

      dialogElement.showModal();
      global.requestAnimationFrame(function focusControl() {
        focusInitialControl(mode, {
          cancelButton,
          textareaElement,
        });
      });
    });
  }

  /**
   * Atalho para abrir o dialogo no modo de confirmacao simples.
   *
   * @param {object} options Configuracoes complementares do modal.
   * @returns {Promise<boolean>} `true` quando a acao foi confirmada.
   */
  function confirmDialog(options) {
    return openDialog({
      mode: "confirm",
      eyebrow: "Confirmacao",
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      ...options,
    });
  }

  /**
   * Abre o editor de descricao de um card.
   *
   * @param {string} cardTitle Titulo do card sendo editado.
   * @param {string} currentDescription Descricao atual do card.
   * @param {Element | null | undefined} restoreFocusElement Elemento que deve recuperar foco.
   * @returns {Promise<string | null>} Novo texto ou `null` quando cancelado.
   */
  function editCardDescription(cardTitle, currentDescription, restoreFocusElement) {
    return openDialog({
      mode: "text",
      eyebrow: "Edicao",
      title: "Editar descricao",
      description: 'Card: "' + cardTitle + '"',
      label: "Descricao do card",
      placeholder: "Digite a descricao do card",
      confirmText: "Salvar",
      cancelText: "Cancelar",
      initialValue: currentDescription,
      restoreFocusElement,
    });
  }

  /**
   * Solicita confirmacao antes de remover um card.
   *
   * @param {Element | null | undefined} restoreFocusElement Elemento que abre o modal.
   * @returns {Promise<boolean>} `true` quando o card deve ser removido.
   */
  function confirmCardRemoval(restoreFocusElement) {
    return confirmDialog({
      variant: "destructive",
      title: "Excluir card?",
      description: "Essa acao nao pode ser desfeita.",
      confirmText: "Excluir",
      restoreFocusElement,
    });
  }

  /**
   * Solicita confirmacao antes de remover uma coluna, incluindo o impacto
   * sobre a quantidade de cards contidos nela.
   *
   * @param {string} columnTitle Titulo da coluna.
   * @param {number} cardCount Quantidade de cards dentro da coluna.
   * @param {Element | null | undefined} restoreFocusElement Elemento que abre o modal.
   * @returns {Promise<boolean>} `true` quando a coluna deve ser removida.
   */
  function confirmColumnRemoval(columnTitle, cardCount, restoreFocusElement) {
    return confirmDialog({
      variant: "destructive",
      title: "Excluir coluna?",
      description:
        cardCount === 0
          ? 'A coluna "' + columnTitle + '" sera removida.'
          : 'A coluna "' +
            columnTitle +
            '" e seus ' +
            cardCount +
            " cards serao removidos.",
      confirmText: "Excluir",
      restoreFocusElement,
    });
  }

  Kanban.modal = {
    confirmCardRemoval,
    confirmColumnRemoval,
    editCardDescription,
  };
})(window);
