/**
 * Concentra todas as operacoes puras sobre o estado do quadro.
 * As funcoes deste modulo sempre retornam novas estruturas quando algo muda,
 * o que facilita a renderizacao e o estudo do fluxo de dados.
 *
 * @param {Window} global Objeto global do navegador.
 */
(function anexarEstado(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const { criarId, normalizarTexto } = Kanban.utilitarios;

  /**
   * Cria uma nova coluna com titulo saneado e lista de cartoes vazia.
   *
   * @param {string} titulo Titulo informado pela interface.
   * @returns {{ id: string, titulo: string, cartoes: Array<object> }} Nova coluna.
   */
  function criarColuna(titulo) {
    const tituloNormalizado = normalizarTexto(titulo) || "Nova coluna";

    return {
      id: criarId("coluna"),
      titulo: tituloNormalizado,
      cartoes: [],
    };
  }

  /**
   * Adiciona uma coluna ao fim do quadro.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} [titulo] Titulo opcional da nova coluna.
   * @returns {{ colunas: Array<object> }} Novo estado com a coluna criada.
   */
  function adicionarColuna(estadoQuadro, titulo) {
    const novaColuna = criarColuna(titulo);

    return {
      ...estadoQuadro,
      colunas: [...estadoQuadro.colunas, novaColuna],
    };
  }

  /**
   * Cria um cartao com titulo saneado e descricao vazia por padrao.
   *
   * @param {string} titulo Titulo informado pela interface.
   * @returns {{ id: string, titulo: string, descricao: string }} Novo cartao.
   */
  function criarCartao(titulo) {
    const tituloNormalizado = normalizarTexto(titulo) || "Novo cartao";

    return {
      id: criarId("cartao"),
      titulo: tituloNormalizado,
      descricao: "",
    };
  }

  /**
   * Atualiza uma unica coluna sem mutar o restante da estrutura.
   * Se o `atualizador` nao alterar nada, o estado original e reaproveitado.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColuna Identificador da coluna a ser atualizada.
   * @param {(coluna: object) => object} atualizador Funcao que produz a proxima coluna.
   * @returns {{ colunas: Array<object> }} Estado atualizado ou o original.
   */
  function comColunaAtualizada(estadoQuadro, idColuna, atualizador) {
    let houveAtualizacao = false;

    const colunas = estadoQuadro.colunas.map(function mapearColuna(coluna) {
      if (coluna.id !== idColuna) {
        return coluna;
      }

      const proximaColuna = atualizador(coluna);

      if (proximaColuna === coluna) {
        return coluna;
      }

      houveAtualizacao = true;
      return proximaColuna;
    });

    return houveAtualizacao
      ? {
          ...estadoQuadro,
          colunas,
        }
      : estadoQuadro;
  }

  /**
   * Atualiza um cartao localizado dentro de uma coluna especifica.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColuna Coluna que contem o cartao.
   * @param {string} idCartao Cartao a ser transformado.
   * @param {(cartao: object) => object} atualizador Funcao que produz o proximo cartao.
   * @returns {{ colunas: Array<object> }} Estado atualizado ou o original.
   */
  function comCartaoAtualizado(estadoQuadro, idColuna, idCartao, atualizador) {
    return comColunaAtualizada(
      estadoQuadro,
      idColuna,
      function atualizarCartoesColuna(coluna) {
        let houveAtualizacao = false;

        const cartoes = coluna.cartoes.map(function mapearCartao(cartao) {
          if (cartao.id !== idCartao) {
            return cartao;
          }

          const proximoCartao = atualizador(cartao);

          if (proximoCartao === cartao) {
            return cartao;
          }

          houveAtualizacao = true;
          return proximoCartao;
        });

        return houveAtualizacao
          ? {
              ...coluna,
              cartoes,
            }
          : coluna;
      }
    );
  }

  /**
   * Cria um cartao e o adiciona ao final da coluna informada.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColuna Coluna que recebera o novo cartao.
   * @param {string} [titulo] Titulo opcional do novo cartao.
   * @returns {{ colunas: Array<object> }} Novo estado com o cartao inserido.
   */
  function adicionarCartao(estadoQuadro, idColuna, titulo) {
    return comColunaAtualizada(estadoQuadro, idColuna, function anexarCartao(coluna) {
      return {
        ...coluna,
        cartoes: [...coluna.cartoes, criarCartao(titulo)],
      };
    });
  }

  /**
   * Remove uma coluna inteira do quadro.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColuna Coluna a remover.
   * @returns {{ colunas: Array<object> }} Estado sem a coluna, se ela existir.
   */
  function removerColuna(estadoQuadro, idColuna) {
    const proximasColunas = estadoQuadro.colunas.filter(function filtrarColuna(coluna) {
      return coluna.id !== idColuna;
    });

    return proximasColunas.length === estadoQuadro.colunas.length
      ? estadoQuadro
      : {
          ...estadoQuadro,
          colunas: proximasColunas,
        };
  }

  /**
   * Remove um cartao de dentro de uma coluna especifica.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColuna Coluna que contem o cartao.
   * @param {string} idCartao Cartao a remover.
   * @returns {{ colunas: Array<object> }} Estado atualizado sem o cartao.
   */
  function removerCartao(estadoQuadro, idColuna, idCartao) {
    return comColunaAtualizada(estadoQuadro, idColuna, function removerCartaoColuna(coluna) {
      const proximosCartoes = coluna.cartoes.filter(function filtrarCartao(cartao) {
        return cartao.id !== idCartao;
      });

      return proximosCartoes.length === coluna.cartoes.length
        ? coluna
        : {
            ...coluna,
            cartoes: proximosCartoes,
          };
    });
  }

  /**
   * Reordena colunas no eixo horizontal do quadro.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColuna Coluna arrastada.
   * @param {number} indiceDestino Nova posicao desejada.
   * @returns {{ colunas: Array<object> }} Estado com a nova ordem.
   */
  function moverColuna(estadoQuadro, idColuna, indiceDestino) {
    const indiceOrigem = estadoQuadro.colunas.findIndex(function localizarColuna(coluna) {
      return coluna.id === idColuna;
    });

    if (indiceOrigem === -1) {
      return estadoQuadro;
    }

    const indiceDestinoNormalizado = Math.max(
      0,
      Math.min(indiceDestino, estadoQuadro.colunas.length - 1)
    );

    if (indiceOrigem === indiceDestinoNormalizado) {
      return estadoQuadro;
    }

    const proximasColunas = [...estadoQuadro.colunas];
    const colunaMovida = proximasColunas.splice(indiceOrigem, 1)[0];

    proximasColunas.splice(indiceDestinoNormalizado, 0, colunaMovida);

    return {
      ...estadoQuadro,
      colunas: proximasColunas,
    };
  }

  /**
   * Move um cartao dentro da mesma coluna ou entre colunas diferentes.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColunaOrigem Coluna de origem.
   * @param {string} idCartao Cartao que esta sendo movido.
   * @param {string} idColunaDestino Coluna de destino.
   * @param {number} indiceDestino Posicao final dentro da coluna de destino.
   * @returns {{ colunas: Array<object> }} Estado com os cartoes reordenados.
   */
  function moverCartao(
    estadoQuadro,
    idColunaOrigem,
    idCartao,
    idColunaDestino,
    indiceDestino
  ) {
    const indiceColunaOrigem = estadoQuadro.colunas.findIndex(function localizarOrigem(coluna) {
      return coluna.id === idColunaOrigem;
    });
    const indiceColunaDestino = estadoQuadro.colunas.findIndex(function localizarDestino(coluna) {
      return coluna.id === idColunaDestino;
    });

    if (indiceColunaOrigem === -1 || indiceColunaDestino === -1) {
      return estadoQuadro;
    }

    const colunaOrigem = estadoQuadro.colunas[indiceColunaOrigem];
    const indiceCartaoOrigem = colunaOrigem.cartoes.findIndex(function localizarCartao(cartao) {
      return cartao.id === idCartao;
    });

    if (indiceCartaoOrigem === -1) {
      return estadoQuadro;
    }

    if (idColunaOrigem === idColunaDestino && indiceCartaoOrigem === indiceDestino) {
      return estadoQuadro;
    }

    const proximasColunas = [...estadoQuadro.colunas];
    const proximaColunaOrigem = {
      ...proximasColunas[indiceColunaOrigem],
      cartoes: [...proximasColunas[indiceColunaOrigem].cartoes],
    };
    const proximaColunaDestino =
      indiceColunaOrigem === indiceColunaDestino
        ? proximaColunaOrigem
        : {
            ...proximasColunas[indiceColunaDestino],
            cartoes: [...proximasColunas[indiceColunaDestino].cartoes],
          };

    proximasColunas[indiceColunaOrigem] = proximaColunaOrigem;
    proximasColunas[indiceColunaDestino] = proximaColunaDestino;

    const cartaoMovido = proximaColunaOrigem.cartoes.splice(indiceCartaoOrigem, 1)[0];
    const indiceDestinoNormalizado = Math.max(
      0,
      Math.min(indiceDestino, proximaColunaDestino.cartoes.length)
    );

    proximaColunaDestino.cartoes.splice(indiceDestinoNormalizado, 0, cartaoMovido);

    return {
      ...estadoQuadro,
      colunas: proximasColunas,
    };
  }

  /**
   * Atualiza o titulo de uma coluna quando o texto informado e valido.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColuna Coluna a renomear.
   * @param {string} titulo Novo titulo digitado pelo usuario.
   * @returns {{ colunas: Array<object> }} Estado com o titulo atualizado.
   */
  function atualizarTituloColuna(estadoQuadro, idColuna, titulo) {
    const tituloNormalizado = normalizarTexto(titulo);

    if (!tituloNormalizado) {
      return estadoQuadro;
    }

    return comColunaAtualizada(estadoQuadro, idColuna, function atualizarColuna(coluna) {
      return coluna.titulo === tituloNormalizado
        ? coluna
        : {
            ...coluna,
            titulo: tituloNormalizado,
          };
    });
  }

  /**
   * Atualiza o titulo de um cartao especifico.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColuna Coluna que contem o cartao.
   * @param {string} idCartao Cartao a renomear.
   * @param {string} titulo Novo titulo digitado pelo usuario.
   * @returns {{ colunas: Array<object> }} Estado com o titulo do cartao atualizado.
   */
  function atualizarTituloCartao(estadoQuadro, idColuna, idCartao, titulo) {
    const tituloNormalizado = normalizarTexto(titulo);

    if (!tituloNormalizado) {
      return estadoQuadro;
    }

    return comCartaoAtualizado(
      estadoQuadro,
      idColuna,
      idCartao,
      function atualizarTitulo(cartao) {
        return cartao.titulo === tituloNormalizado
          ? cartao
          : {
              ...cartao,
              titulo: tituloNormalizado,
            };
      }
    );
  }

  /**
   * Atualiza a descricao textual de um cartao.
   *
   * @param {{ colunas: Array<object> }} estadoQuadro Estado atual do quadro.
   * @param {string} idColuna Coluna que contem o cartao.
   * @param {string} idCartao Cartao cuja descricao sera alterada.
   * @param {string} descricao Novo texto descritivo.
   * @returns {{ colunas: Array<object> }} Estado com a descricao atualizada.
   */
  function atualizarDescricaoCartao(estadoQuadro, idColuna, idCartao, descricao) {
    const descricaoNormalizada = normalizarTexto(descricao);

    return comCartaoAtualizado(
      estadoQuadro,
      idColuna,
      idCartao,
      function atualizarDescricao(cartao) {
        return cartao.descricao === descricaoNormalizada
          ? cartao
          : {
              ...cartao,
              descricao: descricaoNormalizada,
            };
      }
    );
  }

  /**
   * Gera o estado inicial usado na primeira carga da aplicacao.
   * O conteudo exemplo ajuda a demonstrar a estrutura do quadro logo no inicio.
   *
   * @returns {{ colunas: Array<object> }} Estrutura inicial do quadro.
   */
  function criarQuadroInicial() {
    return {
      colunas: [
        {
          id: criarId("coluna"),
          titulo: "Backlog",
          cartoes: [
            {
              id: criarId("cartao"),
              titulo: "Revisar o escopo do trabalho",
              descricao: "Mapear requisitos do PDF e transformar em tarefas iniciais.",
            },
            {
              id: criarId("cartao"),
              titulo: "Definir a estrutura dos arquivos",
              descricao: "Separar estado, interface e persistencia desde o inicio.",
            },
          ],
        },
        {
          id: criarId("coluna"),
          titulo: "Em andamento",
          cartoes: [
            {
              id: criarId("cartao"),
              titulo: "Montar layout base do quadro",
              descricao: "Criar a casca inicial da aplicacao para validar a direcao visual.",
            },
          ],
        },
        {
          id: criarId("coluna"),
          titulo: "Concluido",
          cartoes: [
            {
              id: criarId("cartao"),
              titulo: "Criar README e .gitignore",
              descricao: "Registrar o escopo inicial e preparar o repositorio.",
            },
          ],
        },
      ],
    };
  }

  Kanban.estado = {
    adicionarCartao,
    adicionarColuna,
    atualizarDescricaoCartao,
    atualizarTituloCartao,
    atualizarTituloColuna,
    criarQuadroInicial,
    moverCartao,
    moverColuna,
    removerCartao,
    removerColuna,
  };
})(window);
