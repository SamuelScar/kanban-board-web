import { useStore } from '../../store/kanbanStore'
import { formatarQuantidadeCartoes } from '../../utils'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import Card, { CardBase } from './Card'
import { Trash2, Plus, MoreHorizontal, X, GripHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useRef, useCallback, useMemo, memo } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'
import ConfirmDialog from '../ui/ConfirmDialog'
import { playPop, playSwoosh } from '../../utils/audio'

export default memo(function Column({ coluna, index }) {
  const removerColuna = useStore((state) => state.removerColuna)
  const adicionarCartao = useStore((state) => state.adicionarCartao)
  const atualizarTituloColuna = useStore((state) => state.atualizarTituloColuna)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const headerRef = useRef(null)

  useClickOutside(useMemo(() => [headerRef], []), useCallback(() => {
    setMobileMenuOpen(false)
  }, []))

  const handleRemover = () => {
    playSwoosh()
    removerColuna(coluna.id)
    setShowConfirmDelete(false)
  }

  const handleTituloChange = (e) => {
    atualizarTituloColuna(coluna.id, e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  }

  return (
    <Draggable draggableId={coluna.id} index={index}>
      {(provided, snapshot) => {
        let className = 'flex flex-col flex-shrink-0 w-[85vw] max-w-[320px] sm:w-[320px] max-h-full bg-white/50 dark:bg-black/30 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-4 shadow-xl shadow-black/5 transition-all duration-300';
        if (snapshot.isDragging) {
          className += ' shadow-2xl scale-[1.02] bg-white/70 dark:bg-black/50 ring-4 ring-[var(--color-brand-terracotta)]/20 z-50';
        }

        const style = {
          ...provided.draggableProps.style,
        };

        if (snapshot.isDragging) {
          if (!snapshot.isDropAnimating) {
            style.transition = 'none';
          }
          if (provided.draggableProps.style?.transform) {
            style.transform = `${provided.draggableProps.style.transform} rotate(2deg)`;
          }
        }

        return (
          <article
            className={className}
            ref={provided.innerRef}
            data-tour={index === 0 ? "colunas" : undefined}
            {...provided.draggableProps}
            style={style}
          >
          <header ref={headerRef} className="flex items-center gap-1 px-2 pb-4 group" {...provided.dragHandleProps}>
            <div className="md:hidden flex items-center justify-center p-1 -ml-1 text-black/30 dark:text-white/30 shrink-0 touch-none">
              <GripHorizontal size={20} />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <input
                className="w-full text-[17px] font-semibold text-[var(--color-brand-text)] bg-transparent border-none outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/40 rounded px-1 -mx-1 truncate"
                type="text"
                value={coluna.titulo}
                onChange={handleTituloChange}
                onKeyDown={handleKeyDown}
                maxLength={40}
                aria-label="Título da coluna"
              />
              <p className="text-xs font-medium text-black/40 dark:text-white/40 mt-0.5 ml-1">{formatarQuantidadeCartoes(coluna.cartoes.length)}</p>
            </div>
            
            <div 
              className="relative flex items-center gap-1 shrink-0"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <button 
                type="button"
                className={`text-black/40 dark:text-white/40 hover:text-black/70 p-2 rounded-full cursor-pointer transition-colors [@media(hover:hover)]:hidden ${mobileMenuOpen ? 'text-red-500 hover:text-red-600' : ''}`}
                onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
              >
                {mobileMenuOpen ? <X size={16} /> : <MoreHorizontal size={16} />}
              </button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                className={`text-black/20 dark:text-white/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-full transition-colors cursor-pointer 
                  ${mobileMenuOpen ? 'flex opacity-100' : 'hidden opacity-0 [@media(hover:hover)]:flex [@media(hover:hover)]:group-hover:opacity-100'}
                `}
                onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); setMobileMenuOpen(false); }}
                aria-label="Excluir coluna"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </header>

          <Droppable 
            droppableId={coluna.id} 
            type="card"
            renderClone={(providedClone, snapshotClone, rubric) => (
              <CardBase 
                cartao={coluna.cartoes[rubric.source.index]} 
                idColuna={coluna.id} 
                provided={providedClone} 
                snapshot={snapshotClone} 
                isClone={true} 
              />
            )}
          >
            {(providedDrop, snapshotDrop) => (
              <div
                className={`flex-1 overflow-y-auto overflow-x-hidden px-1 -mx-1 py-1 -my-1 min-h-[50px] flex flex-col gap-3 rounded-2xl transition-colors duration-200 ${snapshotDrop.isDraggingOver ? 'bg-black/5 dark:bg-white/5 ring-inset ring-1 ring-black/10 dark:ring-white/10 p-2 -m-2' : ''}`}
                ref={providedDrop.innerRef}
                {...providedDrop.droppableProps}
              >
                {coluna.cartoes.map((cartao, idx) => (
                  <Card key={cartao.id} cartao={cartao} index={idx} idColuna={coluna.id} isFirst={index === 0 && idx === 0} />
                ))}
                {providedDrop.placeholder}
              </div>
            )}
          </Droppable>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-black/50 dark:text-white/50 hover:text-[var(--color-brand-terracotta)] text-sm font-medium transition-colors cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5 shadow-sm"
            onClick={() => { playPop(); adicionarCartao(coluna.id, "") }}
            aria-label="Adicionar cartão"
          >
            <Plus size={16} />
            Adicionar
          </motion.button>
          
          <ConfirmDialog 
            isOpen={showConfirmDelete}
            titulo="Excluir coluna?"
            descricao={coluna.cartoes.length === 0 ? `A coluna "${coluna.titulo}" será removida.` : `A coluna "${coluna.titulo}" e seus ${coluna.cartoes.length} cartões serão removidos.`}
            textoConfirmar="Excluir"
            onConfirm={handleRemover}
            onCancel={() => setShowConfirmDelete(false)}
          />
        </article>
        )
      }}
    </Draggable>
  )
})
