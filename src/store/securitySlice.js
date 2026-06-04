import CryptoJS from 'crypto-js'
import { STORAGE_KEYS, TIMEOUTS } from '../constants/storage'
import { kanbanSchema } from './cryptoStorage'
import { criarQuadroInicial } from './boardSlice'

// ── Helpers de Rate Limit ──────────────────────────────────────

const getRateLimit = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RATE_LIMIT)) || { falhas: 0, bloqueadoAte: null }
  } catch (e) {
    return { falhas: 0, bloqueadoAte: null }
  }
}

const saveRateLimit = (data) => localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(data))

// ── Helpers de Senha de Pânico ─────────────────────────────────

const getPanicHash = () => localStorage.getItem(STORAGE_KEYS.PANIC_HASH)
const savePanicHash = (hash) => localStorage.setItem(STORAGE_KEYS.PANIC_HASH, hash)
const clearPanicHash = () => localStorage.removeItem(STORAGE_KEYS.PANIC_HASH)

// ── Security Slice ─────────────────────────────────────────────
// Responsável por criptografia, desbloqueio, rate-limiting e modo pânico

export const createSecuritySlice = (set) => ({
  isLocked: false,
  encryptedData: null,
  erroDesbloqueio: false,
  tentativasFalhas: getRateLimit().falhas,
  bloqueadoAte: getRateLimit().bloqueadoAte,

  tentarDesbloquear: (senha) => set((state) => {
    // Se estiver no período de bloqueio, nem tenta
    if (state.bloqueadoAte && Date.now() < state.bloqueadoAte) {
      return state
    }

    if (!state.encryptedData) return state

    // 1. Verifica MODO PÂNICO primeiro
    const panicHash = getPanicHash()
    if (panicHash && CryptoJS.SHA256(senha).toString() === panicHash) {
      // AUTODESTRUIÇÃO SILENCIOSA
      localStorage.removeItem(STORAGE_KEYS.ESTADO)
      localStorage.removeItem(STORAGE_KEYS.RATE_LIMIT)
      clearPanicHash()
      sessionStorage.removeItem(STORAGE_KEYS.SENHA_SESSAO)

      return {
        ...criarQuadroInicial(),
        isLocked: false,
        encryptedData: null,
        erroDesbloqueio: false,
        tentativasFalhas: 0,
        bloqueadoAte: null,
        isPrivacyMode: false,
        _forceSave: Date.now() // força salvar vazio sobrescrevendo tudo
      }
    }

    // 2. Fluxo Normal de Descriptografia
    try {
      const bytes = CryptoJS.AES.decrypt(state.encryptedData.slice(4), senha)
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8)
      if (!decryptedStr) throw new Error("Senha incorreta")

      const parsed = JSON.parse(decryptedStr)
      const dadosValidados = kanbanSchema.parse(parsed.state)

      sessionStorage.setItem(STORAGE_KEYS.SENHA_SESSAO, senha)
      saveRateLimit({ falhas: 0, bloqueadoAte: null })

      return {
        ...dadosValidados,
        isLocked: false,
        encryptedData: null,
        erroDesbloqueio: false,
        tentativasFalhas: 0,
        bloqueadoAte: null
      }
    } catch (erro) {
      const novasFalhas = state.tentativasFalhas + 1
      const novoBloqueio = novasFalhas >= TIMEOUTS.MAX_TENTATIVAS_SENHA
        ? Date.now() + TIMEOUTS.RATE_LIMIT_BLOCK_MS
        : state.bloqueadoAte
      saveRateLimit({ falhas: novasFalhas, bloqueadoAte: novoBloqueio })

      return {
        erroDesbloqueio: true,
        tentativasFalhas: novasFalhas,
        bloqueadoAte: novoBloqueio
      }
    }
  }),

  trancarSessao: () => {
    // Limpa a chave em memória e recarrega a página para limpar o estado do React
    sessionStorage.removeItem(STORAGE_KEYS.SENHA_SESSAO)
    window.location.reload()
  },

  definirSenha: (novaSenha, senhaPanico) => set(() => {
    sessionStorage.setItem(STORAGE_KEYS.SENHA_SESSAO, novaSenha)
    if (senhaPanico) {
      savePanicHash(CryptoJS.SHA256(senhaPanico).toString())
    } else {
      clearPanicHash()
    }
    return { _forceSave: Date.now() } // Força o persist a salvar com a nova senha
  }),

  removerSenha: () => set(() => {
    sessionStorage.removeItem(STORAGE_KEYS.SENHA_SESSAO)
    clearPanicHash()
    return { _forceSave: Date.now() } // Força o persist a salvar sem senha (texto plano)
  }),
})
