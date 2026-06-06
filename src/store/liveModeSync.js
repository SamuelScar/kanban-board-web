import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useStore } from './kanbanStore';
import { startLobbyHost } from './lobbySync';
import { toast } from 'react-hot-toast';

let ydoc = null;
let provider = null;
let sharedMap = null;
let isSyncing = false;
let isObserverInitialized = false;

export const startLiveMode = (publicRoom, secretRoom, signalingServerUrl, isCreating = false) => {
  if (provider) {
    provider.destroy();
    ydoc.destroy();
  }

  useStore.getState().setLiveModeState('connecting', publicRoom);
  sessionStorage.setItem('kanban_live_room', publicRoom);
  sessionStorage.setItem('kanban_live_secret_room', secretRoom);
  sessionStorage.setItem('kanban_live_is_creating', isCreating);

  ydoc = new Y.Doc();
  sharedMap = ydoc.getMap('kanbanState');

  provider = new WebrtcProvider(secretRoom, ydoc, {
    signaling: [signalingServerUrl]
  });

  const userName = useStore.getState().userName;
  provider.awareness.setLocalStateField('user', { name: userName, isHost: isCreating });

  provider.on('synced', (syncState) => {
    console.log('[LiveMode] Synced event fired:', syncState);
    const isSynced = syncState && syncState.synced;
    if (isSynced) {
      useStore.getState().setLiveModeState('online', publicRoom);
    }
  });

  provider.on('peers', (peersInfo) => {
    console.log('[LiveMode] Peers changed:', peersInfo);
    const webrtcPeers = Array.from(provider.webrtcConns.keys());
    if (webrtcPeers.length > 0) {
      useStore.getState().setLiveModeState('online', publicRoom);
    }
  });

  let oldParticipants = [];

  provider.awareness.on('change', () => {
    const states = provider.awareness.getStates();
    const participants = [];
    states.forEach((state, clientId) => {
      if (state.user && state.user.name) {
        participants.push({
          id: clientId.toString(),
          name: state.user.name,
          isHost: state.user.isHost || false
        });
      }
    });

    const isOnline = useStore.getState().liveModeStatus === 'online';
    if (isOnline && oldParticipants.length > 0) {
      const newIds = participants.map(p => p.id);
      const leftParticipants = oldParticipants.filter(p => !newIds.includes(p.id));
      if (leftParticipants.length > 0) {
        leftParticipants.forEach(p => {
          toast(`${p.name} saiu da sala`, { icon: '👋' });
        });
      }
    }

    oldParticipants = participants;
    useStore.getState().setParticipants(participants);
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
  if (isCreating && !sharedMap.has('colunas') && estadoAtual.length > 0) {
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
  sessionStorage.removeItem('kanban_live_secret_room');
  sessionStorage.removeItem('kanban_live_is_creating');
  useStore.getState().setParticipants([]);
  useStore.getState().setLiveModeState('offline', null);
};

export const initLocalSyncObserver = () => {
  if (isObserverInitialized) return;
  isObserverInitialized = true;

  const savedRoom = sessionStorage.getItem('kanban_live_room');
  const savedSecretRoom = sessionStorage.getItem('kanban_live_secret_room');
  const savedServer = useStore.getState().liveModeServerUrl;
  const isCreating = sessionStorage.getItem('kanban_live_is_creating') === 'true';
  
  if (savedRoom && savedSecretRoom) {
    if (isCreating) {
      startLobbyHost(savedRoom, savedSecretRoom, savedServer);
    }
    startLiveMode(savedRoom, savedSecretRoom, savedServer, isCreating);
  }

  useStore.subscribe((estadoAtual, estadoAnterior) => {
    if (isSyncing || !sharedMap) return;
    if (estadoAtual.colunas !== estadoAnterior.colunas) {
      sharedMap.set('colunas', estadoAtual.colunas);
    }
  });
};
