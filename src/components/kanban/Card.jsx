import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../store/kanbanStore'
import { OPCOES_COR_CARTAO, clarearCorHexadecimal } from '../../utils'
import { TIMEOUTS } from '../../constants/storage'
import { Draggable } from '@hello-pangea/dnd'
import Modal from '../ui/Modal'
import { Trash2, Palette, Timer, MoreHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmDialog from '../ui/ConfirmDialog'
import MarkdownRenderer from '../ui/MarkdownRenderer'
import { useClickOutside } from '../../hooks/useClickOutside'
import { playSwoosh } from '../../utils/audio'

export function CardBase({ cartao, idColuna, provided, snapshot, isClone }) {
  const atualizarTituloCartao = useStore((state) => state.atualizarTituloCartao)
  const atualizarCorCartao = useStore((state) => state.atualizarCorCartao)
  const removerCartao = useStore((state) => state.removerCartao)
  const atualizarDescricaoCartao = useStore((state) => state.atualizarDescricaoCartao)
  const isPrivacyMode = useStore((state) => state.isPrivacyMode)
  
  const tarefaAtivaId = useStore((state) => state.tarefaAtivaId)
  const setTarefaAtiva = useStore((state) => state.setTarefaAtiva)
  const limparTarefaAtiva = useStore((state) => state.limparTarefaAtiva)
  const isAtiva = tarefaAtivaId === cartao.id
  
  const [modalOpen, setModalOpen] = useState(false)
  const [colorMenuOpen, setColorMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [colorMenuPos, setColorMenuPos] = useState({ top: 0, right: 0, above: true })
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmTimerSwitch, setShowConfirmTimerSwitch] = useState(false)
  const detailsRef = useRef(null)
  const colorBtnRef = useRef(null)
  const menuRef = useRef(null)

  const clickRefs = useMemo(() => [detailsRef, menuRef], [])

  useClickOutside(clickRefs, useCallback(() => {
    setColorMenuOpen(false)
    setShowConfirmTimerSwitch(false)
    setMobileMenuOpen(false)
  }, []))

  useEffect(() => {
    if (showConfirmTimerSwitch) {
      const timer = setTimeout(() => {
        setShowConfirmTimerSwitch(false)
      }, TIMEOUTS.TIMER_SWITCH_DISMISS_MS)
      return () => clearTimeout(timer)
    }
  }, [showConfirmTimerSwitch])

  const handleTituloChange = (e) => {
    atualizarTituloCartao(idColuna, cartao.id, e.target.value)
  }

  const handleRemoverClick = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = () => {
    playSwoosh()
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
      '--cartao-superficie-light': clarearCorHexadecimal(cartao.cor, 0.85),
      '--cartao-superficie-dark': `color-mix(in srgb, ${cartao.cor} 15%, #27272a)`,
      '--cartao-borda-light': clarearCorHexadecimal(cartao.cor, 0.6),
      '--cartao-borda-dark': `color-mix(in srgb, ${cartao.cor} 20%, #3f3f46)`,
      '--cartao-texto-light': `color-mix(in srgb, ${cartao.cor} 70%, black)`,
      '--cartao-texto-dark': `color-mix(in srgb, ${cartao.cor} 20%, #f4f4f5)`,
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
          ${cartao.cor ? 'bg-[var(--cartao-superficie-light)] dark:bg-[var(--cartao-superficie-dark)]' : 'bg-white dark:bg-zinc-800'}
          ${isAtiva ? 'border-transparent' : cartao.cor ? 'border border-[var(--cartao-borda-light)] dark:border-[var(--cartao-borda-dark)]' : 'border border-black/5 dark:border-white/5'}
        `}
      >
        {isAtiva && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ overflow: 'visible' }}>
            <defs>
              <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <g filter="url(#edge-glow)">
              {Array.from({ length: 24 }).map((_, i) => (
                <rect 
                  key={i}
                  x="0" y="0" width="100%" height="100%" 
                  rx="12" ry="12" 
                  pathLength="100" 
                  fill="none" 
                  stroke="var(--color-brand-sage)" 
                  strokeWidth={(0.5 + (i / 23) * 2.5).toFixed(1)} 
                  strokeDasharray="2.5 97.5" 
                  strokeLinecap="round" 
                  strokeOpacity={Math.pow(i / 23, 1.2)} 
                  className="animate-svg-edge-light" 
                  style={{ animationDelay: `${-(i * 0.05)}s` }} 
                />
              ))}
            </g>
          </svg>
        )}
        {/* Botão de reticências exclusivo para mobile/tablet */}
        <button
          type="button"
          className={`absolute bottom-2 right-2 p-1.5 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md rounded-lg border border-black/5 dark:border-white/5 shadow-sm text-black/60 dark:text-white/60 z-20 transition-all [@media(hover:hover)]:hidden ${mobileMenuOpen ? 'text-red-500 hover:text-red-600' : 'hover:text-black dark:hover:text-white'}`}
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(!mobileMenuOpen);
            if (mobileMenuOpen) {
              setColorMenuOpen(false);
              setShowConfirmTimerSwitch(false);
            }
          }}
        >
          {mobileMenuOpen ? <X size={14} /> : <MoreHorizontal size={14} />}
        </button>

        <div className={`absolute bottom-2 right-10 [@media(hover:hover)]:right-2 gap-1 transition-all bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md px-1.5 py-1 rounded-lg border border-black/5 dark:border-white/5 shadow-sm z-10 
          ${(colorMenuOpen || showConfirmTimerSwitch || mobileMenuOpen) 
            ? 'flex opacity-100' 
            : 'hidden opacity-0 [@media(hover:hover)]:flex [@media(hover:hover)]:group-hover:opacity-100'
          }
        `}>
          
          <AnimatePresence mode="wait">
            {showConfirmTimerSwitch ? (
              <motion.div 
                key="confirm"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1.5 px-1 overflow-hidden"
              >
                <span className="text-[11px] font-medium text-black/60 dark:text-white/60 whitespace-nowrap ml-1">Trocar foco?</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowConfirmTimerSwitch(false); }} 
                  className="px-2 py-1 text-[10px] font-semibold rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors cursor-pointer"
                >
                  Não
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setTarefaAtiva(cartao.id); setShowConfirmTimerSwitch(false); }} 
                  className="px-2 py-1 text-[10px] font-semibold rounded bg-[var(--color-brand-sage)] text-white hover:brightness-110 transition-all shadow-sm cursor-pointer"
                >
                  Sim
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-1"
              >
                <button
                  type="button"
                  className={`p-1.5 rounded transition-colors cursor-pointer ${isAtiva ? 'text-[var(--color-brand-sage)] bg-[var(--color-brand-sage)]/10' : 'text-black/40 dark:text-white/40 hover:text-[var(--color-brand-sage)] hover:bg-[var(--color-brand-sage)]/10'}`}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isAtiva) {
                      limparTarefaAtiva();
                    } else if (tarefaAtivaId) {
                      setShowConfirmTimerSwitch(true);
                    } else {
                      setTarefaAtiva(cartao.id);
                    }
                  }}
                  aria-label="Focar nesta tarefa"
                >
                  <Timer size={14} />
                </button>
                
                <div ref={detailsRef} className="relative">
                  <button
                    ref={colorBtnRef}
                    type="button"
                    className="p-1.5 text-black/40 dark:text-white/40 hover:text-black/80 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (colorBtnRef.current) {
                        const rect = colorBtnRef.current.getBoundingClientRect()
                        const above = rect.top > 60
                        setColorMenuPos({
                          top: above ? rect.top - 4 : rect.bottom + 4,
                          right: Math.max(10, window.innerWidth - rect.right),
                          above,
                        })
                      }
                      setColorMenuOpen(!colorMenuOpen)
                    }}
                    aria-label="Escolher cor do cartão"
                  >
                    <Palette size={14} />
                  </button>
                  
                  {colorMenuOpen && createPortal(
                    <AnimatePresence>
                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: colorMenuPos.above ? 5 : -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: colorMenuPos.above ? 5 : -5, scale: 0.95 }}
                        style={{
                          position: 'fixed',
                          right: colorMenuPos.right,
                          ...(colorMenuPos.above
                            ? { bottom: window.innerHeight - colorMenuPos.top }
                            : { top: colorMenuPos.top }),
                          zIndex: 9999,
                        }}
                        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-black/10 dark:border-white/10 p-2 flex gap-1 min-w-max"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
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
                    </AnimatePresence>,
                    document.body
                  )}
                </div>
                <button
                  type="button"
                  className="p-1.5 text-black/30 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                  aria-label="Excluir cartão"
                  onClick={handleRemoverClick}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <input
          className={`w-full text-[15px] font-medium leading-tight bg-transparent border-none outline-none rounded -ml-1 px-1 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 truncate transition-all duration-300
            ${cartao.cor ? 'text-[var(--cartao-texto-light)] dark:text-[var(--cartao-texto-dark)]' : 'text-black/80 dark:text-white/80'}
            ${isPrivacyMode ? 'blur-sm hover:blur-none focus:blur-none' : ''}
          `}
          type="text"
          value={cartao.titulo}
          onChange={handleTituloChange}
          onKeyDown={handleKeyDown}
          maxLength={80}
          aria-label="Título do cartão"
        />
        
        {cartao.descricao ? (
          <div 
            className={`text-[13px] leading-snug line-clamp-3 overflow-hidden cursor-text transition-all duration-300 ${isPrivacyMode ? 'blur-sm hover:blur-none' : ''} ${cartao.cor ? 'text-[var(--cartao-texto-light)] dark:text-[var(--cartao-texto-dark)] opacity-90' : 'text-black/60 dark:text-white/60'}`} 
            onClick={() => setModalOpen(true)}
          >
            <MarkdownRenderer content={cartao.descricao} />
          </div>
        ) : (
          <button 
            type="button"
            className="text-left text-[11px] font-medium text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 transition-colors mt-0.5 cursor-pointer w-max px-1 -ml-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
            onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
          >
            + Adicionar descrição...
          </button>
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
          extraActions={
            <>
              <button
                type="button"
                className={`p-2 sm:px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-2 font-medium text-sm border ${isAtiva ? 'text-[var(--color-brand-sage)] border-[var(--color-brand-sage)]/30 bg-[var(--color-brand-sage)]/10' : 'text-black/60 dark:text-white/60 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (isAtiva) {
                    limparTarefaAtiva();
                  } else {
                    setTarefaAtiva(cartao.id);
                  }
                }}
              >
                <Timer size={16} />
                <span className="hidden sm:inline">{isAtiva ? 'Pausar Foco' : 'Focar'}</span>
              </button>

              <button
                type="button"
                className="p-2 sm:px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-2 font-medium text-sm text-red-500/70 border border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(false);
                  setShowConfirmDelete(true);
                }}
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Excluir</span>
              </button>
            </>
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1 bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-black/5 dark:border-white/5">
            <span className="text-sm font-medium text-black/60 dark:text-white/60 shrink-0">Cor do Cartão:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {OPCOES_COR_CARTAO.map((opcao) => (
                <button
                  key={opcao.rotulo}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 cursor-pointer shadow-sm ${cartao.cor === opcao.valor ? 'border-black/50 dark:border-white/50 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: opcao.valor || '#efe5d8' }}
                  title={opcao.rotulo}
                  onClick={(e) => {
                    e.stopPropagation();
                    atualizarCorCartao(idColuna, cartao.id, opcao.valor);
                  }}
                />
              ))}
            </div>
          </div>
        </Modal>
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
