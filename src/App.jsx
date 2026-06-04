import { DragDropContext } from '@hello-pangea/dnd'
import { useStore } from './store/kanbanStore'
import Board from './components/kanban/Board'
import Header from './components/layout/Header'
import { AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
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
  
  const erroRecuperacao = useStore(state => state.erroRecuperacao)
  const limparErroRecuperacao = useStore(state => state.limparErroRecuperacao)

  const tema = useStore(state => state.tema)
  const definirTema = useStore(state => state.definirTema)

  const atalhosAtivos = useStore(state => state.atalhosAtivos)

  // ── Tema ──────────────────────────────────────────────────────
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

  // ── Estado dos Modais ────────────────────────────────────────
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)
  const [backupModalMode, setBackupModalMode] = useState('dados')
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false)

  const abrirModalDados = () => {
    setBackupModalMode('dados')
    setIsBackupModalOpen(true)
  }

  const abrirModalSeguranca = () => {
    setBackupModalMode('seguranca')
    setIsBackupModalOpen(true)
  }

  // ── Atalhos de Teclado ───────────────────────────────────────
  useKeyboardShortcuts({
    atalhosAtivos,
    onTogglePrivacy: togglePrivacyMode,
    onToggleTheme: handleToggleTema,
    onShowHelp: () => setIsCheatSheetOpen(true),
    onFocusNewColumn: () => {
      const btn = document.querySelector('[data-new-column-btn]')
      if (btn) btn.focus()
    }
  })

  // ── Lock Screen ──────────────────────────────────────────────
  if (isLocked) {
    return <LockScreen />
  }

  // ── Drag & Drop ──────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--color-brand-bg)] text-[var(--color-brand-text)] font-sans">
      {/* Dynamic Background Mesh (subtle) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-brand-sand)] opacity-15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[var(--color-brand-sage)] opacity-15 blur-[100px] pointer-events-none" />
      
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

      <Header 
        onToggleTema={handleToggleTema}
        onShowClearDialog={() => setIsClearDialogOpen(true)}
        onShowBackupOptions={abrirModalDados}
        onShowSecurityOptions={abrirModalSeguranca}
        onShowCheatSheet={() => setIsCheatSheetOpen(true)}
      />

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
        isOpen={isClearDialogOpen} 
        onClose={() => setIsClearDialogOpen(false)} 
      />
      
      <BackupModal 
        isOpen={isBackupModalOpen} 
        mode={backupModalMode}
        onClose={() => setIsBackupModalOpen(false)} 
      />
      
      <EducationalModal />
      <AutoLockManager />
      
      <CheatSheetModal 
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
      
      <PomodoroWidget />
    </div>
  )
}

export default App
