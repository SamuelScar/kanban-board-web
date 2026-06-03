import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, LayoutTemplate, Trash2, Eraser } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { useStore } from '../../store/kanbanStore'

export default function ClearBoardDialog({ isOpen, onClose }) {
  const [modo, setModo] = useState('cartoes') // 'cartoes' | 'tudo' | 'padrao'
  const [step, setStep] = useState(1) // 1: opções, 2: confirmação
  const [timeLeft, setTimeLeft] = useState(3)
  
  const limparCartoes = useStore(state => state.limparCartoes)
  const limparTudo = useStore(state => state.limparTudo)
  const restaurarPadrao = useStore(state => state.restaurarPadrao)

  useEffect(() => {
    if (isOpen) {
      setModo('cartoes')
      setStep(1)
      setTimeLeft(3)
    }
  }, [isOpen])

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(id)
    }
  }, [step, timeLeft])

  if (!isOpen) return null;

  const handleCancel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  const handleContinuar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setStep(2)
    setTimeLeft(3)
  }

  const handleVoltar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setStep(1)
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (modo === 'cartoes') limparCartoes();
    if (modo === 'tudo') limparTudo();
    if (modo === 'padrao') restaurarPadrao();
    
    onClose()
  }

  const getConfirmText = () => {
    if (modo === 'cartoes') return "Todos os cartões serão apagados, mas suas colunas serão mantidas. Essa ação não pode ser desfeita."
    if (modo === 'tudo') return "O quadro inteiro será apagado (colunas e cartões). Essa ação não pode ser desfeita."
    if (modo === 'padrao') return "O quadro será resetado para o modelo inicial padrão. Seus dados atuais serão perdidos."
    return ""
  }

  const opcoes = [
    {
      id: 'cartoes',
      titulo: 'Manter colunas',
      descricao: 'Apaga apenas os cartões',
      icone: <Eraser size={20} />
    },
    {
      id: 'tudo',
      titulo: 'Zerar tudo',
      descricao: 'Apaga colunas e cartões',
      icone: <Trash2 size={20} />
    },
    {
      id: 'padrao',
      titulo: 'Modo inicial',
      descricao: 'Restaura exemplos',
      icone: <LayoutTemplate size={20} />
    }
  ]

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={handleCancel}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex shrink-0 items-center justify-center text-[var(--color-brand-terracotta)]">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black/90 dark:text-white/90">Opções de Limpeza</h2>
                    <p className="text-sm text-black/60 dark:text-white/60">Escolha como deseja resetar o seu quadro hoje.</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  {opcoes.map((opcao) => (
                    <label 
                      key={opcao.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${modo === opcao.id ? 'border-[var(--color-brand-terracotta)] bg-orange-50/50' : 'border-black/5 hover:border-black/10 hover:bg-black/[0.02]'}`}
                      onClick={() => setModo(opcao.id)}
                    >
                      <input 
                        type="radio" 
                        name="modo_limpeza" 
                        className="hidden"
                        checked={modo === opcao.id}
                        onChange={() => setModo(opcao.id)}
                      />
                      <div className={`shrink-0 ${modo === opcao.id ? 'text-[var(--color-brand-terracotta)]' : 'text-black/40 dark:text-white/40'}`}>
                        {opcao.icone}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${modo === opcao.id ? 'text-[var(--color-brand-text)]' : 'text-black/70 dark:text-white/70'}`}>{opcao.titulo}</h3>
                        <p className="text-sm text-black/50 dark:text-white/50">{opcao.descricao}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${modo === opcao.id ? 'border-[var(--color-brand-terracotta)]' : 'border-black/20'}`}>
                        {modo === opcao.id && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-terracotta)]" />}
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-3 justify-end mt-2">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="min-w-[120px] px-6 py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-brand-terracotta)] hover:bg-[var(--color-brand-terracotta)]/90 text-white shadow-md shadow-[var(--color-brand-terracotta)]/20 transition-colors cursor-pointer"
                    onClick={handleContinuar}
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6 text-center items-center"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[var(--color-brand-terracotta)] mb-2">
                  <AlertTriangle size={24} />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-black/90 dark:text-white/90 mb-2">Tem certeza absoluta?</h2>
                  <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed max-w-xs">{getConfirmText()}</p>
                </div>
                
                <div className="flex gap-3 justify-center w-full mt-4">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={handleVoltar}
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    disabled={timeLeft > 0}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all
                      ${timeLeft > 0 
                        ? 'bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40 cursor-not-allowed shadow-none' 
                        : 'bg-[var(--color-brand-terracotta)] hover:bg-[var(--color-brand-terracotta)]/90 text-white shadow-[var(--color-brand-terracotta)]/20 cursor-pointer'
                      }`}
                    onClick={handleConfirm}
                  >
                    {timeLeft > 0 ? `Sim, apagar! (${timeLeft})` : 'Sim, apagar!'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
