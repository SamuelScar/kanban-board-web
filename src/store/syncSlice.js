export const createSyncSlice = (set, get) => ({
  syncFileHandle: null,
  syncFileName: null,
  syncStatus: 'desvinculado', // 'desvinculado', 'ativo', 'pausado_permissao', 'erro'

  setSyncState: (handle, name, status) => set({
    syncFileHandle: handle,
    syncFileName: name,
    syncStatus: status
  }),
  
  desvincularSync: () => set({
    syncFileHandle: null,
    syncFileName: null,
    syncStatus: 'desvinculado'
  }),
  
  setSyncStatus: (status) => set({
    syncStatus: status
  })
});
