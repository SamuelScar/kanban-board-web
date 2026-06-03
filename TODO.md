# Backlog de Futuras Implementações

Esta é a lista de ideias e features planejadas para escalar o Kanban Board Web para o próximo nível:

## Produtividade e UX
- [ ] **Atalhos de teclado:** Adicionar suporte a navegação por teclado (ex: criar cartão com `C`, apagar com `Del`, mover com setas, navegar entre inputs).
- [ ] **Temporizador de tarefas (Pomodoro):** Integrar um timer diretamente nos cartões para focar em tempo de trabalho contínuo.

## Imersão
- [ ] **Efeitos sonoros:** Feedback de áudio satisfatório ao arrastar/soltar cartões, concluir tarefas e apagar itens, incluindo um controle global de volume (Mudo/Ligado).
- [ ] **Adição de música:** Player embutido opcional com faixas de foco (Lo-Fi, Ambiente) para melhorar a concentração durante o uso da ferramenta.

## Escalabilidade e Colaboração
- [ ] **Segurança:** Implementar medidas de segurança, como sanitização de inputs avançada (prevenção de XSS) e validação de limite de requisições caso no futuro envolva banco de dados.
- [ ] **Livemode (Trabalho em Equipe):** Evoluir a ferramenta de `localStorage` para um backend em tempo real (ex: WebSockets / Socket.io / Firebase) para permitir múltiplos cursores e colaboração ao vivo.
