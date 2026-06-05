import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useStore } from './kanbanStore';

let ydoc = null;
let provider = null;
let sharedMap = null;
let isSyncing = false;
let isObserverInitialized = false;

export const startLiveMode = (roomName, signalingServerUrl) => {
  if (provider) {
    provider.destroy();
    ydoc.destroy();
  }

  // Update Zustand to connecting
  useStore.getState().setLiveModeState('connecting', roomName);
  sessionStorage.setItem('kanban_live_room', roomName);

  ydoc = new Y.Doc();
  sharedMap = ydoc.getMap('kanbanState');

  provider = new WebrtcProvider(roomName, ydoc, {
    signaling: [signalingServerUrl]
  });

  // When connection is fully established
  provider.on('synced', synced => {
    // We consider it online once synced
    useStore.getState().setLiveModeState('online', roomName);
  });

  sharedMap.observe(event => {
    if (event.transaction.local) return;
    const remoteColunas = sharedMap.get('colunas');
    if (remoteColunas) {
      isSyncing = true;
      useStore.setState({ colunas: remoteColunas });
      setTimeout(() => { isSyncing = false; }, 0);
    }
  });

  const estadoAtual = useStore.getState().colunas;
  if (!sharedMap.has('colunas') && estadoAtual.length > 0) {
    sharedMap.set('colunas', estadoAtual);
  }

  return { provider, ydoc };
};

export const disconnectLiveMode = () => {
  if (provider) {
    provider.destroy();
    ydoc.destroy();
    provider = null;
    ydoc = null;
    sharedMap = null;
  }
  sessionStorage.removeItem('kanban_live_room');
  useStore.getState().setLiveModeState('offline', null);
};

export const initLocalSyncObserver = () => {
  if (isObserverInitialized) return;
  isObserverInitialized = true;

  // Tenta reconectar automaticamente no refresh da página se houver sala salva
  const savedRoom = sessionStorage.getItem('kanban_live_room');
  const savedServer = useStore.getState().liveModeServerUrl;
  if (savedRoom) {
    startLiveMode(savedRoom, savedServer);
  }

  useStore.subscribe((estadoAtual, estadoAnterior) => {
    if (isSyncing || !sharedMap) return;
    if (estadoAtual.colunas !== estadoAnterior.colunas) {
      sharedMap.set('colunas', estadoAtual.colunas);
    }
  });
};
