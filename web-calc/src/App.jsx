import { useState, useRef, useEffect, useCallback } from 'react'
import Hotbar from './components/ui/Hotbar'
import Calculator from './components/ui/Calculator'
import CartesianGame from './components/games/CartesianProd'
import FunctionGame from './components/games/FindFunction'
import VectorGame from './components/games/VecMission'
import { AlignCenter, Moon, Sun, X} from "lucide-react" 
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import './App.css'

// Importação da fonte caligráfica
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap');
`;

function App() {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentHomeIndex, setCurrentHomeIndex] = useState(0);
  const [homeCarouselApi, setHomeCarouselApi] = useState();

  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);

  // Detectar se o dispositivo é móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Aplicar a classe dark na tag html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Remover elementos de debugging
    const removeDebugElements = () => {
      const debugButtons = document.querySelectorAll('.debug-button, .close-button');
      debugButtons.forEach(button => {
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });
    };
    
    setTimeout(removeDebugElements, 100);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // Game data array
  const games = [
    {
      id: 'cartesianGame',
      component: CartesianGame,
      title: 'Produto Cartesiano'
    },
    {
      id: 'functionGame', 
      component: FunctionGame,
      title: 'Descubra a Função'
    },
    {
      id: 'vectorGame',
      component: VectorGame,
      title: 'Decomposição Vetorial'
    }
  ];


    // Add modal handlers
  const openGameModal = (gameId) => {
    setSelectedGameId(gameId);
    setShowGameModal(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeGameModal = () => {
    setShowGameModal(false);
    setSelectedGameId(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };


  // Update scroll function to handle game modals
  const scrollToSection = (sectionId) => {
    if (sectionId === 'calculator') {
      setShowCalculator(true);
      return;
    }
    
    if (sectionId === 'about') {
      aboutRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      return;
    }

    if (sectionId === 'home') {
      homeRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      return;
    }
  };


  // Get selected game component
  const getSelectedGameComponent = () => {
    const game = games.find(g => g.id === selectedGameId);
    return game ? game.component : null;
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showGameModal) {
        closeGameModal();
      }
    };

    if (showGameModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showGameModal]);

  useEffect(() => {
  if (!homeCarouselApi) {
    return;
  }

  const onSelect = () => {
    setCurrentHomeIndex(homeCarouselApi.selectedScrollSnap());
  };

  homeCarouselApi.on('select', onSelect);
  onSelect();

  return () => {
    homeCarouselApi.off('select', onSelect);
  };
}, [homeCarouselApi]);

// Handler para indicadores do carrossel da home
const handleHomeIndicatorClick = useCallback((index) => {
  if (homeCarouselApi) {
    homeCarouselApi.scrollTo(index);
  }
}, [homeCarouselApi]);

  return (
    <div 
      className={`App ${darkMode ? 'dark' : ''}`}
      style={{
        backgroundColor: darkMode ? '#1f2937' : 'rgba(227, 228, 233, 0.8)',
        backgroundImage: darkMode 
          ? `
            linear-gradient(to right, rgba(75, 85, 99, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(75, 85, 99, 0.2) 1px, transparent 1px)
          `
          : `
            linear-gradient(to right, rgba(211, 213, 218, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(211, 213, 218, 0.8) 1px, transparent 1px)
          `,
        backgroundSize: '20px 20px'
      }}
    >
      {/* Incluir estilos da fonte */}
      <style>{fontStyles}</style>
      
      <Hotbar 
        onNavigate={scrollToSection} 
        showCalculator={showCalculator} 
        setShowCalculator={setShowCalculator}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        isMobile={isMobile}
      />
      
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} darkMode={darkMode} />}
      
    {/* Game Modal */}
      {showGameModal && selectedGameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeGameModal}
          />
          
          {/* Modal Content */}
          <div className={`
            relative w-full max-w-7xl max-h-[90vh] overflow-auto
            ${darkMode ? 'bg-gray-900' : 'bg-white'}
            rounded-lg shadow-2xl transform transition-all
            border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {/* Close Button */}
            <button
              onClick={closeGameModal}
              className={`
                absolute top-4 right-4 z-10 p-2 rounded-full
                transition-colors hover:scale-110
                ${darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }
              `}
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Game Component */}
            <div className="w-full h-full">
              {(() => {
                const GameComponent = getSelectedGameComponent();
                return GameComponent ? (
                  <GameComponent 
                    onClose={closeGameModal} 
                    darkMode={darkMode} 
                    isMobile={isMobile} 
                  />
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Botão toggle theme apenas aparece para viewports maiores */}
      {!isMobile && (
        <button
          onClick={toggleTheme}
          className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-800 shadow-lg z-50 transition-colors"
          aria-label="Alternar tema"
        >
          {darkMode ? 
            <Sun className="h-5 w-5 text-gray-400" /> : 
            <Moon className="h-5 w-5 text-gray-800" />
          }
        </button>
      )}

      {/* Home Section - Update card onClick handlers */}
      <section 
        ref={homeRef} 
        id="home"
        className=" min-h-screen flex items-center justify-center px-4 py-12 md:p-6 transition-colors"
      >
        <div className="max-w-5xl w-full">
          <h1 
            className="text-3xl md:text-5xl font-bold text-center mb-10 text-gray-600 dark:text-gray-200 transition-colors"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Explorando Matemática Interativa
          </h1>
          
          <h2 
            className="text-xl md:text-3xl font-semibold text-center mb-8 text-gray-600 dark:text-gray-300 transition-colors"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Nossos Jogos
          </h2>
          
          {/* Cards em carrossel */}
          <Carousel 
  className="relative"
  setApi={setHomeCarouselApi}
  opts={{
    loop: true,
    align: "center",
    dragFree: false,
    skipSnaps: false,
    duration: 20,
    startIndex: 0,
  }}
>
  <CarouselContent className="-ml-4 py-4">
    {/* Card Produto Cartesiano */}
    <CarouselItem className="pl-4 basis-full">
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <div 
            onClick={() => openGameModal('cartesianGame')}
            className={`
              bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden 
              border border-gray-200 dark:border-gray-700 transition-all 
              cursor-pointer hover:shadow-lg hover:scale-105 duration-300 h-full
            `}
          >
            <div className="h-32 md:h-40 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center transition-colors">
              <div 
                className="text-4xl md:text-5xl text-gray-600 dark:text-gray-200 font-bold"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                A×B
              </div>
            </div>
            <div className="p-6">
              <h3 
                className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-200 mb-3 transition-colors text-center"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Produto Cartesiano
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-300 transition-colors text-center">
                Explore e colete os pares ordenados no plano cartesiano.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CarouselItem>
    
    {/* Card Função */}
    <CarouselItem className="pl-4 basis-full">
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <div 
            onClick={() => openGameModal('functionGame')}
            className={`
              bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden 
              border border-gray-200 dark:border-gray-700 transition-all 
              cursor-pointer hover:shadow-lg hover:scale-105 duration-300 h-full
            `}
          >
            <div className="h-32 md:h-40 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center transition-colors">
              <div 
                className="text-2xl md:text-3xl text-gray-600 dark:text-gray-200 font-bold transition-colors"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                f(x)=ax²+bx+c
              </div>
            </div>
            <div className="p-6">
              <h3 
                className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-200 mb-3 transition-colors text-center"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Descubra a Função
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-300 transition-colors text-center">
                Deduza a função matemática a partir do seu gráfico e comportamento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CarouselItem>
    
    {/* Card Vetor */}
    <CarouselItem className="pl-4 basis-full">
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <div 
            onClick={() => openGameModal('vectorGame')}
            className={`
              bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden 
              border border-gray-200 dark:border-gray-700 transition-all 
              cursor-pointer hover:shadow-lg hover:scale-105 duration-300 h-full
            `}
          >
            <div className="h-32 md:h-40 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center transition-colors">
              <div 
                className="text-2xl md:text-3xl text-gray-600 dark:text-gray-200 font-bold transition-colors"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                <span className="inline-block transform -translate-y-2">→</span>
                <span className="ml-1">v = (x,y)</span>
              </div>
            </div>
            <div className="p-6">
              <h3 
                className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-200 mb-3 transition-colors text-center"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Decomposição Vetorial
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-300 transition-colors text-center">
                Decompor vetores em seus componentes no plano cartesiano.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CarouselItem>
  </CarouselContent>
  
  {/* Navigation controls */}
  <CarouselPrevious 
    className={`
      -left-8 md:-left-12 
      transition-all duration-300 ease-out 
      hover:scale-110 hover:shadow-xl hover:-translate-x-1
      ${darkMode 
        ? 'bg-gray-800/90 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
        : 'bg-white/90 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
    style={{
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}
  />
  <CarouselNext 
    className={`
      -right-8 md:-right-12 
      transition-all duration-300 ease-out 
      hover:scale-110 hover:shadow-xl hover:translate-x-1
      ${darkMode 
        ? 'bg-gray-800/90 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
        : 'bg-white/90 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
    style={{
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}
  />
</Carousel>
          
          {/* Indicadores do carrossel */}
          <div className="flex justify-center mt-8 gap-3">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => handleHomeIndicatorClick(index)}
                className={`
                  transition-all duration-300 ease-out rounded-full relative overflow-hidden
                  hover:scale-125 active:scale-95
                  ${index === currentHomeIndex
                    ? `w-8 h-3 ${darkMode ? 'bg-blue-400 shadow-blue-400/60' : 'bg-blue-600 shadow-blue-600/60'} shadow-lg`
                    : `w-3 h-3 ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} hover:shadow-md`
                  }
                `}
                aria-label={`Ir para o jogo ${index + 1}`}
              >
                {/* Animação no indicador ativo */}
                <div className={`
                  absolute inset-0 rounded-full transition-all duration-300
                  ${index === currentHomeIndex
                    ? `${darkMode ? 'bg-gradient-to-r from-blue-300 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-blue-700'} animate-pulse`
                    : 'bg-transparent'
                  }
                `} />
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section 
        ref={aboutRef} 
        id="about"
        className="min-h-screen flex items-center justify-center px-4 py-16 md:p-6 transition-colors"
      >
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg transition-colors">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-gray-600 dark:text-white transition-colors"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Sobre o Projeto
          </h2>
          <p className="mb-4 text-sm md:text-base text-gray-600 dark:text-gray-300 transition-colors">
            Este projeto foi desenvolvido como parte do trabalho de Estruturas Matemáticas,
            com o objetivo de criar ferramentas interativas para ensino e aprendizagem de
            conceitos matemáticos.
          </p>
          <p className="mb-4 text-sm md:text-base text-gray-600 dark:text-gray-300 transition-colors">
            Os jogos disponíveis exploram diferentes conceitos:
          </p>
          <ul className="list-disc pl-6 mb-4 text-sm md:text-base text-gray-600 dark:text-gray-300 transition-colors">
            <li>Produto Cartesiano - Combinação de elementos de conjuntos</li>
            <li>Descubra a Função - Relação entre equações e seus gráficos</li>
            <li>Decomposição Vetorial - Operações e propriedades de vetores</li>
          </ul>
          <p 
            className="text-xl md:text-2xl mt-6 text-gray-600 dark:text-gray-300 transition-colors"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Equipe de desenvolvimento: Luiz Eduardo Varela
          </p>
        </div>
      </section>
    </div>
  )
}

export default App