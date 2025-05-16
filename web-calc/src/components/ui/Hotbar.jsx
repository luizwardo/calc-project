import React, { useState, useRef, useEffect } from 'react';
import Calculator from './Calculator';

function Hotbar({ onNavigate, showCalculator, setShowCalculator, darkMode, toggleTheme }) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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
        e.clientX < rect.right + 15 && 
        e.clientX > rect.left - 15 &&
        e.clientY > rect.top - 15 && 
        e.clientY < rect.bottom + 15;
      
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
      if (scrollPosition > lastScrollY + 100) {
        // Rolando para baixo - esconder a hotbar
        setVisible(false);
      } else if (scrollPosition < lastScrollY - 20) {
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
  }, [lastScrollY]);

  return (
    <>
      <div 
        ref={hotbarRef}
        className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out ${
          expanded ? 'px-3' : 'px-2'
        } ${
          visible 
            ? 'left-0 translate-x-0' 
            : '-left-20 translate-x-0'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`
          bg-black/40 backdrop-blur-md rounded-r-2xl shadow-lg 
          transition-all duration-300 ease-in-out
          border border-gray-500/20
          flex flex-col justify-center items-center
          ${expanded ? 'py-4 px-3' : 'py-3 px-2'}
        `}>
          <div className={`
            flex flex-col gap-4 items-center justify-center
            transition-all duration-300 ease-in-out
            ${expanded ? 'scale-100' : 'scale-90'}
          `}>
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('home')}
              icon="🏠"
              description={buttonDescriptions.home}
              isActive={activeSection === 'home'}
              darkMode={darkMode}
            />
            
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('cartesianGame')}
              icon="🔢"
              description={buttonDescriptions.cartesianGame}
              isActive={activeSection === 'cartesianGame'}
              darkMode={darkMode}
            />
            
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('functionGame')}
              icon="📈"
              description={buttonDescriptions.functionGame}
              isActive={activeSection === 'functionGame'}
              darkMode={darkMode}
            />
            
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('about')}
              icon="ℹ️"
              description={buttonDescriptions.about}
              isActive={activeSection === 'about'}
              darkMode={darkMode}
            />
            
            <HotbarButton 
              expanded={expanded}
              onClick={() => onNavigate('calculator')}
              icon="🧮"
              description={buttonDescriptions.calculator}
              darkMode={darkMode}
            />
            
            {toggleTheme && (
              <HotbarButton 
                expanded={expanded}
                onClick={toggleTheme}
                icon={darkMode ? "☀️" : "🌙"}
                description={darkMode ? "Modo claro" : "Modo escuro"}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      </div>
      
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
    </>
  );
}

// Individual button component with hover effects
function HotbarButton({ expanded, onClick, icon, description, isActive, darkMode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimer = useRef(null);
  
  // Gerenciamento do delay para mostrar o tooltip
  useEffect(() => {
    if (isHovered) {
      // Configurar um delay de 500ms (0.5s) antes de mostrar o tooltip
      hoverTimer.current = setTimeout(() => {
        setShowTooltip(true);
      }, 500);
    } else {
      // Limpar o timeout e esconder o tooltip imediatamente quando o mouse sair
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
      }
      setShowTooltip(false);
    }
    
    // Cleanup ao desmontar o componente
    return () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, [isHovered]);
  
  return (
    <div className="relative">
      <button 
        className={`
          relative text-white rounded-xl
          flex items-center justify-center bg-transparent
          transition-all duration-300 ease-in-out
          p-2.5
          hover:scale-110 hover:shadow-md
          ${isActive 
            ? 'bg-blue-800/80 hover:bg-blue-700/70'
            : 'bg-gray-800/80 hover:bg-gray-700/70'}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="text-lg">
          {icon}
        </span>
      </button>
      
      {/* Tooltip ao lado do botão */}
      <div className={`
        absolute left-full top-1/2 -translate-y-1/2 ml-2
        ${darkMode 
          ? 'bg-gray-800/90 text-gray-100' 
          : 'bg-white/90 text-gray-800'} 
        backdrop-blur-sm px-3 py-1.5 rounded text-sm whitespace-nowrap
        shadow-lg z-10 transition-all duration-200 ease-in-out pointer-events-none
        border ${darkMode ? 'border-gray-700/50' : 'border-gray-300/50'}
        ${showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-1 invisible'}
      `}>
        {description}
        <div className={`
          absolute right-full top-1/2 -translate-y-1/2
          border-8 border-transparent 
          ${darkMode 
            ? 'border-r-gray-800/90' 
            : 'border-r-white/90'}
        `}></div>
      </div>
    </div>
  );
}

export default Hotbar;