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

## Como executar

Primeiro, instale a dependencia local do projeto:

```bash
npm install
```

Depois, abra o arquivo `index.html` diretamente no navegador.

## Documento de referencia

O escopo inicial do projeto esta descrito em [TP1_TEC_WEB.pdf](./TP1_TEC_WEB.pdf).
