import { useStore } from '../../store/kanbanStore'
import { Droppable } from '@hello-pangea/dnd'
import Column from './Column'

export default function Board() {
  const colunas = useStore((state) => state.colunas)
  const adicionarColuna = useStore((state) => state.adicionarColuna)

  return (
    <Droppable droppableId="board" type="column" direction="horizontal">
      {(provided) => (
        <section
          className="quadro"
          aria-label="Quadro Kanban"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {colunas.map((coluna, index) => (
            <Column key={coluna.id} coluna={coluna} index={index} />
          ))}
          {provided.placeholder}
          
          <button
            type="button"
            className="quadro__botao-adicionar-coluna"
            onClick={() => adicionarColuna()}
          >
            + Nova coluna
          </button>
        </section>
      )}
    </Droppable>
  )
}
