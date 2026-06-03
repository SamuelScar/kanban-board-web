import { useRef, useState } from 'react'
import { useStore } from '../../store/kanbanStore'
import { OPCOES_COR_CARTAO, clarearCorHexadecimal } from '../../utils'
import { Draggable } from '@hello-pangea/dnd'
import Modal from '../ui/Modal'

export function CardBase({ cartao, idColuna, provided, snapshot, isClone }) {
  const atualizarTituloCartao = useStore((state) => state.atualizarTituloCartao)
  const atualizarCorCartao = useStore((state) => state.atualizarCorCartao)
  const removerCartao = useStore((state) => state.removerCartao)
  const atualizarDescricaoCartao = useStore((state) => state.atualizarDescricaoCartao)
  
  const detailsRef = useRef(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleTituloChange = (e) => {
    atualizarTituloCartao(idColuna, cartao.id, e.target.value)
  }

  const handleRemover = () => {
    if (window.confirm('Excluir cartão?\nEssa ação não pode ser desfeita.')) {
      removerCartao(idColuna, cartao.id)
    }
  }

  const handleCorClick = (valor) => {
    atualizarCorCartao(idColuna, cartao.id, valor)
    if (detailsRef.current) {
      detailsRef.current.removeAttribute('open')
    }
  }

  const getCardStyles = () => {
    if (!cartao.cor) return {}
    return {
      '--cartao-superficie': clarearCorHexadecimal(cartao.cor, 0.82),
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
    // If clicking on an interactive element, ignore
    if (e.target.closest('.cartao__acoes') || e.target.closest('input')) {
      return
    }
    setModalOpen(true)
  }

  const isGhost = snapshot.isDragging && !isClone;
  const isDraggingItem = isClone;

  let className = 'cartao';
  if (isGhost) className += ' cartao--fantasma';
  if (isDraggingItem) className += ' cartao--arrastando';

  const style = {
    ...provided.draggableProps.style,
    ...getCardStyles(),
  };

  if (isDraggingItem) {
    if (!snapshot.isDropAnimating) {
      style.transition = 'none'; // prevents lag behind cursor but allows drop animation
    }
    if (provided.draggableProps.style?.transform) {
      style.transform = `${provided.draggableProps.style.transform} rotate(1.6deg)`;
    }
  }

  return (
    <>
      <article
        className={className}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={style}
        onClick={handleCardClick}
      >
        <div className="cartao__acoes">
          <details className="cartao__seletor-cor" ref={detailsRef}>
            <summary
              className="cartao__alternador-cor"
              aria-label="Escolher cor do cartão"
              title="Escolher cor do cartão"
              style={{ '--cartao-preenchimento-botao-cor': cartao.cor || '#efe5d8' }}
            ></summary>
            <div className="cartao__menu-cor">
              {OPCOES_COR_CARTAO.map((opcao) => (
                <button
                  key={opcao.rotulo}
                  type="button"
                  className={`cartao__opcao-cor ${!opcao.valor ? 'cartao__opcao-cor--limpar' : ''}`}
                  aria-label={opcao.rotulo}
                  title={opcao.rotulo}
                  aria-pressed={opcao.valor === cartao.cor}
                  style={opcao.valor ? { '--cartao-preenchimento-opcao-cor': opcao.valor } : {}}
                  onClick={() => handleCorClick(opcao.valor)}
                ></button>
              ))}
            </div>
          </details>
          <button
            type="button"
            className="cartao__botao-remover"
            aria-label="Excluir cartão"
            onClick={handleRemover}
          >
            x
          </button>
        </div>
        
        <input
          className="cartao__campo-titulo"
          type="text"
          value={cartao.titulo}
          onChange={handleTituloChange}
          onKeyDown={handleKeyDown}
          maxLength={80}
          aria-label="Título do cartão"
        />
        
        {cartao.descricao && (
          <p className="cartao__descricao">{cartao.descricao}</p>
        )}
      </article>

      {modalOpen && !isClone && (
        <Modal
          titulo="Editar descrição"
          subtitulo="Edição"
          descricaoTexto={`Cartão: "${cartao.titulo}"`}
          valorInicial={cartao.descricao || ''}
          onClose={() => setModalOpen(false)}
          onSave={(novaDescricao) => {
            atualizarDescricaoCartao(idColuna, cartao.id, novaDescricao)
            setModalOpen(false)
          }}
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
