import React, { useState, useEffect } from 'react';

function Calculator({ onClose, isMobile = false }) {
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
      if (display.length < 12) { // Limitar o número de dígitos
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

  // Renderização
  return (
    <div 
      className={`
        fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm
        transition-all duration-300 ease-in-out
      `}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`
          ${isMobile ? 'w-full max-w-[320px] mx-4' : 'w-[350px]'}
          bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden
          border border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho da Calculadora */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-800 dark:text-gray-200">Calculadora</h3>
          <button 
            className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800"
            onClick={onClose}
          >
            <span className="text-red-600 dark:text-red-400 text-sm">✕</span>
          </button>
        </div>
        
        {/* Display */}
        <div className={`
          px-4 py-6 bg-gray-50 dark:bg-gray-900
          border-b border-gray-200 dark:border-gray-700
          text-right overflow-hidden
        `}>
          <div className="text-gray-500 dark:text-gray-400 text-sm h-4 mb-1">
            {prevValue !== null ? `${prevValue} ${operation || ''}` : ''}
          </div>
          <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            {display}
          </div>
        </div>
        
        {/* Teclado */}
        <div className="grid grid-cols-4 gap-1 p-2">
          {/* Linha 1 */}
          <button onClick={handleClear} className="col-span-2 calc-button bg-transparent dark:transparent text-red-600 dark:text-red-300">
            AC
          </button>
          <button onClick={handleDelete} className="calc-button bg-transparent dark:bg-transparent text-gray-700 dark:text-gray-300">
            DEL
          </button>
          <button onClick={() => handleOperation('/')} className="calc-button bg-transparent dark:bg-transparent text-blue-600 dark:text-blue-300">
            ÷
          </button>
          
          {/* Linha 2 */}
          <button onClick={() => handleNumber('7')} className="calc-button">7</button>
          <button onClick={() => handleNumber('8')} className="calc-button">8</button>
          <button onClick={() => handleNumber('9')} className="calc-button">9</button>
          <button onClick={() => handleOperation('*')} className="calc-button bg-transparent dark:bg-transparent text-blue-600 dark:text-blue-300">
            ×
          </button>
          
          {/* Linha 3 */}
          <button onClick={() => handleNumber('4')} className="calc-button">4</button>
          <button onClick={() => handleNumber('5')} className="calc-button">5</button>
          <button onClick={() => handleNumber('6')} className="calc-button">6</button>
          <button onClick={() => handleOperation('-')} className="calc-button bg-transparent dark:bg-transparent text-blue-600 dark:text-blue-300">
            -
          </button>
          
          {/* Linha 4 */}
          <button onClick={() => handleNumber('1')} className="calc-button">1</button>
          <button onClick={() => handleNumber('2')} className="calc-button">2</button>
          <button onClick={() => handleNumber('3')} className="calc-button">3</button>
          <button onClick={() => handleOperation('+')} className="calc-button bg-transparent dark:bg-transparent text-blue-600 dark:text-blue-300">
            +
          </button>
          
          {/* Linha 5 */}
          <button onClick={() => handleNumber('0')} className="calc-button col-span-2">0</button>
          <button onClick={handleDecimal} className="calc-button">.</button>
          <button onClick={handleEquals} className="calc-button bg-blue-500 dark:bg-blue-600 text-white">
            =
          </button>
        </div>
      </div>
    </div>
  );
}

export default Calculator;