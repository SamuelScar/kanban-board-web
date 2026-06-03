import { useEffect } from 'react';
import { useStore } from '../../store/kanbanStore';

// Tempo de inatividade antes de trancar: 5 minutos
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export default function AutoLockManager() {
  const trancarSessao = useStore(state => state.trancarSessao);

  useEffect(() => {
    let lastActivityTime = Date.now();
    let intervalId = null;

    const resetTimer = () => {
      lastActivityTime = Date.now();
    };

    const checkInactivity = () => {
      const temSenha = !!sessionStorage.getItem("kanban_senha");
      
      // Só tranca se houver uma sessão ativa de criptografia
      if (temSenha && Date.now() - lastActivityTime >= INACTIVITY_TIMEOUT_MS) {
        trancarSessao();
      }
    };

    // Eventos que indicam atividade do usuário
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Checa a inatividade a cada 10 segundos para não sobrecarregar
    intervalId = setInterval(checkInactivity, 10000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(intervalId);
    };
  }, [trancarSessao]);

  // Esse componente é invisível, serve apenas para gerenciar os eventos globais
  return null;
}
