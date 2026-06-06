import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useStore } from './kanbanStore';
import { toast } from 'react-hot-toast';

let lobbyDoc = null;
let lobbyProvider = null;
let approvalsMap = null;
let currentSecretRoomId = null;

const connectLobby = (roomName, signalingServerUrl) => {
  if (lobbyProvider) disconnectLobby();
  
  lobbyDoc = new Y.Doc();
  // Usamos um prefixo 'lobby-' para separar da sala de dados reais
  lobbyProvider = new WebrtcProvider(`lobby-${roomName}`, lobbyDoc, {
    signaling: [signalingServerUrl]
  });
  approvalsMap = lobbyDoc.getMap('approvals');
};

export const disconnectLobby = () => {
  if (lobbyProvider) {
    lobbyProvider.destroy();
    lobbyDoc.destroy();
  }
  lobbyProvider = null;
  lobbyDoc = null;
  approvalsMap = null;
  currentSecretRoomId = null;
};

// ============================================================================
// LÓGICA DO ANFITRIÃO (CRIADOR DA SALA)
// ============================================================================

export const startLobbyHost = (roomName, secretRoomId, signalingServerUrl) => {
  currentSecretRoomId = secretRoomId;
  connectLobby(roomName, signalingServerUrl);
  
  useStore.getState().setPendingRequests([]);
  
  // O Anfitrião escuta quem entra na sala de espera através do Awareness
  lobbyProvider.awareness.on('change', () => {
    updateHostPendingRequests();
  });

  // O Anfitrião também escuta mudanças no mapa de aprovações (caso precise limpar algo)
  approvalsMap.observe(() => {
    updateHostPendingRequests();
  });
};

const updateHostPendingRequests = () => {
  if (!lobbyProvider || !approvalsMap) return;

  const states = lobbyProvider.awareness.getStates();
  const pending = [];

  states.forEach((state, clientId) => {
    if (state.guest && state.guest.name) {
      // Verifica se já não tomamos uma decisão sobre ele
      const decision = approvalsMap.get(clientId.toString());
      if (!decision) {
        pending.push({ id: clientId.toString(), name: state.guest.name });
      }
    }
  });

  const oldPending = useStore.getState().pendingRequests || [];
  const newPending = pending.filter(p => !oldPending.find(op => op.id === p.id));
  
  newPending.forEach(p => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium"><strong>{p.name}</strong> quer entrar na sala.</p>
        <div className="flex gap-2 mt-1">
          <button 
            onClick={() => approveGuest(p.id)}
            className="flex-1 py-1.5 px-3 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Permitir
          </button>
          <button 
            onClick={() => rejectGuest(p.id)}
            className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition-colors"
          >
            Recusar
          </button>
        </div>
      </div>
    ), { 
      duration: Infinity, 
      id: `req-${p.id}`,
      position: 'top-right'
    });
  });

  useStore.getState().setPendingRequests(pending);
};

export const approveGuest = (guestIdStr) => {
  if (!approvalsMap || !currentSecretRoomId) return;
  approvalsMap.set(guestIdStr, currentSecretRoomId);
  toast.dismiss(`req-${guestIdStr}`);
  updateHostPendingRequests(); // Remove da lista de pendentes localmente
};

export const rejectGuest = (guestIdStr) => {
  if (!approvalsMap) return;
  approvalsMap.set(guestIdStr, 'REJECTED');
  toast.dismiss(`req-${guestIdStr}`);
  updateHostPendingRequests();
};

// ============================================================================
// LÓGICA DO VISITANTE
// ============================================================================

export const joinLobbyAsGuest = (roomName, guestName, signalingServerUrl, onApproval, onRejection) => {
  connectLobby(roomName, signalingServerUrl);
  
  const myClientIdStr = lobbyDoc.clientID.toString();

  // Entra na sala de espera "levantando a mão" via Awareness
  lobbyProvider.awareness.setLocalStateField('guest', { name: guestName });
  
  // Fica escutando a resposta do anfitrião no mapa de aprovações
  approvalsMap.observe(() => {
    const decision = approvalsMap.get(myClientIdStr);
    
    if (decision) {
      if (decision === 'REJECTED') {
        disconnectLobby();
        onRejection();
      } else {
        // Se a decisão não for REJECTED, é a chave da sala secreta
        disconnectLobby();
        onApproval(decision);
      }
    }
  });
};
