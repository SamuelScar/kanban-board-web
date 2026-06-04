import { criarId, normalizarTexto, normalizarCorHexadecimal } from '../utils'
import { mapCartaoNaColuna, mapCartoesNaColuna } from './boardHelpers'

// ── Estado Inicial ─────────────────────────────────────────────

export const criarQuadroInicial = () => ({
  colunas: [
    {
      id: criarId("coluna"),
      titulo: "Backlog",
      cartoes: [
        {
          id: criarId("cartao"),
          titulo: "Revisar o escopo do trabalho",
          descricao: "Mapear requisitos do PDF e transformar em tarefas iniciais.",
        },
        {
          id: criarId("cartao"),
          titulo: "Definir a estrutura dos arquivos",
          descricao: "Separar estado, interface e persistencia desde o inicio.",
        },
      ],
    },
    {
      id: criarId("coluna"),
      titulo: "Em andamento",
      cartoes: [
        {
          id: criarId("cartao"),
          titulo: "Montar layout base do quadro",
          descricao: "Criar a casca inicial da aplicacao para validar a direcao visual.",
        },
      ],
    },
    {
      id: criarId("coluna"),
      titulo: "Concluido",
      cartoes: [
        {
          id: criarId("cartao"),
          titulo: "Criar README e .gitignore",
          descricao: "Registrar o escopo inicial e preparar o repositorio.",
        },
      ],
    },
  ],
})

// ── Board Slice ────────────────────────────────────────────────
// Responsável por todas as operações CRUD no quadro (colunas e cartões)

export const createBoardSlice = (set) => ({
  ...criarQuadroInicial(),
  erroRecuperacao: false,
  tarefaAtivaId: null,
  _forceSave: 0,

  limparErroRecuperacao: () => set({ erroRecuperacao: false }),

  setTarefaAtiva: (id) => set({ tarefaAtivaId: id }),
  limparTarefaAtiva: () => set({ tarefaAtivaId: null }),

  // ── Colunas ──

  adicionarColuna: (titulo) => set((state) => ({
    colunas: [
      ...state.colunas,
      {
        id: criarId("coluna"),
        titulo: normalizarTexto(titulo) || "Nova coluna",
        cartoes: []
      }
    ]
  })),

  removerColuna: (idColuna) => set((state) => {
    // Se a coluna removida continha o cartão com timer ativo, limpa o timer
    const colunaRemovida = state.colunas.find(col => col.id === idColuna)
    const timerOrfao = colunaRemovida?.cartoes.some(c => c.id === state.tarefaAtivaId)
    return {
      colunas: state.colunas.filter(col => col.id !== idColuna),
      ...(timerOrfao && { tarefaAtivaId: null })
    }
  }),

  atualizarTituloColuna: (idColuna, titulo) => set((state) => ({
    colunas: state.colunas.map(col => col.id === idColuna ? { ...col, titulo } : col)
  })),

  // ── Cartões ──

  adicionarCartao: (idColuna, titulo) => set((state) => ({
    colunas: mapCartoesNaColuna(state.colunas, idColuna, (cartoes) => [
      ...cartoes,
      {
        id: criarId("cartao"),
        titulo: normalizarTexto(titulo) || "Novo cartao",
        descricao: ""
      }
    ])
  })),

  removerCartao: (idColuna, idCartao) => set((state) => ({
    colunas: mapCartoesNaColuna(state.colunas, idColuna, (cartoes) =>
      cartoes.filter(cartao => cartao.id !== idCartao)
    ),
    // Se o cartão deletado era o ativo no timer, limpa o timer
    ...(state.tarefaAtivaId === idCartao && { tarefaAtivaId: null })
  })),

  atualizarTituloCartao: (idColuna, idCartao, titulo) => set((state) => ({
    colunas: mapCartaoNaColuna(state.colunas, idColuna, idCartao, (cartao) => ({
      ...cartao, titulo
    }))
  })),

  atualizarDescricaoCartao: (idColuna, idCartao, descricao) => set((state) => ({
    colunas: mapCartaoNaColuna(state.colunas, idColuna, idCartao, (cartao) => ({
      ...cartao, descricao: normalizarTexto(descricao)
    }))
  })),

  atualizarCorCartao: (idColuna, idCartao, cor) => set((state) => {
    const corNormalizada = normalizarCorHexadecimal(cor)
    return {
      colunas: mapCartaoNaColuna(state.colunas, idColuna, idCartao, (cartao) => {
        const novoCartao = { ...cartao }
        if (!corNormalizada) delete novoCartao.cor
        else novoCartao.cor = corNormalizada
        return novoCartao
      })
    }
  }),

  // ── Operações em Lote ──
  // Todas limpam tarefaAtivaId porque os cartões são destruídos

  limparCartoes: () => set((state) => ({
    colunas: state.colunas.map(col => ({ ...col, cartoes: [] })),
    tarefaAtivaId: null
  })),

  limparTudo: () => set(() => ({
    colunas: [],
    tarefaAtivaId: null
  })),

  restaurarPadrao: () => set((state) => ({
    colunas: state.templatePadrao ? JSON.parse(JSON.stringify(state.templatePadrao)) : criarQuadroInicial().colunas,
    tarefaAtivaId: null
  })),

  importarDados: (novasColunas) => set(() => ({
    colunas: novasColunas,
    tarefaAtivaId: null
  })),

  // ── Movimentação (Drag & Drop) ──

  moverColuna: (idColuna, indiceDestino) => set((state) => {
    const indiceOrigem = state.colunas.findIndex(c => c.id === idColuna)
    if (indiceOrigem === -1) return state

    const destinoReal = Math.max(0, Math.min(indiceDestino, state.colunas.length - 1))
    if (indiceOrigem === destinoReal) return state

    const proximasColunas = [...state.colunas]
    const [colunaMovida] = proximasColunas.splice(indiceOrigem, 1)
    proximasColunas.splice(destinoReal, 0, colunaMovida)

    return { colunas: proximasColunas }
  }),

  moverCartao: (idColunaOrigem, idCartao, idColunaDestino, indiceDestino) => set((state) => {
    const idxOrigem = state.colunas.findIndex(c => c.id === idColunaOrigem)
    const idxDestino = state.colunas.findIndex(c => c.id === idColunaDestino)

    if (idxOrigem === -1 || idxDestino === -1) return state

    const colunaOrigem = state.colunas[idxOrigem]
    const idxCartao = colunaOrigem.cartoes.findIndex(c => c.id === idCartao)
    if (idxCartao === -1) return state

    const proximasColunas = [...state.colunas]
    const proximaOrigem = { ...proximasColunas[idxOrigem], cartoes: [...proximasColunas[idxOrigem].cartoes] }
    const proximaDestino = idxOrigem === idxDestino ? proximaOrigem : { ...proximasColunas[idxDestino], cartoes: [...proximasColunas[idxDestino].cartoes] }

    proximasColunas[idxOrigem] = proximaOrigem
    proximasColunas[idxDestino] = proximaDestino

    const [cartaoMovido] = proximaOrigem.cartoes.splice(idxCartao, 1)
    const destinoReal = Math.max(0, Math.min(indiceDestino, proximaDestino.cartoes.length))
    proximaDestino.cartoes.splice(destinoReal, 0, cartaoMovido)

    return { colunas: proximasColunas }
  })
})
