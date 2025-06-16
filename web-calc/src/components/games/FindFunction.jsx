import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FunctionSquare, RotateCcw, Trophy } from 'lucide-react';

// Função para gerar pontos x,y para um gráfico
const generatePoints = (func, min, max, steps) => {
  const x = [];
  const y = [];
  const step = (max - min) / steps;
  
  for (let i = 0; i <= steps; i++) {
    const xVal = min + i * step;
    const yVal = func(xVal);
    
    if (isFinite(yVal)) {
      x.push(xVal);
      y.push(yVal);
    }
  }
  
  return { x, y };
};

// Lista estática de funções para o jogo da memória
const functions = [
  { id: 1, expression: "f(x) = sin(x)", plot: x => Math.sin(x) },
  { id: 2, expression: "f(x) = x²", plot: x => x * x },
  { id: 3, expression: "f(x) = cos(x)", plot: x => Math.cos(x) },
  { id: 4, expression: "f(x) = 2x", plot: x => 2 * x },
  { id: 5, expression: "f(x) = x³", plot: x => x * x * x },
  { id: 6, expression: "f(x) = e^x", plot: x => Math.exp(x) },
  { id: 7, expression: "f(x) = log(x)", plot: x => x > 0 ? Math.log(x) : NaN },
  { id: 8, expression: "f(x) = √x", plot: x => x >= 0 ? Math.sqrt(x) : NaN }
];

// Componente Card
const Card = ({ card, isFlipped, onClick, darkMode }) => {
  return (
    <div
      className={`
        relative w-full aspect-square cursor-pointer transition-all duration-700 ease-in-out
        ${card.isMatched ? 'opacity-75' : 'hover:scale-105'}
      `}
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
      onClick={() => !isFlipped && !card.isMatched && onClick(card)}
    >
      {/* Card Inner Container */}
      <div
        className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Card Back */}
        <div
          className={`
            absolute inset-0 w-full h-full rounded-lg border-2 flex items-center justify-center
            ${darkMode 
              ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 border-gray-500/30 shadow-lg shadow-gray-900/50' 
              : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 border-gray-400/40 shadow-lg shadow-gray-600/30'
            }
          `}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <FunctionSquare className={`h-8 w-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </div>

        {/* Card Front */}
        <div
          className={`
            absolute inset-0 w-full h-full rounded-lg border-2 p-2
            ${darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border-gray-700/50' 
              : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 border-gray-300/50'
            }
          `}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {card.type === 'graph' ? (
            <div className="w-full h-full">
              <Plot
                data={[{
                  x: card.plotData.x,
                  y: card.plotData.y,
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: darkMode ? '#9ca3af' : '#6b7280', width: 2 },
                  showlegend: false
                }]}
                layout={{
                  autosize: true,
                  margin: { l: 15, r: 15, b: 15, t: 15 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: {
                    color: darkMode ? '#e5e7eb' : '#374151',
                    size: 8
                  },
                  xaxis: { 
                    range: [-5, 5],
                    zeroline: true,
                    showgrid: true,
                    gridcolor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.3)',
                    gridwidth: 1,
                    zerolinecolor: darkMode ? 'rgba(107, 114, 128, 0.5)' : 'rgba(107, 114, 128, 0.5)',
                    zerolinewidth: 1,
                    showticklabels: false
                  },
                  yaxis: { 
                    range: [-3, 3],
                    zeroline: true,
                    showgrid: true,
                    gridcolor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.3)',
                    gridwidth: 1,
                    zerolinecolor: darkMode ? 'rgba(107, 114, 128, 0.5)' : 'rgba(107, 114, 128, 0.5)',
                    zerolinewidth: 1,
                    showticklabels: false
                  },
                  showlegend: false
                }}
                config={{ 
                  displayModeBar: false,
                  responsive: true,
                  staticPlot: true
                }}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  borderRadius: '0.375rem'
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className={`text-xs font-bold text-center px-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {card.expression}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function FunctionGame({ darkMode }) {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  // const [gameComplete, setGameComplete] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // Gerar cartas para o jogo
  const generateCards = useCallback(() => {
    // Selecionar 8 funções aleatoriamente
    const selectedFunctions = functions.slice(0, 8);
    const gameCards = [];

    selectedFunctions.forEach((func, index) => {
      // Gerar dados do gráfico
      const plotData = generatePoints(func.plot, -5, 5, 100);
      
      // Carta com gráfico
      gameCards.push({
        id: index * 2,
        functionId: func.id,
        type: 'graph',
        plotData: plotData,
        isMatched: false
      });

      // Carta com equação
      gameCards.push({
        id: index * 2 + 1,
        functionId: func.id,
        type: 'equation',
        expression: func.expression,
        isMatched: false
      });
    });

    // Embaralhar cartas
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    // setGameComplete(false);
  }, []);

  // Inicializar jogo
  useEffect(() => {
    generateCards();
  }, [generateCards]);

  // Lidar com clique na carta
  const handleCardClick = (clickedCard) => {
    if (flippedCards.length === 2) return;

    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      // Verificar se é um par
      const [firstCard, secondCard] = newFlippedCards;
      const isMatch = firstCard.functionId === secondCard.functionId && 
                     firstCard.type !== secondCard.type;

      if (isMatch) {
        // Par correto
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.functionId === firstCard.functionId 
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFlippedCards([]);
          setMatchedPairs(prev => {
            const newMatched = prev + 1;
            if (newMatched === 8) {
              setAlertOpen(true);
            }
            return newMatched;
          });
        }, 1000);
      } else {
        // Par incorreto
        setTimeout(() => {
          setFlippedCards([]);
        }, 1500);
      }
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const resetGame = () => {
    generateCards();
  };

  return (
    <div className={`min-h-100 p-1 md:p-2 ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'} transition-all duration-300 overflow-hidden`}>
      <div className={`w-full h-full ${darkMode ? 'bg-gray-900/95 border border-gray-800/50' : 'bg-white/95 border border-gray-200/50'} rounded-lg shadow-2xl backdrop-blur-lg transition-all duration-300 flex flex-col`}>
        
        {/* Header */}
        <div className={`p-2 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'} flex-shrink-0`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className={`p-1 rounded-full ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} mr-2`}>
                <FunctionSquare className={`h-3 w-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <h1 
                className={`text-base md:text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Jogo da Memória: Funções
              </h1>
            </div>
            <button
              onClick={resetGame}
              className={`
                px-2 py-1 rounded text-xs font-semibold transition-all duration-200 hover:scale-105 relative overflow-hidden flex items-center space-x-1
                ${darkMode 
                  ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-100 shadow-lg shadow-gray-900/50' 
                  : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-800 shadow-lg shadow-gray-600/30 border border-gray-400/40'
                }
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
              `}
            >
              <RotateCcw className="h-3 w-3" />
              <span>Novo Jogo</span>
            </button>
          </div>
          
          {/* Stats */}
          <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'} backdrop-blur-sm`}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pares</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{matchedPairs}/8</p>
              </div>
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Movimentos</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{moves}</p>
              </div>
              <div>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Precisão</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {moves > 0 ? Math.round((matchedPairs / moves) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 p-4 overflow-hidden flex items-center justify-center">
          <div className="grid grid-cols-4 gap-3 max-w-2xl w-full aspect-square">
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                isFlipped={flippedCards.includes(card) || card.isMatched}
                onClick={handleCardClick}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Victory Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className={`${darkMode ? 'bg-gray-900 text-gray-100 border border-gray-800' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl backdrop-blur-lg`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center`}>
              <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
              🎉 Parabéns!
            </AlertDialogTitle>
            <AlertDialogDescription className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Você completou o jogo da memória em {moves} movimentos com {Math.round((matchedPairs / moves) * 100)}% de precisão!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogAction 
              onClick={() => { handleAlertClose(); resetGame(); }}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${darkMode 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' 
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
                }
              `}
            >
              Novo Jogo
            </AlertDialogAction>
            
            <AlertDialogAction 
              onClick={handleAlertClose}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                }
              `}
            >
              Fechar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FunctionGame;