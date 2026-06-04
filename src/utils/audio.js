import { useStore } from '../store/kanbanStore'

let audioCtx = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Retoma o contexto se ele tiver sido suspenso pelo navegador
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Verifica se o som está ativo na store antes de executar.
 * Usado como guard em todas as funções de áudio.
 */
const isSomAtivo = () => useStore.getState().somAtivo

// ── Sons de Drag & Drop ────────────────────────────────────────

/** Som de "pegar" — click oco e macio ao iniciar drag */
export const playPluck = () => {
  if (!isSomAtivo()) return;
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

/** Som de "soltar" — grave e curto, sensação de encaixe */
export const playDrop = () => {
  if (!isSomAtivo()) return;
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

// ── Som do Pomodoro ────────────────────────────────────────────

/** Sino tibetano suave — fim de ciclo Pomodoro */
export const playBell = () => {
  if (!isSomAtivo()) return;
  const ctx = getContext();
  
  const playHarmonic = (freq, vol, duration, delay = 0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }
  
  playHarmonic(432, 0.4, 3.0);         // Frequência fundamental (calma)
  playHarmonic(864, 0.15, 2.0, 0.05);  // Harmônico 1
  playHarmonic(1296, 0.05, 1.5, 0.1);  // Harmônico 2
}

// ── Sons de Ações ──────────────────────────────────────────────

/** Bolha suave ascendente — criação de cartão/coluna */
export const playPop = () => {
  if (!isSomAtivo()) return;
  const ctx = getContext();
  
  // Nota principal: sine subindo rápido (efeito "bolha")
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(350, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.06);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
  
  // Overtone sutil que dá "brilho" à bolha
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(700, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
  
  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start();
  osc2.stop(ctx.currentTime + 0.08);
}

/** Sopro descendente suave — remoção/exclusão */
export const playSwoosh = () => {
  if (!isSomAtivo()) return;
  const ctx = getContext();
  
  // Ruído filtrado descendente (efeito "vento")
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
  filter.Q.value = 1.5;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + 0.15);
  
  // Tom grave para dar "peso" à remoção
  const osc = ctx.createOscillator();
  const gainOsc = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
  
  gainOsc.gain.setValueAtTime(0, ctx.currentTime);
  gainOsc.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
  gainOsc.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  
  osc.connect(gainOsc);
  gainOsc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

/** Duplo clique sutil — alternância de toggle (tema, privacidade) */
export const playSwitch = () => {
  if (!isSomAtivo()) return;
  const ctx = getContext();
  
  // Primeiro "tick" — breve e agudo
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  
  osc1.type = 'sine';
  osc1.frequency.value = 600;
  
  gain1.gain.setValueAtTime(0, ctx.currentTime);
  gain1.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.005);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start();
  osc1.stop(ctx.currentTime + 0.03);
  
  // Segundo "tock" — levemente mais alto, dá sensação de "encaixe"
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  
  osc2.type = 'sine';
  osc2.frequency.value = 800;
  
  gain2.gain.setValueAtTime(0, ctx.currentTime + 0.04);
  gain2.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.045);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(ctx.currentTime + 0.04);
  osc2.stop(ctx.currentTime + 0.08);
}

/** Tick mecânico sutil — reset de timer */
export const playTick = () => {
  if (!isSomAtivo()) return;
  const ctx = getContext();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1000, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.02);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}
