// ── Preferences Slice ──────────────────────────────────────────
// Responsável por preferências de UI: tema, privacidade, atalhos, som, aviso educacional

export const createPreferencesSlice = (set) => ({
  avisoEducacionalVisto: false,
  tutorialVisto: false,
  isPrivacyMode: false,
  tema: 'system',
  atalhosAtivos: true,
  somAtivo: true,
  tempoFoco: 25,
  tempoPausa: 5,
  templatePadrao: null,

  marcarAvisoEducacionalVisto: () => set({ avisoEducacionalVisto: true }),
  marcarTutorialVisto: () => set({ tutorialVisto: true }),
  togglePrivacyMode: () => set(state => ({ isPrivacyMode: !state.isPrivacyMode })),
  definirTema: (novoTema) => set({ tema: novoTema }),
  toggleAtalhos: () => set(state => ({ atalhosAtivos: !state.atalhosAtivos })),
  toggleSom: () => set(state => ({ somAtivo: !state.somAtivo })),
  definirTempoFoco: (minutos) => set({ tempoFoco: minutos }),
  definirTempoPausa: (minutos) => set({ tempoPausa: minutos }),
  salvarTemplatePadrao: (colunas) => set({ templatePadrao: colunas }),
  removerTemplatePadrao: () => set({ templatePadrao: null }),
})
