import { DragDropContext } from '@hello-pangea/dnd'
import { useStore } from './store/kanbanStore'
import Board from './components/kanban/Board'

function App() {
  const moverCartao = useStore((state) => state.moverCartao)
  const moverColuna = useStore((state) => state.moverColuna)

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
    <div className="aplicacao">
      <header className="aplicacao__cabecalho">
        <h1>KBW</h1>
      </header>
      <main className="aplicacao__principal">
        <DragDropContext onDragEnd={onDragEnd}>
          <Board />
        </DragDropContext>
      </main>
    </div>
  )
}

export default App
