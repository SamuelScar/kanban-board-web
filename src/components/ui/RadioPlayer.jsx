import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, Volume1, Volume2, VolumeX, Radio, Loader2, AlertCircle } from 'lucide-react'
import { useStore } from '../../store/kanbanStore'
import { ESTACOES_RADIO } from '../../store/radioSlice'
import { useClickOutside } from '../../hooks/useClickOutside'
import { radioManager } from '../../utils/radioManager'

export default function RadioPlayer() {
  const radioStatus = useStore(state => state.radioStatus) // 'idle' | 'loading' | 'playing' | 'error'
  const radioVolume = useStore(state => state.radioVolume)
  const currentStationIndex = useStore(state => state.currentStationIndex)
  
  const setRadioVolume = useStore(state => state.setRadioVolume)
  const nextStationState = useStore(state => state.nextStation)
  const prevStationState = useStore(state => state.prevStation)
  
  const currentStation = ESTACOES_RADIO[currentStationIndex]
  
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  
  useClickOutside(menuRef, () => setIsOpen(false))

  // Sincroniza volume
  useEffect(() => {
    radioManager.setVolume(radioVolume)
  }, [radioVolume])

  // Handlers diretos para fletir o bloqueio de Autoplay
  const handleTogglePlay = () => {
    if (radioStatus === 'playing' || radioStatus === 'loading') {
      radioManager.pause()
    } else {
      radioManager.play(currentStation.url, radioVolume)
    }
  }

  const handleNext = () => {
    nextStationState()
    const nextIndex = (currentStationIndex + 1) % ESTACOES_RADIO.length
    if (radioStatus === 'playing' || radioStatus === 'loading' || radioStatus === 'error') {
      radioManager.play(ESTACOES_RADIO[nextIndex].url, radioVolume)
    }
  }

  const handlePrev = () => {
    prevStationState()
    const prevIndex = (currentStationIndex - 1 + ESTACOES_RADIO.length) % ESTACOES_RADIO.length
    if (radioStatus === 'playing' || radioStatus === 'loading' || radioStatus === 'error') {
      radioManager.play(ESTACOES_RADIO[prevIndex].url, radioVolume)
    }
  }

  const isPlaying = radioStatus === 'playing'
  const isLoading = radioStatus === 'loading'
  const isError = radioStatus === 'error'

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão no Header */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center px-3 py-2 text-sm font-medium transition-all rounded-lg cursor-pointer ${
          isPlaying
            ? "text-[var(--color-brand-sage)] bg-[var(--color-brand-sage)]/10"
            : isError 
            ? "text-red-500 bg-red-500/10"
            : "text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
        }`}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin text-[var(--color-brand-sage)]" />
        ) : isError ? (
          <AlertCircle size={18} />
        ) : (
          <Radio size={18} className={isPlaying ? "animate-pulse" : ""} />
        )}
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
          Rádio
        </span>
      </motion.button>

      {/* Menu Suspenso */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-black/10 dark:border-white/10 overflow-hidden z-50 p-4"
          >
            {/* Info da Estação */}
            <div className="text-center mb-4 min-h-[60px]">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                {currentStation.nome}
                {isPlaying && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-sage)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand-sage)]"></span>
                  </span>
                )}
              </h4>
              
              {isError ? (
                <p className="text-xs text-red-500 font-medium mt-1">
                  Estação offline. Tente outra.
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {currentStation.descricao}
                </p>
              )}
            </div>

            {/* Controles Principais */}
            <div className="flex items-center justify-center gap-4 mb-4 relative">
              <button 
                onClick={handlePrev}
                className="p-2 rounded-full text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <SkipBack size={20} fill="currentColor" />
              </button>
              
              <button 
                onClick={handleTogglePlay}
                disabled={isLoading}
                className="p-3 rounded-full bg-[var(--color-brand-sage)] text-white hover:bg-[var(--color-brand-sage)]/90 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : isPlaying ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" className="ml-1" />
                )}
              </button>

              <button 
                onClick={handleNext}
                className="p-2 rounded-full text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <SkipForward size={20} fill="currentColor" />
              </button>
            </div>

            {/* Controle de Volume */}
            <div className="flex items-center gap-3 px-2">
              <button onClick={() => {
                  const newVol = radioVolume === 0 ? 0.3 : 0;
                  setRadioVolume(newVol);
                  radioManager.setVolume(newVol);
                }} 
                className="text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 w-5 flex justify-center"
              >
                {radioVolume === 0 ? <VolumeX size={16} /> : radioVolume < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={radioVolume}
                onChange={(e) => {
                  const newVol = parseFloat(e.target.value);
                  setRadioVolume(newVol);
                  radioManager.setVolume(newVol);
                }}
                className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-sage)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
