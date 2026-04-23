(function attachModal(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const DIALOG_ID = "kanban-text-dialog";
  let dialogRefs = null;

  function fallbackPrompt(options) {
    console.warn(
      "HTMLDialogElement nao esta disponivel. Usando prompt nativo como fallback."
    );
    return Promise.resolve(
      global.prompt(options.fallbackMessage || options.title, options.initialValue)
    );
  }

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
      titleElement: dialogElement.querySelector(".text-dialog__title"),
      descriptionElement: dialogElement.querySelector(".text-dialog__description"),
      labelElement: dialogElement.querySelector(".text-dialog__label"),
      textareaElement: dialogElement.querySelector(".text-dialog__textarea"),
      cancelButton: dialogElement.querySelector('[value="cancel"]'),
      confirmButton: dialogElement.querySelector('[value="confirm"]'),
    };
  }

  function ensureDialog() {
    if (dialogRefs) {
      return dialogRefs;
    }

    dialogRefs = createDialogElement();
    return dialogRefs;
  }

  function focusTextarea(textareaElement) {
    textareaElement.focus();

    const textLength = textareaElement.value.length;
    textareaElement.setSelectionRange(textLength, textLength);
  }

  function openTextDialog(options) {
    if (
      typeof global.HTMLDialogElement !== "function" ||
      typeof global.HTMLDialogElement.prototype.showModal !== "function"
    ) {
      return fallbackPrompt(options);
    }

    const {
      dialogElement,
      titleElement,
      descriptionElement,
      labelElement,
      textareaElement,
      cancelButton,
      confirmButton,
    } = ensureDialog();
    const restoreFocusElement = options.restoreFocusElement;

    if (dialogElement.open) {
      dialogElement.close("cancel");
    }

    titleElement.textContent = options.title;
    descriptionElement.textContent = options.description || "";
    descriptionElement.hidden = !options.description;
    labelElement.textContent = options.label;
    textareaElement.value = options.initialValue || "";
    textareaElement.placeholder = options.placeholder || "";
    cancelButton.textContent = options.cancelText || "Cancelar";
    confirmButton.textContent = options.confirmText || "Salvar";
    dialogElement.returnValue = "";

    return new Promise(function openDialog(resolve) {
      dialogElement.addEventListener(
        "close",
        function handleClose() {
          const nextValue =
            dialogElement.returnValue === "confirm" ? textareaElement.value : null;

          if (nextValue === null && restoreFocusElement instanceof HTMLElement) {
            if (restoreFocusElement.isConnected) {
              restoreFocusElement.focus();
            }
          }

          resolve(nextValue);
        },
        { once: true }
      );

      dialogElement.showModal();
      global.requestAnimationFrame(function focusField() {
        focusTextarea(textareaElement);
      });
    });
  }

  function editCardDescription(cardTitle, currentDescription, restoreFocusElement) {
    return openTextDialog({
      title: "Editar descricao",
      description: 'Card: "' + cardTitle + '"',
      label: "Descricao do card",
      placeholder: "Digite a descricao do card",
      confirmText: "Salvar",
      cancelText: "Cancelar",
      fallbackMessage: 'Editar descricao do card "' + cardTitle + '":',
      initialValue: currentDescription,
      restoreFocusElement,
    });
  }

  Kanban.modal = {
    openTextDialog,
    editCardDescription,
  };
})(window);
