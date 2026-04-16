  (function attachUi(global) {
    const Kanban = (global.Kanban = global.Kanban || {});
  const {
    cardColorOptions,
    formatCardCount,
    normalizeHexColor,
    tintHexColor,
  } = Kanban.utils;

  function createTitleInput(options) {
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.className = options.className;
    inputElement.value = options.value;
    inputElement.maxLength = options.maxLength;
    inputElement.setAttribute("aria-label", options.ariaLabel);

    Object.entries(options.dataset).forEach(function assignData(entry) {
      const [key, value] = entry;
      inputElement.dataset[key] = value;
    });

    return inputElement;
  }

  function createCardElement(card) {
    const cardElement = document.createElement("article");
    cardElement.className = "card";
    cardElement.dataset.cardId = card.id;

    const normalizedCardColor = normalizeHexColor(card.color);

    if (normalizedCardColor) {
      cardElement.style.setProperty(
        "--card-surface",
        tintHexColor(normalizedCardColor, 0.82)
      );
      cardElement.style.setProperty(
        "--card-border",
        tintHexColor(normalizedCardColor, 0.6)
      );
      cardElement.style.setProperty("--card-accent", normalizedCardColor);
    }

    const cardActionsElement = document.createElement("div");
    cardActionsElement.className = "card__actions";

    const colorPickerElement = document.createElement("details");
    colorPickerElement.className = "card__color-picker";

    const colorToggleElement = document.createElement("summary");
    colorToggleElement.className = "card__color-toggle";
    colorToggleElement.setAttribute("aria-label", "Escolher cor do card");
    colorToggleElement.title = "Escolher cor do card";
    colorToggleElement.style.setProperty(
      "--card-color-button-fill",
      normalizedCardColor || "#efe5d8"
    );

    const colorMenuElement = document.createElement("div");
    colorMenuElement.className = "card__color-menu";

    cardColorOptions.forEach(function appendColorOption(option) {
      const colorOptionButton = document.createElement("button");
      colorOptionButton.type = "button";
      colorOptionButton.className = option.value
        ? "card__color-option"
        : "card__color-option card__color-option--clear";
      colorOptionButton.dataset.action = "set-card-color";
      colorOptionButton.dataset.cardId = card.id;
      colorOptionButton.dataset.colorValue = option.value;
      colorOptionButton.setAttribute("aria-label", option.label);
      colorOptionButton.title = option.label;
      colorOptionButton.setAttribute(
        "aria-pressed",
        String(option.value === normalizedCardColor)
      );

      if (option.value) {
        colorOptionButton.style.setProperty(
          "--card-color-option-fill",
          option.value
        );
      }

      colorMenuElement.append(colorOptionButton);
    });

    colorPickerElement.append(colorToggleElement, colorMenuElement);

    const removeCardButton = document.createElement("button");
    removeCardButton.type = "button";
    removeCardButton.className = "card__remove-button";
    removeCardButton.dataset.action = "remove-card";
    removeCardButton.dataset.cardId = card.id;
    removeCardButton.setAttribute("aria-label", "Excluir card");
    removeCardButton.textContent = "x";

    const titleElement = createTitleInput({
      className: "card__title-input",
      value: card.title,
      maxLength: 80,
      ariaLabel: "Titulo do card",
      dataset: {
        cardTitleInput: "true",
        cardId: card.id,
      },
    });

    cardActionsElement.append(colorPickerElement, removeCardButton);
    cardElement.append(cardActionsElement, titleElement);

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

    const titleElement = createTitleInput({
      className: "column__title-input",
      value: column.title,
      maxLength: 40,
      ariaLabel: "Titulo da coluna",
      dataset: {
        columnTitleInput: "true",
        columnId: column.id,
      },
    });

    const metaElement = document.createElement("p");
    metaElement.className = "column__meta";
    metaElement.textContent = formatCardCount(column.cards.length);

    const removeColumnButton = document.createElement("button");
    removeColumnButton.type = "button";
    removeColumnButton.className = "column__remove-button";
    removeColumnButton.dataset.action = "remove-column";
    removeColumnButton.dataset.columnId = column.id;
    removeColumnButton.setAttribute("aria-label", "Excluir coluna");
    removeColumnButton.textContent = "x";

    titleWrapperElement.append(titleElement, metaElement);
    headerElement.append(titleWrapperElement, removeColumnButton);

    const cardsElement = document.createElement("div");
    cardsElement.className = "column__cards";
    cardsElement.dataset.columnId = column.id;

    column.cards.forEach(function appendCard(card) {
      cardsElement.append(createCardElement(card));
    });

    const addCardButton = document.createElement("button");
    addCardButton.type = "button";
    addCardButton.className = "column__add-card-button";
    addCardButton.dataset.action = "add-card";
    addCardButton.dataset.columnId = column.id;
    addCardButton.setAttribute("aria-label", "Adicionar card");
    addCardButton.textContent = "+";

    columnElement.append(headerElement, cardsElement, addCardButton);
    return columnElement;
  }

  function createAddColumnElement() {
    const addColumnButton = document.createElement("button");
    addColumnButton.type = "button";
    addColumnButton.className = "board__add-column-button";
    addColumnButton.dataset.action = "add-column";
    addColumnButton.textContent = "+ Nova coluna";

    return addColumnButton;
  }

  function renderBoard(rootElement, boardState) {
    rootElement.replaceChildren();

    const fragment = document.createDocumentFragment();

    boardState.columns.forEach(function appendColumn(column) {
      fragment.append(createColumnElement(column));
    });

    fragment.append(createAddColumnElement());
    rootElement.append(fragment);
  }

  Kanban.ui = {
    renderBoard,
  };
})(window);
