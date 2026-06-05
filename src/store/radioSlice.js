export const ESTACOES_RADIO = [
  {
    nome: "Deep Focus",
    url: "https://ice1.somafm.com/defcon-128-mp3",
    descricao: "Música instrumental e beats para hiperfoco"
  },
  {
    nome: "Groove Salad",
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
    descricao: "Downtempo e ambientação chill (SomaFM)"
  },
  {
    nome: "Drone Zone",
    url: "https://ice1.somafm.com/dronezone-128-mp3",
    descricao: "Atmosferas profundas sem batidas (SomaFM)"
  },
  {
    nome: "Secret Agent",
    url: "https://ice1.somafm.com/secretagent-128-mp3",
    descricao: "Jazz/Lounge de espionagem (SomaFM)"
  }
]

export const createRadioSlice = (set) => ({
  radioStatus: 'idle', // 'idle' | 'loading' | 'playing' | 'error'
  radioVolume: 0.3,
  currentStationIndex: 0,
  
  setRadioStatus: (status) => set({ radioStatus: status }),
  
  setRadioVolume: (volume) => set({ radioVolume: volume }),
  
  setStationIndex: (index) => set({ 
    currentStationIndex: index,
  }),
  
  nextStation: () => set((state) => ({
    currentStationIndex: (state.currentStationIndex + 1) % ESTACOES_RADIO.length,
  })),
  
  prevStation: () => set((state) => ({
    currentStationIndex: (state.currentStationIndex - 1 + ESTACOES_RADIO.length) % ESTACOES_RADIO.length,
  })),
})
