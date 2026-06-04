import { useStore } from '../../store/kanbanStore'
import { Droppable } from '@hello-pangea/dnd'
import Column from './Column'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { playPop } from '../../utils/audio'

export default function Board() {
  const colunas = useStore((state) => state.colunas)
  const adicionarColuna = useStore((state) => state.adicionarColuna)

  return (
    <Droppable droppableId="board" type="column" direction="horizontal">
      {(provided) => (
        <section
          className="flex gap-6 h-full items-start"
          aria-label="Quadro Kanban"
          ref={provided.innerRef}
          {...provided.droppableProps}
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
            className="flex-shrink-0 flex items-center justify-center gap-2 w-[320px] h-[72px] rounded-2xl bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-black/60 hover:text-black/90 font-medium transition-colors shadow-sm cursor-pointer"
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
