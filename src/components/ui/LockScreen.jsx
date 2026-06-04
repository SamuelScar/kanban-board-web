import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/kanbanStore'
import { Lock, Unlock, AlertCircle, ShieldAlert } from 'lucide-react'
import { TIMEOUTS } from '../../constants/storage'

export default function LockScreen() {
  const [senha, setSenha] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const tentarDesbloquear = useStore(state => state.tentarDesbloquear)
  const erroDesbloqueio = useStore(state => state.erroDesbloqueio)
  const tentativasFalhas = useStore(state => state.tentativasFalhas)
  const bloqueadoAte = useStore(state => state.bloqueadoAte)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!bloqueadoAte) {
      setTimeLeft(0)
      return
    }
    
    const calculateTime = () => Math.max(0, Math.ceil((bloqueadoAte - Date.now()) / 1000))
    setTimeLeft(calculateTime())
    
    const interval = setInterval(() => {
      const remaining = calculateTime()
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [bloqueadoAte])

  const isPunished = timeLeft > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (senha.trim()) {
      tentarDesbloquear(senha)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-black/5 dark:border-white/5 flex flex-col items-center text-center">
          
          <div 
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 relative overflow-hidden transition-colors ${
              isPunished 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-[var(--color-brand-terracotta)]/10 text-[var(--color-brand-terracotta)]'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              animate={{ 
                scale: isHovered && !isPunished ? 1.1 : 1,
                x: isPunished ? [0, -5, 5, -5, 5, 0] : 0 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300,
                x: { duration: 0.4, repeat: isPunished ? Infinity : 0, repeatDelay: 2 }
              }}
            >
              {isPunished ? <ShieldAlert size={32} /> : isHovered ? <Unlock size={32} /> : <Lock size={32} />}
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold text-black/90 dark:text-white/90 mb-2">Quadro Trancado</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mb-8">
            Seus dados estão protegidos por criptografia local. Digite sua senha para acessar o quadro.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="relative">
              <input 
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha de Desbloqueio"
                disabled={isPunished}
                className={`w-full border rounded-xl px-4 py-3 text-base outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/30 dark:text-white
                  ${isPunished 
                    ? 'bg-black/[0.03] dark:bg-white/[0.03] text-black/50 dark:text-white/50 border-black/5 dark:border-white/5 cursor-not-allowed' 
                    : erroDesbloqueio 
                      ? 'bg-black/[0.03] dark:bg-white/[0.03] text-black/80 dark:text-white/80 border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/40' 
                      : 'bg-black/[0.03] dark:bg-white/[0.03] text-black/80 dark:text-white/80 border-black/10 dark:border-white/10 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/40 focus:border-[var(--color-brand-terracotta)]'
                  }`}
                autoFocus
              />
              
              <AnimatePresence mode="wait">
                {isPunished ? (
                  <motion.div 
                    key="punished"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-6 left-0 text-xs text-red-500 flex items-center gap-1 font-bold"
                  >
                    <ShieldAlert size={12} />
                    Muitas tentativas. Aguarde {timeLeft}s.
                  </motion.div>
                ) : erroDesbloqueio ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-6 left-0 text-xs text-red-500 flex items-center gap-1 font-medium"
                  >
                    <AlertCircle size={12} />
                    Senha incorreta. {Math.max(0, TIMEOUTS.MAX_TENTATIVAS_SENHA - tentativasFalhas)} tentativas restantes.
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <button 
              type="submit"
              disabled={!senha.trim() || isPunished}
              className="mt-4 w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPunished ? <ShieldAlert size={18} /> : <Unlock size={18} />}
              {isPunished ? 'Acesso Bloqueado' : 'Desbloquear Quadro'}
            </button>
          </form>

        </div>
        
        <p className="text-center text-xs text-black/40 dark:text-white/40 mt-6 font-medium px-8">
          A criptografia garante que apenas você tem acesso aos seus cartões. Nós não temos acesso à sua senha.
        </p>
      </motion.div>
    </div>
  )
}
