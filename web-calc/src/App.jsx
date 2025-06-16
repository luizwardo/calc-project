import { useState, useRef, useEffect, useCallback } from 'react'
import Hotbar from './components/ui/Hotbar'
import Calculator from './components/ui/Calculator'
import CartesianGame from './components/games/CartesianProd'
import FunctionGame from './components/games/FindFunction'
import VectorGame from './components/games/VecMission'
import SetTheoryGame from './components/games/SetTheoryGame'
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
  
  html {
    scroll-behavior: smooth;
  }
  
  * {
    scroll-behavior: smooth;
  }
`;

function App() {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const materiasRef = useRef(null);
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentHomeIndex, setCurrentHomeIndex] = useState(0);
  const [homeCarouselApi, setHomeCarouselApi] = useState();

  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [showMaterialSidebar, setShowMaterialSidebar] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

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
    },
    {
      id: 'setTheoryGame',
      component: SetTheoryGame,
      title: 'Teoria dos Conjuntos'
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

    if (sectionId === 'materias') {
      materiasRef.current?.scrollIntoView({ 
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

  // PDF files configuration - now with content instead of paths
  const studyMaterials = [
    {
      id: 'conjuntos',
      title: '📚 Teoria dos Conjuntos',
      description: 'Conceitos fundamentais sobre conjuntos, operações e produto cartesiano.',
      topics: ['• Definição de conjuntos', '• Operações entre conjuntos', '• Produto cartesiano'],
      content: {
        sections: [
          {
            title: 'Definição de Conjuntos',
            content: `Um conjunto é uma coleção bem definida de objetos distintos, chamados elementos ou membros do conjunto. Os conjuntos são representados por letras maiúsculas (A, B, C, ...) e seus elementos são listados entre chaves.

Exemplos:
• A = {1, 2, 3, 4, 5}
• B = {a, e, i, o, u}
• C = {x | x é um número par}`
          },
          {
            title: 'Operações entre Conjuntos',
            content: `As principais operações entre conjuntos são:

União (A ∪ B): Conjunto formado por todos os elementos que pertencem a A ou a B.

Interseção (A ∩ B): Conjunto formado por todos os elementos que pertencem a A e a B.

Diferença (A - B): Conjunto formado por todos os elementos que pertencem a A mas não pertencem a B.

Complementar (A'): Conjunto formado por todos os elementos que não pertencem a A.`
          },
          {
            title: 'Produto Cartesiano',
            content: `O produto cartesiano de dois conjuntos A e B, denotado por A × B, é o conjunto de todos os pares ordenados (a, b) onde a ∈ A e b ∈ B.

Exemplo:
Se A = {1, 2} e B = {x, y}, então:
A × B = {(1,x), (1,y), (2,x), (2,y)}

O número de elementos em A × B é |A| × |B|.`
          }
        ]
      }
    },
    {
      id: 'funcoes',
      title: '📈 Funções Matemáticas',
      description: 'Estudo completo sobre funções lineares, quadráticas e trigonométricas.',
      topics: ['• Funções lineares', '• Funções quadráticas', '• Funções trigonométricas'],
      content: {
        sections: [
          {
            title: 'Funções Lineares',
            content: `Uma função linear tem a forma f(x) = ax + b, onde a e b são constantes reais e a ≠ 0.

Características:
• Gráfico: linha reta
• Coeficiente angular: a
• Coeficiente linear: b
• Crescente se a > 0, decrescente se a < 0

Exemplo: f(x) = 2x + 3`
          },
          {
            title: 'Funções Quadráticas',
            content: `Uma função quadrática tem a forma f(x) = ax² + bx + c, onde a, b e c são constantes reais e a ≠ 0.

Características:
• Gráfico: parábola
• Vértice: V(-b/2a, -Δ/4a)
• Discriminante: Δ = b² - 4ac
• Concavidade: para cima se a > 0, para baixo se a < 0

Exemplo: f(x) = x² - 4x + 3`
          },
          {
            title: 'Funções Trigonométricas',
            content: `As principais funções trigonométricas são seno, cosseno e tangente.

Função Seno: f(x) = sen(x)
• Domínio: ℝ
• Imagem: [-1, 1]
• Período: 2π

Função Cosseno: f(x) = cos(x)
• Domínio: ℝ
• Imagem: [-1, 1]
• Período: 2π

Função Tangente: f(x) = tg(x)
• Domínio: ℝ - {π/2 + kπ, k ∈ ℤ}
• Imagem: ℝ
• Período: π`
          }
        ]
      }
    },
    {
      id: 'vetores',
      title: '🧭 Álgebra Vetorial',
      description: 'Conceitos de vetores, operações vetoriais e decomposição.',
      topics: ['• Definição de vetores', '• Operações vetoriais', '• Decomposição vetorial'],
      content: {
        sections: [
          {
            title: 'Definição de Vetores',
            content: `Um vetor é uma grandeza que possui módulo (tamanho), direção e sentido. É representado geometricamente por uma seta.

Notação:
• Vetor: v⃗ ou |v|
• Componentes: v⃗ = (x, y) no plano
• Módulo: |v⃗| = √(x² + y²)

Exemplo: v⃗ = (3, 4) tem módulo |v⃗| = √(3² + 4²) = 5`
          },
          {
            title: 'Operações Vetoriais',
            content: `Principais operações com vetores:

Adição: u⃗ + v⃗ = (u₁ + v₁, u₂ + v₂)

Subtração: u⃗ - v⃗ = (u₁ - v₁, u₂ - v₂)

Multiplicação por escalar: k·v⃗ = (k·v₁, k·v₂)

Produto escalar: u⃗ · v⃗ = u₁v₁ + u₂v₂

Produto vetorial (3D): u⃗ × v⃗`
          },
          {
            title: 'Decomposição Vetorial',
            content: `A decomposição vetorial consiste em expressar um vetor como soma de suas componentes.

No plano cartesiano:
v⃗ = vₓî + vyĵ

Onde:
• vₓ = |v⃗|cos(θ) (componente horizontal)
• vy = |v⃗|sen(θ) (componente vertical)
• î e ĵ são os vetores unitários

Exemplo: Se v⃗ tem módulo 5 e faz ângulo de 37° com o eixo x:
vₓ = 5·cos(37°) = 4
vy = 5·sen(37°) = 3
Então v⃗ = (4, 3)`
          }
        ]
      }
    }
  ];

  // Function to open material sidebar
  const openMaterial = (material) => {
    setSelectedMaterial(material);
    setShowMaterialSidebar(true);
    document.body.style.overflow = 'hidden';
  };

  // Function to close material sidebar
  const closeMaterialSidebar = () => {
    setShowMaterialSidebar(false);
    setSelectedMaterial(null);
    document.body.style.overflow = 'unset';
  };

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showMaterialSidebar) {
        closeMaterialSidebar();
      }
    };

    if (showMaterialSidebar) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMaterialSidebar]);

  return (
    <div 
      className={`App ${darkMode ? 'dark' : ''} min-h-screen w-full`}
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
        backgroundSize: '20px 20px',
        scrollBehavior: 'smooth',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Incluir estilos da fonte */}
      <style>{fontStyles}</style>
      
      {/* Add body background fix */}
      <style>{`
        body {
          background-color: ${darkMode ? '#1f2937' : 'rgba(227, 228, 233, 0.8)'} !important;
          background-image: ${darkMode 
            ? `
              linear-gradient(to right, rgba(75, 85, 99, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(75, 85, 99, 0.2) 1px, transparent 1px)
            `
            : `
              linear-gradient(to right, rgba(211, 213, 218, 0.8) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(211, 213, 218, 0.8) 1px, transparent 1px)
            `} !important;
          background-size: 20px 20px !important;
          background-attachment: fixed !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          overflow-x: hidden !important;
        }
        
        html {
          background-color: ${darkMode ? '#1f2937' : 'rgba(227, 228, 233, 0.8)'} !important;
          width: 100% !important;
          overflow-x: hidden !important;
        }
        
        #root {
          width: 100% !important;
          min-height: 100vh !important;
        }
      `}</style>

      <Hotbar 
        onNavigate={scrollToSection} 
        showCalculator={showCalculator} 
        setShowCalculator={setShowCalculator}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        isMobile={isMobile}
      />
      
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} darkMode={darkMode} />}
      
      {/* Material Sidebar */}
      {showMaterialSidebar && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/50 transition-opacity"
            onClick={closeMaterialSidebar}
          />
          
          {/* Sidebar Content */}
          <div 
            className={`
              w-full max-w-2xl h-full overflow-auto
              shadow-2xl transform transition-all
              border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            `}
            style={{
              backgroundColor: darkMode ? '#1f2937' : 'rgba(227, 228, 233, 0.95)',
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
            {/* Header */}
            <div className={`
              sticky top-0 z-10 p-6 border-b backdrop-blur-sm
              ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            `}
            style={{
              backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(227, 228, 233, 0.95)',
              backdropFilter: 'blur(8px)'
            }}
            >
              <div className="flex items-center justify-between">
                <h2 
                  className="text-2xl font-bold text-gray-600 dark:text-gray-200"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  {selectedMaterial.title}
                </h2>
                <button
                  onClick={closeMaterialSidebar}
                  className={`
                    p-2 rounded-full transition-colors hover:scale-110
                    ${darkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                    }
                  `}
                  aria-label="Fechar material"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {selectedMaterial.description}
              </p>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-8">
              {selectedMaterial.content.sections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h3 
                    className="text-xl font-semibold text-gray-700 dark:text-gray-200"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    {section.title}
                  </h3>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {section.content.split('\n').map((paragraph, pIndex) => (
                      paragraph.trim() && (
                        <p 
                          key={pIndex} 
                          className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-line"
                        >
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {/* Home and Materias Sections - Side by Side */}
      <section 
        ref={homeRef} 
        id="home"
        className="min-h-screen flex items-center justify-center px-4 py-12 md:p-6 transition-colors w-full"
      >
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Home Section - Left Side */}
          <div className="max-w-sm flex flex-col justify-center">
            <h1 
              className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-600 dark:text-gray-200 transition-colors"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Matemática Interativa
            </h1>
            
            <h2 
              className="text-xl md:text-2xl font-semibold text-center mb-8 text-gray-600 dark:text-gray-300 transition-colors"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Nossos Jogos
            </h2>
            
            {/* Cards em carrossel */}
            <Carousel 
              className="relative px-4"
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
              <CarouselContent className="-ml-4 py-8">
                {/* Card Produto Cartesiano */}
                <CarouselItem className="pl-4 basis-full">
                  <div className="flex justify-center px-4">
                    <div className="w-full max-w-sm">
                      <div 
                        onClick={() => openGameModal('cartesianGame')}
                        className={`
                          bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden 
                          border border-gray-200 dark:border-gray-700 transition-all 
                          cursor-pointer hover:shadow-lg hover:scale-105 duration-300 h-full
                          transform-gpu
                        `}
                      >
                        <div className="h-32 md:h-40 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center transition-colors">
                          <div 
                            className="text-4xl md:text-5xl text-gray-600 dark:text-gray-200 font-bold"
                            style={{ fontFamily: "'Dancing Script', cursive" }}
                          >
                            X×Y
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 
                            className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-200 mb-3 transition-colors text-center"
                            style={{ fontFamily: "'Dancing Script', cursive" }}
                          >
                            Corrida Cartesiana
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
                  <div className="flex justify-center px-4">
                    <div className="w-full max-w-sm">
                      <div 
                        onClick={() => openGameModal('functionGame')}
                        className={`
                          bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden 
                          border border-gray-200 dark:border-gray-700 transition-all 
                          cursor-pointer hover:shadow-lg hover:scale-105 duration-300 h-full
                          transform-gpu
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
                            Memória Matemática
                          </h3>
                          <p className="text-base text-gray-600 dark:text-gray-300 transition-colors text-center">
                             Ache os pares entre gráficos e expressões 
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                
                {/* Card Vetor */}
                <CarouselItem className="pl-4 basis-full">
                  <div className="flex justify-center px-4">
                    <div className="w-full max-w-sm">
                      <div 
                        onClick={() => openGameModal('vectorGame')}
                        className={`
                          bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden 
                          border border-gray-200 dark:border-gray-700 transition-all 
                          cursor-pointer hover:shadow-lg hover:scale-105 duration-300 h-full
                          transform-gpu
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
                            Caça ao Vetor
                          </h3>
                          <p className="text-base text-gray-600 dark:text-gray-300 transition-colors text-center">
                            Decompor vetores em seus componentes no plano cartesiano.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                
                {/* Card Teoria dos Conjuntos */}
                <CarouselItem className="pl-4 basis-full">
                  <div className="flex justify-center px-4">
                    <div className="w-full max-w-sm">
                      <div 
                        onClick={() => openGameModal('setTheoryGame')}
                        className={`
                          bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden 
                          border border-gray-200 dark:border-gray-700 transition-all 
                          cursor-pointer hover:shadow-lg hover:scale-105 duration-300 h-full
                          transform-gpu
                        `}
                      >
                        <div className="h-32 md:h-40 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center transition-colors">
                          <div 
                            className="text-2xl md:text-3xl text-gray-600 dark:text-gray-200 font-bold transition-colors"
                            style={{ fontFamily: "'Dancing Script', cursive" }}
                          >
                            A ∪ B ∩ C
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 
                            className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-200 mb-3 transition-colors text-center"
                            style={{ fontFamily: "'Dancing Script', cursive" }}
                          >
                            Desafio dos Conjuntos
                          </h3>
                          <p className="text-base text-gray-600 dark:text-gray-300 transition-colors text-center">
                            Explore operações entre conjuntos e suas propriedades.
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
                  -left-12 md:-left-16 
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
                  -right-12 md:-right-16 
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
              {[0, 1, 2, 3].map((index) => (
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

          {/* Materias Section - Right Side */}
          <div ref={materiasRef} id="materias" className="flex flex-col justify-center">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-600 dark:text-gray-200 transition-colors"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Materiais de Estudo
            </h2>
            
            <div className="space-y-6">
              {studyMaterials.map((material) => (
                <div 
                  key={material.id}
                  onClick={() => openMaterial(material)}
                  className={`
                    bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden 
                    border border-gray-200 dark:border-gray-700 transition-all 
                    hover:shadow-lg hover:scale-105 duration-300 cursor-pointer
                    transform-gpu
                  `}
                >
                  <div className="p-6">
                    <h3 
                      className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-200 mb-3 transition-colors"
                      style={{ fontFamily: "'Dancing Script', cursive" }}
                    >
                      {material.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 transition-colors mb-4">
                      {material.description}
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {material.topics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section 
        ref={aboutRef} 
        id="about"
        className="min-h-screen flex items-center justify-center px-4 py-16 md:p-6 transition-colors w-full"
      >
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Project Info - Left Column */}
          <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg transition-colors">
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
              <li>Corrida Cartesiana - Combinação de elementos de conjuntos</li>
              <li>Memória Matemática - Relação entre equações e seus gráficos</li>
              <li>Caça Ao Vetor - Operações e propriedades de vetores</li>
              <li>Desafio dos Conjuntos - Operações e classificação de elementos</li>
            </ul>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 transition-colors">
              Cada jogo foi projetado para proporcionar uma experiência de aprendizado 
              envolvente e interativa, permitindo aos usuários explorar conceitos matemáticos 
              de forma prática e visual.
            </p>

            

              <div className="my-10 p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  🛠️ Tecnologias
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  React, Vite, JSX, Tailwind CSS, Lucide Icons
                </p>
              </div>

          </div>

          {/* Participants - Right Column */}
          <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg transition-colors">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6 text-gray-600 dark:text-white transition-colors"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Participantes
            </h2>
            
            <div className="space-y-6">
              {/* Participant 1 */}
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  J
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    João Vitor da Silva Araújo
                  </h3>
                  
                </div>
              </div>

              {/* Participant 2 */}
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  J
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Juan
                  </h3>
                  
                </div>
              </div>

              {/* Participant 3 */}
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  L
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Luiz Eduardo Varela
                  </h3>
                  
                </div>
              </div>

              {/* Participant 4 */}
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  G
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Gustavo Maykot
                  </h3>
                  
                </div>
              </div>

              {/* Participant 5 */}
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  T
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Thiago Marchi
                  </h3>
                  
                </div>
              </div>
             
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App