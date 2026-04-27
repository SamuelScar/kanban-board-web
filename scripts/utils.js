/**
 * Reune funcoes utilitarias compartilhadas por todos os modulos da aplicacao.
 * Este arquivo concentra criacao de ids, normalizacao de texto e pequenas
 * formatacoes usadas em mais de um lugar.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function anexarUtilitarios(global) {
  const Kanban = (global.Kanban = global.Kanban || {});

  /**
   * Gera um identificador unico com um prefixo sem depender de estado externo.
   * Prioriza `crypto.randomUUID` quando disponivel e usa um fallback simples
   * baseado em tempo e aleatoriedade quando necessario.
   *
   * @param {string} prefixo Prefixo que identifica o tipo do item.
   * @returns {string} Identificador pronto para uso em colunas e cartoes.
   */
  function criarId(prefixo) {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return prefixo + "-" + global.crypto.randomUUID();
    }

    return (
      prefixo +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  /**
   * Remove espacos excedentes e garante que o retorno sempre seja texto.
   *
   * @param {unknown} valor Valor recebido da interface ou do estado.
   * @returns {string} Texto normalizado ou string vazia para entradas invalidas.
   */
  function normalizarTexto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  /**
   * Exibe a quantidade de cartoes usando singular ou plural de forma consistente.
   *
   * @param {number} quantidade Quantidade de cartoes em uma coluna.
   * @returns {string} Texto pronto para aparecer na interface.
   */
  function formatarQuantidadeCartoes(quantidade) {
    return quantidade === 1 ? "1 cartao" : quantidade + " cartoes";
  }

  Kanban.utilitarios = {
    criarId,
    formatarQuantidadeCartoes,
    normalizarTexto,
  };
})(window);
