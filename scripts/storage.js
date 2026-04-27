/**
 * Implementa a camada de persistencia local do quadro usando `localStorage`.
 * O modulo tambem valida a estrutura carregada para evitar que dados
 * corrompidos quebrem a aplicacao.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function anexarArmazenamento(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const CHAVE_ARMAZENAMENTO = "kanban-board-web:estado";

  /**
   * Verifica se um valor e uma string com conteudo util apos o `trim`.
   *
   * @param {unknown} valor Valor a validar.
   * @returns {boolean} `true` quando ha texto aproveitavel.
   */
  function eTextoNaoVazio(valor) {
    return typeof valor === "string" && valor.trim().length > 0;
  }

  /**
   * Valida a estrutura minima de um cartao salvo no navegador.
   *
   * @param {unknown} cartao Possivel cartao lido do armazenamento.
   * @returns {boolean} `true` quando o objeto pode ser usado com seguranca.
   */
  function eCartaoValido(cartao) {
    return Boolean(
      cartao &&
        typeof cartao === "object" &&
        eTextoNaoVazio(cartao.id) &&
        eTextoNaoVazio(cartao.titulo) &&
        (cartao.descricao === undefined || typeof cartao.descricao === "string")
    );
  }

  /**
   * Valida a estrutura de uma coluna, incluindo todos os cartoes internos.
   *
   * @param {unknown} coluna Possivel coluna lida do armazenamento.
   * @returns {boolean} `true` quando a coluna segue o contrato esperado.
   */
  function eColunaValida(coluna) {
    return Boolean(
      coluna &&
        typeof coluna === "object" &&
        eTextoNaoVazio(coluna.id) &&
        eTextoNaoVazio(coluna.titulo) &&
        Array.isArray(coluna.cartoes) &&
        coluna.cartoes.every(eCartaoValido)
    );
  }

  /**
   * Garante que o estado raiz tenha o formato esperado pela aplicacao.
   *
   * @param {unknown} valor Valor desserializado do `localStorage`.
   * @returns {boolean} `true` quando o estado pode ser reaproveitado.
   */
  function eEstadoQuadroValido(valor) {
    return Boolean(
      valor &&
        typeof valor === "object" &&
        Array.isArray(valor.colunas) &&
        valor.colunas.every(eColunaValida)
    );
  }

  /**
   * Le o estado persistido e devolve `null` quando o dado nao existe
   * ou nao passa na validacao estrutural.
   *
   * @returns {{ colunas: Array<object> } | null} Estado salvo ou `null`.
   */
  function carregarQuadro() {
    try {
      const estadoSerializado = global.localStorage.getItem(CHAVE_ARMAZENAMENTO);

      if (!estadoSerializado) {
        return null;
      }

      const estadoConvertido = JSON.parse(estadoSerializado);
      return eEstadoQuadroValido(estadoConvertido) ? estadoConvertido : null;
    } catch (erro) {
      console.warn("Nao foi possivel carregar o estado salvo.", erro);
      return null;
    }
  }

  /**
   * Serializa e persiste o estado atual do quadro no navegador.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @returns {void}
   */
  function salvarQuadro(estadoQuadro) {
    try {
      global.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(estadoQuadro));
    } catch (erro) {
      console.warn("Nao foi possivel salvar o estado atual.", erro);
    }
  }

  Kanban.armazenamento = {
    carregarQuadro,
    salvarQuadro,
  };
})(window);
