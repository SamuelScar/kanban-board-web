import { createJSONStorage } from 'zustand/middleware'
import { z } from 'zod'
import CryptoJS from 'crypto-js'
import { STORAGE_KEYS } from '../constants/storage'

// ── Schema de validação (Zod) ──────────────────────────────────
// Garante a integridade dos dados lidos do localStorage

const cartaoSchema = z.object({
  id: z.string(),
  titulo: z.string().max(200, "Título muito longo"), // Limite generoso (um tweet antigo)
  descricao: z.string().max(10000, "Descrição excedeu o limite").optional(), // ~5 páginas de texto
  cor: z.string().max(10).optional()
})

const colunaSchema = z.object({
  id: z.string(),
  titulo: z.string().max(100, "Título de coluna muito longo"),
  cartoes: z.array(cartaoSchema)
})

export const kanbanSchema = z.object({
  colunas: z.array(colunaSchema).optional(),
  avisoEducacionalVisto: z.boolean().optional().default(false),
  tutorialVisto: z.boolean().optional().default(false),
  isLocked: z.boolean().optional().default(false),
  encryptedData: z.string().nullable().optional().default(null),
  isPrivacyMode: z.boolean().optional().default(false),
  tema: z.enum(['light', 'dark', 'system']).optional().default('system'),
  atalhosAtivos: z.boolean().optional().default(true),
  somAtivo: z.boolean().optional().default(true),
  tempoFoco: z.number().min(1).max(120).optional().default(25),
  tempoPausa: z.number().min(1).max(60).optional().default(5),
  radioVolume: z.number().optional().default(0.3),
  currentStationIndex: z.number().optional().default(0),
  radioStatus: z.enum(['idle', 'loading', 'playing', 'error']).optional().default('idle'),
  templatePadrao: z.array(z.any()).nullable().optional().default(null)
})

// ── Motor de Storage Customizado ───────────────────────────────
// Intercepta leitura/escrita para aplicar criptografia AES transparente

const cryptoStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name)
    if (!str) return null

    if (str.startsWith("ENC:")) {
      const senha = sessionStorage.getItem(STORAGE_KEYS.SENHA_SESSAO)
      if (!senha) {
        // Quadro trancado! Retorna um estado mockado avisando a interface
        return JSON.stringify({ state: { isLocked: true, encryptedData: str }, version: 0 })
      }
      try {
        const bytes = CryptoJS.AES.decrypt(str.slice(4), senha)
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8)
        if (!decryptedStr) throw new Error("Senha incorreta")
        return decryptedStr
      } catch (e) {
        // Se a senha estiver errada (ou sessão trocada), trata como trancado
        return JSON.stringify({ state: { isLocked: true, encryptedData: str }, version: 0 })
      }
    }
    return str // Dados não criptografados
  },
  setItem: (name, value) => {
    // Evita sobrescrever o localStorage se o estado atual estiver "trancado"
    try {
      const parsed = JSON.parse(value)
      if (parsed?.state?.isLocked) return
    } catch(e) {}

    const senha = sessionStorage.getItem(STORAGE_KEYS.SENHA_SESSAO)
    if (senha) {
      const encrypted = CryptoJS.AES.encrypt(value, senha).toString()
      localStorage.setItem(name, "ENC:" + encrypted)
    } else {
      localStorage.setItem(name, value)
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
}

// ── Factory do Storage para Zustand ────────────────────────────

export function createKanbanStorage() {
  return createJSONStorage(() => cryptoStorage)
}
