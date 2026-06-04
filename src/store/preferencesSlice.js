// ── Preferences Slice ──────────────────────────────────────────
// Responsável por preferências de UI: tema, privacidade, atalhos, som, aviso educacional

export const createPreferencesSlice = (set) => ({
  avisoEducacionalVisto: false,
  isPrivacyMode: false,
  tema: 'system',
  atalhosAtivos: true,
  somAtivo: true,

  marcarAvisoEducacionalVisto: () => set({ avisoEducacionalVisto: true }),
  togglePrivacyMode: () => set(state => ({ isPrivacyMode: !state.isPrivacyMode })),
  definirTema: (novoTema) => set({ tema: novoTema }),
  toggleAtalhos: () => set(state => ({ atalhosAtivos: !state.atalhosAtivos })),
  toggleSom: () => set(state => ({ somAtivo: !state.somAtivo })),
})
