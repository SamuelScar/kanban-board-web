import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

export default function Modal({
  titulo,
  subtitulo = "Edição",
  descricaoTexto = "",
  valorInicial = "",
  onClose,
  onSave
}) {
  const [valor, setValor] = useState(valorInicial)

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
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6"
        >
          <div>
            <p className="text-sm font-semibold tracking-wider text-[var(--color-brand-terracotta)] uppercase mb-1">{subtitulo}</p>
            <h2 className="text-2xl font-bold text-black/90">{titulo}</h2>
            {descricaoTexto && (
              <p className="text-sm text-black/50 mt-1 italic">{descricaoTexto}</p>
            )}
          </div>
          
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black/70">Descrição do cartão</span>
            <textarea
              className="w-full min-h-[160px] resize-y bg-black/[0.03] border border-black/10 rounded-xl p-4 text-base text-black/80 focus:bg-white focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/40 focus:border-[var(--color-brand-terracotta)] outline-none transition-all placeholder:text-black/30"
              rows="5"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Digite a descrição detalhada ou notas para esta tarefa..."
              autoFocus
            />
          </label>
          
          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-black/60 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-brand-terracotta)] hover:bg-[var(--color-brand-terracotta)]/90 text-white shadow-md shadow-[var(--color-brand-terracotta)]/20 transition-colors cursor-pointer"
              onClick={handleConfirm}
            >
              Salvar
            </button>
          </div>
        </motion.form>
      </div>
    </AnimatePresence>,
    document.body
  )
}
