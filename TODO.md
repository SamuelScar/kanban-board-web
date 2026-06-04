# Backlog de Futuras Implementações

Esta é a lista de ideias e features planejadas para escalar o Kanban Board Web para o próximo nível:

## To Do

- [ ] Implementar Progress Web App (PWA) para instalação nativa
- [ ] Criar um Tutorial/Onboarding explicando as funcionalidades (incluindo como importar modelos json, atalhos, etc)
- [ ] Melhorar a acessibilidade do site

## Produtividade e UX
- [ ] **Progressive Web App (PWA):** Transformar a aplicação em um PWA instalável, para que possa funcionar como um aplicativo nativo no celular e desktop (com suporte offline e manifest.json).
- [x] **Atalhos de teclado:** Adicionar suporte a atalhos globais configuráveis (ex: focar "Nova coluna" com `C`, alternar temas com `T`, fechar modais com `Esc`).
- [x] **Temporizador de tarefas (Pomodoro):** Integrar um timer diretamente nos cartões para focar em tempo de trabalho contínuo.
- [ ] **Assistente de Inteligência Artificial:** Integrar IA para ajudar a quebrar tarefas grandes em subtarefas, sugerir melhorias de escopo ou priorizar o backlog.

## Imersão e Personalização
- [x] **Efeitos sonoros base:** Feedback de áudio (Web Audio API) ao arrastar/soltar cartões e concluir Pomodoro, incluindo controle global de mute.
- [x] **Efeitos sonoros avançados:** Adicionar sons para outras interações secundárias (ex: apagar cartão, criar coluna) e explorar novas texturas/pacotes sonoros.
- [x] **Adição de música:** Player embutido opcional com faixas de foco (Lo-Fi, Ambiente) para melhorar a concentração durante o uso da ferramenta.
- [x] **Sistema de Temas Avançado:** Adicionar suporte a Dark Mode detectando o sistema e permitindo a troca manual na interface. (Futuro: criação de temas personalizados)
- [x] **Template Padrão Customizável:** Permitir que o usuário defina um arquivo JSON próprio como o seu "Layout Padrão". Ao usar a função "Restaurar Quadro", o Kanban recarregará essa estrutura salva em vez do Backlog original do app (se o cache for limpo, volta ao original).

## Segurança e Privacidade
- [x] **Migração para PNPM (Supply Chain Security):** Migrar o gerenciador de pacotes de `npm` para `pnpm`. O `pnpm` é mais rápido, cria um `node_modules` mais limpo e strict. *Nota: É 100% seguro pois baixa exatamente as mesmas bibliotecas do registro oficial do NPM.*
- [x] **Aviso Educacional sobre Dados Locais:** Adicionar um aviso (modal inicial ou configuração) informando que os dados ficam no navegador e serão perdidos se o histórico/cache for limpo.
- [x] **Backup: Exportação/Importação (JSON):** Criar sistema para baixar os dados do Kanban como um arquivo `.json` e importá-los novamente. Isso garante que o usuário tenha controle e não perca dados. *No futuro: Criar conversores para importar/exportar no formato do Trello.*
- [x] **Política de Segurança de Conteúdo (CSP):** Configurar a tag `<meta http-equiv="Content-Security-Policy">` no `index.html`. Isso age como um "leão de chácara", garantindo que nenhum script malicioso de outros sites (XSS) consiga rodar na nossa aplicação.
- [x] **Validação de Estado (Zod):** Implementar Zod para validar o JSON lido do `localStorage`. Se o arquivo estiver corrompido ou manipulado incorretamente pelo usuário, a aplicação não deve quebrar, mas sim lidar com o erro graciosamente.
- [x] **Sanitização de Markdown (XSS):** Ao implementar suporte a Markdown (para deixar as descrições dos cards ricas), usar a biblioteca `DOMPurify` para limpar o HTML gerado e impedir execução de códigos injetados.
- [x] **Criptografia Local (Opcional):** Fornecer uma opção (toggle) nas configurações para criptografar os dados salvos usando uma senha fornecida pelo usuário (AES). Se ativado, pedir a senha ao abrir o app.

## Escalabilidade e Colaboração
- [x] **Sincronização com File System API:** (Futuro) Em vez de usar apenas o `localStorage` (que é volátil), pedir permissão ao usuário para salvar/sincronizar o arquivo JSON diretamente em uma pasta física no computador dele.
- [ ] **Recuperação de Quarentena:** (Futuro) Criar uma interface avançada ou script para permitir que o usuário tente visualizar e recuperar o JSON corrompido que foi salvo no `localStorage` durante a falha do Zod.
- [ ] **Livemode (Trabalho em Equipe):** Evoluir a ferramenta para um sistema colaborativo em tempo real usando **WebRTC** (para minimizar custos de servidor, usando um servidor de sinalização apenas para criar a conexão P2P) em conjunto com a biblioteca **Yjs** (CRDT) para facilitar a sincronização de estado e resolução de conflitos entre múltiplos cursores.
