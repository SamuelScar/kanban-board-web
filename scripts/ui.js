/**
 * Converte o estado do board em elementos DOM.
 * Este modulo nao conhece eventos da aplicacao; ele apenas monta a interface
 * com os atributos e classes esperados pelos demais modulos.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function attachUi(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const {
    cardColorOptions,
    formatCardCount,
    normalizeHexColor,
    tintHexColor,
  } = Kanban.utils;

  /**
   * Cria um elemento opcionalmente ja associado a uma classe CSS.
   *
   * @param {string} tagName Tag HTML a ser criada.
   * @param {string} [className] Classe CSS inicial.
   * @returns {HTMLElement} Elemento recem-criado.
   */
  function createElement(tagName, className) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    return element;
  }

  /**
   * Preenche atributos `data-*` de maneira centralizada.
   *
   * @param {HTMLElement} element Elemento que recebera o dataset.
   * @param {Record<string, string>} [dataset] Chaves e valores a aplicar.
   * @returns {void}
   */
  function assignDataset(element, dataset) {
    Object.entries(dataset || {}).forEach(function assignData(entry) {
      const [key, value] = entry;
      element.dataset[key] = value;
    });
  }

  /**
   * Cria um botao ja configurado com texto, atributos de acessibilidade e dataset.
   *
   * @param {{
   *   className?: string,
   *   textContent?: string,
   *   ariaLabel?: string,
   *   title?: string,
   *   dataset?: Record<string, string>
   * }} options Configuracao do botao.
   * @returns {HTMLButtonElement} Botao pronto para uso na interface.
   */
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

  /**
   * Cria o campo editavel usado nos titulos de colunas e cards.
   *
   * @param {{
   *   className: string,
   *   value: string,
   *   maxLength: number,
   *   ariaLabel: string,
   *   dataset: Record<string, string>
   * }} options Configuracao do input.
   * @returns {HTMLInputElement} Campo de texto pronto para ser renderizado.
   */
  function createTitleInput(options) {
    const inputElement = createElement("input", options.className);
    inputElement.type = "text";
    inputElement.value = options.value;
    inputElement.maxLength = options.maxLength;
    inputElement.setAttribute("aria-label", options.ariaLabel);
    assignDataset(inputElement, options.dataset);
    return inputElement;
  }

  /**
   * Aplica variaveis CSS derivadas da cor escolhida para o card.
   * Assim o visual pode ser ajustado sem multiplicar classes de estilo.
   *
   * @param {HTMLElement} cardElement Elemento visual do card.
   * @param {string} normalizedCardColor Cor ja validada em hexadecimal.
   * @returns {void}
   */
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

  /**
   * Cria um botao individual dentro da paleta de cores do card.
   *
   * @param {string} cardId Card que sera atualizado ao clicar.
   * @param {{ label: string, value: string }} option Opcao da paleta.
   * @param {string} normalizedCardColor Cor atualmente ativa no card.
   * @returns {HTMLButtonElement} Botao de escolha de cor.
   */
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

  /**
   * Monta o seletor de cor exibido em cada card.
   *
   * @param {string} cardId Card associado ao seletor.
   * @param {string} normalizedCardColor Cor atualmente ativa.
   * @returns {HTMLDetailsElement} Componente expansivel com a paleta de cores.
   */
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

  /**
   * Agrupa os controles secundarios do card, como cor e exclusao.
   *
   * @param {string} cardId Card que recebera as acoes.
   * @param {string} normalizedCardColor Cor ativa do card.
   * @returns {HTMLDivElement} Bloco de acoes do card.
   */
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

  /**
   * Cria o paragrafo de descricao apenas quando o card possui conteudo.
   *
   * @param {string} description Texto descritivo do card.
   * @returns {HTMLParagraphElement | null} Descricao renderizada ou `null`.
   */
  function createCardDescription(description) {
    if (!description) {
      return null;
    }

    const descriptionElement = createElement("p", "card__description");
    descriptionElement.textContent = description;
    return descriptionElement;
  }

  /**
   * Converte um card do estado em um elemento `<article>`.
   *
   * @param {{ id: string, title: string, description?: string, color?: string }} card Dados do card.
   * @returns {HTMLElement} Elemento completo do card.
   */
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

  /**
   * Monta o cabecalho da coluna com titulo, metadados e botao de remocao.
   *
   * @param {{ id: string, title: string, cards: Array<object> }} column Dados da coluna.
   * @returns {HTMLElement} Cabecalho da coluna.
   */
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

  /**
   * Cria a area que recebe os cards renderizados e tambem serve como alvo
   * para o drag-and-drop.
   *
   * @param {{ id: string, cards: Array<object> }} column Coluna em renderizacao.
   * @returns {HTMLDivElement} Lista visual de cards.
   */
  function createCardsContainer(column) {
    const cardsElement = createElement("div", "column__cards");
    cardsElement.dataset.columnId = column.id;

    column.cards.forEach(function appendCard(card) {
      cardsElement.append(createCardElement(card));
    });

    return cardsElement;
  }

  /**
   * Cria o botao responsavel por adicionar cards dentro de uma coluna.
   *
   * @param {string} columnId Coluna que recebera o novo card.
   * @returns {HTMLButtonElement} Botao de adicao.
   */
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

  /**
   * Converte uma coluna inteira do estado em um bloco visual completo.
   *
   * @param {{ id: string, title: string, cards: Array<object> }} column Dados da coluna.
   * @returns {HTMLElement} Elemento da coluna.
   */
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

  /**
   * Cria o botao exibido ao final do board para adicionar novas colunas.
   *
   * @returns {HTMLButtonElement} Botao de adicao de coluna.
   */
  function createAddColumnElement() {
    return createButton({
      className: "board__add-column-button",
      textContent: "+ Nova coluna",
      dataset: {
        action: "add-column",
      },
    });
  }

  /**
   * Renderiza o estado inteiro do board substituindo o conteudo atual do DOM.
   * O uso de `DocumentFragment` reduz repaints enquanto o board e reconstruido.
   *
   * @param {HTMLElement} rootElement Container principal do quadro.
   * @param {{ columns: Array<object> }} boardState Estado atual a ser renderizado.
   * @returns {void}
   */
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
