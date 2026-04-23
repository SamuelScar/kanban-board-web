/**
 * Reune funcoes utilitarias compartilhadas por todos os modulos da aplicacao.
 * Este arquivo concentra normalizacao de dados, formatacao de texto e apoio
 * visual para cores dos cards.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function attachUtils(global) {
  const Kanban = (global.Kanban = global.Kanban || {});

  /**
   * Gera um identificador unico com um prefixo sem depender de estado externo.
   * Prioriza `crypto.randomUUID` quando disponivel e usa um fallback simples
   * baseado em tempo e aleatoriedade quando necessario.
   *
   * @param {string} prefix Prefixo que identifica o tipo do item.
   * @returns {string} Identificador pronto para uso em colunas e cards.
   */
  function createId(prefix) {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return prefix + "-" + global.crypto.randomUUID();
    }

    return (
      prefix +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  /**
   * Remove espacos excedentes e garante que o retorno sempre seja texto.
   *
   * @param {unknown} value Valor recebido da interface ou do estado.
   * @returns {string} Texto normalizado ou string vazia para entradas invalidas.
   */
  function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  /**
   * Exibe a quantidade de cards usando singular ou plural de forma consistente.
   *
   * @param {number} count Quantidade de cards em uma coluna.
   * @returns {string} Texto pronto para aparecer na interface.
   */
  function formatCardCount(count) {
    return count === 1 ? "1 card" : count + " cards";
  }

  /**
   * Paleta fixa exibida no seletor de cores dos cards.
   * `Object.freeze` evita alteracoes acidentais em tempo de execucao.
   */
  const CARD_COLOR_OPTIONS = Object.freeze([
    Object.freeze({ label: "Padrao", value: "" }),
    Object.freeze({ label: "Areia", value: "#d9c6ae" }),
    Object.freeze({ label: "Terracota", value: "#cf8d66" }),
    Object.freeze({ label: "Mel", value: "#d8ad5c" }),
    Object.freeze({ label: "Sage", value: "#9bae8a" }),
    Object.freeze({ label: "Verde", value: "#7ba488" }),
    Object.freeze({ label: "Azul", value: "#86a8c4" }),
    Object.freeze({ label: "Rosa", value: "#d7a0b5" }),
  ]);

  /**
   * Valida uma cor hexadecimal e a normaliza para o formato `#rrggbb`.
   * Tambem converte versoes curtas, como `#abc`, para a forma expandida.
   *
   * @param {unknown} value Cor recebida pelo estado ou pela interface.
   * @returns {string} Cor normalizada ou string vazia quando invalida.
   */
  function normalizeHexColor(value) {
    if (typeof value !== "string") {
      return "";
    }

    const trimmedValue = value.trim();
    const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(trimmedValue);

    if (shortHexMatch) {
      return (
        "#" +
        shortHexMatch[1]
          .split("")
          .map(function duplicateDigit(digit) {
            return digit + digit;
          })
          .join("")
          .toLowerCase()
      );
    }

    if (/^#[0-9a-f]{6}$/i.test(trimmedValue)) {
      return trimmedValue.toLowerCase();
    }

    return "";
  }

  /**
   * Mistura uma cor com branco para gerar superficies mais suaves na interface.
   *
   * @param {string} hexColor Cor base em hexadecimal.
   * @param {number} whiteRatio Intensidade da mistura com branco entre 0 e 1.
   * @returns {string} Nova cor clareada ou string vazia quando a entrada e invalida.
   */
  function tintHexColor(hexColor, whiteRatio) {
    const normalizedColor = normalizeHexColor(hexColor);

    if (!normalizedColor) {
      return "";
    }

    const clampedRatio = Math.min(Math.max(whiteRatio, 0), 1);
    const colorChannels = [1, 3, 5].map(function mapChannel(index) {
      return Number.parseInt(normalizedColor.slice(index, index + 2), 16);
    });

    const tintedChannels = colorChannels.map(function tintChannel(channel) {
      return Math.round(channel + (255 - channel) * clampedRatio);
    });

    return (
      "#" +
      tintedChannels
        .map(function formatChannel(channel) {
          return channel.toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  Kanban.utils = {
    cardColorOptions: CARD_COLOR_OPTIONS,
    createId,
    formatCardCount,
    normalizeHexColor,
    normalizeText,
    tintHexColor,
  };
})(window);
