import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { criarId, normalizarTexto, normalizarCorHexadecimal } from '../utils'

const criarQuadroInicial = () => ({
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

export const useStore = create(
  persist(
    (set) => ({
      ...criarQuadroInicial(),
      
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

      adicionarCartao: (idColuna, titulo) => set((state) => ({
        colunas: state.colunas.map(col => {
          if (col.id === idColuna) {
            return {
              ...col,
              cartoes: [
                ...col.cartoes,
                {
                  id: criarId("cartao"),
                  titulo: normalizarTexto(titulo) || "Novo cartao",
                  descricao: ""
                }
              ]
            }
          }
          return col
        })
      })),

      removerColuna: (idColuna) => set((state) => ({
        colunas: state.colunas.filter(col => col.id !== idColuna)
      })),

      removerCartao: (idColuna, idCartao) => set((state) => ({
        colunas: state.colunas.map(col => {
          if (col.id === idColuna) {
            return {
              ...col,
              cartoes: col.cartoes.filter(cartao => cartao.id !== idCartao)
            }
          }
          return col
        })
      })),

      atualizarTituloColuna: (idColuna, titulo) => set((state) => {
        return {
          colunas: state.colunas.map(col => col.id === idColuna ? { ...col, titulo } : col)
        }
      }),

      atualizarTituloCartao: (idColuna, idCartao, titulo) => set((state) => {
        return {
          colunas: state.colunas.map(col => {
            if (col.id === idColuna) {
              return {
                ...col,
                cartoes: col.cartoes.map(cartao => cartao.id === idCartao ? { ...cartao, titulo } : cartao)
              }
            }
            return col;
          })
        }
      }),

      atualizarDescricaoCartao: (idColuna, idCartao, descricao) => set((state) => {
        const descricaoNormalizada = normalizarTexto(descricao);
        return {
          colunas: state.colunas.map(col => {
            if (col.id === idColuna) {
              return {
                ...col,
                cartoes: col.cartoes.map(cartao => cartao.id === idCartao ? { ...cartao, descricao: descricaoNormalizada } : cartao)
              }
            }
            return col;
          })
        }
      }),

      atualizarCorCartao: (idColuna, idCartao, cor) => set((state) => {
        const corNormalizada = normalizarCorHexadecimal(cor);
        return {
          colunas: state.colunas.map(col => {
            if (col.id === idColuna) {
              return {
                ...col,
                cartoes: col.cartoes.map(cartao => {
                  if (cartao.id === idCartao) {
                    const novoCartao = { ...cartao };
                    if (!corNormalizada) delete novoCartao.cor;
                    else novoCartao.cor = corNormalizada;
                    return novoCartao;
                  }
                  return cartao;
                })
              }
            }
            return col;
          })
        }
      }),

      moverColuna: (idColuna, indiceDestino) => set((state) => {
        const indiceOrigem = state.colunas.findIndex(c => c.id === idColuna);
        if (indiceOrigem === -1) return state;
        
        const destinoReal = Math.max(0, Math.min(indiceDestino, state.colunas.length - 1));
        if (indiceOrigem === destinoReal) return state;

        const proximasColunas = [...state.colunas];
        const [colunaMovida] = proximasColunas.splice(indiceOrigem, 1);
        proximasColunas.splice(destinoReal, 0, colunaMovida);

        return { colunas: proximasColunas };
      }),

      moverCartao: (idColunaOrigem, idCartao, idColunaDestino, indiceDestino) => set((state) => {
        const idxOrigem = state.colunas.findIndex(c => c.id === idColunaOrigem);
        const idxDestino = state.colunas.findIndex(c => c.id === idColunaDestino);
        
        if (idxOrigem === -1 || idxDestino === -1) return state;

        const colunaOrigem = state.colunas[idxOrigem];
        const idxCartao = colunaOrigem.cartoes.findIndex(c => c.id === idCartao);
        if (idxCartao === -1) return state;

        const proximasColunas = [...state.colunas];
        const proximaOrigem = { ...proximasColunas[idxOrigem], cartoes: [...proximasColunas[idxOrigem].cartoes] };
        const proximaDestino = idxOrigem === idxDestino ? proximaOrigem : { ...proximasColunas[idxDestino], cartoes: [...proximasColunas[idxDestino].cartoes] };

        proximasColunas[idxOrigem] = proximaOrigem;
        proximasColunas[idxDestino] = proximaDestino;

        const [cartaoMovido] = proximaOrigem.cartoes.splice(idxCartao, 1);
        const destinoReal = Math.max(0, Math.min(indiceDestino, proximaDestino.cartoes.length));
        proximaDestino.cartoes.splice(destinoReal, 0, cartaoMovido);

        return { colunas: proximasColunas };
      })
    }),
    {
      name: 'kanban-board-web:estado', // Mantem a mesma key de antes, entao os dados antigos devem carregar automaticamente!
    }
  )
)
