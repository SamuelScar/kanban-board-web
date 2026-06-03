import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, HardDrive, Info } from 'lucide-react'
import { useStore } from '../../store/kanbanStore'

export default function EducationalModal() {
  const avisoVisto = useStore(state => state.avisoEducacionalVisto)
  const marcarVisto = useStore(state => state.marcarAvisoEducacionalVisto)

  if (avisoVisto) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          className="relative w-full max-w-md bg-[var(--color-brand-bg)] border border-black/5 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden p-6 sm:p-8"
        >
          <div className="flex flex-col items-center text-center gap-4">
            
            <div className="w-16 h-16 rounded-full bg-[var(--color-brand-sand)]/50 flex items-center justify-center text-[var(--color-brand-terracotta)] mb-2">
              <HardDrive size={32} strokeWidth={1.5} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white/90 tracking-tight">
              Seus dados estão com você
            </h2>

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-4 font-medium">
              <p>
                O Kanban Board Web foi feito para ser rápido, seguro e totalmente focado na sua privacidade.
              </p>
              
              <div className="bg-[var(--color-brand-sand)]/30 rounded-xl p-4 text-left flex gap-3 items-start border border-black/5 dark:border-white/5">
                <ShieldAlert size={18} className="text-[var(--color-brand-terracotta)] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong className="font-bold text-gray-900 dark:text-white/90">Atenção ao Histórico:</strong> Todos os seus cartões e colunas são salvos <strong>exclusivamente no cache deste navegador</strong>. Se você limpar os dados de navegação ou desinstalar o navegador, seus dados serão apagados.
                </p>
              </div>

              <div className="bg-[var(--color-brand-sage)]/20 rounded-xl p-4 text-left flex gap-3 items-start border border-black/5 dark:border-white/5">
                <Info size={18} className="text-[var(--color-brand-sage)] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  Em breve adicionaremos uma opção para exportar seus dados. Por enquanto, utilize este quadro com responsabilidade em máquinas seguras.
                </p>
              </div>
            </div>

            <button
              onClick={marcarVisto}
              className="mt-4 w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md"
            >
              Entendi, vamos começar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
