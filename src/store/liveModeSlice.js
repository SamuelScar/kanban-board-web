export const createLiveModeSlice = (set, get) => ({
  liveModeStatus: 'offline', // offline, lobby, connecting, online
  liveModeRoom: null,
  liveModeServerUrl: localStorage.getItem('kanban_live_server') || 'wss://kanban-signaling.onrender.com',
  
  // Identificação e Presença
  userName: localStorage.getItem('kanban_user_name') || '',
  participants: [], // [{ id, name, isHost }]
  
  // Lobby (Sala de Espera)
  pendingRequests: [], // [{ id, name }]
  
  setUserName: (name) => {
    localStorage.setItem('kanban_user_name', name)
    set({ userName: name })
  },
  
  setParticipants: (participants) => set({ participants }),
  
  setPendingRequests: (requests) => set({ pendingRequests: requests }),

  setLiveModeState: (status, roomName) => set({ 
    liveModeStatus: status, 
    liveModeRoom: roomName 
  }),

  setLiveModeServerUrl: (url) => {
    localStorage.setItem('kanban_live_server', url)
    set({ liveModeServerUrl: url })
  }
})
