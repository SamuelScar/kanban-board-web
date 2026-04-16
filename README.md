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

Para testes rapidos, voce pode abrir o arquivo `index.html` no navegador.

Para desenvolvimento, o ideal e rodar um servidor local simples:

```bash
python3 -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador.

Os alertas de confirmacao usam `SweetAlert2` carregado por CDN.

O estado atual da aplicacao contem:

- Layout base do quadro
- Estado inicial em memoria
- Renderizacao dinamica das colunas e cards
- Persistencia inicial com `localStorage`
- Adicao de cards com botao `+` em cada coluna
- Adicao de colunas por um controle no fim do board
- Edicao inline dos titulos de colunas e cards
- Remocao de cards e colunas com confirmacao em `SweetAlert2`

## Documento de referencia

O escopo inicial do projeto esta descrito em [TP1_TEC_WEB.pdf](./TP1_TEC_WEB.pdf).
