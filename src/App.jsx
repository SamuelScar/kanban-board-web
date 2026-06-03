import { DragDropContext } from '@hello-pangea/dnd'
import { useStore } from './store/kanbanStore'
import Board from './components/kanban/Board'
import { Plus, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import ClearBoardDialog from './components/ui/ClearBoardDialog'
import ConfirmDialog from './components/ui/ConfirmDialog'

function App() {
  const moverCartao = useStore((state) => state.moverCartao)
  const moverColuna = useStore((state) => state.moverColuna)
  const adicionarColuna = useStore((state) => state.adicionarColuna)
  
  const limparCartoes = useStore(state => state.limparCartoes)
  const limparTudo = useStore(state => state.limparTudo)
  const restaurarPadrao = useStore(state => state.restaurarPadrao)

  const [showClearOptions, setShowClearOptions] = useState(false)

  const onDragEnd = (result) => {
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
      <header className="relative z-10 px-8 py-6 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-1 h-6">
            <div className="w-2 h-6 bg-[var(--color-brand-terracotta)] rounded-full" />
            <div className="w-2 h-4 bg-[var(--color-brand-sand)] rounded-full" />
            <div className="w-2 h-5 bg-[var(--color-brand-sage)] rounded-full" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">KBW</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowClearOptions(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black/60 hover:text-[var(--color-brand-terracotta)] transition-colors rounded-lg hover:bg-[var(--color-brand-terracotta)]/10 cursor-pointer"
            title="Limpar todos os cartões e reiniciar o quadro"
          >
            <RefreshCw size={16} />
            Limpar Quadro
          </motion.button>
        </div>
      </header>

      {/* Main Board Area */}
      <main className="flex-1 relative z-10 overflow-x-auto overflow-y-hidden px-8 pb-8">
        <DragDropContext onDragEnd={onDragEnd}>
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
    </div>
  )
}

export default App
