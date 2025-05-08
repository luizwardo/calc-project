import React, { useState, useRef, useEffect } from 'react';

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [calculated, setCalculated] = useState(false);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const initialPositionRef = useRef({ x: 0, y: 0 });

  const handleNumber = (num) => {
    if (display === '0' || calculated) {
      setDisplay(num);
      setCalculated(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op) => {
    setEquation(display + op);
    setDisplay('0');
    setCalculated(false);
  };

  const handleEqual = () => {
    try {
      // Using Function constructor to safely evaluate the expression
      const result = new Function('return ' + equation + display)();
      setDisplay(String(result));
      setEquation('');
      setCalculated(true);
    } catch (error) {
      setDisplay('Error');
      setCalculated(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  // Dragging functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.calculator-header')) {
      setIsDragging(true);
      initialPositionRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - initialPositionRef.current.x,
        y: e.clientY - initialPositionRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={dragRef}
      className="fixed z-50"
      style={{ 
        left: `calc(50% + ${position.x}px)`, 
        top: `calc(50% + ${position.y}px)`,
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <div className="bg-gray-900 p-4 rounded-lg shadow-2xl w-64 select-none">
        {/* Added draggable header */}
        <div 
          className="calculator-header bg-gray-700 p-1 mb-2 rounded cursor-grab flex justify-between items-center"
          onMouseDown={handleMouseDown}
        >
        
          <div className="flex gap-1 pr-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-2 mb-4 rounded">
          <div className="text-gray-400 text-xs h-4">{equation}</div>
          <div className="text-white text-right text-2xl font-mono">{display}</div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <button onClick={handleClear} className="col-span-2 bg-gray-700 text-white p-3 rounded hover:bg-gray-600">C</button>
          <button onClick={() => handleOperator('/')} className="bg-gray-700 text-white p-3 rounded hover:bg-gray-600">/</button>
          <button onClick={() => handleOperator('*')} className="bg-gray-700 text-white p-3 rounded hover:bg-gray-600">×</button>
          
          <button onClick={() => handleNumber('7')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">7</button>
          <button onClick={() => handleNumber('8')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">8</button>
          <button onClick={() => handleNumber('9')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">9</button>
          <button onClick={() => handleOperator('-')} className="bg-gray-700 text-white p-3 rounded hover:bg-gray-600">-</button>
          
          <button onClick={() => handleNumber('4')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">4</button>
          <button onClick={() => handleNumber('5')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">5</button>
          <button onClick={() => handleNumber('6')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">6</button>
          <button onClick={() => handleOperator('+')} className="bg-gray-700 text-white p-3 rounded hover:bg-gray-600">+</button>
          
          <button onClick={() => handleNumber('1')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">1</button>
          <button onClick={() => handleNumber('2')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">2</button>
          <button onClick={() => handleNumber('3')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">3</button>
          <button onClick={handleEqual} className="bg-blue-600 text-white p-3 rounded hover:bg-blue-500 row-span-2">=</button>
          
          <button onClick={() => handleNumber('0')} className="col-span-2 bg-gray-800 text-white p-3 rounded hover:bg-gray-700">0</button>
          <button onClick={() => handleNumber('.')} className="bg-gray-800 text-white p-3 rounded hover:bg-gray-700">.</button>
        </div>
      </div>
    </div>
  );
}

export default Calculator;