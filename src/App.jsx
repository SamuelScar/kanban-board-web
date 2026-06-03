import { DragDropContext } from '@hello-pangea/dnd'
import { useStore } from './store/kanbanStore'
import Board from './components/kanban/Board'
import { Plus, RefreshCw, AlertTriangle, X, Database, Eye, EyeOff, Moon, Sun, Monitor, Settings, Keyboard, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import ClearBoardDialog from './components/ui/ClearBoardDialog'
import ConfirmDialog from './components/ui/ConfirmDialog'
import EducationalModal from './components/ui/EducationalModal'
import BackupModal from './components/ui/BackupModal'
import LockScreen from './components/ui/LockScreen'
import AutoLockManager from './components/ui/AutoLockManager'
import CheatSheetModal from './components/ui/CheatSheetModal'
import PomodoroWidget from './components/ui/PomodoroWidget'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { playPluck, playDrop } from './utils/audio'

function App() {
  const isLocked = useStore((state) => state.isLocked)
  const isPrivacyMode = useStore((state) => state.isPrivacyMode)
  const togglePrivacyMode = useStore((state) => state.togglePrivacyMode)
  
  const moverCartao = useStore((state) => state.moverCartao)
  const moverColuna = useStore((state) => state.moverColuna)
  const adicionarColuna = useStore((state) => state.adicionarColuna)
  
  const limparCartoes = useStore(state => state.limparCartoes)
  const limparTudo = useStore(state => state.limparTudo)
  const restaurarPadrao = useStore(state => state.restaurarPadrao)
  
  const erroRecuperacao = useStore(state => state.erroRecuperacao)
  const limparErroRecuperacao = useStore(state => state.limparErroRecuperacao)

  const tema = useStore(state => state.tema)
  const definirTema = useStore(state => state.definirTema)

  const atalhosAtivos = useStore(state => state.atalhosAtivos)
  const toggleAtalhos = useStore(state => state.toggleAtalhos)
  
  const somAtivo = useStore(state => state.somAtivo)
  const toggleSom = useStore(state => state.toggleSom)

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (currentTheme) => {
      if (currentTheme === 'dark' || (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    
    applyTheme(tema)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => { if (tema === 'system') applyTheme('system') }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [tema])

  const handleToggleTema = () => {
    if (tema === 'system') definirTema('dark')
    else if (tema === 'dark') definirTema('light')
    else definirTema('system')
  }

  const [showClearOptions, setShowClearOptions] = useState(false)
  const [showBackupOptions, setShowBackupOptions] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showCheatSheet, setShowCheatSheet] = useState(false)
  
  const settingsMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
    if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
      setShowSettingsMenu(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])

useKeyboardShortcuts({
  atalhosAtivos,
  onTogglePrivacy: togglePrivacyMode,
  onToggleTheme: handleToggleTema,
  onShowHelp: () => setShowCheatSheet(true),
  onFocusNewColumn: () => {
    const btn = document.querySelector('[data-new-column-btn]')
    if (btn) btn.focus()
    // Como a criacao de coluna esta no componente Board.jsx, ou delegamos o focus pro input.
    // Como a interface tem o "Nova coluna" q expande, focar no botao ajuda.
  }
})

if (isLocked) {
    return <LockScreen />
  }

  const onDragStart = () => {
    playPluck()
  }

  const onDragEnd = (result) => {
    playDrop()
    const { destination, source, type, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    if (type === 'column') {
      moverColuna(draggableId, destination.index)
      return
    }

    if (type === 'card') {
      moverCartao(source.droppableId, draggableId, destination.droppableId, destination.index)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--color-brand-bg)] text-[var(--color-brand-text)] font-sans">
      {/* Dynamic Background Mesh (subtle) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-brand-sand)] opacity-15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[var(--color-brand-sage)] opacity-15 blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-50 px-8 py-6 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-1 h-6">
            <div className="w-2 h-6 bg-[var(--color-brand-terracotta)] rounded-full" />
            <div className="w-2 h-4 bg-[var(--color-brand-sand)] rounded-full" />
            <div className="w-2 h-5 bg-[var(--color-brand-sage)] rounded-full" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">KBW</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePrivacyMode}
            className={`group flex items-center px-3 py-2 text-sm font-medium transition-all rounded-lg cursor-pointer ${
              isPrivacyMode 
                ? 'text-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/10' 
                : 'text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
              Privacidade
            </span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowClearOptions(true)}
            className="group flex items-center px-3 py-2 text-sm font-medium text-black/60 dark:text-white/60 hover:text-[var(--color-brand-terracotta)] transition-all rounded-lg hover:bg-[var(--color-brand-terracotta)]/10 cursor-pointer"
          >
            <RefreshCw size={18} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
              Limpar Quadro
            </span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleTema}
            className="group flex items-center px-3 py-2 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            {tema === 'system' ? <Monitor size={18} /> : tema === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
              Tema: {tema === 'system' ? 'Sistema' : tema === 'dark' ? 'Escuro' : 'Claro'}
            </span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSom}
            className="group flex items-center px-3 py-2 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            {somAtivo ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
              Sons: {somAtivo ? 'Ligados' : 'Desligados'}
            </span>
          </motion.button>

          <div className="relative" ref={settingsMenuRef}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`group flex items-center px-3 py-2 text-sm font-medium transition-all rounded-lg cursor-pointer ${
                showSettingsMenu ? 'bg-black/5 dark:bg-white/10 text-black/90 dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Settings size={18} />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
                Configurações
              </span>
            </motion.button>

            <AnimatePresence>
              {showSettingsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-black/10 dark:border-white/10 overflow-hidden z-50"
                >
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setShowBackupOptions(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--color-brand-sage)] transition-colors cursor-pointer"
                    >
                      <Database size={16} />
                      <span>Dados e Segurança</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setShowCheatSheet(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Keyboard size={16} />
                        <span>Atalhos de Teclado</span>
                      </div>
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded">?</kbd>
                    </button>

                    <div className="flex items-center justify-between px-3 py-2.5 mt-1 border-t border-black/5 dark:border-white/5">
                      <span className="text-sm font-medium text-black/70 dark:text-white/70">Ativar Atalhos</span>
                      <button 
                        onClick={toggleAtalhos}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${atalhosAtivos ? 'bg-[var(--color-brand-sage)]' : 'bg-black/20 dark:bg-white/20'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${atalhosAtivos ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {erroRecuperacao && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-20 mx-8 mb-4 bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-500" />
              <p className="text-sm font-medium">
                Houve uma falha na leitura dos seus dados locais. Eles foram colocados em uma quarentena de segurança e o quadro foi zerado para evitar travamentos.
              </p>
            </div>
            <button onClick={limparErroRecuperacao} className="p-1 hover:bg-red-500/10 rounded-md transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Board Area */}
      <main className="flex-1 relative z-10 overflow-x-auto overflow-y-hidden px-8 pb-8">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <Board />
        </DragDropContext>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs font-medium text-black/40">
        Seus dados ficam apenas no seu navegador. Feito para o hoje.
      </footer>
      
      <ClearBoardDialog 
        isOpen={showClearOptions}
        onClose={() => setShowClearOptions(false)}
      />
      
      <BackupModal 
        isOpen={showBackupOptions}
        onClose={() => setShowBackupOptions(false)}
      />
      
      <EducationalModal />
      <AutoLockManager />
      
      <CheatSheetModal 
        isOpen={showCheatSheet}
        onClose={() => setShowCheatSheet(false)}
      />
      
      <PomodoroWidget />
    </div>
  )
}

export default App
