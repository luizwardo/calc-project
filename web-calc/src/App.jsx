import { useState, useRef, useEffect } from 'react'
import Hotbar from './components/ui/Hotbar'
import Calculator from './components/ui/Calculator'
import CartesianGame from './components/games/CartesianProd'
import FunctionGame from './components/games/FindFunction'
import VectorGame from './components/games/VecMission'
import { Moon, Sun } from "lucide-react" 
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
  const cartesianGameRef = useRef(null);
  const functionGameRef = useRef(null);
  const vectorGameRef = useRef(null);
  const aboutRef = useRef(null);
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  
  // Mapeamento de seções
  const sections = {
    home: homeRef,
    cartesianGame: cartesianGameRef,
    functionGame: functionGameRef,
    vectorGame: vectorGameRef,
    about: aboutRef,
    calculator: () => setShowCalculator(true)
  };

  // Navegação suave
  const scrollToSection = (sectionId) => {
    if (sectionId === 'calculator') {
      setShowCalculator(true);
      return;
    }
    
    const sectionRef = sections[sectionId];
    if (sectionRef && sectionRef.current) {
      sectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div 
      className={`App ${darkMode ? 'dark' : ''}`}
      style={{
        backgroundImage: darkMode 
          ? `
            linear-gradient(to right, rgba(75, 85, 99, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(75, 85, 99, 0.2) 1px, transparent 1px)
          `
          : `
            linear-gradient(to right, rgba(229, 231, 235, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229, 231, 235, 0.8) 1px, transparent 1px)
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
      
      <section 
        ref={homeRef} 
        id="home"
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12 md:p-6 transition-colors"
      >
        <div className="max-w-5xl">
          <h1 
            className="text-3xl md:text-5xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200 transition-colors"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Explorando Matemática Interativa
          </h1>
          
          <h2 
            className="text-xl md:text-3xl font-semibold text-center mb-8 text-gray-700 dark:text-gray-300 transition-colors"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Nossos Jogos
          </h2>
          
          {/* Versão móvel: Cards em coluna */}
          {isMobile ? (
            <div className="flex flex-col gap-6">
              {/* Card Produto Cartesiano */}
              <div 
                onClick={() => scrollToSection('cartesianGame')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
              >
                <div className="h-24 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center transition-colors">
                  <div 
                    className="text-4xl text-blue-600 dark:text-blue-300 font-bold"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    A×B
                  </div>
                </div>
                <div className="p-4">
                  <h3 
                    className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-2 transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    Produto Cartesiano
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    Explore a combinação de conjuntos e colete os pares ordenados no plano cartesiano.
                  </p>
                </div>
              </div>
      
              {/* Card Função */}
              <div 
                onClick={() => scrollToSection('functionGame')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
              >
                <div className="h-24 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center transition-colors">
                  <div 
                    className="text-3xl text-gray-800 dark:text-gray-200 font-bold transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    f(x)=ax²+bx+c
                  </div>
                </div>
                <div className="p-4">
                  <h3 
                    className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    Descubra a Função
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    Deduza a função matemática a partir do seu gráfico e comportamento.
                  </p>
                </div>
              </div>
      
              {/* Card Vetor */}
              <div 
                onClick={() => scrollToSection('vectorGame')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
              >
                <div className="h-24 bg-gray-50 dark:bg-purple-900/30 flex items-center justify-center transition-colors">
                  <div 
                    className="text-3xl text-gray-800 dark:text-purple-200 font-bold transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    <span className="inline-block transform -translate-y-2">→</span>
                    <span className="ml-1">v = (x,y)</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 
                    className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    Decomposição Vetorial
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    Aprenda a decompor vetores em suas componentes x e y no plano cartesiano.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Versão desktop: Cards lado a lado (sem carousel) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Produto Cartesiano */}
              <div 
                onClick={() => scrollToSection('cartesianGame')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all cursor-pointer hover:shadow-md"
              >
                <div className="h-36 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center transition-colors">
                  <div 
                    className="text-5xl text-blue-600 dark:text-blue-300 font-bold"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    A×B
                  </div>
                </div>
                <div className="p-4">
                  <h3 
                    className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2 transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    Produto Cartesiano
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 transition-colors">
                    Explore a combinação de conjuntos e colete os pares ordenados no plano cartesiano.
                  </p>
                </div>
              </div>
              
              {/* Card Função */}
              <div 
                onClick={() => scrollToSection('functionGame')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all cursor-pointer hover:shadow-md"
              >
                <div className="h-36 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center transition-colors">
                  <div 
                    className="text-3xl text-gray-800 dark:text-gray-200 font-bold transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    f(x)=ax²+bx+c
                  </div>
                </div>
                <div className="p-4">
                  <h3 
                    className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    Descubra a Função
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 transition-colors">
                    Deduza a função matemática a partir do seu gráfico e comportamento.
                  </p>
                </div>
              </div>
              
              {/* Card Vetor */}
              <div 
                onClick={() => scrollToSection('vectorGame')}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all cursor-pointer hover:shadow-md"
              >
                <div className="h-36 bg-gray-50 dark:bg-purple-900/30 flex items-center justify-center transition-colors">
                  <div 
                    className="text-3xl text-gray-800 dark:text-purple-200 font-bold transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    <span className="inline-block transform -translate-y-2">→</span>
                    <span className="ml-1">v = (x,y)</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 
                    className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors"
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                  >
                    Decomposição Vetorial
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 transition-colors">
                    Aprenda a decompor vetores em suas componentes x e y no plano cartesiano.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Seções de jogos com padding adequado para mobile */}
      <section
        ref={cartesianGameRef}
        id="cartesianGame"
        className="min-h-screen px-2 py-16 md:p-6 transition-colors"
      >
        <CartesianGame onClose={() => scrollToSection('home')} darkMode={darkMode} isMobile={isMobile} />
      </section>
      
      <section 
        ref={functionGameRef} 
        id="functionGame"
        className="min-h-screen px-2 py-16 md:p-6 transition-colors"
      >
        <FunctionGame onClose={() => scrollToSection('home')} darkMode={darkMode} isMobile={isMobile} />
      </section>
      
      <section 
        ref={vectorGameRef} 
        id="vectorGame"
        className="min-h-screen px-2 py-16 md:p-6 transition-colors"
      >
        <VectorGame onClose={() => scrollToSection('home')} darkMode={darkMode} isMobile={isMobile} />
      </section>
      
      {/* Seção Sobre adaptável */}
      <section 
        ref={aboutRef} 
        id="about"
        className="min-h-screen flex items-center justify-center px-4 py-16 md:p-6 transition-colors"
      >
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg transition-colors">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6 dark:text-white transition-colors"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Sobre o Projeto
          </h2>
          <p className="mb-4 text-sm md:text-base text-gray-700 dark:text-gray-300 transition-colors">
            Este projeto foi desenvolvido como parte do trabalho de Estruturas Matemáticas,
            com o objetivo de criar ferramentas interativas para ensino e aprendizagem de
            conceitos matemáticos.
          </p>
          <p className="mb-4 text-sm md:text-base text-gray-700 dark:text-gray-300 transition-colors">
            Os jogos disponíveis exploram diferentes conceitos:
          </p>
          <ul className="list-disc pl-6 mb-4 text-sm md:text-base text-gray-700 dark:text-gray-300 transition-colors">
            <li>Produto Cartesiano - Combinação de elementos de conjuntos</li>
            <li>Descubra a Função - Relação entre equações e seus gráficos</li>
            <li>Decomposição Vetorial - Operações e propriedades de vetores</li>
          </ul>
          <p 
            className="text-xl md:text-2xl mt-6 text-gray-700 dark:text-gray-300 transition-colors"
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