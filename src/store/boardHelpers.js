/**
 * Helpers genéricos para transformações imutáveis no quadro Kanban.
 * Eliminam a repetição do padrão nested-map que aparecia 5x na store.
 */

/**
 * Aplica uma transformação em um cartão específico dentro de uma coluna.
 * 
 * @param {Array} colunas - Array de colunas do quadro
 * @param {string} idColuna - ID da coluna que contém o cartão
 * @param {string} idCartao - ID do cartão a transformar
 * @param {Function} transformFn - Função (cartao) => novoCartao
 * @returns {Array} Novo array de colunas com a transformação aplicada
 */
export function mapCartaoNaColuna(colunas, idColuna, idCartao, transformFn) {
  return colunas.map(col => {
    if (col.id !== idColuna) return col
    return {
      ...col,
      cartoes: col.cartoes.map(cartao =>
        cartao.id === idCartao ? transformFn(cartao) : cartao
      )
    }
  })
}

/**
 * Aplica uma transformação na lista de cartões de uma coluna inteira.
 * 
 * @param {Array} colunas - Array de colunas do quadro
 * @param {string} idColuna - ID da coluna alvo
 * @param {Function} transformFn - Função (cartoes[]) => novosCartoes[]
 * @returns {Array} Novo array de colunas com a transformação aplicada
 */
export function mapCartoesNaColuna(colunas, idColuna, transformFn) {
  return colunas.map(col => {
    if (col.id !== idColuna) return col
    return { ...col, cartoes: transformFn(col.cartoes) }
  })
}
