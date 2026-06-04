import { useEffect } from 'react'

/**
 * Hook genérico para detectar cliques fora de um elemento.
 * Substitui o padrão manual de useEffect + mousedown + ref.contains()
 * que aparecia duplicado em App.jsx e Card.jsx.
 * 
 * @param {React.RefObject} ref - Referência ao elemento que define a "área interna"
 * @param {Function} callback - Função chamada quando o clique é fora do ref
 */
export function useClickOutside(ref, callback) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, callback])
}
