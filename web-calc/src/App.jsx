import { useState, useRef } from 'react'
import Hotbar from './components/ui/Hotbar'
import Calculator from './components/ui/Calculator'
import CartesianGame from './components/games/CartesianProd'
import FunctionGame from './components/games/FindFunction'
import VectorGame from './components/games/VecMission'
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
  
  // Estado para a calculadora
  const [showCalculator, setShowCalculator] = useState(false);

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

  return (
    <div className="App">
      <Hotbar onNavigate={scrollToSection} showCalculator={showCalculator} setShowCalculator={setShowCalculator} />
      
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      
      {/* Seção Home */}
      <section 
        ref={homeRef} 
        id="home"
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-6"
      >
        
        {/* Carrossel com os jogos */}
        <div className="w-xl max-w-5xl">
          <h2 className="text-2xl font-semibold text-center mb-6">Nossos Jogos</h2>
          <Carousel className="w-full" opts={{ align: "center" }}>
            <CarouselContent>
              {/* Cartão do Produto Cartesiano */}
              <CarouselItem className="basis-full">
                <div 
                  onClick={() => scrollToSection('cartesianGame')}
                  className="h-[300px] bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-300 hover:border-blue-500 transition-all cursor-pointer"
                >
                  <div className="h-1/2 bg-blue-100 flex items-center justify-center">
                    <div className="text-6xl text-blue-600 font-bold">A×B</div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-blue-700 mb-2">Produto Cartesiano</h3>
                    <p className="text-gray-700">
                      Explore a combinação de conjuntos e colete os pares ordenados no plano cartesiano.
                    </p>
                  </div>
                </div>
              </CarouselItem>
              
              {/* Cartão da Função Matemática */}
              <CarouselItem className="basis-full">
                <div 
                  onClick={() => scrollToSection('functionGame')}
                  className="h-[300px] bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300 hover:border-gray-500 transition-all cursor-pointer"
                >
                  <div className="h-1/2 bg-gray-100 flex items-center justify-center">
                    <div className="text-4xl text-gray-black font-bold">f(x)=ax²+bx+c</div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-black-300 mb-2">Descubra a Função</h3>
                    <p className="text-gray-700">
                      Deduza a função matemática a partir de seu gráfico e comportamento.
                    </p>
                  </div>
                </div>
              </CarouselItem>
              
              {/* Cartão do Vetor */}
              <CarouselItem className="basis-full">
                <div 
                  onClick={() => scrollToSection('vectorGame')}
                  className="h-[300px] bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300 hover:border-gray-500 transition-all cursor-pointer"
                >
                  <div className="h-1/2 bg-gray-100 flex items-center justify-center">
                    <div className="text-4xl text-black-300 font-bold">
                      <span className="inline-block transform -translate-y-2">→</span>
                      <span className="ml-1">v = (x,y)</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-black-300 mb-2">Decomposição Vetorial</h3>
                    <p className="text-gray-700">
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
        className="min-h-screen p-6 bg-blue-50"
      >
        <CartesianGame onClose={() => scrollToSection('home')} />
      </section>
      
      {/* Seção Função Matemática */}
      <section 
        ref={functionGameRef} 
        id="functionGame"
        className="min-h-screen p-6 bg-green-50"
      >
        <FunctionGame onClose={() => scrollToSection('home')} />
      </section>
      
      {/* Seção Missão Vetorial */}
      <section 
        ref={vectorGameRef} 
        id="vectorGame"
        className="min-h-screen p-6 bg-purple-50"
      >
        <VectorGame onClose={() => scrollToSection('home')} />
      </section>
      
      {/* Seção Sobre */}
      <section 
        ref={aboutRef} 
        id="about"
        className="min-h-screen flex items-center justify-center bg-gray-100 p-6"
      >
        <div className="max-w-2xl bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Sobre o Projeto</h2>
          <p className="mb-4">
            Este projeto foi desenvolvido como parte do trabalho de Estruturas Matemáticas,
            com o objetivo de criar ferramentas interativas para ensino e aprendizagem de
            conceitos matemáticos.
          </p>
          <p className="mb-4">
            Os jogos disponíveis exploram diferentes conceitos:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Produto Cartesiano - Combinação de elementos de conjuntos</li>
            <li>Descubra a Função - Relação entre equações e seus gráficos</li>
            <li>Decomposição Vetorial - Operações e propriedades de vetores</li>
          </ul>
          <p>
            Equipe de desenvolvimento: [Seus nomes aqui]
          </p>
        </div>
      </section>
    </div>
  )
}

export default App