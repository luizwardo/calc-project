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

function App() {
  // Refs para cada seção
  const homeRef = useRef(null);
  const cartesianGameRef = useRef(null);
  const functionGameRef = useRef(null);
  const vectorGameRef = useRef(null);
  const aboutRef = useRef(null);
  
  // Estados
  const [showCalculator, setShowCalculator] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Estado para o tema

  // Aplicar a classe dark na tag html quando darkMode for true
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Remover elementos de debugging que podem estar sendo injetados
    const removeDebugElements = () => {
      const debugButtons = document.querySelectorAll('.debug-button, .close-button');
      debugButtons.forEach(button => {
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });
    };
    
    // Executar após o DOM ser atualizado
    setTimeout(removeDebugElements, 100);
    
  }, [darkMode]);
  
  // Mapeamento de seções e seus refs
  const sections = {
    home: homeRef,
    cartesianGame: cartesianGameRef,
    functionGame: functionGameRef,
    vectorGame: vectorGameRef,
    about: aboutRef,
    calculator: () => setShowCalculator(true)
  };

  // Função para navegação por scroll
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

  // Toggle do tema
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div 
      className={`App ${darkMode ? 'dark' : ''}`}
      style={{
        backgroundImage: darkMode 
          ? `
            linear-gradient(to right, #696969 0.1px, transparent 1px),
            linear-gradient(to bottom, #696969 0.1px, transparent 1px)
          `
          : `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
        backgroundSize: '20px 20px'
      }}
    >
      <Hotbar 
        onNavigate={scrollToSection} 
        showCalculator={showCalculator} 
        setShowCalculator={setShowCalculator}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />
      
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} darkMode={darkMode} />}
      
      {/* Botão Toggle Theme (versão flutuante) */}
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
      
      {/* Seção Home */}
      <section 
        ref={homeRef} 
        id="home"
        className="min-h-screen flex flex-col items-center justify-center  p-6 transition-colors"
      >
        
        {/* Carrossel com os jogos */}
        <div className="w-xl max-w-5xl">
          <h2 className="text-2xl font-semibold text-center mb-6 dark:text-white transition-colors">Nossos Jogos</h2>
          <Carousel className="w-full" opts={{ align: "center" }}>
            <CarouselContent>
              {/* Cartão do Produto Cartesiano */}
              <CarouselItem className="basis-full">
                <div 
                  onClick={() => scrollToSection('cartesianGame')}
                  className="h-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-blue-300 hover:border-blue-500 dark:border-blue-600 dark:hover:border-blue-400 transition-all cursor-pointer"
                >
                  <div className="h-1/2 bg-blue-100 dark:bg-blue-900 flex items-center justify-center transition-colors">
                    <div className="text-6xl text-blue-600 dark:text-blue-300 font-bold">A×B</div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2 transition-colors">Produto Cartesiano</h3>
                    <p className="text-gray-700 dark:text-gray-300 transition-colors">
                      Explore a combinação de conjuntos e colete os pares ordenados no plano cartesiano.
                    </p>
                  </div>
                </div>
              </CarouselItem>
              
              {/* Cartão da Função Matemática */}
              <CarouselItem className="basis-full">
                <div 
                  onClick={() => scrollToSection('functionGame')}
                  className="h-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-gray-300 hover:border-gray-500 dark:border-gray-600 dark:hover:border-gray-400 transition-all cursor-pointer"
                >
                  <div className="h-1/2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-colors">
                    <div className="text-4xl text-gray-800 dark:text-gray-200 font-bold transition-colors">f(x)=ax²+bx+c</div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors">Descubra a Função</h3>
                    <p className="text-gray-700 dark:text-gray-300 transition-colors">
                      Deduza a função matemática a partir de seu gráfico e comportamento.
                    </p>
                  </div>
                </div>
              </CarouselItem>
              
              {/* Cartão do Vetor */}
              <CarouselItem className="basis-full">
                <div 
                  onClick={() => scrollToSection('vectorGame')}
                  className="h-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-gray-300 hover:border-gray-500 dark:border-purple-700 dark:hover:border-purple-500 transition-all cursor-pointer"
                >
                  <div className="h-1/2 bg-gray-100 dark:bg-purple-900 flex items-center justify-center transition-colors">
                    <div className="text-4xl text-gray-800 dark:text-purple-200 font-bold transition-colors">
                      <span className="inline-block transform -translate-y-2">→</span>
                      <span className="ml-1">v = (x,y)</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors">Decomposição Vetorial</h3>
                    <p className="text-gray-700 dark:text-gray-300 transition-colors">
                      Aprenda a decompor vetores em suas componentes x e y no plano cartesiano.
                    </p>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>     
      </section>
      
      {/* Seção Produto Cartesiano */}
      <section 
        ref={cartesianGameRef} 
        id="cartesianGame"
        className="min-h-screen p-6 transition-colors"
      >
        <CartesianGame onClose={() => scrollToSection('home')} darkMode={darkMode} />
      </section>
      
      {/* Seção Função Matemática */}
      <section 
        ref={functionGameRef} 
        id="functionGame"
        className="min-h-screen p-6 transition-colors"
      >
        <FunctionGame onClose={() => scrollToSection('home')} darkMode={darkMode} />
      </section>
      
      {/* Seção Missão Vetorial */}
      <section 
        ref={vectorGameRef} 
        id="vectorGame"
        className="min-h-screen p-6transition-colors"
      >
        <VectorGame onClose={() => scrollToSection('home')} darkMode={darkMode} />
      </section>
      
      {/* Seção Sobre */}
      <section 
        ref={aboutRef} 
        id="about"
        className="min-h-screen flex items-center justify-center p-6 transition-colors"
      >
        <div className="max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg transition-colors">
          <h2 className="text-3xl font-bold mb-4 dark:text-white transition-colors">Sobre o Projeto</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300 transition-colors">
            Este projeto foi desenvolvido como parte do trabalho de Estruturas Matemáticas,
            com o objetivo de criar ferramentas interativas para ensino e aprendizagem de
            conceitos matemáticos.
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-300 transition-colors">
            Os jogos disponíveis exploram diferentes conceitos:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 transition-colors">
            <li>Produto Cartesiano - Combinação de elementos de conjuntos</li>
            <li>Descubra a Função - Relação entre equações e seus gráficos</li>
            <li>Decomposição Vetorial - Operações e propriedades de vetores</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 transition-colors">
            Equipe de desenvolvimento: [Seus nomes aqui]
          </p>
        </div>
      </section>
    </div>
  )
}

export default App