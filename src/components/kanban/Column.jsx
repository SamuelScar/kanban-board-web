import { useStore } from '../../store/kanbanStore'
import { formatarQuantidadeCartoes } from '../../utils'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import Card, { CardBase } from './Card'

export default function Column({ coluna, index }) {
  const removerColuna = useStore((state) => state.removerColuna)
  const adicionarCartao = useStore((state) => state.adicionarCartao)
  const atualizarTituloColuna = useStore((state) => state.atualizarTituloColuna)

  const handleRemover = () => {
    if (window.confirm(coluna.cartoes.length === 0 ? `A coluna "${coluna.titulo}" será removida.` : `A coluna "${coluna.titulo}" e seus ${coluna.cartoes.length} cartões serão removidos.`)) {
      removerColuna(coluna.id)
    }
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
        let className = 'coluna';
        if (snapshot.isDragging) {
          className += ' coluna--arrastando';
        }

        const style = {
          ...provided.draggableProps.style,
        };

        if (snapshot.isDragging) {
          if (!snapshot.isDropAnimating) {
            style.transition = 'none';
          }
          if (provided.draggableProps.style?.transform) {
            style.transform = `${provided.draggableProps.style.transform} rotate(1deg)`;
          }
        }

        return (
          <article
            className={className}
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={style}
          >
          <header className="coluna__cabecalho" {...provided.dragHandleProps}>
            <div>
              <input
                className="coluna__campo-titulo"
                type="text"
                value={coluna.titulo}
                onChange={handleTituloChange}
                onKeyDown={handleKeyDown}
                maxLength={40}
                aria-label="Título da coluna"
              />
              <p className="coluna__meta">{formatarQuantidadeCartoes(coluna.cartoes.length)}</p>
            </div>
            <button
              type="button"
              className="coluna__botao-remover"
              onClick={handleRemover}
              aria-label="Excluir coluna"
            >
              x
            </button>
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
                className="coluna__cartoes"
                ref={providedDrop.innerRef}
                {...providedDrop.droppableProps}
                style={{
                  backgroundColor: snapshotDrop.isDraggingOver ? 'rgba(255, 255, 255, 0.18)' : undefined,
                  boxShadow: snapshotDrop.isDraggingOver ? 'inset 0 0 0 1px rgba(185, 111, 59, 0.14)' : undefined
                }}
              >
                {coluna.cartoes.map((cartao, idx) => (
                  <Card key={cartao.id} cartao={cartao} index={idx} idColuna={coluna.id} />
                ))}
                {providedDrop.placeholder}
              </div>
            )}
          </Droppable>

          <button
            type="button"
            className="coluna__botao-adicionar-cartao"
            onClick={() => adicionarCartao(coluna.id)}
            aria-label="Adicionar cartão"
          >
            +
          </button>
        </article>
        )
      }}
    </Draggable>
  )
}
