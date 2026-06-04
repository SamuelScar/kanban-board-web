import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/kanbanStore'
import { Play, Pause, X, Coffee, Brain, RotateCcw } from 'lucide-react'
import { playBell, playPluck, playSwoosh, playTick } from '../../utils/audio'

const FOCUS_TIME = 25 * 60
const BREAK_TIME = 5 * 60

export default function PomodoroWidget() {
  const tarefaAtivaId = useStore(state => state.tarefaAtivaId)
  const limparTarefaAtiva = useStore(state => state.limparTarefaAtiva)
  const colunas = useStore(state => state.colunas)
  
  // Encontrar os detalhes da tarefa ativa
  const tarefaAtiva = (() => {
    if (!tarefaAtivaId) return null;
    for (const col of colunas) {
      const cartao = col.cartoes.find(c => c.id === tarefaAtivaId)
      if (cartao) return cartao
    }
    return null
  })()

  // Se a tarefa foi excluída ou desmarcada, limpar o estado local
  useEffect(() => {
    if (!tarefaAtiva) {
      setIsRunning(false)
      setMode('focus')
      setTimeLeft(FOCUS_TIME)
    }
  }, [tarefaAtiva])

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  
  const timerRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Fim do timer! Toca o sino e alterna o modo
            playBell()

            const nextMode = mode === 'focus' ? 'break' : 'focus'
            setMode(nextMode)
            setIsRunning(false) // Pausa pra pessoa decidir quando começar o próximo
            return nextMode === 'focus' ? FOCUS_TIME : BREAK_TIME
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning, mode])

  // Pré-calcular os frames do favicon animado (compatível com navegadores que bloqueiam CSS em SVG favicons)
  const faviconFrames = useMemo(() => {
    const frames = [];
    const totalFrames = 60; // 60 frames para animação super fluida
    for (let i = 0; i < totalFrames; i++) {
      const angle = (i / totalFrames) * 360;
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
          <g transform="rotate(${angle} 50 50)">
            <rect x="4" y="4" width="92" height="92" rx="20" fill="none" stroke="#84a98c" stroke-width="2" stroke-dasharray="60 300" stroke-linecap="round" stroke-opacity="0.1" />
            <rect x="4" y="4" width="92" height="92" rx="20" fill="none" stroke="#84a98c" stroke-width="4" stroke-dasharray="40 300" stroke-linecap="round" stroke-opacity="0.4" />
            <rect x="4" y="4" width="92" height="92" rx="20" fill="none" stroke="#84a98c" stroke-width="6" stroke-dasharray="15 300" stroke-linecap="round" stroke-opacity="1.0" />
          </g>
          <rect x="20" y="25" width="16" height="50" rx="8" fill="#c65e43" />
          <rect x="42" y="35" width="16" height="40" rx="8" fill="#e8ba71" />
          <rect x="64" y="20" width="16" height="55" rx="8" fill="#84a98c" />
        </svg>
      `.trim().replace(/\s+/g, ' ');
      frames.push(`data:image/svg+xml;base64,${btoa(svg)}`);
    }
    return frames;
  }, []);

  // Animador do Favicon
  useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;
    
    let interval;
    if (tarefaAtivaId && isRunning) {
      let frame = 0;
      interval = setInterval(() => {
        favicon.href = faviconFrames[frame];
        frame = (frame + 1) % faviconFrames.length;
      }, 50); // 20 FPS (50ms) = 3 segundos por volta completa (60 frames)
    } else {
      favicon.href = '/favicon.svg';
    }
    
    return () => {
      clearInterval(interval);
      favicon.href = '/favicon.svg';
    }
  }, [tarefaAtivaId, isRunning, faviconFrames])

  const toggleTimer = () => {
    playPluck()
    setIsRunning(!isRunning)
  }
  
  const handleClose = () => {
    playSwoosh()
    limparTarefaAtiva()
    setIsRunning(false)
    setMode('focus')
    setTimeLeft(FOCUS_TIME)
  }
  
  const handleReset = () => {
    playTick()
    setIsRunning(false)
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = mode === 'focus' 
    ? ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100 
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100

  if (!tarefaAtivaId || !tarefaAtiva) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5"
      >
        {/* Progress Bar Top */}
        <div className="w-full h-1 bg-black/5 dark:bg-white/5">
          <motion.div 
            className={`h-full ${mode === 'focus' ? 'bg-[var(--color-brand-sage)]' : 'bg-blue-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
        
        <div className="px-6 py-4 flex items-center gap-6">
          <div className="flex flex-col max-w-[150px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-black/40 dark:text-white/40 flex items-center gap-1">
              {mode === 'focus' ? <><Brain size={10} /> Em Foco</> : <><Coffee size={10} /> Descanso</>}
            </span>
            <span className="text-sm font-medium truncate text-black/80 dark:text-white/80" title={tarefaAtiva.titulo}>
              {tarefaAtiva.titulo}
            </span>
          </div>

          <div className="text-3xl font-bold tracking-tighter tabular-nums text-black/90 dark:text-white/90 w-24 text-center">
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTimer}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all text-white shadow-md hover:scale-105 active:scale-95 ${mode === 'focus' ? 'bg-[var(--color-brand-sage)]' : 'bg-blue-500'}`}
            >
              {isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
            </button>
            
            <button 
              onClick={handleReset}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white hover:bg-black/10 transition-colors"
              title="Reiniciar tempo"
            >
              <RotateCcw size={14} />
            </button>
            
            <button 
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-black/30 dark:text-white/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-1"
              title="Parar Foco"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
