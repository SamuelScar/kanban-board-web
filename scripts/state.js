(function attachState(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const { createId, normalizeText } = Kanban.utils;

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

  function addCard(boardState, columnId, title) {
    let didUpdate = false;

    const columns = boardState.columns.map(function mapColumn(column) {
      if (column.id !== columnId) {
        return column;
      }

      didUpdate = true;

      return {
        ...column,
        cards: [...column.cards, createCard(title)],
      };
    });

    return didUpdate
      ? {
          ...boardState,
          columns,
        }
      : boardState;
  }

  function removeColumn(boardState, columnId) {
    const nextColumns = boardState.columns.filter(function filterColumn(column) {
      return column.id !== columnId;
    });

    if (nextColumns.length === boardState.columns.length) {
      return boardState;
    }

    return {
      ...boardState,
      columns: nextColumns,
    };
  }

  function removeCard(boardState, columnId, cardId) {
    let didUpdate = false;

    const columns = boardState.columns.map(function mapColumn(column) {
      if (column.id !== columnId) {
        return column;
      }

      const nextCards = column.cards.filter(function filterCard(card) {
        return card.id !== cardId;
      });

      if (nextCards.length === column.cards.length) {
        return column;
      }

      didUpdate = true;

      return {
        ...column,
        cards: nextCards,
      };
    });

    return didUpdate
      ? {
          ...boardState,
          columns,
        }
      : boardState;
  }

  function updateColumnTitle(boardState, columnId, title) {
    const normalizedTitle = normalizeText(title);

    if (!normalizedTitle) {
      return boardState;
    }

    let didUpdate = false;

    const columns = boardState.columns.map(function mapColumn(column) {
      if (column.id !== columnId || column.title === normalizedTitle) {
        return column;
      }

      didUpdate = true;

      return {
        ...column,
        title: normalizedTitle,
      };
    });

    return didUpdate
      ? {
          ...boardState,
          columns,
        }
      : boardState;
  }

  function updateCardTitle(boardState, columnId, cardId, title) {
    const normalizedTitle = normalizeText(title);

    if (!normalizedTitle) {
      return boardState;
    }

    let didUpdate = false;

    const columns = boardState.columns.map(function mapColumn(column) {
      if (column.id !== columnId) {
        return column;
      }

      const cards = column.cards.map(function mapCard(card) {
        if (card.id !== cardId || card.title === normalizedTitle) {
          return card;
        }

        didUpdate = true;

        return {
          ...card,
          title: normalizedTitle,
        };
      });

      return didUpdate
        ? {
            ...column,
            cards,
          }
        : column;
    });

    return didUpdate
      ? {
          ...boardState,
          columns,
        }
      : boardState;
  }

  function updateCardDescription(boardState, columnId, cardId, description) {
    const normalizedDescription =
      typeof description === "string" ? description.trim() : "";

    let didUpdate = false;

    const columns = boardState.columns.map(function mapColumn(column) {
      if (column.id !== columnId) {
        return column;
      }

      const cards = column.cards.map(function mapCard(card) {
        if (card.id !== cardId || card.description === normalizedDescription) {
          return card;
        }

        didUpdate = true;

        return {
          ...card,
          description: normalizedDescription,
        };
      });

      return didUpdate
        ? {
            ...column,
            cards,
          }
        : column;
    });

    return didUpdate
      ? {
          ...boardState,
          columns,
        }
      : boardState;
  }

  function createInitialBoardState() {
    return {
      id: createId("board"),
      title: "Quadro Inicial",
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
    removeCard,
    removeColumn,
    updateCardDescription,
    updateCardTitle,
    updateColumnTitle,
  };
})(window);
