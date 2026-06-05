import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Wifi, WifiOff, Copy, Check, Play, X, Info, PlusCircle, ArrowRightToLine } from 'lucide-react'
import { useStore } from '../../store/kanbanStore'
import { startLiveMode, disconnectLiveMode } from '../../store/liveModeSync'

export default function LiveModeModal({ isOpen, onClose }) {
  const liveModeStatus = useStore(state => state.liveModeStatus)
  const liveModeRoom = useStore(state => state.liveModeRoom)
  const liveModeServerUrl = useStore(state => state.liveModeServerUrl)
  const setLiveModeServerUrl = useStore(state => state.setLiveModeServerUrl)

  const [inputRoomName, setInputRoomName] = useState('')
  const [copied, setCopied] = useState(false)
  
  // Controle de abas visuais na tela inicial (criar vs entrar)
  const [activeTab, setActiveTab] = useState('criar') // 'criar' ou 'entrar'

  if (!isOpen) return null

  const handleCreateRoom = () => {
    const randomRoom = `sala-${Math.floor(Math.random() * 90000) + 10000}`
    startLiveMode(randomRoom, liveModeServerUrl)
  }

  const handleJoinRoom = () => {
    if (!inputRoomName.trim()) return
    startLiveMode(inputRoomName.trim(), liveModeServerUrl)
  }

  const handleDisconnect = () => {
    disconnectLiveMode()
    setInputRoomName('')
  }

  const copyRoomName = () => {
    if (liveModeRoom) {
      navigator.clipboard.writeText(liveModeRoom)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isConnected = liveModeStatus === 'online' || liveModeStatus === 'connecting'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[var(--color-brand-terracotta)]" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Colaboração Ao Vivo
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto">
            <div className="space-y-6">
              <div className="bg-[var(--color-brand-sage)]/10 p-3 rounded-xl flex items-start gap-3 border border-[var(--color-brand-sage)]/20">
                <Info size={18} className="text-[var(--color-brand-sage)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-brand-text)] font-medium leading-relaxed">
                  Trabalhe em equipe no mesmo quadro simultaneamente. A conexão é P2P (direta e criptografada).
                </p>
              </div>

              {!isConnected ? (
                <div className="space-y-5">
                  {/* Abas */}
                  <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                    <button
                      onClick={() => setActiveTab('criar')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'criar'
                          ? 'bg-white dark:bg-zinc-700 shadow-sm text-[var(--color-brand-terracotta)]'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <PlusCircle size={16} />
                      Nova Sala
                    </button>
                    <button
                      onClick={() => setActiveTab('entrar')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'entrar'
                          ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <ArrowRightToLine size={16} />
                      Entrar em Sala
                    </button>
                  </div>

                  {activeTab === 'criar' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
                        Crie uma nova sala para convidar seus colegas. Um código único será gerado automaticamente.
                      </div>
                      <button
                        onClick={handleCreateRoom}
                        className="w-full py-3.5 flex items-center justify-center gap-2 bg-[var(--color-brand-terracotta)] text-white font-bold rounded-xl hover:bg-[#c44d41] transition-colors shadow-lg shadow-[var(--color-brand-terracotta)]/20 active:scale-[0.98]"
                      >
                        <PlusCircle size={18} />
                        Gerar Código e Começar
                      </button>
                    </div>
                  )}

                  {activeTab === 'entrar' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                          Código do Convite
                        </label>
                        <input
                          type="text"
                          value={inputRoomName}
                          onChange={(e) => setInputRoomName(e.target.value)}
                          placeholder="Cole o código aqui..."
                          className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm dark:text-white transition-all shadow-inner"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={handleJoinRoom}
                        disabled={!inputRoomName.trim()}
                        className="w-full py-3.5 flex items-center justify-center gap-2 bg-blue-600 disabled:bg-blue-400 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                      >
                        <ArrowRightToLine size={18} />
                        Entrar na Sala
                      </button>
                    </div>
                  )}

                  {/* Configurações Avançadas Ocultas (Servidor) */}
                  <details className="mt-4 group">
                    <summary className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer list-none text-center">
                      Configurações Avançadas (Servidor)
                    </summary>
                    <div className="pt-3 mt-2 border-t border-gray-100 dark:border-zinc-800">
                      <input
                        type="text"
                        value={liveModeServerUrl}
                        onChange={(e) => setLiveModeServerUrl(e.target.value)}
                        placeholder="wss://..."
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none text-xs opacity-70 dark:text-white"
                      />
                    </div>
                  </details>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-green-500/40 rounded-2xl bg-green-500/5">
                    <div className="relative">
                      {liveModeStatus === 'connecting' ? (
                         <Wifi className="text-yellow-500 mb-3 relative z-10 animate-pulse" size={36} />
                      ) : (
                        <>
                          <Wifi className="text-green-500 mb-3 relative z-10" size={36} />
                          <div className="absolute inset-0 bg-green-500 blur-xl opacity-30 animate-pulse rounded-full"></div>
                        </>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {liveModeStatus === 'connecting' ? 'Conectando...' : 'Conexão Estabelecida'}
                    </h3>
                    
                    {liveModeRoom && (
                      <>
                        <div className="flex items-center gap-2 mt-5 p-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm w-11/12 max-w-[280px]">
                          <div className="flex-1 px-3 py-2 font-mono font-bold text-sm tracking-wide text-center truncate dark:text-white text-green-700 dark:text-green-400">
                            {liveModeRoom}
                          </div>
                          <button 
                            onClick={copyRoomName} 
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-lg transition-colors shrink-0 flex items-center justify-center" 
                            title="Copiar código"
                          >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-600 dark:text-gray-300" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center px-6 leading-relaxed">
                          Envie este código exato para seus colegas entrarem neste mesmo quadro.
                        </p>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="w-full py-3.5 flex items-center justify-center gap-2 bg-gray-100 dark:bg-zinc-800 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors active:scale-[0.98]"
                  >
                    <WifiOff size={18} />
                    Sair da Sala
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
