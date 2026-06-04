import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import MarkdownRenderer from './MarkdownRenderer'
import { Eye, PenLine, Info } from 'lucide-react'

export default function Modal({
  titulo,
  subtitulo = "Edição",
  descricaoTexto = "",
  valorInicial = "",
  onClose,
  onSave,
  extraActions,
  children
}) {
  const [valor, setValor] = useState(valorInicial)
  const [activeTab, setActiveTab] = useState('editar')

  const handleCancel = (e) => {
    e.preventDefault()
    onClose()
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    onSave(valor)
  }

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={handleCancel}
        />
        
        {/* Modal Dialog */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 border border-black/5 dark:border-white/5"
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wider text-[var(--color-brand-terracotta)] uppercase mb-1">{subtitulo}</p>
              <h2 className="text-2xl font-bold text-black/90 dark:text-white/90">{titulo}</h2>
              {descricaoTexto && (
                <p className="text-sm text-black/50 dark:text-white/50 mt-1 italic">{descricaoTexto}</p>
              )}
            </div>
            
            {/* Controles de Markdown */}
            <div className="flex items-center gap-1 shrink-0">
              {activeTab === 'editar' && (
                <div className="group relative">
                  <button type="button" className="p-2.5 rounded-lg text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black/80 dark:hover:text-white/80 transition-colors">
                    <Info size={18} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-zinc-800 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all -translate-y-2 group-hover:translate-y-0 z-50">
                    <p className="font-bold mb-2">Dicas de Markdown:</p>
                    <ul className="list-disc pl-4 flex flex-col gap-1.5">
                      <li><strong>**Texto**</strong> para negrito</li>
                      <li><em>*Texto*</em> para itálico</li>
                      <li><code className="bg-white/20 dark:bg-black/10 px-1 rounded">#</code> para Títulos Grandes</li>
                      <li><code className="bg-white/20 dark:bg-black/10 px-1 rounded">-</code> ou <code className="bg-white/20 dark:bg-black/10 px-1 rounded">*</code> para listas</li>
                      <li><code className="bg-white/20 dark:bg-black/10 px-1 rounded">[Texto](Link)</code> para links</li>
                      <li><code className="bg-white/20 dark:bg-black/10 px-1 rounded">`Código`</code> para código em linha</li>
                    </ul>
                    <div className="absolute -top-1.5 right-3 w-3 h-3 bg-zinc-800 dark:bg-zinc-100 rotate-45 rounded-sm"></div>
                  </div>
                </div>
              )}

              <div className="group relative">
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'editar' ? 'visualizar' : 'editar')}
                  className="p-2.5 rounded-lg text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  {activeTab === 'editar' ? <Eye size={18} /> : <PenLine size={18} />}
                </button>
                <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-zinc-800 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {activeTab === 'editar' ? 'Visualizar' : 'Editar'}
                  <div className="absolute -top-1.5 right-3 w-3 h-3 bg-zinc-800 dark:bg-zinc-100 rotate-45 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {activeTab === 'editar' ? (
              <textarea
                className="w-full min-h-[250px] resize-y bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl p-4 text-base text-black/80 dark:text-white/80 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/40 focus:border-[var(--color-brand-terracotta)] outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/30 leading-relaxed"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Digite a descrição detalhada ou notas usando Markdown..."
                maxLength={10000}
                autoFocus
              />
            ) : (
              <div className="w-full min-h-[250px] max-h-[500px] overflow-y-auto bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 rounded-xl p-6">
                {valor ? (
                  <MarkdownRenderer content={valor} />
                ) : (
                  <div className="h-full flex items-center justify-center min-h-[200px]">
                    <p className="text-sm text-black/40 dark:text-white/40 italic text-center">*Nenhuma descrição fornecida*</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {children}
          
          <div className="flex justify-between items-center mt-2 pt-4 border-t border-black/5 dark:border-white/5">
            <div className="flex gap-2">
              {extraActions}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-brand-terracotta)] hover:bg-[var(--color-brand-terracotta)]/90 text-white shadow-md shadow-[var(--color-brand-terracotta)]/20 transition-colors cursor-pointer"
                onClick={handleConfirm}
              >
                Salvar
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </AnimatePresence>,
    document.body
  )
}
