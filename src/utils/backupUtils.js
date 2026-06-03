import { criarId } from './index'

// --- HELPER: Faz o download de um arquivo gerado no lado do cliente ---
function baixarArquivo(conteudo, nomeArquivo, tipoMime) {
  const blob = new Blob([conteudo], { type: tipoMime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// --- EXPORTAÇÕES ---

export function exportarNativo(colunas) {
  const json = JSON.stringify({ colunas, versao: 1 }, null, 2)
  const data = new Date().toISOString().split('T')[0]
  baixarArquivo(json, `kanban-backup-${data}.json`, 'application/json')
}

export function exportarTrello(colunas) {
  // Converte nosso modelo para o modelo básico do Trello
  const lists = []
  const cards = []

  colunas.forEach((col, index) => {
    const listId = col.id
    lists.push({
      id: listId,
      name: col.titulo,
      pos: (index + 1) * 1000,
      closed: false
    })

    col.cartoes.forEach((cartao, cartaoIndex) => {
      cards.push({
        id: cartao.id,
        idList: listId,
        name: cartao.titulo,
        desc: cartao.descricao || '',
        pos: (cartaoIndex + 1) * 1000,
        closed: false
      })
    })
  })

  const trelloJson = JSON.stringify({
    name: "Quadro Exportado (KBW)",
    lists,
    cards
  }, null, 2)

  const data = new Date().toISOString().split('T')[0]
  baixarArquivo(trelloJson, `trello-export-${data}.json`, 'application/json')
}

export function exportarTexto(colunas) {
  let texto = "# Meu Quadro Kanban\n\n"

  colunas.forEach(col => {
    texto += `## 📋 ${col.titulo}\n`
    if (col.cartoes.length === 0) {
      texto += "*(Vazio)*\n"
    } else {
      col.cartoes.forEach(cartao => {
        texto += `- [ ] ${cartao.titulo}\n`
        if (cartao.descricao) {
          // Adiciona tabulação para a descrição
          const descFormatada = cartao.descricao.split('\n').map(linha => `    ${linha}`).join('\n')
          texto += `${descFormatada}\n`
        }
      })
    }
    texto += "\n"
  })

  const data = new Date().toISOString().split('T')[0]
  baixarArquivo(texto, `kanban-resumo-${data}.txt`, 'text/plain')
}

// --- IMPORTAÇÃO ---

export async function processarArquivoImportacao(arquivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const conteudo = e.target.result
        const dados = JSON.parse(conteudo)
        
        // 1. Tentar detectar se é um backup Trello
        if (dados.lists && dados.cards) {
          const colunasConvertidas = parseTrelloParaNativo(dados)
          resolve(colunasConvertidas)
          return
        }

        // 2. Assumir que é backup Nativo (pode estar na raiz `colunas` ou dentro do `state` se foi exportado errado pelo Zustand)
        let colunas = []
        if (Array.isArray(dados.colunas)) {
          colunas = dados.colunas
        } else if (dados.state && Array.isArray(dados.state.colunas)) {
          colunas = dados.state.colunas
        } else {
          throw new Error("Formato de arquivo não reconhecido.")
        }
        
        resolve(colunas)

      } catch (erro) {
        reject(erro)
      }
    }

    reader.onerror = () => {
      reject(new Error("Falha ao ler o arquivo."))
    }

    reader.readAsText(arquivo)
  })
}

function parseTrelloParaNativo(trelloData) {
  const colunasMap = new Map()

  // Criar colunas
  if (Array.isArray(trelloData.lists)) {
    trelloData.lists.filter(l => !l.closed).sort((a, b) => a.pos - b.pos).forEach(list => {
      colunasMap.set(list.id, {
        id: criarId("coluna"),
        titulo: list.name || "Sem Título",
        cartoes: []
      })
    })
  }

  // Preencher cartoes
  if (Array.isArray(trelloData.cards)) {
    trelloData.cards.filter(c => !c.closed).sort((a, b) => a.pos - b.pos).forEach(card => {
      const colunaDestino = colunasMap.get(card.idList)
      if (colunaDestino) {
        colunaDestino.cartoes.push({
          id: criarId("cartao"),
          titulo: card.name || "Cartão Sem Título",
          descricao: card.desc || "",
        })
      }
    })
  }

  return Array.from(colunasMap.values())
}
