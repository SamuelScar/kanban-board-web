/**
 * Reune funcoes utilitarias compartilhadas por todos os modulos da aplicacao.
 * Este arquivo concentra normalizacao de dados, formatacao de texto e apoio
 * visual para cores dos cartoes.
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

  /**
   * Paleta fixa exibida no seletor de cores dos cartoes.
   * `Object.freeze` evita alteracoes acidentais em tempo de execucao.
   */
  const OPCOES_COR_CARTAO = Object.freeze([
    Object.freeze({ rotulo: "Padrao", valor: "" }),
    Object.freeze({ rotulo: "Areia", valor: "#d9c6ae" }),
    Object.freeze({ rotulo: "Terracota", valor: "#cf8d66" }),
    Object.freeze({ rotulo: "Mel", valor: "#d8ad5c" }),
    Object.freeze({ rotulo: "Sage", valor: "#9bae8a" }),
    Object.freeze({ rotulo: "Verde", valor: "#7ba488" }),
    Object.freeze({ rotulo: "Azul", valor: "#86a8c4" }),
    Object.freeze({ rotulo: "Rosa", valor: "#d7a0b5" }),
  ]);

  /**
   * Valida uma cor hexadecimal e a normaliza para o formato `#rrggbb`.
   * Tambem converte versoes curtas, como `#abc`, para a forma expandida.
   *
   * @param {unknown} valor Cor recebida pelo estado ou pela interface.
   * @returns {string} Cor normalizada ou string vazia quando invalida.
   */
  function normalizarCorHexadecimal(valor) {
    if (typeof valor !== "string") {
      return "";
    }

    const valorSemEspacos = valor.trim();
    const correspondenciaHexCurto = /^#([0-9a-f]{3})$/i.exec(valorSemEspacos);

    if (correspondenciaHexCurto) {
      return (
        "#" +
        correspondenciaHexCurto[1]
          .split("")
          .map(function duplicarDigito(digito) {
            return digito + digito;
          })
          .join("")
          .toLowerCase()
      );
    }

    if (/^#[0-9a-f]{6}$/i.test(valorSemEspacos)) {
      return valorSemEspacos.toLowerCase();
    }

    return "";
  }

  /**
   * Mistura uma cor com branco para gerar superficies mais suaves na interface.
   *
   * @param {string} corHexadecimal Cor base em hexadecimal.
   * @param {number} proporcaoBranco Intensidade da mistura com branco entre 0 e 1.
   * @returns {string} Nova cor clareada ou string vazia quando a entrada e invalida.
   */
  function clarearCorHexadecimal(corHexadecimal, proporcaoBranco) {
    const corNormalizada = normalizarCorHexadecimal(corHexadecimal);

    if (!corNormalizada) {
      return "";
    }

    const proporcaoLimitada = Math.min(Math.max(proporcaoBranco, 0), 1);
    const canaisCor = [1, 3, 5].map(function mapearCanal(indice) {
      return Number.parseInt(corNormalizada.slice(indice, indice + 2), 16);
    });

    const canaisClareados = canaisCor.map(function clarearCanal(canal) {
      return Math.round(canal + (255 - canal) * proporcaoLimitada);
    });

    return (
      "#" +
      canaisClareados
        .map(function formatarCanal(canal) {
          return canal.toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  Kanban.utilitarios = {
    criarId,
    formatarQuantidadeCartoes,
    normalizarCorHexadecimal,
    normalizarTexto,
    clarearCorHexadecimal,
    opcoesCorCartao: OPCOES_COR_CARTAO,
  };
})(window);
