(function attachAlerts(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const swal = global.Swal;

  function fallbackConfirm(message) {
    console.warn(
      "SweetAlert2 nao foi carregado. Usando confirm nativo como fallback."
    );
    return Promise.resolve(global.confirm(message));
  }

  function confirmDialog(options) {
    if (!swal) {
      return fallbackConfirm(options.fallbackMessage);
    }

    return swal
      .fire({
        icon: "warning",
        showCancelButton: true,
        reverseButtons: true,
        focusCancel: true,
        confirmButtonText: "Excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#a6592b",
        cancelButtonColor: "#8f6c54",
        background: "#fffdf8",
        color: "#2f2a25",
        ...options,
      })
      .then(function handleResult(result) {
        return result.isConfirmed;
      });
  }

  function confirmCardRemoval() {
    return confirmDialog({
      title: "Excluir card?",
      text: "Essa acao nao pode ser desfeita.",
      fallbackMessage: "Excluir este card?",
    });
  }

  function confirmColumnRemoval(columnTitle, cardCount) {
    if (cardCount === 0) {
      return confirmDialog({
        title: "Excluir coluna?",
        text: 'A coluna "' + columnTitle + '" sera removida.',
        fallbackMessage: 'Excluir a coluna "' + columnTitle + '"?',
      });
    }

    return confirmDialog({
      title: "Excluir coluna?",
      text:
        'A coluna "' +
        columnTitle +
        '" e seus ' +
        cardCount +
        " cards serao removidos.",
      fallbackMessage:
        'Excluir a coluna "' + columnTitle + '" e seus ' + cardCount + " cards?",
    });
  }

  Kanban.alerts = {
    confirmCardRemoval,
    confirmColumnRemoval,
  };
})(window);
