(function attachUi(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const {
    cardColorOptions,
    formatCardCount,
    normalizeHexColor,
    tintHexColor,
  } = Kanban.utils;

  function createElement(tagName, className) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    return element;
  }

  function assignDataset(element, dataset) {
    Object.entries(dataset || {}).forEach(function assignData(entry) {
      const [key, value] = entry;
      element.dataset[key] = value;
    });
  }

  function createButton(options) {
    const buttonElement = createElement("button", options.className);
    buttonElement.type = "button";
    buttonElement.textContent = options.textContent || "";

    if (options.ariaLabel) {
      buttonElement.setAttribute("aria-label", options.ariaLabel);
    }

    if (options.title) {
      buttonElement.title = options.title;
    }

    assignDataset(buttonElement, options.dataset);
    return buttonElement;
  }

  function createTitleInput(options) {
    const inputElement = createElement("input", options.className);
    inputElement.type = "text";
    inputElement.value = options.value;
    inputElement.maxLength = options.maxLength;
    inputElement.setAttribute("aria-label", options.ariaLabel);
    assignDataset(inputElement, options.dataset);
    return inputElement;
  }

  function applyCardColorTheme(cardElement, normalizedCardColor) {
    if (!normalizedCardColor) {
      return;
    }

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

  function createColorOptionButton(cardId, option, normalizedCardColor) {
    const className = option.value
      ? "card__color-option"
      : "card__color-option card__color-option--clear";
    const buttonElement = createButton({
      className,
      ariaLabel: option.label,
      title: option.label,
      dataset: {
        action: "set-card-color",
        cardId,
        colorValue: option.value,
      },
    });

    buttonElement.setAttribute(
      "aria-pressed",
      String(option.value === normalizedCardColor)
    );

    if (option.value) {
      buttonElement.style.setProperty("--card-color-option-fill", option.value);
    }

    return buttonElement;
  }

  function createColorPicker(cardId, normalizedCardColor) {
    const colorPickerElement = createElement("details", "card__color-picker");
    const colorToggleElement = createElement("summary", "card__color-toggle");
    const colorMenuElement = createElement("div", "card__color-menu");

    colorToggleElement.setAttribute("aria-label", "Escolher cor do card");
    colorToggleElement.title = "Escolher cor do card";
    colorToggleElement.style.setProperty(
      "--card-color-button-fill",
      normalizedCardColor || "#efe5d8"
    );

    cardColorOptions.forEach(function appendColorOption(option) {
      colorMenuElement.append(
        createColorOptionButton(cardId, option, normalizedCardColor)
      );
    });

    colorPickerElement.append(colorToggleElement, colorMenuElement);
    return colorPickerElement;
  }

  function createCardActions(cardId, normalizedCardColor) {
    const cardActionsElement = createElement("div", "card__actions");
    const removeCardButton = createButton({
      className: "card__remove-button",
      textContent: "x",
      ariaLabel: "Excluir card",
      dataset: {
        action: "remove-card",
        cardId,
      },
    });

    cardActionsElement.append(
      createColorPicker(cardId, normalizedCardColor),
      removeCardButton
    );

    return cardActionsElement;
  }

  function createCardDescription(description) {
    if (!description) {
      return null;
    }

    const descriptionElement = createElement("p", "card__description");
    descriptionElement.textContent = description;
    return descriptionElement;
  }

  function createCardElement(card) {
    const cardElement = createElement("article", "card");
    const normalizedCardColor = normalizeHexColor(card.color);
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
    const descriptionElement = createCardDescription(card.description);

    cardElement.dataset.cardId = card.id;
    applyCardColorTheme(cardElement, normalizedCardColor);
    cardElement.append(createCardActions(card.id, normalizedCardColor), titleElement);

    if (descriptionElement) {
      cardElement.append(descriptionElement);
    }

    return cardElement;
  }

  function createColumnHeader(column) {
    const headerElement = createElement("header", "column__header");
    const titleWrapperElement = createElement("div");
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
    const metaElement = createElement("p", "column__meta");
    const removeColumnButton = createButton({
      className: "column__remove-button",
      textContent: "x",
      ariaLabel: "Excluir coluna",
      dataset: {
        action: "remove-column",
        columnId: column.id,
      },
    });

    metaElement.textContent = formatCardCount(column.cards.length);
    titleWrapperElement.append(titleElement, metaElement);
    headerElement.append(titleWrapperElement, removeColumnButton);

    return headerElement;
  }

  function createCardsContainer(column) {
    const cardsElement = createElement("div", "column__cards");
    cardsElement.dataset.columnId = column.id;

    column.cards.forEach(function appendCard(card) {
      cardsElement.append(createCardElement(card));
    });

    return cardsElement;
  }

  function createAddCardButton(columnId) {
    return createButton({
      className: "column__add-card-button",
      textContent: "+",
      ariaLabel: "Adicionar card",
      dataset: {
        action: "add-card",
        columnId,
      },
    });
  }

  function createColumnElement(column) {
    const columnElement = createElement("article", "column");

    columnElement.dataset.columnId = column.id;
    columnElement.append(
      createColumnHeader(column),
      createCardsContainer(column),
      createAddCardButton(column.id)
    );

    return columnElement;
  }

  function createAddColumnElement() {
    return createButton({
      className: "board__add-column-button",
      textContent: "+ Nova coluna",
      dataset: {
        action: "add-column",
      },
    });
  }

  function renderBoard(rootElement, boardState) {
    const fragment = document.createDocumentFragment();

    boardState.columns.forEach(function appendColumn(column) {
      fragment.append(createColumnElement(column));
    });

    fragment.append(createAddColumnElement());
    rootElement.replaceChildren(fragment);
  }

  Kanban.ui = {
    renderBoard,
  };
})(window);
