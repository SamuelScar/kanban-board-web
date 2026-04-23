/**
 * Concentra todas as operacoes puras sobre o estado do board.
 * As funcoes deste modulo sempre retornam novas estruturas quando algo muda,
 * o que facilita a renderizacao e o estudo do fluxo de dados.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function attachState(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const { createId, normalizeHexColor, normalizeText } = Kanban.utils;

  /**
   * Cria uma nova coluna com titulo saneado e lista de cards vazia.
   *
   * @param {string} title Titulo informado pela interface.
   * @returns {{ id: string, title: string, cards: Array<object> }} Nova coluna.
   */
  function createColumn(title) {
    const normalizedTitle = normalizeText(title) || "Nova coluna";

    return {
      id: createId("column"),
      title: normalizedTitle,
      cards: [],
    };
  }

  /**
   * Adiciona uma coluna ao fim do quadro.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} [title] Titulo opcional da nova coluna.
   * @returns {{ columns: Array<object> }} Novo estado com a coluna criada.
   */
  function addColumn(boardState, title) {
    const newColumn = createColumn(title);

    return {
      ...boardState,
      columns: [...boardState.columns, newColumn],
    };
  }

  /**
   * Cria um card com titulo saneado e descricao vazia por padrao.
   *
   * @param {string} title Titulo informado pela interface.
   * @returns {{ id: string, title: string, description: string }} Novo card.
   */
  function createCard(title) {
    const normalizedTitle = normalizeText(title) || "Novo card";

    return {
      id: createId("card"),
      title: normalizedTitle,
      description: "",
    };
  }

  /**
   * Atualiza uma unica coluna sem mutar o restante da estrutura.
   * Se o `updater` nao alterar nada, o estado original e reaproveitado.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Identificador da coluna a ser atualizada.
   * @param {(column: object) => object} updater Funcao que produz a proxima coluna.
   * @returns {{ columns: Array<object> }} Estado atualizado ou o original.
   */
  function withUpdatedColumn(boardState, columnId, updater) {
    let didUpdate = false;

    const columns = boardState.columns.map(function mapColumn(column) {
      if (column.id !== columnId) {
        return column;
      }

      const nextColumn = updater(column);

      if (nextColumn === column) {
        return column;
      }

      didUpdate = true;
      return nextColumn;
    });

    return didUpdate
      ? {
          ...boardState,
          columns,
        }
      : boardState;
  }

  /**
   * Atualiza um card localizado dentro de uma coluna especifica.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Coluna que contem o card.
   * @param {string} cardId Card a ser transformado.
   * @param {(card: object) => object} updater Funcao que produz o proximo card.
   * @returns {{ columns: Array<object> }} Estado atualizado ou o original.
   */
  function withUpdatedCard(boardState, columnId, cardId, updater) {
    return withUpdatedColumn(boardState, columnId, function updateColumnCards(column) {
      let didUpdate = false;

      const cards = column.cards.map(function mapCard(card) {
        if (card.id !== cardId) {
          return card;
        }

        const nextCard = updater(card);

        if (nextCard === card) {
          return card;
        }

        didUpdate = true;
        return nextCard;
      });

      return didUpdate
        ? {
            ...column,
            cards,
          }
        : column;
    });
  }

  /**
   * Cria um card e o adiciona ao final da coluna informada.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Coluna que recebera o novo card.
   * @param {string} [title] Titulo opcional do novo card.
   * @returns {{ columns: Array<object> }} Novo estado com o card inserido.
   */
  function addCard(boardState, columnId, title) {
    return withUpdatedColumn(boardState, columnId, function appendCard(column) {
      return {
        ...column,
        cards: [...column.cards, createCard(title)],
      };
    });
  }

  /**
   * Remove uma coluna inteira do quadro.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Coluna a remover.
   * @returns {{ columns: Array<object> }} Estado sem a coluna, se ela existir.
   */
  function removeColumn(boardState, columnId) {
    const nextColumns = boardState.columns.filter(function filterColumn(column) {
      return column.id !== columnId;
    });

    return nextColumns.length === boardState.columns.length
      ? boardState
      : {
          ...boardState,
          columns: nextColumns,
        };
  }

  /**
   * Remove um card de dentro de uma coluna especifica.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Coluna que contem o card.
   * @param {string} cardId Card a remover.
   * @returns {{ columns: Array<object> }} Estado atualizado sem o card.
   */
  function removeCard(boardState, columnId, cardId) {
    return withUpdatedColumn(boardState, columnId, function removeColumnCard(column) {
      const nextCards = column.cards.filter(function filterCard(card) {
        return card.id !== cardId;
      });

      return nextCards.length === column.cards.length
        ? column
        : {
            ...column,
            cards: nextCards,
          };
    });
  }

  /**
   * Reordena colunas no eixo horizontal do board.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Coluna arrastada.
   * @param {number} targetIndex Nova posicao desejada.
   * @returns {{ columns: Array<object> }} Estado com a nova ordem.
   */
  function moveColumn(boardState, columnId, targetIndex) {
    const sourceIndex = boardState.columns.findIndex(function matchColumn(column) {
      return column.id === columnId;
    });

    if (sourceIndex === -1) {
      return boardState;
    }

    const normalizedTargetIndex = Math.max(
      0,
      Math.min(targetIndex, boardState.columns.length - 1)
    );

    if (sourceIndex === normalizedTargetIndex) {
      return boardState;
    }

    const nextColumns = [...boardState.columns];
    const movedColumn = nextColumns.splice(sourceIndex, 1)[0];

    nextColumns.splice(normalizedTargetIndex, 0, movedColumn);

    return {
      ...boardState,
      columns: nextColumns,
    };
  }

  /**
   * Move um card dentro da mesma coluna ou entre colunas diferentes.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} sourceColumnId Coluna de origem.
   * @param {string} cardId Card que esta sendo movido.
   * @param {string} targetColumnId Coluna de destino.
   * @param {number} targetIndex Posicao final dentro da coluna de destino.
   * @returns {{ columns: Array<object> }} Estado com os cards reordenados.
   */
  function moveCard(
    boardState,
    sourceColumnId,
    cardId,
    targetColumnId,
    targetIndex
  ) {
    const sourceColumnIndex = boardState.columns.findIndex(function matchSource(column) {
      return column.id === sourceColumnId;
    });
    const targetColumnIndex = boardState.columns.findIndex(function matchTarget(column) {
      return column.id === targetColumnId;
    });

    if (sourceColumnIndex === -1 || targetColumnIndex === -1) {
      return boardState;
    }

    const sourceColumn = boardState.columns[sourceColumnIndex];
    const sourceCardIndex = sourceColumn.cards.findIndex(function matchCard(card) {
      return card.id === cardId;
    });

    if (sourceCardIndex === -1) {
      return boardState;
    }

    if (sourceColumnId === targetColumnId && sourceCardIndex === targetIndex) {
      return boardState;
    }

    const nextColumns = [...boardState.columns];
    const nextSourceColumn = {
      ...nextColumns[sourceColumnIndex],
      cards: [...nextColumns[sourceColumnIndex].cards],
    };
    const nextTargetColumn =
      sourceColumnIndex === targetColumnIndex
        ? nextSourceColumn
        : {
            ...nextColumns[targetColumnIndex],
            cards: [...nextColumns[targetColumnIndex].cards],
          };

    nextColumns[sourceColumnIndex] = nextSourceColumn;
    nextColumns[targetColumnIndex] = nextTargetColumn;

    const movedCard = nextSourceColumn.cards.splice(sourceCardIndex, 1)[0];
    const normalizedTargetIndex = Math.max(
      0,
      Math.min(targetIndex, nextTargetColumn.cards.length)
    );

    nextTargetColumn.cards.splice(normalizedTargetIndex, 0, movedCard);

    return {
      ...boardState,
      columns: nextColumns,
    };
  }

  /**
   * Atualiza o titulo de uma coluna quando o texto informado e valido.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Coluna a renomear.
   * @param {string} title Novo titulo digitado pelo usuario.
   * @returns {{ columns: Array<object> }} Estado com o titulo atualizado.
   */
  function updateColumnTitle(boardState, columnId, title) {
    const normalizedTitle = normalizeText(title);

    if (!normalizedTitle) {
      return boardState;
    }

    return withUpdatedColumn(boardState, columnId, function updateColumn(column) {
      return column.title === normalizedTitle
        ? column
        : {
            ...column,
            title: normalizedTitle,
          };
    });
  }

  /**
   * Atualiza o titulo de um card especifico.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Coluna que contem o card.
   * @param {string} cardId Card a renomear.
   * @param {string} title Novo titulo digitado pelo usuario.
   * @returns {{ columns: Array<object> }} Estado com o titulo do card atualizado.
   */
  function updateCardTitle(boardState, columnId, cardId, title) {
    const normalizedTitle = normalizeText(title);

    if (!normalizedTitle) {
      return boardState;
    }

    return withUpdatedCard(boardState, columnId, cardId, function updateTitle(card) {
      return card.title === normalizedTitle
        ? card
        : {
            ...card,
            title: normalizedTitle,
          };
    });
  }

  /**
   * Atualiza a descricao textual de um card.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Coluna que contem o card.
   * @param {string} cardId Card cuja descricao sera alterada.
   * @param {string} description Novo texto descritivo.
   * @returns {{ columns: Array<object> }} Estado com a descricao atualizada.
   */
  function updateCardDescription(boardState, columnId, cardId, description) {
    const normalizedDescription = normalizeText(description);

    return withUpdatedCard(
      boardState,
      columnId,
      cardId,
      function updateDescription(card) {
        return card.description === normalizedDescription
          ? card
          : {
              ...card,
              description: normalizedDescription,
            };
      }
    );
  }

  /**
   * Atualiza a cor de destaque do card.
   * Quando a cor informada e invalida ou vazia, o atributo e removido.
   *
   * @param {{ columns: Array<object> }} boardState Estado atual do board.
   * @param {string} columnId Coluna que contem o card.
   * @param {string} cardId Card cuja cor sera alterada.
   * @param {string} color Nova cor em hexadecimal.
   * @returns {{ columns: Array<object> }} Estado com a cor normalizada.
   */
  function updateCardColor(boardState, columnId, cardId, color) {
    const normalizedColor = normalizeHexColor(color);

    return withUpdatedCard(boardState, columnId, cardId, function updateColor(card) {
      const currentColor = normalizeHexColor(card.color);

      if (currentColor === normalizedColor) {
        return card;
      }

      if (!normalizedColor) {
        const nextCard = { ...card };
        delete nextCard.color;
        return nextCard;
      }

      return {
        ...card,
        color: normalizedColor,
      };
    });
  }

  /**
   * Gera o estado inicial usado na primeira carga da aplicacao.
   * O conteudo exemplo ajuda a demonstrar a estrutura do board logo no inicio.
   *
   * @returns {{ columns: Array<object> }} Estrutura inicial do quadro.
   */
  function createInitialBoardState() {
    return {
      columns: [
        {
          id: createId("column"),
          title: "Backlog",
          cards: [
            {
              id: createId("card"),
              title: "Revisar o escopo do trabalho",
              description: "Mapear requisitos do PDF e transformar em tarefas iniciais.",
            },
            {
              id: createId("card"),
              title: "Definir a estrutura dos arquivos",
              description: "Separar estado, interface e persistencia desde o inicio.",
            },
          ],
        },
        {
          id: createId("column"),
          title: "Em andamento",
          cards: [
            {
              id: createId("card"),
              title: "Montar layout base do board",
              description: "Criar a casca inicial da aplicacao para validar a direcao visual.",
            },
          ],
        },
        {
          id: createId("column"),
          title: "Concluido",
          cards: [
            {
              id: createId("card"),
              title: "Criar README e .gitignore",
              description: "Registrar o escopo inicial e preparar o repositorio.",
            },
          ],
        },
      ],
    };
  }

  Kanban.state = {
    addCard,
    addColumn,
    createInitialBoardState,
    moveColumn,
    moveCard,
    removeCard,
    removeColumn,
    updateCardColor,
    updateCardDescription,
    updateCardTitle,
    updateColumnTitle,
  };
})(window);
