import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Upload, FileJson, Kanban, FileText, AlertTriangle, CheckCircle2, Lock, KeyRound, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useStore } from '../../store/kanbanStore'
import { exportarNativo, exportarTrello, exportarTexto, processarArquivoImportacao } from '../../utils/backupUtils'
import { STORAGE_KEYS } from '../../constants/storage'

export default function BackupModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('exportar')
  const [importStatus, setImportStatus] = useState(null)
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef(null)
  
  const [novaSenha, setNovaSenha] = useState('')
  const [senhaPanico, setSenhaPanico] = useState('')
  const [usarSenhaPanico, setUsarSenhaPanico] = useState(false)
  const [temSenha, setTemSenha] = useState(false)
  
  const colunas = useStore(state => state.colunas)
  const importarDados = useStore(state => state.importarDados)
  const definirSenha = useStore(state => state.definirSenha)
  const removerSenha = useStore(state => state.removerSenha)

  useEffect(() => {
    if (isOpen) {
      setTemSenha(!!sessionStorage.getItem(STORAGE_KEYS.SENHA_SESSAO))
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleExportNativo = () => exportarNativo(colunas)
  const handleExportTrello = () => exportarTrello(colunas)
  const handleExportTexto = () => exportarTexto(colunas)

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImportStatus('loading')
    setImportError('')

    try {
      const colunasImportadas = await processarArquivoImportacao(file)
      importarDados(colunasImportadas)
      setImportStatus('success')
      setTimeout(() => {
        onClose()
        setImportStatus(null)
      }, 2000)
    } catch (erro) {
      console.error(erro)
      setImportStatus('error')
      setImportError(erro.message || 'Falha ao ler o arquivo.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAtivarSenha = (e) => {
    e.preventDefault()
    if (!novaSenha.trim()) return
    
    if (usarSenhaPanico && (!senhaPanico.trim() || senhaPanico === novaSenha)) {
      alert("A senha de pânico não pode ser vazia ou igual à senha principal.")
      return
    }

    definirSenha(novaSenha, usarSenhaPanico ? senhaPanico : null)
    setTemSenha(true)
    setNovaSenha('')
    setSenhaPanico('')
    setUsarSenhaPanico(false)
    // Download de segurança obrigatório
    handleExportNativo()
  }

  const handleRemoverSenha = () => {
    if (confirm("Tem certeza que deseja remover a senha? Seus dados não estarão mais protegidos por criptografia.")) {
      removerSenha()
      setTemSenha(false)
    }
  }

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
          className="relative w-full max-w-lg bg-[var(--color-brand-bg)] border border-black/5 shadow-2xl rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Portabilidade e Segurança</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-black/5">
            <button
              onClick={() => setActiveTab('exportar')}
              className={`flex-1 py-4 text-xs sm:text-sm font-semibold transition-colors flex justify-center items-center gap-2 ${
                activeTab === 'exportar' ? 'text-[var(--color-brand-terracotta)] border-b-2 border-[var(--color-brand-terracotta)]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Download size={18} /> Exportar
            </button>
            <button
              onClick={() => setActiveTab('importar')}
              className={`flex-1 py-4 text-xs sm:text-sm font-semibold transition-colors flex justify-center items-center gap-2 ${
                activeTab === 'importar' ? 'text-[var(--color-brand-sage)] border-b-2 border-[var(--color-brand-sage)]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Upload size={18} /> Importar
            </button>
            <button
              onClick={() => setActiveTab('seguranca')}
              className={`flex-1 py-4 text-xs sm:text-sm font-semibold transition-colors flex justify-center items-center gap-2 ${
                activeTab === 'seguranca' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Lock size={18} /> Segurança
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'exportar' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
                  Baixe seus dados para manter um backup seguro ou leve seu quadro para outra ferramenta.
                </p>

                <button onClick={handleExportNativo} className="w-full flex items-center gap-4 p-4 rounded-xl border border-black/5 dark:border-white/5 hover:border-[var(--color-brand-terracotta)] hover:bg-[var(--color-brand-terracotta)]/5 transition-all group text-left">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-terracotta)]/10 flex items-center justify-center text-[var(--color-brand-terracotta)] group-hover:scale-110 transition-transform">
                    <FileJson size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Formato KBW Nativo (.json)</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Cópia exata e confiável para restaurar neste app depois.</p>
                  </div>
                </button>

                <button onClick={handleExportTrello} className="w-full flex items-center gap-4 p-4 rounded-xl border border-black/5 dark:border-white/5 hover:border-[var(--color-brand-sage)] hover:bg-[var(--color-brand-sage)]/5 transition-all group text-left">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-sage)]/10 flex items-center justify-center text-[var(--color-brand-sage)] group-hover:scale-110 transition-transform">
                    <Kanban size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Formato Trello (.json)</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Compatível para importar no Trello oficial.</p>
                  </div>
                </button>

                <button onClick={handleExportTexto} className="w-full flex items-center gap-4 p-4 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-all group text-left">
                  <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/60 dark:text-white/60 group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Resumo em Texto (.txt)</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Formato Markdown legível para mandar no Slack/Email.</p>
                  </div>
                </button>
              </div>
            )}

            {activeTab === 'importar' && (
              <div className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 flex gap-3 items-start">
                  <AlertTriangle size={20} className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-orange-800 dark:text-orange-400">Ação Destrutiva</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1 leading-relaxed">
                      Ao importar um arquivo, <strong>todo o seu quadro atual será apagado e substituído</strong> pelos dados do arquivo. Recomendamos fazer um backup antes!
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  
                  {importStatus === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-green-600">
                      <CheckCircle2 size={48} />
                      <p className="font-bold">Quadro importado com sucesso!</p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={importStatus === 'loading'}
                      className="w-full py-12 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-[var(--color-brand-sage)] hover:bg-[var(--color-brand-sage)]/5 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 group-hover:bg-[var(--color-brand-sage)]/10 flex items-center justify-center text-gray-400 dark:text-white/40 group-hover:text-[var(--color-brand-sage)] transition-colors">
                        <Upload size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Clique para selecionar o arquivo</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aceita arquivos .json (Nativo KBW ou Trello)</p>
                      </div>
                    </button>
                  )}

                  {importStatus === 'error' && (
                    <p className="text-red-500 text-sm mt-4 font-medium">{importError}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'seguranca' && (
              <div className="space-y-6">
                {temSenha ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center">
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Quadro Protegido</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Seus dados locais estão criptografados (AES-256). O quadro será trancado automaticamente quando você fechar esta aba.
                      </p>
                    </div>
                    <button 
                      onClick={handleRemoverSenha}
                      className="mt-4 text-red-500 text-sm font-semibold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      Remover Criptografia e Senha
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 flex gap-3 items-start mb-6">
                      <ShieldAlert size={20} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-400">Criptografia Local (Beta)</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                          Proteja seus cartões contra acessos físicos ao seu computador.
                          <strong> Aviso Crítico:</strong> Não há recuperação de senha! Se esquecê-la, seus dados serão perdidos.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAtivarSenha} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Definir Senha Mestra</label>
                        <div className="relative">
                          <input 
                            type="password"
                            required
                            value={novaSenha}
                            onChange={e => setNovaSenha(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-white/10 dark:text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all"
                          />
                          <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input 
                            type="checkbox" 
                            checked={usarSenhaPanico} 
                            onChange={(e) => setUsarSenhaPanico(e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                          />
                          <span className="text-sm font-bold text-red-600">Adicionar Senha de Autodestruição (Modo Pânico)</span>
                        </label>
                        
                        <AnimatePresence>
                          {usarSenhaPanico && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-3"
                            >
                              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 flex gap-2 items-start">
                                <AlertTriangle size={16} className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                                <p className="text-xs font-semibold text-red-700 dark:text-red-400 leading-tight">
                                  ATENÇÃO: Qualquer pessoa que digitar essa senha na tela de bloqueio apagará TODOS os seus cartões instantaneamente, sem aviso prévio.
                                </p>
                              </div>
                              <div className="relative">
                                <input 
                                  type="password"
                                  required={usarSenhaPanico}
                                  value={senhaPanico}
                                  onChange={e => setSenhaPanico(e.target.value)}
                                  placeholder="Senha de pânico (diferente da principal)"
                                  minLength={6}
                                  className="w-full bg-white dark:bg-zinc-800 border border-red-300 dark:border-red-500/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-500/40 focus:border-red-500 outline-none transition-all placeholder:text-red-300 dark:placeholder:text-red-500/50 dark:text-white"
                                />
                                <ShieldAlert size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                      >
                        <Lock size={18} />
                        Ativar Criptografia e Fazer Backup
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
