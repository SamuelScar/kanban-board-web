import { useStore } from '../store/kanbanStore'

class RadioManager {
  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'none'
    this.currentUrl = null
    
    // Configura eventos nativos para sincronizar com Zustand
    this.audio.addEventListener('playing', () => {
      useStore.getState().setRadioStatus('playing')
    })

    this.audio.addEventListener('waiting', () => {
      useStore.getState().setRadioStatus('loading')
    })

    this.audio.addEventListener('pause', () => {
      // Se não for por causa de buffer, volta pra idle
      if (this.audio.readyState >= 3) {
        useStore.getState().setRadioStatus('idle')
      }
    })

    this.audio.addEventListener('error', (e) => {
      console.error("RadioManager Error:", e)
      useStore.getState().setRadioStatus('error')
    })
  }

  play(url, volume) {
    if (this.audio.src !== url) {
      this.audio.src = url
      this.currentUrl = url
      this.audio.load()
    }
    
    this.audio.volume = volume
    useStore.getState().setRadioStatus('loading')
    
    // O comando de play() chamado imediatamente pelo onClick fura o bloqueio
    this.audio.play().catch((e) => {
      console.error("Autoplay ou rede bloqueados:", e)
      useStore.getState().setRadioStatus('error')
    })
  }

  pause() {
    this.audio.pause()
    useStore.getState().setRadioStatus('idle')
  }

  setVolume(volume) {
    this.audio.volume = volume
  }
}

// Exporta como singleton
export const radioManager = new RadioManager()
