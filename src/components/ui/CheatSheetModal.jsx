import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { useEffect } from 'react'

export default function CheatSheetModal({ isOpen, onClose }) {
  // O modal se fecha com Esc (independente de atalhosAtivos ou não, UX padrão de modais)
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const atalhos = [
    { tecla: 'C', desc: 'Focar em "Nova Coluna"' },
    { tecla: 'P', desc: 'Ligar/Desligar Privacidade' },
    { tecla: 'T', desc: 'Trocar Tema Visual' },
    { tecla: '? ou /', desc: 'Abrir este menu de ajuda' },
    { tecla: 'Esc', desc: 'Fechar janela aberta' }
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-black/90 dark:text-white/90">
              <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <Keyboard size={20} />
              </div>
              <h2 className="text-lg font-bold">Atalhos de Teclado</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} className="text-black/50 dark:text-white/50" />
            </button>
          </div>

          <div className="space-y-3">
            {atalhos.map((atalho, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0">
                <span className="text-sm font-medium text-black/70 dark:text-white/70">{atalho.desc}</span>
                <kbd className="px-2 py-1 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 rounded text-xs font-mono font-bold text-black/80 dark:text-white/80 shadow-sm">
                  {atalho.tecla}
                </kbd>
              </div>
            ))}
          </div>
          
          <p className="mt-6 text-xs text-center text-black/40 dark:text-white/40 font-medium">
            Os atalhos são desabilitados automaticamente enquanto você digita.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
