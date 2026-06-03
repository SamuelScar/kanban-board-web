import { useEffect } from 'react'

export function useKeyboardShortcuts({
  atalhosAtivos,
  onTogglePrivacy,
  onToggleTheme,
  onShowHelp,
  onFocusNewColumn,
}) {
  useEffect(() => {
    if (!atalhosAtivos) return

    const handleKeyDown = (e) => {
      // Ignorar se o usuário estiver digitando em um input, textarea, ou div com contentEditable
      const tag = document.activeElement?.tagName?.toLowerCase()
      const isInput = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable
      if (isInput) return

      // Prevenir se alguma tecla modificadora estiver pressionada (Ctrl, Alt, Meta), 
      // exceto Shift para o `?`
      if (e.ctrlKey || e.altKey || e.metaKey) return

      switch (e.key) {
        case '?':
        case '/':
          e.preventDefault()
          if (onShowHelp) onShowHelp()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          if (onTogglePrivacy) onTogglePrivacy()
          break
        case 't':
        case 'T':
          e.preventDefault()
          if (onToggleTheme) onToggleTheme()
          break
        case 'c':
        case 'C':
          e.preventDefault()
          if (onFocusNewColumn) onFocusNewColumn()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [atalhosAtivos, onTogglePrivacy, onToggleTheme, onShowHelp, onFocusNewColumn])
}
