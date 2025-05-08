import React, { useState } from 'react';
import Calculator from './Calculator';

function Hotbar() {
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <>
    <div className="flex items-center justify-center p-4 bg-white-800 ">
        <div className='bg-gray-800 p-4 rounded shadow-md flex space-x-4'>
      <button className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350 tracking-wider">Home</button>
      <button className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350 tracking-wider">About</button>
      <button className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350 tracking-wider">Services</button>
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