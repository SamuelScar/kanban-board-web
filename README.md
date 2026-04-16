# Kanban Board Web

Aplicacao web de quadro Kanban inspirada em ferramentas como Trello, desenvolvida apenas com tecnologias nativas da web.

## Objetivo

Criar uma aplicacao front-end capaz de organizar tarefas em colunas e cards, permitindo criar, mover e remover elementos dinamicamente, com persistencia local no navegador.

## Funcionalidades previstas

- Criacao de colunas dinamicamente
- Remocao de colunas
- Criacao de cards dentro das colunas
- Remocao de cards
- Movimentacao de cards entre colunas
- Persistencia dos dados no navegador com `localStorage`


## Arquitetura esperada

O projeto sera organizado com base em tres partes principais:

- Estado: estrutura de dados das colunas e cards
- Interface: renderizacao visual no DOM
- Logica: manipulacao de eventos, atualizacao de estado e persistencia

## Estrutura atual

```text
.
|-- index.html
|-- package-lock.json
|-- package.json
|-- scripts/
|   |-- app.js
|   |-- alerts.js
|   |-- state.js
|   |-- storage.js
|   |-- ui.js
|   `-- utils.js
|-- styles/
|   `-- main.css
`-- TP1_TEC_WEB.pdf
```

## Como executar

Primeiro, instale a dependencia local do projeto:

```bash
npm install
```

Depois, rode o servidor local:

```bash
npm start
```

Depois, abra `http://localhost:8000` no navegador.

Os alertas de confirmacao usam `SweetAlert2` instalado via `npm` e carregado localmente a partir de `node_modules`, sem CDN.

O estado atual da aplicacao contem:

- Layout base do quadro
- Estado inicial em memoria
- Renderizacao dinamica das colunas e cards
- Persistencia inicial com `localStorage`
- Adicao de cards com botao `+` em cada coluna
- Adicao de colunas por um controle no fim do board
- Edicao inline dos titulos de colunas e cards
- Edicao da descricao dos cards em modal com `SweetAlert2`
- Remocao de cards e colunas com confirmacao em `SweetAlert2`

## Documento de referencia

O escopo inicial do projeto esta descrito em [TP1_TEC_WEB.pdf](./TP1_TEC_WEB.pdf).
