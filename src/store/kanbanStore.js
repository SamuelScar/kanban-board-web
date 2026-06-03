import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { z } from 'zod'
import CryptoJS from 'crypto-js'
import { criarId, normalizarTexto, normalizarCorHexadecimal } from '../utils'

// Definindo o schema de validação para garantir a integridade dos dados locais
const cartaoSchema = z.object({
  id: z.string(),
  titulo: z.string().max(200, "Título muito longo"), // Limite generoso (um tweet antigo)
  descricao: z.string().max(10000, "Descrição excedeu o limite").optional(), // ~5 páginas de texto
  cor: z.string().max(10).optional()
});

const colunaSchema = z.object({
  id: z.string(),
  titulo: z.string().max(100, "Título de coluna muito longo"),
  cartoes: z.array(cartaoSchema)
});

const kanbanSchema = z.object({
  colunas: z.array(colunaSchema).optional(),
  avisoEducacionalVisto: z.boolean().optional().default(false),
  isLocked: z.boolean().optional().default(false),
  encryptedData: z.string().nullable().optional().default(null),
  isPrivacyMode: z.boolean().optional().default(false),
  tema: z.enum(['light', 'dark', 'system']).optional().default('system'),
  atalhosAtivos: z.boolean().optional().default(true),
  somAtivo: z.boolean().optional().default(true)
});

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

// Motor de Storage Customizado
const cryptoStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    if (str.startsWith("ENC:")) {
      const senha = sessionStorage.getItem("kanban_senha");
      if (!senha) {
        // Quadro trancado! Retorna um estado mockado avisando a interface
        return JSON.stringify({ state: { isLocked: true, encryptedData: str }, version: 0 });
      }
      try {
        const bytes = CryptoJS.AES.decrypt(str.slice(4), senha);
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedStr) throw new Error("Senha incorreta");
        return decryptedStr;
      } catch (e) {
        // Se a senha estiver errada (ou sessão trocada), trata como trancado
        return JSON.stringify({ state: { isLocked: true, encryptedData: str }, version: 0 });
      }
    }
    return str; // Dados não criptografados
  },
  setItem: (name, value) => {
    // Evita sobrescrever o localStorage se o estado atual estiver "trancado"
    try {
      const parsed = JSON.parse(value);
      if (parsed?.state?.isLocked) return; 
    } catch(e) {}

    const senha = sessionStorage.getItem("kanban_senha");
    if (senha) {
      const encrypted = CryptoJS.AES.encrypt(value, senha).toString();
      localStorage.setItem(name, "ENC:" + encrypted);
    } else {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
}

// Helpers para o Rate Limit da tela de bloqueio
const getRateLimit = () => {
  try {
    return JSON.parse(localStorage.getItem('kanban_rate_limit')) || { falhas: 0, bloqueadoAte: null };
  } catch (e) {
    return { falhas: 0, bloqueadoAte: null };
  }
};
const saveRateLimit = (data) => localStorage.setItem('kanban_rate_limit', JSON.stringify(data));

// Helpers para a Senha de Pânico
const getPanicHash = () => localStorage.getItem('kanban_panic_hash');
const savePanicHash = (hash) => localStorage.setItem('kanban_panic_hash', hash);
const clearPanicHash = () => localStorage.removeItem('kanban_panic_hash');

export const useStore = create(
  persist(
    (set) => ({
      ...criarQuadroInicial(),
      erroRecuperacao: false,
      avisoEducacionalVisto: false,
      isLocked: false,
      encryptedData: null,
      erroDesbloqueio: false,
      tentativasFalhas: getRateLimit().falhas,
      bloqueadoAte: getRateLimit().bloqueadoAte,
      isPrivacyMode: false,
      tema: 'system',
      atalhosAtivos: true,
      somAtivo: true,
      tarefaAtivaId: null,
      _forceSave: 0,
      
      limparErroRecuperacao: () => set({ erroRecuperacao: false }),
      marcarAvisoEducacionalVisto: () => set({ avisoEducacionalVisto: true }),
      togglePrivacyMode: () => set(state => ({ isPrivacyMode: !state.isPrivacyMode })),
      definirTema: (novoTema) => set({ tema: novoTema }),
      toggleAtalhos: () => set(state => ({ atalhosAtivos: !state.atalhosAtivos })),
      toggleSom: () => set(state => ({ somAtivo: !state.somAtivo })),
      
      setTarefaAtiva: (id) => set({ tarefaAtivaId: id }),
      limparTarefaAtiva: () => set({ tarefaAtivaId: null }),
      
      tentarDesbloquear: (senha) => set((state) => {
        // Se estiver no período de bloqueio, nem tenta
        if (state.bloqueadoAte && Date.now() < state.bloqueadoAte) {
          return state;
        }

        if (!state.encryptedData) return state;

        // 1. Verifica MODO PÂNICO primeiro
        const panicHash = getPanicHash();
        if (panicHash && CryptoJS.SHA256(senha).toString() === panicHash) {
          // AUTODESTRUIÇÃO SILENCIOSA
          localStorage.removeItem('kanban-board-web:estado');
          localStorage.removeItem('kanban_rate_limit');
          clearPanicHash();
          sessionStorage.removeItem("kanban_senha");
          
          return {
            ...criarQuadroInicial(),
            isLocked: false,
            encryptedData: null,
            erroDesbloqueio: false,
            tentativasFalhas: 0,
            bloqueadoAte: null,
            isPrivacyMode: false,
            _forceSave: Date.now() // força salvar vazio sobrescrevendo tudo
          };
        }

        // 2. Fluxo Normal de Descriptografia
        try {
          const bytes = CryptoJS.AES.decrypt(state.encryptedData.slice(4), senha);
          const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
          if (!decryptedStr) throw new Error("Senha incorreta");
          
          const parsed = JSON.parse(decryptedStr);
          const dadosValidados = kanbanSchema.parse(parsed.state);
          
          sessionStorage.setItem("kanban_senha", senha);
          saveRateLimit({ falhas: 0, bloqueadoAte: null });
          
          return {
            ...dadosValidados,
            isLocked: false,
            encryptedData: null,
            erroDesbloqueio: false,
            tentativasFalhas: 0,
            bloqueadoAte: null
          };
        } catch (erro) {
          const novasFalhas = state.tentativasFalhas + 1;
          const novoBloqueio = novasFalhas >= 5 ? Date.now() + 60000 : state.bloqueadoAte;
          saveRateLimit({ falhas: novasFalhas, bloqueadoAte: novoBloqueio });
          
          return { 
            erroDesbloqueio: true,
            tentativasFalhas: novasFalhas,
            bloqueadoAte: novoBloqueio
          };
        }
      }),

      trancarSessao: () => {
        // Limpa a chave em memória e recarrega a página para limpar o estado do React
        sessionStorage.removeItem("kanban_senha");
        window.location.reload();
      },

      definirSenha: (novaSenha, senhaPanico) => set(() => {
        sessionStorage.setItem("kanban_senha", novaSenha);
        if (senhaPanico) {
          savePanicHash(CryptoJS.SHA256(senhaPanico).toString());
        } else {
          clearPanicHash();
        }
        return { _forceSave: Date.now() }; // Força o persist a salvar com a nova senha
      }),

      removerSenha: () => set(() => {
        sessionStorage.removeItem("kanban_senha");
        clearPanicHash();
        return { _forceSave: Date.now() }; // Força o persist a salvar sem senha (texto plano)
      }),
      
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

      limparCartoes: () => set((state) => ({
        colunas: state.colunas.map(col => ({ ...col, cartoes: [] }))
      })),

      limparTudo: () => set(() => ({
        colunas: []
      })),

      restaurarPadrao: () => set(() => ({
        ...criarQuadroInicial()
      })),

      importarDados: (novasColunas) => set(() => ({
        colunas: novasColunas
      })),

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
      storage: createJSONStorage(() => cryptoStorage),
      merge: (persistedState, currentState) => {
        try {
          // Valida estritamente os dados que vêm do LocalStorage
          const dadosValidados = kanbanSchema.parse(persistedState);
          return { ...currentState, ...dadosValidados };
        } catch (erro) {
          console.error("Dados salvos no navegador estão corrompidos. Restaurando estado padrão para evitar tela branca.", erro);
          
          // QUARENTENA: Salva o dado corrompido em uma chave de backup antes de o Zustand sobrescrever com o padrão
          try {
            localStorage.setItem(`kanban-board-web:quarentena-${Date.now()}`, JSON.stringify(persistedState));
          } catch (e) {
            console.error("Falha ao salvar quarentena", e);
          }

          // Se os dados estiverem bagunçados, descarta e usa o currentState inicial, mas avisa a interface
          return { ...currentState, erroRecuperacao: true };
        }
      }
    }
  )
)
