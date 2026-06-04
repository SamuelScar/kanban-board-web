import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Upload, FileJson, Kanban, FileText, AlertTriangle, CheckCircle2, Lock, KeyRound, ShieldCheck, ShieldAlert, LayoutTemplate, HardDrive } from 'lucide-react'
import { useStore } from '../../store/kanbanStore'
import { exportarNativo, exportarTrello, exportarTexto, processarArquivoImportacao } from '../../utils/backupUtils'
import { isFileSystemAccessSupported, iniciarVinculoArquivo, clearFileHandle } from '../../utils/fileSyncUtils'
import { STORAGE_KEYS } from '../../constants/storage'

export default function BackupModal({ isOpen, onClose, mode = 'dados' }) {
  const [activeTab, setActiveTab] = useState('exportar')
  const [importStatus, setImportStatus] = useState(null)
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef(null)
  const templateFileInputRef = useRef(null)
  
  const [novaSenha, setNovaSenha] = useState('')
  const [senhaPanico, setSenhaPanico] = useState('')
  const [usarSenhaPanico, setUsarSenhaPanico] = useState(false)
  const [temSenha, setTemSenha] = useState(false)
  
  const colunas = useStore(state => state.colunas)
  const templatePadrao = useStore(state => state.templatePadrao)
  const importarDados = useStore(state => state.importarDados)
  const definirSenha = useStore(state => state.definirSenha)
  const removerSenha = useStore(state => state.removerSenha)
  const salvarTemplatePadrao = useStore(state => state.salvarTemplatePadrao)
  const removerTemplatePadrao = useStore(state => state.removerTemplatePadrao)
  
  const syncStatus = useStore(state => state.syncStatus)
  const syncFileName = useStore(state => state.syncFileName)
  const setSyncState = useStore(state => state.setSyncState)
  const desvincularSync = useStore(state => state.desvincularSync)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'dados') setActiveTab('exportar')
      setTemSenha(!!sessionStorage.getItem(STORAGE_KEYS.SENHA_SESSAO))
    }
  }, [isOpen, mode])

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

  const handleTemplateFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const colunasImportadas = await processarArquivoImportacao(file)
      salvarTemplatePadrao(colunasImportadas)
      alert("Template importado e salvo com sucesso!")
    } catch (erro) {
      console.error(erro)
      alert(erro.message || 'Falha ao ler o arquivo de template.')
    } finally {
      if (templateFileInputRef.current) {
        templateFileInputRef.current.value = ''
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {mode === 'seguranca' ? 'Segurança do Quadro' : 'Gestão de Dados'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs - Ocultas no modo Segurança */}
          {mode === 'dados' && (
            <div className="flex border-b border-black/5 overflow-x-auto no-scrollbar">
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
              onClick={() => setActiveTab('template')}
              className={`flex-1 py-4 px-2 whitespace-nowrap text-xs sm:text-sm font-semibold transition-colors flex justify-center items-center gap-2 ${
                activeTab === 'template' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutTemplate size={18} /> Template
            </button>
            <button
              onClick={() => setActiveTab('sincronizacao')}
              className={`flex-1 py-4 px-2 whitespace-nowrap text-xs sm:text-sm font-semibold transition-colors flex justify-center items-center gap-2 ${
                activeTab === 'sincronizacao' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <HardDrive size={18} /> Sincronização Local
            </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {mode === 'dados' && activeTab === 'exportar' && (
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

            {mode === 'dados' && activeTab === 'importar' && (
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

            {mode === 'dados' && activeTab === 'template' && (
              <div className="space-y-6">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">Como criar seu próprio modelo?</h4>
                  <ol className="text-xs text-indigo-800 dark:text-indigo-200 list-decimal pl-4 space-y-1.5 font-medium">
                    <li>Edite as colunas do seu quadro principal (adicione, renomeie ou exclua) para criar a sua estrutura ideal.</li>
                    <li>Volte nesta tela e clique em <strong>"Salvar Estrutura Atual"</strong>.</li>
                    <li><em>Alternativa:</em> Se já tiver um modelo pronto, clique em <strong>"Importar de Arquivo (.json)"</strong>.</li>
                    <li>Pronto! Sempre que usar a função "Limpar Quadro", o sistema carregará este seu modelo.</li>
                  </ol>
                </div>

                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={templateFileInputRef}
                  onChange={handleTemplateFileSelect}
                />

                {templatePadrao ? (
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg">Template Ativo</h4>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Seu quadro possui um esqueleto customizado salvo.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                      <button 
                        onClick={() => {
                          if (confirm("Tem certeza que deseja remover o template customizado?")) {
                            removerTemplatePadrao();
                          }
                        }}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-800 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold rounded-lg shadow-sm border border-red-100 dark:border-red-500/20 transition-all cursor-pointer"
                      >
                        Remover Template
                      </button>
                      <button 
                        onClick={() => templateFileInputRef.current?.click()}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Upload size={18} />
                        Importar (.json)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <LayoutTemplate size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">Nenhum Template</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        O sistema está usando o layout de demonstração original (Backlog, Em andamento, Concluído).
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-4 w-full px-2 sm:px-6">
                      <button 
                        onClick={() => {
                          salvarTemplatePadrao(colunas);
                          alert("Quadro atual salvo como Template Padrão com sucesso!");
                        }}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <LayoutTemplate size={18} />
                        Salvar Estrutura Atual
                      </button>
                      
                      <button 
                        onClick={() => templateFileInputRef.current?.click()}
                        className="w-full py-2.5 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Upload size={18} />
                        Importar de Arquivo (.json)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'dados' && activeTab === 'sincronizacao' && (
              <div className="space-y-6">
                {!isFileSystemAccessSupported() ? (
                  <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-6 flex gap-3 items-start">
                    <AlertTriangle size={24} className="text-orange-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-orange-900 dark:text-orange-100">Funcionalidade Bloqueada ou Não Suportada</h4>
                      <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">A File System Access API precisa estar ativada no seu navegador para isso funcionar. Ela é suportada nativamente no Google Chrome, Microsoft Edge e Opera. <strong>Atenção:</strong> Navegadores com foco extremo em privacidade (como o Brave) ou motores concorrentes (Firefox/Safari) bloqueiam essa funcionalidade de fábrica para impedir acesso direto ao seu computador.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Vincule este quadro a um arquivo <code>.json</code> no seu computador. Todas as suas alterações no Kanban serão salvas automaticamente nele em tempo real.
                    </p>

                    {syncStatus !== 'desvinculado' ? (
                      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <CheckCircle2 size={32} />
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-900 dark:text-blue-100 text-lg">Arquivo Vinculado</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-medium bg-white/50 dark:bg-black/20 px-3 py-1 rounded-md inline-block mt-2">
                            {syncFileName}
                          </p>
                        </div>
                        <button 
                          onClick={async () => {
                            if (confirm("Deseja parar de sincronizar com este arquivo? (Isso não apagará o arquivo físico)")) {
                              await clearFileHandle();
                              desvincularSync();
                            }
                          }}
                          className="mt-4 px-6 py-2.5 bg-white dark:bg-zinc-800 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold rounded-lg shadow-sm border border-red-100 dark:border-red-500/20 transition-all cursor-pointer"
                        >
                          Desvincular Arquivo
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <HardDrive size={32} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">Sincronização Inativa</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Seus dados estão sendo salvos apenas no cache temporário do navegador.
                          </p>
                        </div>
                        
                        <button 
                          onClick={async () => {
                            try {
                              const handle = await iniciarVinculoArquivo();
                              setSyncState(handle, handle.name, 'ativo');
                              alert("Arquivo vinculado com sucesso! Tudo será salvo automaticamente a partir de agora.");
                            } catch (e) {
                              if (e.name !== 'AbortError') {
                                alert("Erro ao tentar vincular arquivo: " + e.message);
                              }
                            }
                          }}
                          className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <HardDrive size={18} />
                          Vincular a um Arquivo no Computador
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {mode === 'seguranca' && (
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
                                  ATENÇÃO: A Senha de Pânico funciona como uma "senha falsa" na Tela de Bloqueio. Se você for coagido a destravar o seu quadro, digite a senha de pânico em vez da principal. O aplicativo vai aceitar o acesso, mas apagará TODOS os seus dados silenciosamente e irreversivelmente antes de abrir.
                                </p>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3 flex gap-2 items-start mt-2">
                                <ShieldCheck size={16} className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 leading-tight">
                                  Lembre-se: Para usar o Modo Pânico, você deve primeiro definir a sua Senha Mestra verdadeira logo acima.
                                </p>
                              </div>
                              <div className="relative mt-3">
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
