import React from 'react';

function Hotbar() {
  return (
    <div className="flex items-center justify-center gap-2 p-4 bg-gray-800 shadow-md my-2">
      <button className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350">Home</button>
      <button className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350">About</button>
      <button className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350">Services</button>
      <button className="px-4 py-2 text-white bg-gray-800 rounded shadow-sm hover:bg-gray-700 hover:scale-110 hover:shadow-md transition-all duration-350">Contact</button>
    </div>
  );
}

export default Hotbar;