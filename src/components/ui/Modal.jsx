import { useEffect, useRef, useState } from 'react'

export default function Modal({
  titulo,
  subtitulo = "Edição",
  descricaoTexto = "",
  valorInicial = "",
  onClose,
  onSave
}) {
  const dialogRef = useRef(null)
  const [valor, setValor] = useState(valorInicial)

  useEffect(() => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal()
    }
  }, [])

  const handleCancel = (e) => {
    e.preventDefault()
    if (dialogRef.current) dialogRef.current.close()
    onClose()
  }

  const handleConfirm = (e) => {
    e.preventDefault()
    if (dialogRef.current) dialogRef.current.close()
    onSave(valor)
  }

  return (
    <dialog
      className="modal-texto"
      ref={dialogRef}
      onCancel={handleCancel}
      aria-labelledby="kanban-dialogo-titulo"
      aria-describedby="kanban-dialogo-descricao"
    >
      <form className="modal-texto__formulario">
        <div className="modal-texto__cabecalho">
          <p className="modal-texto__subtitulo">{subtitulo}</p>
          <h2 className="modal-texto__titulo" id="kanban-dialogo-titulo">{titulo}</h2>
          {descricaoTexto && (
            <p className="modal-texto__descricao" id="kanban-dialogo-descricao">{descricaoTexto}</p>
          )}
        </div>
        
        <label className="modal-texto__campo">
          <span className="modal-texto__rotulo">Descrição do cartão</span>
          <textarea
            className="modal-texto__campo-descricao"
            rows="7"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Digite a descrição do cartão"
            autoFocus
          ></textarea>
        </label>
        
        <div className="modal-texto__acoes">
          <button
            type="button"
            className="modal-texto__botao modal-texto__botao--secundario"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal-texto__botao modal-texto__botao--primario"
            onClick={handleConfirm}
          >
            Salvar
          </button>
        </div>
      </form>
    </dialog>
  )
}
