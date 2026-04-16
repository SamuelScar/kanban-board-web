(function attachUi(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const { formatCardCount } = Kanban.utils;

  function createCardElement(card) {
    const cardElement = document.createElement("article");
    cardElement.className = "card";
    cardElement.dataset.cardId = card.id;

    const titleElement = document.createElement("h3");
    titleElement.className = "card__title";
    titleElement.textContent = card.title;

    cardElement.append(titleElement);

    if (card.description) {
      const descriptionElement = document.createElement("p");
      descriptionElement.className = "card__description";
      descriptionElement.textContent = card.description;
      cardElement.append(descriptionElement);
    }

    return cardElement;
  }

  function createColumnElement(column) {
    const columnElement = document.createElement("article");
    columnElement.className = "column";
    columnElement.dataset.columnId = column.id;

    const headerElement = document.createElement("header");
    headerElement.className = "column__header";

    const titleWrapperElement = document.createElement("div");

    const titleElement = document.createElement("h2");
    titleElement.className = "column__title";
    titleElement.textContent = column.title;

    const metaElement = document.createElement("p");
    metaElement.className = "column__meta";
    metaElement.textContent = formatCardCount(column.cards.length);

    titleWrapperElement.append(titleElement, metaElement);
    headerElement.append(titleWrapperElement);

    const cardsElement = document.createElement("div");
    cardsElement.className = "column__cards";

    column.cards.forEach(function appendCard(card) {
      cardsElement.append(createCardElement(card));
    });

    columnElement.append(headerElement, cardsElement);
    return columnElement;
  }

  function renderBoard(rootElement, boardState) {
    rootElement.replaceChildren();

    if (!boardState.columns.length) {
      const emptyStateElement = document.createElement("p");
      emptyStateElement.className = "board__empty";
      emptyStateElement.textContent =
        "Nenhuma coluna foi criada ainda. O proximo passo e liberar a criacao dinamica.";
      rootElement.append(emptyStateElement);
      return;
    }

    const fragment = document.createDocumentFragment();

    boardState.columns.forEach(function appendColumn(column) {
      fragment.append(createColumnElement(column));
    });

    rootElement.append(fragment);
  }

  Kanban.ui = {
    renderBoard,
  };
})(window);
