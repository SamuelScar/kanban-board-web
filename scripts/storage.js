/**
 * Implementa a camada de persistencia local do quadro usando `localStorage`.
 * O modulo tambem valida a estrutura carregada para evitar que dados
 * corrompidos quebrem a aplicacao.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function attachStorage(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const STORAGE_KEY = "kanban-board-web:state";
  const { normalizeHexColor } = Kanban.utils;

  /**
   * Verifica se um valor e uma string com conteudo util apos o `trim`.
   *
   * @param {unknown} value Valor a validar.
   * @returns {boolean} `true` quando ha texto aproveitavel.
   */
  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  /**
   * Valida a estrutura minima de um card salvo no navegador.
   *
   * @param {unknown} card Possivel card lido do armazenamento.
   * @returns {boolean} `true` quando o objeto pode ser usado com seguranca.
   */
  function isValidCard(card) {
    return Boolean(
      card &&
        typeof card === "object" &&
        isNonEmptyString(card.id) &&
        isNonEmptyString(card.title) &&
        (card.description === undefined || typeof card.description === "string") &&
        (card.color === undefined || normalizeHexColor(card.color).length > 0)
    );
  }

  /**
   * Valida a estrutura de uma coluna, incluindo todos os cards internos.
   *
   * @param {unknown} column Possivel coluna lida do armazenamento.
   * @returns {boolean} `true` quando a coluna segue o contrato esperado.
   */
  function isValidColumn(column) {
    return Boolean(
      column &&
        typeof column === "object" &&
        isNonEmptyString(column.id) &&
        isNonEmptyString(column.title) &&
        Array.isArray(column.cards) &&
        column.cards.every(isValidCard)
    );
  }

  /**
   * Garante que o estado raiz tenha o formato esperado pela aplicacao.
   *
   * @param {unknown} value Valor desserializado do `localStorage`.
   * @returns {boolean} `true` quando o estado pode ser reaproveitado.
   */
  function isValidBoardState(value) {
    return Boolean(
      value &&
        typeof value === "object" &&
        Array.isArray(value.columns) &&
        value.columns.every(isValidColumn)
    );
  }

  /**
   * Le o estado persistido e devolve `null` quando o dado nao existe
   * ou nao passa na validacao estrutural.
   *
   * @returns {{ columns: Array<object> } | null} Estado salvo ou `null`.
   */
  function loadBoardState() {
    try {
      const serializedState = global.localStorage.getItem(STORAGE_KEY);

      if (!serializedState) {
        return null;
      }

      const parsedState = JSON.parse(serializedState);
      return isValidBoardState(parsedState) ? parsedState : null;
    } catch (error) {
      console.warn("Nao foi possivel carregar o estado salvo.", error);
      return null;
    }
  }

  /**
   * Serializa e persiste o estado atual do quadro no navegador.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @returns {void}
   */
  function saveBoardState(boardState) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(boardState));
    } catch (error) {
      console.warn("Nao foi possivel salvar o estado atual.", error);
    }
  }

  Kanban.storage = {
    loadBoardState,
    saveBoardState,
  };
})(window);
