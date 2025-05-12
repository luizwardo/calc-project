import { useState, useRef } from 'react'
import Hotbar from './components/ui/Hotbar'
import CartesianGame from './components/games/CartesianProd'
import FunctionGame from './components/games/FindFunction'
import './App.css'

function App() {
  // Refs para cada seção
  const homeRef = useRef(null);
  const cartesianGameRef = useRef(null);
  const functionGameRef = useRef(null);
  const aboutRef = useRef(null);
  
  // Estado para a calculadora
  const [showCalculator, setShowCalculator] = useState(false);

  // Mapeamento de seções e seus refs
  const sections = {
    home: homeRef,
    cartesianGame: cartesianGameRef,
    functionGame: functionGameRef,
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
      
      {/* Seção Home */}
      <section 
        ref={homeRef} 
        id="home"
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-6"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Estruturas Matemáticas</h1>
          <p className="text-xl mb-8">Explore diferentes conceitos e jogos matemáticos</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => scrollToSection('cartesianGame')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Produtos Cartesianos
            </button>
            <button 
              onClick={() => scrollToSection('functionGame')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Funções Matemáticas
            </button>
          </div>
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