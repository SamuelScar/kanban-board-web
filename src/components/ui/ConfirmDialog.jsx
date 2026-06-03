import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'

export default function ConfirmDialog({
  isOpen,
  titulo,
  descricao,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirm,
  onCancel,
  timer = 0
}) {
  const [timeLeft, setTimeLeft] = useState(timer)

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(timer)
    }
  }, [isOpen, timer])

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(id)
    }
  }, [isOpen, timeLeft])

  if (!isOpen) return null;

  const handleCancel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onCancel()
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onConfirm()
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-center items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[var(--color-brand-terracotta)] mb-2">
            <AlertTriangle size={24} />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-black/90 mb-2">{titulo}</h2>
            <p className="text-sm text-black/60 leading-relaxed">{descricao}</p>
          </div>
          
          <div className="flex gap-3 justify-center w-full mt-4">
            <button
              type="button"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-black/60 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
              onClick={handleCancel}
            >
              {textoCancelar}
            </button>
            <button
              type="button"
              disabled={timeLeft > 0}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all
                ${timeLeft > 0 
                  ? 'bg-black/10 text-black/40 cursor-not-allowed shadow-none' 
                  : 'bg-[var(--color-brand-terracotta)] hover:bg-[var(--color-brand-terracotta)]/90 text-white shadow-[var(--color-brand-terracotta)]/20 cursor-pointer'
                }`}
              onClick={handleConfirm}
            >
              {timeLeft > 0 ? `${textoConfirmar} (${timeLeft})` : textoConfirmar}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
