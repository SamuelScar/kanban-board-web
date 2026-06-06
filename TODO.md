# Backlog e Status do Projeto

Esta é a lista de funcionalidades do Kanban Board Web, dividida entre o que já foi implementado e o que está planejado para o futuro.

## 🚀 Backlog (A Fazer)

**Produtividade e UX**
- [ ] **Assistente de Inteligência Artificial:** Integrar IA para ajudar a quebrar tarefas grandes em subtarefas, sugerir melhorias de escopo ou priorizar o backlog.
- [ ] **Acessibilidade:** Melhorar a acessibilidade do site para leitores de tela e navegação por teclado.

**Escalabilidade e Colaboração**
- [ ] **Recuperação de Quarentena:** Criar uma interface avançada ou script para permitir que o usuário tente visualizar e recuperar o JSON corrompido que foi salvo no `localStorage` durante a falha do Zod.

---

## ✅ Funcionalidades Concluídas

**Produtividade e UX**
- [x] **Tutorial/Onboarding:** Criar um tutorial explicando as funcionalidades usando driver.js.
- [x] **Progressive Web App (PWA):** Transformar a aplicação em um PWA instalável, para que possa funcionar como um aplicativo nativo no celular e desktop (com suporte offline e manifest.json).
- [x] **Atalhos de teclado:** Adicionar suporte a atalhos globais configuráveis (ex: focar "Nova coluna" com `C`, alternar temas com `T`, fechar modais com `Esc`).
- [x] **Temporizador de tarefas (Pomodoro):** Integrar um timer diretamente nos cartões para focar em tempo de trabalho contínuo.

**Imersão e Personalização**
- [x] **Efeitos sonoros base:** Feedback de áudio ao arrastar/soltar cartões e concluir Pomodoro, incluindo controle global de mute.
- [x] **Efeitos sonoros avançados:** Adicionar sons para outras interações secundárias (ex: apagar cartão, criar coluna).
- [x] **Adição de música:** Player embutido opcional com faixas de foco (Lo-Fi, Ambiente) para melhorar a concentração.
- [x] **Sistema de Temas Avançado:** Adicionar suporte a Dark Mode detectando o sistema e permitindo a troca manual na interface.
- [x] **Template Padrão Customizável:** Permitir que o usuário defina um arquivo JSON próprio como o seu "Layout Padrão".

**Segurança e Privacidade**
- [x] **Migração para PNPM:** Migrar o gerenciador de pacotes de `npm` para `pnpm`.
- [x] **Aviso Educacional sobre Dados Locais:** Adicionar um aviso informando que os dados ficam no navegador.
- [x] **Backup: Exportação/Importação (JSON):** Criar sistema para baixar e importar os dados do Kanban como `.json`.
- [x] **Política de Segurança de Conteúdo (CSP):** Configurar a tag `<meta http-equiv="Content-Security-Policy">` no `index.html` para evitar XSS.
- [x] **Validação de Estado (Zod):** Implementar Zod para validar o JSON lido do `localStorage`.
- [x] **Sanitização de Markdown (XSS):** Usar `DOMPurify` para limpar o HTML gerado nas descrições.
- [x] **Criptografia Local:** Fornecer opção para criptografar os dados salvos usando uma senha (AES).

**Escalabilidade e Colaboração**
- [x] **Sincronização com File System API:** Pedir permissão ao usuário para salvar/sincronizar o arquivo JSON diretamente em uma pasta física no computador dele.
- [x] **Livemode P2P (Trabalho em Equipe):** Sistema colaborativo em tempo real usando WebRTC e Yjs (CRDT) para sincronização de estado descentralizada.
