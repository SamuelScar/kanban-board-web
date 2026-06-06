export const createLiveModeSlice = (set) => ({
  liveModeStatus: 'offline', // offline, connecting, online
  liveModeRoom: null,
  liveModeServerUrl: localStorage.getItem('kanban_live_server') || 'wss://kanban-signaling.onrender.com',

  setLiveModeState: (status, roomName) => set({ 
    liveModeStatus: status, 
    liveModeRoom: roomName 
  }),

  setLiveModeServerUrl: (url) => {
    localStorage.setItem('kanban_live_server', url)
    set({ liveModeServerUrl: url })
  }
})
