import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Wifi, WifiOff, Copy, Check, X, Info, PlusCircle, ArrowRightToLine, AlertTriangle, Clock, ShieldAlert, UserPlus, User } from 'lucide-react'
import { useStore } from '../../store/kanbanStore'
import { startLiveMode, disconnectLiveMode } from '../../store/liveModeSync'
import { startLobbyHost, joinLobbyAsGuest, approveGuest, rejectGuest, disconnectLobby } from '../../store/lobbySync'

export default function LiveModeModal({ isOpen, onClose }) {
  const { 
    liveModeStatus, liveModeRoom, liveModeServerUrl, 
    setLiveModeServerUrl, userName, setUserName,
    participants, pendingRequests
  } = useStore()

  const [inputRoomName, setInputRoomName] = useState('')
  const [copied, setCopied] = useState(false)
  
  // View states
  const [activeTab, setActiveTab] = useState('criar')
  const [warningType, setWarningType] = useState('none')
  const [guestStatus, setGuestStatus] = useState('none') // 'none', 'waiting', 'rejected'
  const [inputName, setInputName] = useState(userName || '')
  const [confirmTimer, setConfirmTimer] = useState(0)

  useEffect(() => {
    if (confirmTimer > 0) {
      const timerId = setTimeout(() => setConfirmTimer(confirmTimer - 1), 1000)
      return () => clearTimeout(timerId)
    }
  }, [confirmTimer])

  useEffect(() => {
    if (userName) setInputName(userName)
  }, [userName])

  if (!isOpen) return null

  // --- Handlers ---
  const handleNameSubmit = (e) => {
    e.preventDefault()
    if (inputName.trim()) {
      setUserName(inputName.trim())
    }
  }

  const handleCreateRoom = () => {
    setWarningType('create')
    setConfirmTimer(3)
  }

  const confirmCreateRoom = () => {
    const randomLobby = `sala-${Math.floor(Math.random() * 90000) + 10000}`
    const secretRoomId = `sec-${Math.random().toString(36).substring(2, 15)}`
    
    startLobbyHost(randomLobby, secretRoomId, liveModeServerUrl)
    startLiveMode(randomLobby, secretRoomId, liveModeServerUrl, true)
    
    setWarningType('none')
  }

  const handleJoinRoom = () => {
    if (!inputRoomName.trim()) return
    setWarningType('join')
    setConfirmTimer(3)
  }

  const confirmJoinRoom = () => {
    const room = inputRoomName.trim()
    if (!room) return
    
    setWarningType('none')
    setGuestStatus('waiting')
    
    joinLobbyAsGuest(
      room, 
      userName, 
      liveModeServerUrl, 
      (secretRoom) => {
        // Aprovado
        setGuestStatus('none')
        startLiveMode(room, secretRoom, liveModeServerUrl, false)
      },
      () => {
        // Rejeitado
        setGuestStatus('rejected')
      }
    )
  }

  const handleDisconnectClick = () => {
    setWarningType('leave')
    setConfirmTimer(3)
  }

  const handleDisconnectConfirm = () => {
    disconnectLiveMode()
    disconnectLobby()
    setInputRoomName('')
    setWarningType('none')
    setGuestStatus('none')
  }

  const copyRoomName = () => {
    if (liveModeRoom) {
      navigator.clipboard.writeText(liveModeRoom)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isConnected = liveModeStatus === 'online' || liveModeStatus === 'connecting'

  // --- UI Renders ---

  const renderNameInput = () => (
    <form onSubmit={handleNameSubmit} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[var(--color-brand-sage)]/10 text-[var(--color-brand-sage)] rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={32} />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Como devemos te chamar?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Identifique-se para entrar ou criar salas.</p>
      </div>
      <div>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Digite seu nome..."
          className="w-full px-4 py-3 text-center text-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 dark:text-white transition-all shadow-inner"
          autoFocus
          maxLength={20}
        />
      </div>
      <button
        type="submit"
        disabled={!inputName.trim()}
        className="w-full py-3.5 bg-[var(--color-brand-terracotta)] disabled:opacity-50 text-white font-bold rounded-xl hover:bg-[#c44d41] transition-colors shadow-lg shadow-[var(--color-brand-terracotta)]/20 active:scale-[0.98]"
      >
        Continuar
      </button>
    </form>
  )

  const renderGuestWaiting = () => (
    <div className="space-y-6 py-6 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-center">
        <Clock className="text-blue-500 animate-pulse" size={48} />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Aguardando o Anfitrião...</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 px-4">
          O criador da sala <b>{inputRoomName}</b> precisa permitir sua entrada.
        </p>
      </div>
      <button
        onClick={handleDisconnectConfirm}
        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-300 font-bold rounded-xl transition-colors text-sm"
      >
        Cancelar Pedido
      </button>
    </div>
  )

  const renderGuestRejected = () => (
    <div className="space-y-6 py-6 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-center">
        <ShieldAlert className="text-red-500" size={48} />
      </div>
      <div>
        <h3 className="font-bold text-red-600 dark:text-red-400 text-lg">Entrada Recusada</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 px-4">
          O criador da sala não permitiu o seu acesso.
        </p>
      </div>
      <button
        onClick={() => setGuestStatus('none')}
        className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
      >
        Voltar
      </button>
    </div>
  )

  const renderConnected = () => {
    if (warningType === 'leave') {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-3">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="font-bold text-red-800 dark:text-red-500 mb-2">Cuidado ao Sair</h3>
            <p className="text-sm text-red-700 dark:text-red-600/80 leading-relaxed">
              Você será desconectado da sala. Seu quadro atual permanecerá salvo localmente.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setWarningType('none')} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-300 font-bold rounded-xl transition-colors active:scale-[0.98]">Cancelar</button>
            <button 
              onClick={handleDisconnectConfirm} 
              disabled={confirmTimer > 0}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors active:scale-[0.98]"
            >
              {confirmTimer > 0 ? `Aguarde (${confirmTimer}s)` : 'Sim, Sair da Sala'}
            </button>
          </div>
        </div>
      )
    }

    return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Status da Conexão */}
      <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-green-500/40 rounded-2xl bg-green-500/5 relative overflow-hidden">
        <div className="relative">
          {liveModeStatus === 'connecting' ? (
             <Wifi className="text-yellow-500 mb-2 relative z-10 animate-pulse" size={32} />
          ) : (
            <>
              <Wifi className="text-green-500 mb-2 relative z-10" size={32} />
              <div className="absolute inset-0 bg-green-500 blur-xl opacity-30 animate-pulse rounded-full"></div>
            </>
          )}
        </div>
        
        {liveModeRoom && (
          <div className="flex items-center gap-2 mt-3 p-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm w-11/12 max-w-[280px]">
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
        )}
      </div>

      {/* Pedidos Pendentes (Apenas para o Anfitrião) */}
      {pendingRequests.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-blue-800 dark:text-blue-400 font-bold text-sm">
            <UserPlus size={16} />
            Pedidos de Entrada ({pendingRequests.length})
          </div>
          <div className="space-y-2">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between bg-white dark:bg-zinc-800 p-2.5 rounded-lg border border-blue-100 dark:border-zinc-700 shadow-sm">
                <span className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate pr-2">{req.name}</span>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => rejectGuest(req.id)} className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-md transition-colors" title="Recusar">
                    <X size={16} />
                  </button>
                  <button onClick={() => approveGuest(req.id)} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-md transition-colors" title="Permitir">
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Participantes */}
      <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Na sala agora ({participants.length})
        </h4>
        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
          {participants.map(p => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className={`font-medium ${p.name === userName ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-700 dark:text-gray-300'}`}>
                  {p.name} {p.name === userName && '(Você)'}
                </span>
              </div>
              {p.isHost && (
                <span className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-2 py-0.5 rounded-full font-bold">
                  Anfitrião
                </span>
              )}
            </div>
          ))}
          {participants.length === 0 && (
             <div className="text-sm text-gray-500 italic">Carregando...</div>
          )}
        </div>
      </div>

      <button
        onClick={handleDisconnectClick}
        className="w-full py-3.5 flex items-center justify-center gap-2 bg-gray-100 dark:bg-zinc-800 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors active:scale-[0.98]"
      >
        <WifiOff size={18} />
        Sair da Sala
      </button>
    </div>
    )
  }

  const renderTabsAndWarnings = () => (
    <div className="space-y-5">
      {warningType === 'none' ? (
        <>
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
        </>
      ) : warningType === 'create' ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-3">
              <AlertTriangle className="text-yellow-500" size={32} />
            </div>
            <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2">Atenção ao Criar</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-600/80 leading-relaxed">
              O seu quadro atual será compartilhado com <b>todos que entrarem</b> nesta sala.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setWarningType('none')} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-300 font-bold rounded-xl transition-colors active:scale-[0.98]">Cancelar</button>
            <button 
              onClick={confirmCreateRoom} 
              disabled={confirmTimer > 0}
              className="flex-1 py-3 bg-[var(--color-brand-terracotta)] hover:bg-[#c44d41] disabled:opacity-50 text-white font-bold rounded-xl transition-colors active:scale-[0.98]"
            >
              {confirmTimer > 0 ? `Aguarde (${confirmTimer}s)` : 'Entendi, Continuar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-3">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="font-bold text-red-800 dark:text-red-500 mb-2">Cuidado ao Entrar</h3>
            <p className="text-sm text-red-700 dark:text-red-600/80 leading-relaxed">
              O seu quadro atual <b>será permanentemente substituído</b> pelo quadro do criador da sala. O criador ainda precisará permitir sua entrada.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setWarningType('none')} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-300 font-bold rounded-xl transition-colors active:scale-[0.98]">Cancelar</button>
            <button 
              onClick={confirmJoinRoom} 
              disabled={confirmTimer > 0}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors active:scale-[0.98]"
            >
              {confirmTimer > 0 ? `Aguarde (${confirmTimer}s)` : 'Solicitar Entrada'}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
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

          <div className="p-5 overflow-y-auto">
            {!userName ? (
              renderNameInput()
            ) : guestStatus === 'waiting' ? (
              renderGuestWaiting()
            ) : guestStatus === 'rejected' ? (
              renderGuestRejected()
            ) : !isConnected ? (
              renderTabsAndWarnings()
            ) : (
              renderConnected()
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
