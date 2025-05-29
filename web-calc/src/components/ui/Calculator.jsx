import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function Calculator({ onClose, darkMode, isMobile = false }) {
  const [display, setDisplay] = useState('0');
  const [operation, setOperation] = useState(null);
  const [prevValue, setPrevValue] = useState(null);
  const [resetDisplay, setResetDisplay] = useState(false);
  
  // Detectar teclas para cálculos
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.match(/[0-9]/) || e.key === '.') {
        handleNumber(e.key);
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        handleOperation(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [display, operation, prevValue, resetDisplay]);

  // Funções da calculadora
  const handleNumber = (num) => {
    if (display === '0' || resetDisplay) {
      setDisplay(num);
      setResetDisplay(false);
    } else {
      if (display.length < 12) {
        setDisplay(display + num);
      }
    }
  };
  
  const handleDecimal = () => {
    if (resetDisplay) {
      setDisplay('0.');
      setResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };
  
  const handleOperation = (op) => {
    const current = parseFloat(display);
    
    if (prevValue === null) {
      setPrevValue(current);
    } else if (operation) {
      const result = calculate(prevValue, current, operation);
      setPrevValue(result);
      setDisplay(String(result));
    }
    
    setOperation(op);
    setResetDisplay(true);
  };
  
  const handleEquals = () => {
    if (!operation || prevValue === null) return;
    
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operation);
    
    setDisplay(String(result));
    setPrevValue(null);
    setOperation(null);
    setResetDisplay(true);
  };
  
  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setResetDisplay(false);
  };
  
  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const calculate = (a, b, op) => {
    switch(op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 'Error';
      default: return b;
    }
  };

  // Componente de botão estilo macOS
  const CalcButton = ({ children, onClick, type = 'number', className = '', colSpan = 1, active = false }) => {
    const baseStyle = `
      h-16 rounded-full font-medium text-lg transition-all duration-150 ease-in-out
      flex items-center justify-center select-none cursor-pointer
      active:scale-95 hover:brightness-110
      ${colSpan === 2 ? 'col-span-2' : ''}
    `;
    
    let buttonStyle = '';
    
    switch(type) {
      case 'number':
        buttonStyle = darkMode 
          ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg' 
          : 'bg-gray-200 hover:bg-gray-300 text-black shadow-md';
        break;
      case 'function':
        buttonStyle = darkMode 
          ? 'bg-gray-800 hover:bg-gray-700 text-white shadow-lg' 
          : 'bg-gray-400 hover:bg-gray-500 text-white shadow-md';
        break;
      case 'operator':
        buttonStyle = active
          ? (darkMode ? 'bg-orange-200 text-black shadow-lg' : 'bg-orange-200 text-white shadow-lg')
          : (darkMode ? 'bg-orange-300 hover:bg-orange-300 text-white shadow-lg' : 'bg-orange-400 hover:bg-orange-400 text-white shadow-lg');
        break;
    }
    
    return (
      <button 
        className={`${baseStyle} ${buttonStyle} ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`
          ${isMobile ? 'w-full max-w-[340px] mx-4' : 'w-[340px]'}
          ${darkMode ? 'bg-black' : 'bg-white'}
          rounded-3xl shadow-2xl overflow-hidden
          border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
          transition-all duration-300 ease-in-out
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho estilo macOS */}
        <div className={`
          flex justify-between items-center px-6 py-4
          ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
          border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}
        `}>
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Calculadora
          </h3>
          <button 
            className={`
              w-6 h-6 flex items-center justify-center rounded-full
              ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}
              transition-colors duration-150
            `}
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Display estilo macOS */}
        <div className={`
          px-6 py-8 text-right
          ${darkMode ? 'bg-black' : 'bg-white'}
          min-h-[120px] flex flex-col justify-end
        `}>
          {/* Operação anterior */}
          <div className={`
            ${darkMode ? 'text-gray-500' : 'text-gray-400'} 
            text-sm h-6 mb-2 font-light
          `}>
            {prevValue !== null ? `${prevValue} ${operation || ''}` : ''}
          </div>
          
          {/* Display principal */}
          <div className={`
            ${darkMode ? 'text-white' : 'text-black'} 
            text-5xl font-light tracking-tight leading-none
            ${display.length > 8 ? 'text-3xl' : display.length > 6 ? 'text-4xl' : 'text-5xl'}
            transition-all duration-200 min-h-[60px] flex items-end justify-end
          `}>
            {display}
          </div>
        </div>
        
        {/* Teclado estilo macOS */}
        <div className={`
          grid grid-cols-4 gap-3 p-6
          ${darkMode ? 'bg-black' : 'bg-white'}
        `}>
          {/* Linha 1 - Funções */}
          <CalcButton 
            type="function" 
            onClick={handleClear}
          >
            AC
          </CalcButton>
          <CalcButton 
            type="function" 
            onClick={() => {
              const current = parseFloat(display);
              setDisplay(String(current * -1));
            }}
          >
            +/−
          </CalcButton>
          <CalcButton 
            type="function" 
            onClick={() => {
              const current = parseFloat(display);
              setDisplay(String(current / 100));
            }}
          >
            %
          </CalcButton>
          <CalcButton 
            type="operator" 
            onClick={() => handleOperation('/')}
            active={operation === '/'}
          >
            ÷
          </CalcButton>
          
          {/* Linha 2 */}
          <CalcButton onClick={() => handleNumber('7')}>7</CalcButton>
          <CalcButton onClick={() => handleNumber('8')}>8</CalcButton>
          <CalcButton onClick={() => handleNumber('9')}>9</CalcButton>
          <CalcButton 
            type="operator" 
            onClick={() => handleOperation('*')}
            active={operation === '*'}
          >
            ×
          </CalcButton>
          
          {/* Linha 3 */}
          <CalcButton onClick={() => handleNumber('4')}>4</CalcButton>
          <CalcButton onClick={() => handleNumber('5')}>5</CalcButton>
          <CalcButton onClick={() => handleNumber('6')}>6</CalcButton>
          <CalcButton 
            type="operator" 
            onClick={() => handleOperation('-')}
            active={operation === '-'}
          >
            −
          </CalcButton>
          
          {/* Linha 4 */}
          <CalcButton onClick={() => handleNumber('1')}>1</CalcButton>
          <CalcButton onClick={() => handleNumber('2')}>2</CalcButton>
          <CalcButton onClick={() => handleNumber('3')}>3</CalcButton>
          <CalcButton 
            type="operator" 
            onClick={() => handleOperation('+')}
            active={operation === '+'}
          >
            +
          </CalcButton>
          
          {/* Linha 5 */}
          <CalcButton 
            onClick={() => handleNumber('0')} 
            colSpan={2}
          >
            0
          </CalcButton>
          <CalcButton onClick={handleDecimal}>
            ,
          </CalcButton>
          <CalcButton 
            type="operator" 
            onClick={handleEquals}
          >
            =
          </CalcButton>
        </div>
      </div>
    </div>
  );
}

export default Calculator;