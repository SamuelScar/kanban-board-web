import { useStore } from '../../store/kanbanStore'
import { Droppable } from '@hello-pangea/dnd'
import Column from './Column'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { playPop } from '../../utils/audio'

export default function Board({ scrollRef, onMouseDown, onMouseLeave, onMouseUp, onMouseMove }) {
  const colunas = useStore((state) => state.colunas)
  const adicionarColuna = useStore((state) => state.adicionarColuna)

  return (
    <Droppable droppableId="board" type="column" direction="horizontal">
      {(provided) => (
          <section
            className="flex-1 min-h-0 flex gap-4 md:gap-6 h-full items-start overflow-x-auto overflow-y-hidden px-4 md:px-8 cursor-default"
            aria-label="Quadro Kanban"
            ref={(el) => {
              provided.innerRef(el);
              if (scrollRef) scrollRef.current = el;
            }}
            {...provided.droppableProps}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
          >
          {colunas.map((coluna, index) => (
            <Column key={coluna.id} coluna={coluna} index={index} />
          ))}
          {provided.placeholder}
          
          <motion.button
            data-new-column-btn
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.8)' }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="flex-shrink-0 flex items-center justify-center gap-2 w-[85vw] max-w-[320px] sm:w-[320px] h-[72px] rounded-2xl bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-black/60 hover:text-black/90 font-medium transition-colors shadow-sm cursor-pointer mt-1"
            onClick={() => { playPop(); adicionarColuna() }}
          >
            <Plus size={20} />
            Nova coluna
          </motion.button>
        </section>
      )}
    </Droppable>
  )
}
