(function attachState(global) {
  const Kanban = (global.Kanban = global.Kanban || {});
  const { createId } = Kanban.utils;

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
    createInitialBoardState,
  };
})(window);
