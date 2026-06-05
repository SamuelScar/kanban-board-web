import { useStore } from '../../store/kanbanStore'
import { Plus, RefreshCw, X, Database, Eye, EyeOff, Moon, Sun, Monitor, ShieldCheck, Settings, Keyboard, Volume2, VolumeX, Cloud, AlertCircle, Users } from 'lucide-react'
import { verificarPermissao } from '../../utils/fileSyncUtils'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useCallback } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'
import { playSwitch } from '../../utils/audio'
import RadioPlayer from '../ui/RadioPlayer'

export default function Header({
  onToggleTema,
  onShowClearDialog,
  onShowBackupOptions,
  onShowSecurityOptions,
  onShowCheatSheet,
  onShowLiveMode,
}) {
  const isPrivacyMode = useStore((state) => state.isPrivacyMode)
  const togglePrivacyMode = useStore((state) => state.togglePrivacyMode)
  const tema = useStore(state => state.tema)
  const atalhosAtivos = useStore(state => state.atalhosAtivos)
  const toggleAtalhos = useStore(state => state.toggleAtalhos)
  const somAtivo = useStore(state => state.somAtivo)
  const toggleSom = useStore(state => state.toggleSom)
  
  const syncStatus = useStore(state => state.syncStatus)
  const syncFileHandle = useStore(state => state.syncFileHandle)
  const setSyncStatus = useStore(state => state.setSyncStatus)

  const liveModeStatus = useStore(state => state.liveModeStatus)
  const liveModeRoom = useStore(state => state.liveModeRoom)

  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const settingsMenuRef = useRef(null)

  useClickOutside(settingsMenuRef, useCallback(() => setShowSettingsMenu(false), []))

  return (
    <header className="relative z-50 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center w-full">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-end gap-1 h-6">
          <div className="w-2 h-6 bg-[var(--color-brand-terracotta)] rounded-full" />
          <div className="w-2 h-4 bg-[var(--color-brand-sand)] rounded-full" />
          <div className="w-2 h-5 bg-[var(--color-brand-sage)] rounded-full" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">KBW</h1>

        {/* Sync Status Chip */}
        {syncStatus === 'ativo' && (
          <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full cursor-help" title="Sincronizando com arquivo físico">
            <Cloud size={14} />
            Sincronizado
          </div>
        )}
        {syncStatus === 'pausado_permissao' && (
          <button 
            onClick={async () => {
              if (syncFileHandle) {
                const liberado = await verificarPermissao(syncFileHandle, true);
                if (liberado) setSyncStatus('ativo');
              }
            }}
            className="hidden sm:flex items-center gap-1.5 ml-2 px-3 py-1 bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors animate-pulse shadow-sm"
          >
            <AlertCircle size={14} />
            Sincronização Pausada - Clique para Autorizar
          </button>
        )}
      </div>

      {/* Actions */}
      <div data-tour="ferramentas" className="flex items-center gap-1 md:gap-2">
        {/* Ações Desktop */}
        <div className="hidden md:flex items-center gap-1 md:gap-2">
          {/* Privacidade */}
          <HeaderButton
            onClick={() => { playSwitch(); togglePrivacyMode() }}
            active={isPrivacyMode}
            activeClassName="text-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/10"
            icon={isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
            label="Privacidade"
          />

          {/* Live Mode */}
          <HeaderButton
            onClick={onShowLiveMode}
            icon={
              <div className="relative">
                <Users size={18} />
                {liveModeStatus === 'online' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--color-brand-bg)] animate-pulse" />
                )}
                {liveModeStatus === 'connecting' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-[var(--color-brand-bg)]" />
                )}
              </div>
            }
            label={liveModeStatus === 'online' ? `Live: ${liveModeRoom}` : "Live Mode P2P"}
            hoverClassName={liveModeStatus === 'online' ? "text-green-600 bg-green-500/10" : "hover:text-blue-500 hover:bg-blue-500/10"}
            active={liveModeStatus === 'online'}
            activeClassName="text-green-600 bg-green-500/10 dark:text-green-400 dark:bg-green-500/20"
          />

          {/* Limpar Quadro */}
          <HeaderButton
            onClick={onShowClearDialog}
            icon={<RefreshCw size={18} />}
            label="Limpar Quadro"
            hoverClassName="hover:text-[var(--color-brand-terracotta)] hover:bg-[var(--color-brand-terracotta)]/10"
          />

          {/* Tema */}
          <HeaderButton
            onClick={() => { playSwitch(); onToggleTema() }}
            icon={tema === 'system' ? <Monitor size={18} /> : tema === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            label={`Tema: ${tema === 'system' ? 'Sistema' : tema === 'dark' ? 'Escuro' : 'Claro'}`}
          />

          {/* Som */}
          <HeaderButton
            onClick={toggleSom}
            icon={somAtivo ? <Volume2 size={18} /> : <VolumeX size={18} />}
            label={`Sons: ${somAtivo ? 'Ligados' : 'Desligados'}`}
          />
        </div>

        {/* Rádio Lofi/Ambient (Sempre Visível) */}
        <RadioPlayer />

        {/* Configurações (com dropdown) */}
        <div className="relative" ref={settingsMenuRef}>
          <HeaderButton
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            active={showSettingsMenu}
            activeClassName="bg-black/5 dark:bg-white/10 text-black/90 dark:text-white"
            icon={<Settings size={18} />}
            label="Configurações"
          />

          <AnimatePresence>
            {showSettingsMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-black/10 dark:border-white/10 overflow-hidden z-50"
              >
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      onShowBackupOptions();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--color-brand-sage)] transition-colors cursor-pointer"
                  >
                    <Database size={16} />
                    <span>Gestão de Dados</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      onShowSecurityOptions();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    <ShieldCheck size={16} />
                    <span>Segurança do Quadro</span>
                  </button>

                  {/* Itens visíveis apenas no mobile */}
                  <div className="md:hidden border-t border-black/5 dark:border-white/5 my-1"></div>
                  
                  <button
                    onClick={() => { playSwitch(); togglePrivacyMode(); setShowSettingsMenu(false); }}
                    className={`md:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isPrivacyMode ? 'text-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/10' : 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'}`}
                  >
                    {isPrivacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>Privacidade</span>
                  </button>

                  <button
                    onClick={() => { onShowClearDialog(); setShowSettingsMenu(false); }}
                    className="md:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-[var(--color-brand-terracotta)]/10 hover:text-[var(--color-brand-terracotta)] transition-colors cursor-pointer"
                  >
                    <RefreshCw size={16} />
                    <span>Limpar Quadro</span>
                  </button>

                  <button
                    onClick={() => { playSwitch(); onToggleTema(); }}
                    className="md:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {tema === 'system' ? <Monitor size={16} /> : tema === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    <span>Tema: {tema === 'system' ? 'Sistema' : tema === 'dark' ? 'Escuro' : 'Claro'}</span>
                  </button>

                  <button
                    onClick={() => { toggleSom(); }}
                    className="md:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {somAtivo ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <span>Sons: {somAtivo ? 'Ligados' : 'Desligados'}</span>
                  </button>
                  
                  <div className="md:hidden border-t border-black/5 dark:border-white/5 my-1"></div>

                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      onShowCheatSheet();
                    }}
                    className="hidden md:flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Keyboard size={16} />
                      <span>Atalhos de Teclado</span>
                    </div>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded">?</kbd>
                  </button>

                  <div className="hidden md:flex items-center justify-between px-3 py-2.5 mt-1 border-t border-black/5 dark:border-white/5">
                    <span className="text-sm font-medium text-black/70 dark:text-white/70">Ativar Atalhos</span>
                    <button
                      onClick={toggleAtalhos}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${atalhosAtivos ? 'bg-[var(--color-brand-sage)]' : 'bg-black/20 dark:bg-white/20'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${atalhosAtivos ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

// ── Componente auxiliar para botões do header ───────────────────
// Evita repetição de ~12 linhas de JSX por botão

function HeaderButton({
  onClick,
  icon,
  label,
  active = false,
  activeClassName = '',
  hoverClassName = 'hover:text-black/90 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10',
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`group flex items-center px-3 py-2 text-sm font-medium transition-all rounded-lg cursor-pointer ${
        active
          ? activeClassName
          : `text-black/60 dark:text-white/60 ${hoverClassName}`
      }`}
    >
      {icon}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
        {label}
      </span>
    </motion.button>
  )
}
