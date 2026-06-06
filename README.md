# 📋 Kanban Board Web - Flow & Focus

Uma aplicação Kanban moderna, local e incrivelmente rápida, focada não apenas em organizar tarefas, mas em **profunda imersão, produtividade e segurança**. 

O design segue a filosofia *"Warm Minimalism"* (Minimalismo Quente), proporcionando uma interface limpa, com texturas táteis, transições suaves e cores confortáveis para horas de foco ininterrupto.

## ✨ Principais Funcionalidades

### 🚀 Produtividade e Workflow
- **Quadro Fluido:** Crie, edite e mova (Drag & Drop) colunas e cartões de forma completamente fluida com suporte a animações (Framer Motion).
- **Pomodoro Widget:** Timer de produtividade integrado e flutuante. Transita automaticamente entre ciclos de Foco e Descanso e conta suas sessões diárias, enviando alertas visuais (Pulse UI) e sonoros para não quebrar seu ritmo.
- **Atalhos de Teclado:** Controle sua gestão sem o mouse. Foque em colunas, alterne modos e navegue rapidamente (pressione `?` na aplicação para o guia completo).

### 🎧 Imersão e Concentração
- **Rádio Integrada:** Motor de rádio Lofi / Ambiente construído em Vanilla JS nativo (bypassa bloqueios de *Autoplay*) com diversas estações (Lofi Girl, SomaFM, Secret Agent) para entrar em flow.
- **Feedback Sensorial:** Áudio sutil (Pluck/Swoosh) para ações importantes (mover cards, limpar quadros).

### 🛡️ Privacidade e Proteção do Quadro
- **Bloqueio por Senha:** Proteja seus cartões contra curiosos definindo uma senha para trancar o seu quadro quando você se afastar.
- **Modo Pânico:** Em caso de emergência, utilize uma senha alternativa que, ao invés de destravar o quadro, apaga todos os seus dados instantaneamente.
- **Recuperação Segura:** O sistema detecta se algo deu errado com seus dados e evita que você perca todo o seu progresso, mantendo-os seguros até serem restaurados.
- **Modo "Borrão" (Blur):** Esconda o conteúdo da tela com um único clique para privacidade instantânea em ambientes públicos.

### 🌐 Colaboração e Rede
- **Live Mode P2P:** Crie ou entre em salas de colaboração em tempo real via WebRTC (Yjs). Seus dados são sincronizados instantaneamente com outros usuários sem a necessidade de um servidor central de banco de dados (P2P).
- **Sincronização Local Avançada:** Sincronize o estado do quadro diretamente com um arquivo físico (`.json`) no seu computador via File System Access API para backups automáticos fora do navegador.

### 💾 Gestão de Dados
- **Templates Customizados:** Salve a estrutura atual das suas colunas como seu "Esqueleto Padrão" para que sempre que resetar a tela, ela carregue o seu formato pessoal.
- **Importar/Exportar:** Leve seus dados com você em formato JSON puro, texto legível (Markdown) ou migre/importe para o formato nativo do **Trello**.

---

## 🛠️ Tech Stack

- React
- Vite
- Zustand
- Zod
- Tailwind CSS
- Framer Motion
- Crypto-JS
- DOMPurify

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js e gerenciador de pacotes **PNPM** (utilizado no projeto por segurança de cadeia de suprimentos e rapidez).

### Passo a Passo

1. Instale as dependências:
```bash
pnpm install
```

2. Inicie o servidor de desenvolvimento:
```bash
pnpm run dev
```

3. Acesse `http://localhost:5173` no seu navegador favorito.
*(Nota: Devido a restrições de CSP e de Segurança de Áudio do navegador, algumas rádios só reproduzem em ambientes servidos via HTTP/HTTPS, e não através de acesso local "file://").*

---
> Desenvolvido com foco no agora. *Seus dados ficam apenas no seu navegador.*
