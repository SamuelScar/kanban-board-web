(function attachState(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const { createId, normalizeHexColor, normalizeText } = Kanban.utils;

  function createColumn(title) {
    const normalizedTitle = normalizeText(title) || "Nova coluna";

    return {
      id: createId("column"),
      title: normalizedTitle,
      cards: [],
    };
  }

  function addColumn(boardState, title) {
    const newColumn = createColumn(title);

    return {
      ...boardState,
      columns: [...boardState.columns, newColumn],
    };
  }

  function createCard(title) {
    const normalizedTitle = normalizeText(title) || "Novo card";

    return {
      id: createId("card"),
      title: normalizedTitle,
      description: "",
    };
  }

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

  function addCard(boardState, columnId, title) {
    return withUpdatedColumn(boardState, columnId, function appendCard(column) {
      return {
        ...column,
        cards: [...column.cards, createCard(title)],
      };
    });
  }

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
