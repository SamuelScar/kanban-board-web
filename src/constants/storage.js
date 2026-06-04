// Chaves do localStorage/sessionStorage
export const STORAGE_KEYS = Object.freeze({
  ESTADO: 'kanban-board-web:estado',
  SENHA_SESSAO: 'kanban_senha',
  RATE_LIMIT: 'kanban_rate_limit',
  PANIC_HASH: 'kanban_panic_hash',
})

// Prefixo para quarentena de dados corrompidos
export const QUARENTENA_PREFIX = 'kanban-board-web:quarentena'

// Timeouts e limites (em ms salvo onde indicado)
export const TIMEOUTS = Object.freeze({
  AUTO_LOCK_MS: 5 * 60 * 1000,           // 5 minutos de inatividade
  RATE_LIMIT_BLOCK_MS: 60_000,            // 1 minuto de bloqueio após falhas
  MAX_TENTATIVAS_SENHA: 5,
  TIMER_SWITCH_DISMISS_MS: 4_000,         // 4s para fechar confirmação de troca de timer
  CLEAR_DIALOG_COUNTDOWN_S: 3,            // 3 segundos countdown
  INACTIVITY_CHECK_INTERVAL_MS: 10_000,   // intervalo de verificação de inatividade
})
