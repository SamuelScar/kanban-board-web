import { useEffect } from 'react';
import { useStore } from '../../store/kanbanStore';
import { STORAGE_KEYS, TIMEOUTS } from '../../constants/storage';

export default function AutoLockManager() {
  const trancarSessao = useStore(state => state.trancarSessao);

  useEffect(() => {
    let lastActivityTime = Date.now();
    let intervalId = null;

    const resetTimer = () => {
      lastActivityTime = Date.now();
    };

    const checkInactivity = () => {
      const temSenha = !!sessionStorage.getItem(STORAGE_KEYS.SENHA_SESSAO);
      
      // Só tranca se houver uma sessão ativa de criptografia
      if (temSenha && Date.now() - lastActivityTime >= TIMEOUTS.AUTO_LOCK_MS) {
        trancarSessao();
      }
    };

    // Eventos que indicam atividade do usuário
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Checa a inatividade periodicamente para não sobrecarregar
    intervalId = setInterval(checkInactivity, TIMEOUTS.INACTIVITY_CHECK_INTERVAL_MS);

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
