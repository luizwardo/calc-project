import { useState } from 'react'
import Hotbar from './components/ui/Hotbar'
import CartesianGame from './components/games/CartesianProd'
import FunctionGame from './components/games/FindFucntion'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch(currentPage) {
      case 'cartesianGame':
        return <CartesianGame onClose={() => setCurrentPage('home')} />;
        case 'functionGame':
        return <FunctionGame onClose={() => setCurrentPage('home')} />;
      default:
        return (
          <div className="flex items-center justify-center h-[80vh]">
            <h1 className="text-2xl">A3 Estruturas matemáticas</h1>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <Hotbar onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  )
}

export default App