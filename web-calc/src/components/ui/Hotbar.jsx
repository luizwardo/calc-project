import React, { useState, useRef, useEffect } from 'react';
import Calculator from './Calculator';

function Hotbar({ onNavigate, showCalculator, setShowCalculator }) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true); // Estado para controlar a visibilidade da hotbar
  const [lastScrollY, setLastScrollY] = useState(0); // Estado para rastrear a última posição do scroll
  const hotbarRef = useRef(null);

  // Button descriptions
  const buttonDescriptions = {
    home: "Página inicial",
    cartesianGame: "Combine os pares",
    functionGame: "Ache a função",
    about: "Informações",
    calculator: "Calculadora"
  };

  // Handle mouse enter/leave for entire hotbar
  const handleMouseEnter = () => {
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    setExpanded(false);
  };

  // Check if mouse is near the hotbar even before hovering
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!hotbarRef.current) return;
      
      const rect = hotbarRef.current.getBoundingClientRect();
      const isNear = 
        e.clientY < rect.bottom + 15 && 
        e.clientY > rect.top - 15 &&
        e.clientX > rect.left - 15 && 
        e.clientX < rect.right + 15;
      
      setExpanded(isNear);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Detectar a seção atual com base no scroll e controlar visibilidade da hotbar
  const [activeSection, setActiveSection] = useState('home');
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Determinar a direção do scroll
      if (scrollPosition > lastScrollY) {
        // Rolando para baixo - esconder a hotbar
        setVisible(false);
      } else if (scrollPosition < lastScrollY) {
        // Rolando para cima - mostrar a hotbar
        setVisible(true);
      }
      
      // Atualizar a última posição de scroll
      setLastScrollY(scrollPosition);
      
      // Código existente para detectar a seção ativa
      const scrollPositionWithOffset = scrollPosition + 100;
      
      // Obter todas as seções
      const sections = ['home', 'cartesianGame', 'functionGame', 'about'].map(id => {
        const element = document.getElementById(id);
        if (!element) return { id, top: 0, bottom: 0 };
        
        const rect = element.getBoundingClientRect();
        return {
          id,
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY
        };
      });
      
      // Determinar qual seção está visível
      for (const section of sections) {
        if (scrollPositionWithOffset >= section.top && scrollPositionWithOffset < section.bottom) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Verificar inicialmente
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]); // Adicionamos lastScrollY como dependência

  return (
    <>
      <div 
        ref={hotbarRef}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          expanded ? 'py-5' : 'py-2'
        } ${
          visible 
            ? 'top-0 translate-y-0' 
            : '-top-full translate-y-0'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`
          mx-auto bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg 
          transition-all duration-1000 ease-in-out
          border-2 border-gray-700/50
          flex justify-center items-center
          ${expanded ? 'max-w-4xl p-4' : 'max-w-md p-2'}
        `}>
          <div className={`
            flex gap-2 sm:gap-3 md:gap-4 items-center justify-center 
            transition-all duration-1000 ease-in-out
            ${expanded ? 'scale-100' : 'scale-85'}
          `}>
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('home')}
              icon="🏠"
              description={buttonDescriptions.home}
              isActive={activeSection === 'home'}
            />
            
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('cartesianGame')}
              icon="🔢"
              description={buttonDescriptions.cartesianGame}
              isActive={activeSection === 'cartesianGame'}
            />
            
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('functionGame')}
              icon="📈"
              description={buttonDescriptions.functionGame}
              isActive={activeSection === 'functionGame'}
            />
            
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('about')}
              icon="ℹ️"
              description={buttonDescriptions.about}
              isActive={activeSection === 'about'}
            />
            
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('calculator')}
              icon="🧮"
              description={buttonDescriptions.calculator}
            />
          </div>
        </div>
      </div>
      
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
    </>
  );
}

// Individual button component with hover effects
function HotbarButton({ expanded, onClick, icon, label, description, isActive }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative">
      <button 
        className={`
          relative text-white rounded-xl
          flex flex-col items-center justify-center
          transition-all duration-1000 ease-in-out
          ${expanded ? 'px-4 py-2' : 'p-2'}
          hover:scale-110 hover:shadow-md
          ${isActive 
            ? 'bg-blue-600/80 hover:bg-blue-700/90' 
            : 'bg-gray-800/80 hover:bg-gray-700/90'}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className={`text-lg transition-all duration-1000 ease-in-out ${expanded ? 'mb-1' : ''}`}>
          {icon}
        </span>
        
        {/* Usando opacity para uma transição suave em vez de condicional rendering */}
        <span className={`
          text-sm whitespace-nowrap overflow-hidden
          transition-all duration-1000 ease-in-out
          ${expanded ? 'opacity-100 max-h-10 mt-1' : 'opacity-0 max-h-0 mt-0'}
        `}>
          {label}
        </span>
      </button>
      
      {/* Tooltip com transição */}
      <div className={`
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
        bg-gray-900/90 backdrop-blur-sm text-white px-3 py-1 rounded text-sm whitespace-nowrap
        shadow-lg z-10 transition-all duration-500 ease-in-out pointer-events-none
        ${expanded && isHovered ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-1 invisible'}
      `}>
        {description}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                      border-8 border-transparent border-t-gray-900/90"></div>
      </div>
    </div>
  );
}

export default Hotbar;