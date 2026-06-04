import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/kanbanStore'
import { Play, Pause, X, Coffee, Brain, RotateCcw, Settings, Check } from 'lucide-react'
import { playBell, playPluck, playSwoosh, playTick } from '../../utils/audio'

export default function PomodoroWidget() {
  const tarefaAtivaId = useStore(state => state.tarefaAtivaId)
  const limparTarefaAtiva = useStore(state => state.limparTarefaAtiva)
  const colunas = useStore(state => state.colunas)
  
  const tempoFoco = useStore(state => state.tempoFoco)
  const tempoPausa = useStore(state => state.tempoPausa)
  const definirTempoFoco = useStore(state => state.definirTempoFoco)
  const definirTempoPausa = useStore(state => state.definirTempoPausa)
  
  const FOCUS_TIME = tempoFoco * 60
  const BREAK_TIME = tempoPausa * 60
  
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
  
  const [cycles, setCycles] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [tempFoco, setTempFoco] = useState(tempoFoco)
  const [tempPausa, setTempPausa] = useState(tempoPausa)
  
  const timerRef = useRef(null)

  // Limites manuais para o Drag não bugar com CSS bottom
  const [bounds, setBounds] = useState({ top: 0, left: 0, right: 0, bottom: 0 })

  useEffect(() => {
    const updateBounds = () => {
      // O widget tem aprox 300px de largura e 100px de altura
      // Ele começa centralizado embaixo (bottom-6).
      setBounds({
        top: -(window.innerHeight - 150), // Pode subir até quase o topo
        bottom: 0, // Não desce mais que o limite inferior
        left: -(window.innerWidth / 2) + 180, // Limite da esquerda
        right: (window.innerWidth / 2) - 180  // Limite da direita
      })
    }
    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [])

  const dispararFlash = () => {
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 3000)
  }

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Fim do timer! Toca o sino e pisca a tela
            playBell()
            dispararFlash()

            if (mode === 'focus') {
              setCycles(c => c + 1)
              setMode('break')
              setIsRunning(true) // Auto-start do Descanso
              return BREAK_TIME
            } else {
              setMode('focus')
              setIsRunning(false) // Aguarda usuário dar Play no novo Foco
              return FOCUS_TIME
            }
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

  const handleSaveSettings = () => {
    definirTempoFoco(Math.max(1, tempFoco))
    definirTempoPausa(Math.max(1, tempPausa))
    setIsEditing(false)
    setIsRunning(false)
    setMode('focus')
    setTimeLeft(Math.max(1, tempFoco) * 60)
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
    <>
      {/* Flash Visual (pisca a tela visivelmente) */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut", repeat: 1, repeatType: "reverse" }}
            className="fixed inset-0 pointer-events-none z-[9999] bg-[var(--color-brand-sage)]/40 dark:bg-[var(--color-brand-sage)]/30 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 0 150px var(--color-brand-sage)' }}
          />
        )}
      </AnimatePresence>


      <AnimatePresence>
        <motion.div
          drag
          dragConstraints={bounds}
          dragElastic={0.1}
          dragMomentum={false}
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          className="fixed bottom-6 inset-x-0 mx-auto w-max z-50 flex flex-col items-center shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 cursor-move"
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
        
        <div className="px-6 py-4 flex items-center gap-6 min-h-[80px]">
          {isEditing ? (
            <div className="flex items-center gap-4 w-full">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-black/50 dark:text-white/50 mb-1">Foco (min)</label>
                <input 
                  type="number" 
                  min="1" max="120"
                  value={tempFoco} 
                  onChange={(e) => setTempFoco(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-sm font-bold border-none outline-none text-black dark:text-white focus:ring-2 focus:ring-[var(--color-brand-sage)]" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-black/50 dark:text-white/50 mb-1">Pausa (min)</label>
                <input 
                  type="number" 
                  min="1" max="60"
                  value={tempPausa} 
                  onChange={(e) => setTempPausa(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-sm font-bold border-none outline-none text-black dark:text-white focus:ring-2 focus:ring-blue-400" 
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-brand-sage)] text-white hover:bg-[var(--color-brand-sage)]/90 shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col max-w-[150px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-black/40 dark:text-white/40 flex items-center gap-1">
                  {mode === 'focus' ? <><Brain size={10} /> Em Foco</> : <><Coffee size={10} /> Descanso</>}
                  <span className="text-black/30 dark:text-white/30">• Ciclo {cycles}</span>
                  <button onClick={() => { setIsEditing(true); setTempFoco(tempoFoco); setTempPausa(tempoPausa); }} className="ml-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Configurar tempos">
                    <Settings size={10} />
                  </button>
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
            </>
          )}
        </div>
          </motion.div>
      </AnimatePresence>
    </>
  )
}
