import { useEffect } from 'react'

/**
 * Hook genérico para detectar cliques fora de um elemento.
 * Substitui o padrão manual de useEffect + mousedown + ref.contains()
 * que aparecia duplicado em App.jsx e Card.jsx.
 * 
 * @param {React.RefObject} ref - Referência ao elemento que define a "área interna"
 * @param {Function} callback - Função chamada quando o clique é fora do ref
 */
export function useClickOutside(refOrRefs, callback) {
  useEffect(() => {
    const handler = (e) => {
      const refs = Array.isArray(refOrRefs) ? refOrRefs : [refOrRefs]
      const isOutside = refs.every(ref => ref.current && !ref.current.contains(e.target))
      if (isOutside) {
        callback()
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [refOrRefs, callback])
}
