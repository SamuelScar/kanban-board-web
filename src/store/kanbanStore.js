import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS, QUARENTENA_PREFIX } from '../constants/storage'
import { kanbanSchema, createKanbanStorage } from './cryptoStorage'
import { createBoardSlice } from './boardSlice'
import { createSecuritySlice } from './securitySlice'
import { createPreferencesSlice } from './preferencesSlice'
import { createRadioSlice } from './radioSlice'

// ── Store Composta ─────────────────────────────────────────────
// Ponto central de composição dos slices. Cada slice é responsável
// por um domínio específico (board, segurança, preferências).

export const useStore = create(
  persist(
    (set) => ({
      ...createBoardSlice(set),
      ...createSecuritySlice(set),
      ...createPreferencesSlice(set),
      ...createRadioSlice(set),
    }),
    {
      name: STORAGE_KEYS.ESTADO, // Mantem a mesma key de antes, entao os dados antigos devem carregar automaticamente!
      storage: createKanbanStorage(),
      merge: (persistedState, currentState) => {
        try {
          // Valida estritamente os dados que vêm do LocalStorage
          const dadosValidados = kanbanSchema.parse(persistedState)
          return { ...currentState, ...dadosValidados }
        } catch (erro) {
          console.error("Dados salvos no navegador estão corrompidos. Restaurando estado padrão para evitar tela branca.", erro)

          // QUARENTENA: Salva o dado corrompido em uma chave de backup antes de o Zustand sobrescrever com o padrão
          try {
            localStorage.setItem(`${QUARENTENA_PREFIX}-${Date.now()}`, JSON.stringify(persistedState))
          } catch (e) {
            console.error("Falha ao salvar quarentena", e)
          }

          // Se os dados estiverem bagunçados, descarta e usa o currentState inicial, mas avisa a interface
          return { ...currentState, erroRecuperacao: true }
        }
      }
    }
  )
)
