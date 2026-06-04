import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS, QUARENTENA_PREFIX } from '../constants/storage'
import { kanbanSchema, createKanbanStorage } from './cryptoStorage'
import { createBoardSlice } from './boardSlice'
import { createSecuritySlice } from './securitySlice'
import { createPreferencesSlice } from './preferencesSlice'
import { createRadioSlice } from './radioSlice'
import { createSyncSlice } from './syncSlice'

/**
 * ── Store Composta (Zustand) ───────────────────────────────────
 * Ponto central de composição dos slices.
 * Utiliza o padrão de "Slices" para dividir o domínio do estado 
 * em pedaços menores (board, segurança, preferências, rádio).
 * Inclui o middleware de persistência integrado com Zod e AES-256.
 */
export const useStore = create(
  persist(
    (set, get) => ({
      ...createBoardSlice(set),
      ...createSecuritySlice(set),
      ...createPreferencesSlice(set),
      ...createRadioSlice(set),
      ...createSyncSlice(set, get),
    }),
    {
      name: STORAGE_KEYS.ESTADO, // Mantem a mesma key de antes, entao os dados antigos devem carregar automaticamente!
      storage: createKanbanStorage(),
      merge: (persistedState, currentState) => {
        try {
          // Valida estritamente os dados que vêm do LocalStorage (garante objeto vazio se for o primeiro acesso)
          const dadosValidados = kanbanSchema.parse(persistedState || {})
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
