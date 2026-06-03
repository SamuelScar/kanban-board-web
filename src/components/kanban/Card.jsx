import { useRef, useState, useEffect } from 'react'
import { useStore } from '../../store/kanbanStore'
import { OPCOES_COR_CARTAO, clarearCorHexadecimal } from '../../utils'
import { Draggable } from '@hello-pangea/dnd'
import Modal from '../ui/Modal'
import { Trash2, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmDialog from '../ui/ConfirmDialog'

export function CardBase({ cartao, idColuna, provided, snapshot, isClone }) {
  const atualizarTituloCartao = useStore((state) => state.atualizarTituloCartao)
  const atualizarCorCartao = useStore((state) => state.atualizarCorCartao)
  const removerCartao = useStore((state) => state.removerCartao)
  const atualizarDescricaoCartao = useStore((state) => state.atualizarDescricaoCartao)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [colorMenuOpen, setColorMenuOpen] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const detailsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setColorMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [detailsRef])

  const handleTituloChange = (e) => {
    atualizarTituloCartao(idColuna, cartao.id, e.target.value)
  }

  const handleRemoverClick = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = () => {
    removerCartao(idColuna, cartao.id)
    setShowConfirmDelete(false)
  }

  const handleCorClick = (e, valor) => {
    e.stopPropagation();
    atualizarCorCartao(idColuna, cartao.id, valor)
    setColorMenuOpen(false)
  }

  const getCardStyles = () => {
    if (!cartao.cor) return {}
    return {
      '--cartao-superficie': clarearCorHexadecimal(cartao.cor, 0.85),
      '--cartao-borda': clarearCorHexadecimal(cartao.cor, 0.6),
      '--cartao-destaque': cartao.cor
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  }

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) {
      return
    }
    setModalOpen(true)
  }

  const isGhost = snapshot.isDragging && !isClone;
  const isDraggingItem = isClone;

  const dynamicStyle = {
    ...provided.draggableProps.style,
    ...getCardStyles(),
  };

  if (isDraggingItem) {
    if (!snapshot.isDropAnimating) {
      dynamicStyle.transition = 'none';
    }
    if (provided.draggableProps.style?.transform) {
      dynamicStyle.transform = `${provided.draggableProps.style.transform} rotate(2deg)`;
    }
  }

  return (
    <>
      <article
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={dynamicStyle}
        onClick={handleCardClick}
        className={`group relative flex flex-col gap-2 rounded-xl p-3.5 transition-all outline-none 
          ${isGhost ? 'opacity-0' : 'opacity-100'}
          ${isDraggingItem ? 'z-50 shadow-2xl scale-105' : 'shadow-sm hover:shadow-md'}
          ${cartao.cor ? 'bg-[var(--cartao-superficie)] border border-[var(--cartao-borda)]' : 'bg-white border border-black/5'}
        `}
      >
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div ref={detailsRef} className="relative">
            <button
              type="button"
              className="p-1.5 text-black/40 hover:text-black/80 hover:bg-black/5 rounded transition-colors cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setColorMenuOpen(!colorMenuOpen); }}
              aria-label="Escolher cor do cartão"
            >
              <Palette size={14} />
            </button>
            
            <AnimatePresence>
              {colorMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-black/10 p-2 flex gap-1 z-50 min-w-max"
                  onClick={(e) => e.stopPropagation()}
                >
                  {OPCOES_COR_CARTAO.map((opcao) => (
                    <button
                      key={opcao.rotulo}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${cartao.cor === opcao.valor ? 'border-black/30' : 'border-transparent'}`}
                      style={{ backgroundColor: opcao.valor || '#efe5d8' }}
                      title={opcao.rotulo}
                      onClick={(e) => handleCorClick(e, opcao.valor)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            className="p-1.5 text-black/30 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
            aria-label="Excluir cartão"
            onClick={handleRemoverClick}
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        <input
          className={`w-[calc(100%-48px)] text-[15px] font-medium leading-tight bg-transparent border-none outline-none rounded -ml-1 px-1 focus:ring-2 focus:ring-black/10 truncate
            ${cartao.cor ? 'text-[var(--cartao-destaque)]' : 'text-black/80'}
          `}
          style={{ filter: cartao.cor ? 'brightness(0.6)' : 'none' }}
          type="text"
          value={cartao.titulo}
          onChange={handleTituloChange}
          onKeyDown={handleKeyDown}
          maxLength={80}
          aria-label="Título do cartão"
        />
        
        {cartao.descricao && (
          <p className="text-[13px] text-black/60 leading-snug line-clamp-3 overflow-hidden cursor-text" onClick={() => setModalOpen(true)}>
            {cartao.descricao}
          </p>
        )}
      </article>

      {modalOpen && !isClone && (
        <Modal
          titulo="Editar descrição"
          subtitulo="Edição rápida"
          descricaoTexto={`Cartão: "${cartao.titulo}"`}
          valorInicial={cartao.descricao || ''}
          onClose={() => setModalOpen(false)}
          onSave={(novaDescricao) => {
            atualizarDescricaoCartao(idColuna, cartao.id, novaDescricao)
            setModalOpen(false)
          }}
        />
      )}

      {showConfirmDelete && !isClone && (
        <ConfirmDialog 
          isOpen={showConfirmDelete}
          titulo="Excluir cartão?"
          descricao="Essa ação não pode ser desfeita."
          textoConfirmar="Excluir"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </>
  )
}

export default function Card({ cartao, index, idColuna }) {
  return (
    <Draggable draggableId={cartao.id} index={index}>
      {(provided, snapshot) => (
        <CardBase 
          cartao={cartao} 
          idColuna={idColuna} 
          provided={provided} 
          snapshot={snapshot} 
          isClone={false} 
        />
      )}
    </Draggable>
  )
}
