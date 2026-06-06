import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import { useStore } from '../../store/kanbanStore'

export default function TutorialManager() {
  const avisoEducacionalVisto = useStore(state => state.avisoEducacionalVisto)
  const tutorialVisto = useStore(state => state.tutorialVisto)
  const marcarTutorialVisto = useStore(state => state.marcarTutorialVisto)
  const colunas = useStore(state => state.colunas)
  const driverInstance = useRef(null)

  useEffect(() => {
    // Só inicia o tutorial se o aviso educacional já foi fechado e o tutorial ainda não foi visto
    if (avisoEducacionalVisto && !tutorialVisto) {
      
      // Um pequeno delay para garantir que a UI está totalmente renderizada e o aviso sumiu
      const timer = setTimeout(() => {
        driverInstance.current = driver({
          showProgress: true,
          nextBtnText: 'Próximo →',
          prevBtnText: '← Anterior',
          doneBtnText: 'Concluir',
          progressText: 'Passo {{current}} de {{total}}',
          allowClose: true,
          animate: false, // Desabilita animação que causa travamento de GPU no Safari iOS (devido ao blur)
          onDestroyed: () => {
            marcarTutorialVisto();
          },
          steps: [
            {
              popover: {
                title: 'Bem-vindo ao Kanban Board Web! 👋',
                description: 'Este é um espaço minimalista desenhado para te ajudar a focar profundamente no seu trabalho. Vamos fazer um tour rápido de 1 minuto pelas funcionalidades?',
                position: 'center'
              }
            },
            {
              element: '[data-tour="cartao"], [data-tour="colunas"]',
              popover: {
                title: 'Gerencie suas tarefas',
                description: 'Estes são os seus cartões de tarefas. Você pode clicar e segurar para arrastá-los entre as colunas, ou dar um toque para editar o título, descrição, cores e acionar o Pomodoro.',
                position: 'bottom'
              }
            },
            {
              element: '[data-tour="nova-coluna"], [data-new-column-btn]',
              popover: {
                title: 'Fluxo customizável',
                description: 'Seu processo não é estático. Crie quantas colunas precisar clicando aqui para adaptar o quadro ao seu próprio fluxo de trabalho.',
                position: 'top'
              }
            },
            {
              element: '[data-tour="ferramentas"]',
              popover: {
                title: 'O seu Cinto de Utilidades',
                description: 'Aqui em cima você tem ferramentas vitais: o modo Privacidade (para ofuscar dados caso esteja compartilhando tela), a Rádio Lofi integrada para te ajudar a focar, e o menu de Segurança/Backups.',
                position: 'bottom'
              }
            },
            {
              popover: {
                title: 'Tudo pronto! 🚀',
                description: 'Lembre-se: tudo aqui é salvo automaticamente direto no seu navegador de forma super segura. Você está no controle. Bom trabalho!',
                position: 'center'
              }
            }
          ]
        });

        driverInstance.current.drive();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [avisoEducacionalVisto, tutorialVisto, marcarTutorialVisto]);

  return null; // Este componente não renderiza nada visível
}
