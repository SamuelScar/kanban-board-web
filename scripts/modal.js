/**
 * Centraliza os dialogos da aplicacao usando as APIs nativas do navegador.
 * O objetivo aqui e manter as mesmas acoes do fluxo principal com o minimo
 * possivel de codigo de interface.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function anexarModal(global) {
  const Kanban = (global.Kanban = global.Kanban || {});

  /**
   * Solicita um novo texto de descricao para o cartao informado.
   *
   * @param {string} tituloCartao Titulo do cartao sendo editado.
   * @param {string} descricaoAtual Descricao atual do cartao.
   * @returns {Promise<string | null>} Novo texto ou `null` quando cancelado.
   */
  function editarDescricaoCartao(tituloCartao, descricaoAtual) {
    const mensagem = 'Descricao do cartao "' + tituloCartao + '":';
    const proximaDescricao = global.prompt(mensagem, descricaoAtual);

    return Promise.resolve(proximaDescricao === null ? null : proximaDescricao);
  }

  /**
   * Solicita confirmacao antes de remover um cartao.
   *
   * @returns {Promise<boolean>} `true` quando o cartao deve ser removido.
   */
  function confirmarRemocaoCartao() {
    return Promise.resolve(
      global.confirm("Excluir cartao?\nEssa acao nao pode ser desfeita.")
    );
  }

  /**
   * Solicita confirmacao antes de remover uma coluna, incluindo o impacto
   * sobre a quantidade de cartoes contidos nela.
   *
   * @param {string} tituloColuna Titulo da coluna.
   * @param {number} quantidadeCartoes Quantidade de cartoes dentro da coluna.
   * @returns {Promise<boolean>} `true` quando a coluna deve ser removida.
   */
  function confirmarRemocaoColuna(tituloColuna, quantidadeCartoes) {
    const mensagem =
      quantidadeCartoes === 0
        ? 'Excluir coluna?\nA coluna "' + tituloColuna + '" sera removida.'
        : 'Excluir coluna?\nA coluna "' +
          tituloColuna +
          '" e seus ' +
          quantidadeCartoes +
          " cartoes serao removidos.";

    return Promise.resolve(global.confirm(mensagem));
  }

  Kanban.modal = {
    confirmarRemocaoCartao,
    confirmarRemocaoColuna,
    editarDescricaoCartao,
  };
})(window);
