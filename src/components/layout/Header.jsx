import { useStore } from '../../store/kanbanStore'
import { Plus, RefreshCw, X, Database, Eye, EyeOff, Moon, Sun, Monitor, ShieldCheck, Settings, Keyboard, Volume2, VolumeX } from 'lucide-react'
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
}) {
  const isPrivacyMode = useStore((state) => state.isPrivacyMode)
  const togglePrivacyMode = useStore((state) => state.togglePrivacyMode)
  const tema = useStore(state => state.tema)
  const atalhosAtivos = useStore(state => state.atalhosAtivos)
  const toggleAtalhos = useStore(state => state.toggleAtalhos)
  const somAtivo = useStore(state => state.somAtivo)
  const toggleSom = useStore(state => state.toggleSom)

  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const settingsMenuRef = useRef(null)

  useClickOutside(settingsMenuRef, useCallback(() => setShowSettingsMenu(false), []))

  return (
    <header className="relative z-50 px-8 py-6 flex justify-between items-center w-full">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-end gap-1 h-6">
          <div className="w-2 h-6 bg-[var(--color-brand-terracotta)] rounded-full" />
          <div className="w-2 h-4 bg-[var(--color-brand-sand)] rounded-full" />
          <div className="w-2 h-5 bg-[var(--color-brand-sage)] rounded-full" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">KBW</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Privacidade */}
        <HeaderButton
          onClick={() => { playSwitch(); togglePrivacyMode() }}
          active={isPrivacyMode}
          activeClassName="text-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/10"
          icon={isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
          label="Privacidade"
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

        {/* Rádio Lofi/Ambient */}
        <RadioPlayer />

        {/* Som */}
        <HeaderButton
          onClick={toggleSom}
          icon={somAtivo ? <Volume2 size={18} /> : <VolumeX size={18} />}
          label={`Sons: ${somAtivo ? 'Ligados' : 'Desligados'}`}
        />

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

                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      onShowCheatSheet();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Keyboard size={16} />
                      <span>Atalhos de Teclado</span>
                    </div>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded">?</kbd>
                  </button>

                  <div className="flex items-center justify-between px-3 py-2.5 mt-1 border-t border-black/5 dark:border-white/5">
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
