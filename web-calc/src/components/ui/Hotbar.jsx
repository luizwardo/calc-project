import React, { useState } from 'react';
import Calculator from './Calculator';

function Hotbar({ onNavigate }) {
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center p-4 bg-white-800">
        <div className='bg-gray-800 p-4 rounded-2xl shadow-md flex space-x-4 border-3 border-gray-200'>
          <button 
            className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350 tracking-wider"
            onClick={() => onNavigate('home')}
          >
            Home
          </button>
          <button 
            className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350 tracking-wider"
            onClick={() => onNavigate('cartesianGame')}
          >
            Combine os Pares
          </button>
          <button className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350 tracking-wider">
            About
          </button>
          <button 
            className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350 tracking-wider"
            onClick={() => setShowCalculator(!showCalculator)}
          >
            Calculator
          </button>
        </div>
      </div>
      
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
    </>
  );
}

export default Hotbar;