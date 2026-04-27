/**
 * Converte o estado do quadro em elementos DOM.
 * Este modulo nao conhece eventos da aplicacao; ele apenas monta a interface
 * com os atributos e classes esperados pelos demais modulos.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function anexarInterface(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const { formatarQuantidadeCartoes } = Kanban.utilitarios;

  /**
   * Cria um elemento opcionalmente ja associado a uma classe CSS.
   *
   * @param {string} nomeTag Tag HTML a ser criada.
   * @param {string} [nomeClasse] Classe CSS inicial.
   * @returns {HTMLElement} Elemento recem-criado.
   */
  function criarElemento(nomeTag, nomeClasse) {
    const elemento = document.createElement(nomeTag);

    if (nomeClasse) {
      elemento.className = nomeClasse;
    }

    return elemento;
  }

  /**
   * Preenche atributos `data-*` de maneira centralizada.
   *
   * @param {HTMLElement} elemento Elemento que recebera o dataset.
   * @param {Record<string, string>} [conjuntoDados] Chaves e valores a aplicar.
   * @returns {void}
   */
  function atribuirDados(elemento, conjuntoDados) {
    Object.entries(conjuntoDados || {}).forEach(function atribuirDado(entrada) {
      const [chave, valor] = entrada;
      elemento.dataset[chave] = valor;
    });
  }

  /**
   * Cria um botao ja configurado com texto, atributos de acessibilidade e dataset.
   *
   * @param {{
   *   nomeClasse?: string,
   *   texto?: string,
   *   rotuloAria?: string,
   *   titulo?: string,
   *   conjuntoDados?: Record<string, string>
   * }} opcoes Configuracao do botao.
   * @returns {HTMLButtonElement} Botao pronto para uso na interface.
   */
  function criarBotao(opcoes) {
    const elementoBotao = criarElemento("button", opcoes.nomeClasse);
    elementoBotao.type = "button";
    elementoBotao.textContent = opcoes.texto || "";

    if (opcoes.rotuloAria) {
      elementoBotao.setAttribute("aria-label", opcoes.rotuloAria);
    }

    if (opcoes.titulo) {
      elementoBotao.title = opcoes.titulo;
    }

    atribuirDados(elementoBotao, opcoes.conjuntoDados);
    return elementoBotao;
  }

  /**
   * Cria o campo editavel usado nos titulos de colunas e cartoes.
   *
   * @param {{
   *   nomeClasse: string,
   *   valor: string,
   *   tamanhoMaximo: number,
   *   rotuloAria: string,
   *   conjuntoDados: Record<string, string>
   * }} opcoes Configuracao do input.
   * @returns {HTMLInputElement} Campo de texto pronto para ser renderizado.
   */
  function criarCampoTitulo(opcoes) {
    const elementoCampo = criarElemento("input", opcoes.nomeClasse);
    elementoCampo.type = "text";
    elementoCampo.value = opcoes.valor;
    elementoCampo.maxLength = opcoes.tamanhoMaximo;
    elementoCampo.setAttribute("aria-label", opcoes.rotuloAria);
    atribuirDados(elementoCampo, opcoes.conjuntoDados);
    return elementoCampo;
  }

  /**
   * Agrupa os controles secundarios do cartao.
   *
   * @param {string} idCartao Cartao que recebera as acoes.
   * @returns {HTMLDivElement} Bloco de acoes do cartao.
   */
  function criarAcoesCartao(idCartao) {
    const elementoAcoesCartao = criarElemento("div", "cartao__acoes");
    const elementoBotaoRemoverCartao = criarBotao({
      nomeClasse: "cartao__botao-remover",
      texto: "x",
      rotuloAria: "Excluir cartao",
      conjuntoDados: {
        acao: "remover-cartao",
        cartaoId: idCartao,
      },
    });

    elementoAcoesCartao.append(elementoBotaoRemoverCartao);

    return elementoAcoesCartao;
  }

  /**
   * Cria o paragrafo de descricao apenas quando o cartao possui conteudo.
   *
   * @param {string} descricao Texto descritivo do cartao.
   * @returns {HTMLParagraphElement | null} Descricao renderizada ou `null`.
   */
  function criarDescricaoCartao(descricao) {
    if (!descricao) {
      return null;
    }

    const elementoDescricao = criarElemento("p", "cartao__descricao");
    elementoDescricao.textContent = descricao;
    return elementoDescricao;
  }

  /**
   * Converte um cartao do estado em um elemento `<article>`.
   *
   * @param {{ id: string, titulo: string, descricao?: string }} cartao Dados do cartao.
   * @returns {HTMLElement} Elemento completo do cartao.
   */
  function criarElementoCartao(cartao) {
    const elementoCartao = criarElemento("article", "cartao");
    const elementoTitulo = criarCampoTitulo({
      nomeClasse: "cartao__campo-titulo",
      valor: cartao.titulo,
      tamanhoMaximo: 80,
      rotuloAria: "Titulo do cartao",
      conjuntoDados: {
        campoTituloCartao: "true",
        cartaoId: cartao.id,
      },
    });
    const elementoDescricao = criarDescricaoCartao(cartao.descricao);

    elementoCartao.dataset.cartaoId = cartao.id;
    elementoCartao.append(criarAcoesCartao(cartao.id), elementoTitulo);

    if (elementoDescricao) {
      elementoCartao.append(elementoDescricao);
    }

    return elementoCartao;
  }

  /**
   * Monta o cabecalho da coluna com titulo, metadados e botao de remocao.
   *
   * @param {{ id: string, titulo: string, cartoes: Array<object> }} coluna Dados da coluna.
   * @returns {HTMLElement} Cabecalho da coluna.
   */
  function criarCabecalhoColuna(coluna) {
    const elementoCabecalho = criarElemento("header", "coluna__cabecalho");
    const elementoEnvoltoriaTitulo = criarElemento("div");
    const elementoTitulo = criarCampoTitulo({
      nomeClasse: "coluna__campo-titulo",
      valor: coluna.titulo,
      tamanhoMaximo: 40,
      rotuloAria: "Titulo da coluna",
      conjuntoDados: {
        campoTituloColuna: "true",
        colunaId: coluna.id,
      },
    });
    const elementoMeta = criarElemento("p", "coluna__meta");
    const elementoBotaoRemoverColuna = criarBotao({
      nomeClasse: "coluna__botao-remover",
      texto: "x",
      rotuloAria: "Excluir coluna",
      conjuntoDados: {
        acao: "remover-coluna",
        colunaId: coluna.id,
      },
    });

    elementoMeta.textContent = formatarQuantidadeCartoes(coluna.cartoes.length);
    elementoEnvoltoriaTitulo.append(elementoTitulo, elementoMeta);
    elementoCabecalho.append(elementoEnvoltoriaTitulo, elementoBotaoRemoverColuna);

    return elementoCabecalho;
  }

  /**
   * Cria a area que recebe os cartoes renderizados e tambem serve como alvo
   * para o drag-and-drop.
   *
   * @param {{ id: string, cartoes: Array<object> }} coluna Coluna em renderizacao.
   * @returns {HTMLDivElement} Lista visual de cartoes.
   */
  function criarContainerCartoes(coluna) {
    const elementoCartoes = criarElemento("div", "coluna__cartoes");
    elementoCartoes.dataset.colunaId = coluna.id;

    coluna.cartoes.forEach(function anexarCartao(cartao) {
      elementoCartoes.append(criarElementoCartao(cartao));
    });

    return elementoCartoes;
  }

  /**
   * Cria o botao responsavel por adicionar cartoes dentro de uma coluna.
   *
   * @param {string} idColuna Coluna que recebera o novo cartao.
   * @returns {HTMLButtonElement} Botao de adicao.
   */
  function criarBotaoAdicionarCartao(idColuna) {
    return criarBotao({
      nomeClasse: "coluna__botao-adicionar-cartao",
      texto: "+",
      rotuloAria: "Adicionar cartao",
      conjuntoDados: {
        acao: "adicionar-cartao",
        colunaId: idColuna,
      },
    });
  }

  /**
   * Converte uma coluna inteira do estado em um bloco visual completo.
   *
   * @param {{ id: string, titulo: string, cartoes: Array<object> }} coluna Dados da coluna.
   * @returns {HTMLElement} Elemento da coluna.
   */
  function criarElementoColuna(coluna) {
    const elementoColuna = criarElemento("article", "coluna");

    elementoColuna.dataset.colunaId = coluna.id;
    elementoColuna.append(
      criarCabecalhoColuna(coluna),
      criarContainerCartoes(coluna),
      criarBotaoAdicionarCartao(coluna.id)
    );

    return elementoColuna;
  }

  /**
   * Cria o botao exibido ao final do quadro para adicionar novas colunas.
   *
   * @returns {HTMLButtonElement} Botao de adicao de coluna.
   */
  function criarBotaoAdicionarColuna() {
    return criarBotao({
      nomeClasse: "quadro__botao-adicionar-coluna",
      texto: "+ Nova coluna",
      conjuntoDados: {
        acao: "adicionar-coluna",
      },
    });
  }

  /**
   * Renderiza o estado inteiro do quadro substituindo o conteudo atual do DOM.
   * O uso de `DocumentFragment` reduz repaints enquanto o quadro e reconstruido.
   *
   * @param {HTMLElement} elementoRaiz Container principal do quadro.
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual a ser renderizado.
   * @returns {void}
   */
  function renderizarQuadro(elementoRaiz, estadoQuadro) {
    const fragmento = document.createDocumentFragment();

    estadoQuadro.colunas.forEach(function anexarColuna(coluna) {
      fragmento.append(criarElementoColuna(coluna));
    });

    fragmento.append(criarBotaoAdicionarColuna());
    elementoRaiz.replaceChildren(fragmento);
  }

  Kanban.interface = {
    renderizarQuadro,
  };
})(window);
