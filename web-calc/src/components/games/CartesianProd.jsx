import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Plot from 'react-plotly.js';
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function CartesianGame({ onClose, darkMode }) {
  // Estados originais
  const [setA, setSetA] = useState([1, 2, 3]);
  const [setB, setSetB] = useState(['A', 'B', 'C']);
  const [userPairs, setUserPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [selectedA, setSelectedA] = useState(null);
  const [plotData, setPlotData] = useState([]);
  
  // Estados para o jogo com bolinha móvel
  const [gameStarted, setGameStarted] = useState(false);
  const [currentBallPosition, setCurrentBallPosition] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [allPossiblePositions, setAllPossiblePositions] = useState([]);
  
  // Novo estado para armazenar o histórico de posições (efeito de arrasto)
  const [positionHistory, setPositionHistory] = useState([]);
  const MAX_TRAIL_LENGTH = 1; // Número de posições para o rastro
  
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  // Inicializar o jogo
  useEffect(() => {
    generateNewSets();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(intervalRef.current);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Atualizar todas as posições possíveis quando os conjuntos mudam
  useEffect(() => {
    const positions = [];
    setA.forEach(a => {
      setB.forEach(b => {
        // Calcular o valor Y para este elemento do conjunto B
        const yValue = setB.indexOf(b) + 1;
        positions.push({
          original: [a, b],
          plotPosition: [a, yValue]
        });
      });
    });
    setAllPossiblePositions(positions);
  }, [setA, setB]);

  // Função para gerar novos conjuntos A e B
  const generateNewSets = () => {
    // Gerar conjunto A (números)
    const newSetA = [];
    const sizeA = Math.floor(Math.random() * 2) + 3; // 3 a 4 elementos
    
    while (newSetA.length < sizeA) {
      const num = Math.floor(Math.random() * 10) + 1;
      if (!newSetA.includes(num)) {
        newSetA.push(num);
      }
    }
    
    // Gerar conjunto B (letras)
    const possibleB = ['A', 'B', 'C', 'D', 'E'];
    const newSetB = [];
    const sizeB = Math.floor(Math.random() * 2) + 3; // 3 a 4 elementos
    
    while (newSetB.length < sizeB) {
      const idx = Math.floor(Math.random() * possibleB.length);
      if (!newSetB.includes(possibleB[idx])) {
        newSetB.push(possibleB[idx]);
      }
    }
    
    setSetA(newSetA);
    setSetB(newSetB);
    setUserPairs([]);
    setFeedback('');
    stopGame();
  };

  // Função para obter uma posição aleatória do conjunto
  const getRandomPosition = () => {
    if (allPossiblePositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * allPossiblePositions.length);
      return allPossiblePositions[randomIndex];
    }
    return null;
  };

  // Função modificada para mover a bolinha com efeito de arrasto
  const moveToRandomPosition = () => {
    // Pegar a posição atual e a nova posição aleatória
    const startPosition = currentBallPosition || getRandomPosition();
    if (!startPosition) return;
    
    const endPosition = getRandomPosition();
    if (!endPosition || 
        (startPosition.plotPosition[0] === endPosition.plotPosition[0] && 
         startPosition.plotPosition[1] === endPosition.plotPosition[1])) {
      // Se a nova posição for a mesma, encontre outra
      moveToRandomPosition();
      return;
    }
    
    // Iniciar a animação entre as duas posições
    animateBallMovement(startPosition, endPosition);
  };

  // Nova função para animar o movimento da bolinha
  const animateBallMovement = (startPos, endPos) => {
    const startTime = performance.now();
    const duration = 200; // Duração mais rápida da animação (200ms)
    
    // Limpar qualquer animação anterior
    cancelAnimationFrame(animationRef.current);
    
    // Função para calcular e renderizar a posição atual da bolinha
    const animate = (currentTime) => {
      // Calcular o progresso da animação (0 a 1)
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calcular a posição atual usando interpolação suavizada (easeInOutCubic)
      const easeProgress = progress < 0.5 
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const currentX = startPos.plotPosition[0] + (endPos.plotPosition[0] - startPos.plotPosition[0]) * easeProgress;
      const currentY = startPos.plotPosition[1] + (endPos.plotPosition[1] - startPos.plotPosition[1]) * easeProgress;
      
      // Criar um objeto de posição atual com os valores originais do destino
      const currentPosition = {
        original: endPos.original,
        plotPosition: [currentX, currentY]
      };
      
      // Atualizar a posição atual da bolinha
      setCurrentBallPosition(currentPosition);
      
      // Adicionar a posição ao histórico para criar o efeito de arrasto
      setPositionHistory(prevHistory => {
        // Adicionar a nova posição e limitar o tamanho do histórico
        const newHistory = [...prevHistory, { x: currentX, y: currentY }]
          .slice(-MAX_TRAIL_LENGTH);
        return newHistory;
      });
      
      // Atualizar o gráfico
      updatePlotData(currentPosition);
      
      // Continuar a animação se não estiver completa
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animação completa - definir a posição final exata
        setCurrentBallPosition(endPos);
      }
    };
    
    // Iniciar a animação
    animationRef.current = requestAnimationFrame(animate);
  };

  // Função modificada para atualizar o gráfico com efeito de arrasto e blur
  const updatePlotData = (position) => {
    // Dados para o ponto principal (bolinha atual)
    const mainPoint = {
      x: [position.plotPosition[0]],
      y: [position.plotPosition[1]],
      mode: 'markers',
      type: 'scatter',
      hoverinfo: 'none',
      marker: {
        color: darkMode ? 'rgba(74, 222, 128, 1)' : 'rgba(50, 168, 82, 1)',
        size: 18,
        line: {
          color: darkMode ? 'rgb(34, 197, 94)' : 'rgb(30, 120, 50)',
          width: 2
        }
      },
      name: 'Bolinha atual'
    };
    
    // Plot de dados para o plano cartesiano
    const plotDataArray = [mainPoint];
    
    // Adicionar linha conectando os pontos para criar efeito de blur
    if (positionHistory.length > 1) {
      // Coletar todos os pontos do histórico e o atual para a linha
      const allPointsX = [...positionHistory.map(pos => pos.x), position.plotPosition[0]];
      const allPointsY = [...positionHistory.map(pos => pos.y), position.plotPosition[1]];
      
      // Adicionar uma linha gradiente para criar efeito de rastro com blur
      plotDataArray.push({
        x: allPointsX,
        y: allPointsY,
        mode: 'lines',
        type: 'scatter',
        hoverinfo: 'none',
        line: {
          color: darkMode ? 'rgba(74, 222, 128, 0.3)' : 'rgba(50, 168, 82, 0.3)',
          width: 5,
          shape: 'spline',
          smoothing: 1.3,
        },
        showlegend: false
      });
    }
    
    setPlotData(plotDataArray);
  };

  // Iniciar o jogo
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setFeedback('Jogo iniciado! Identifique rapidamente as coordenadas da bolinha.');
    setUserPairs([]);
    setPositionHistory([]); // Limpar o histórico de posições
    
    // Mover a bolinha para uma posição inicial
    moveToRandomPosition();
    setTimeLeft(5);
    
    // Configurar o temporizador para mover a bolinha a cada 5 segundos
    timerRef.current = setInterval(() => {
      moveToRandomPosition();
      setTimeLeft(5);
    }, 5000);
    
    // Configurar o intervalo para atualizar o contador regressivo
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);
  };

  // Parar o jogo
  const stopGame = () => {
    setGameStarted(false);
    clearInterval(timerRef.current);
    clearInterval(intervalRef.current);
    cancelAnimationFrame(animationRef.current);
    setCurrentBallPosition(null);
    setPositionHistory([]);
    setPlotData([]);
  };

  // Verificar resposta do usuário
  const checkAnswer = () => {
    if (!gameStarted || !currentBallPosition || userPairs.length === 0) {
      setFeedback("Selecione um par ordenado antes de verificar!");
      return;
    }
    
    const userPair = userPairs[0]; // Pegar apenas o primeiro par, já que agora temos apenas um
    const correctPair = currentBallPosition.original;
    
    if (userPair[0] === correctPair[0] && userPair[1] === correctPair[1]) {
      // Resposta correta
      const newScore = score + 10;
      setScore(newScore);
      setFeedback(`Correto! Par (${userPair[0]}, ${userPair[1]}) corresponde à posição da bolinha.`);
      setUserPairs([]);
      
      // Mover imediatamente para uma nova posição e reiniciar o timer
      clearInterval(timerRef.current);
      clearInterval(intervalRef.current);
      cancelAnimationFrame(animationRef.current);
      
      moveToRandomPosition();
      setTimeLeft(5);
      
      timerRef.current = setInterval(() => {
        moveToRandomPosition();
        setTimeLeft(5);
      }, 5000);
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => Math.max(prev - 1, 0));
      }, 1000);
    } else {
      // Resposta incorreta
      setFeedback(`Incorreto! A posição correta era (${correctPair[0]}, ${correctPair[1]})`);
      setUserPairs([]);
    }
  };

  // Função para lidar com cliques nos elementos A
  const handleClickA = (value) => {
    if (!gameStarted) {
      setFeedback("Inicie o jogo primeiro!");
      return;
    }
    setSelectedA(value);
    setFeedback(`Elemento ${value} selecionado. Agora selecione um elemento do conjunto B.`);
  };

  // Função para lidar com cliques nos elementos B
  const handleClickB = (value) => {
    if (!gameStarted) {
      setFeedback("Inicie o jogo primeiro!");
      return;
    }
    
    if (selectedA !== null) {
      setUserPairs([[selectedA, value]]);
      setFeedback(`Par (${selectedA}, ${value}) selecionado. Verifique se está correto!`);
      setSelectedA(null);
    } else {
      setFeedback("Selecione primeiro um elemento do conjunto A.");
    }
  };

  // Função para finalizar o jogo
  const endGame = () => {
    stopGame();
    setAlertType('gameOver');
    setAlertOpen(true);
    setScore(0);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    if (isComplete) {
      generateNewProblem();
      setIsComplete(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`p-6 max-w-4xl mx-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg transition-colors`}>
        
          <h1 
          className="text-2xl font-bold mb-4 text-center"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Produto Cartesiano: Capture a Bolinha!
          </h1>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-lg font-medium">Conjunto A = {`{${setA.join(', ')}}`}</p>
              <p className="text-lg font-medium">Conjunto B = {`{${setB.join(', ')}}`}</p>
            </div>
            
            <div>
              <span className="font-bold mr-2">Pontuação:</span>
              <span className="text-xl">{score}</span>
            </div>
          </div>
          
          {/* Plano Cartesiano */}
          <div className={`w-full h-[300px] border-2 ${darkMode ? 'border-blue-600 bg-gray-700' : 'border-blue-300 bg-gray-50'} rounded-lg shadow-md mb-6 transition-colors overflow-hidden relative`}>
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                margin: { l: 50, r: 50, b: 50, t: 50 },
                paper_bgcolor: darkMode ? '#374151' : '#f9fafb',
                plot_bgcolor: darkMode ? '#374151' : '#f9fafb',
                font: {
                  color: darkMode ? '#f9fafb' : '#111827'
                },
                xaxis: {
                  title: 'Conjunto A',
                  range: [Math.min(...setA) - 1, Math.max(...setA) + 1],
                  tickmode: 'array',
                  tickvals: setA,
                  ticktext: setA.map(String),
                  zeroline: true,
                  gridcolor: darkMode ? '#4b5563' : '#d0d0d0',
                  gridwidth: 0.3
                },
                yaxis: {
                  title: 'Conjunto B',
                  range: [0, setB.length + 1],
                  tickmode: 'array',
                  tickvals: Array.from({length: setB.length}, (_, i) => i + 1),
                  ticktext: setB.map(String),
                  zeroline: true,
                  gridcolor: darkMode ? '#4b5563' : '#d0d0d0',
                  gridwidth: 0.3
                },
                showlegend: false,
                hovermode: 'closest'
              }}
              config={{ 
                displayModeBar: false, 
                responsive: true,
                staticPlot: true
              }}
              style={{ 
                width: '100%', 
                height: '100%',
                borderRadius: '0.5rem'
              }}
              useResizeHandler={true}
            />
            
            {/* Temporizador sobreposto ao gráfico */}
            {gameStarted && (
              <div className="absolute top-2 right-2 bg-opacity-70 bg-black text-white px-3 py-1 rounded-full">
                {timeLeft}s
              </div>
            )}
          </div>
          
          <div className="flex justify-between mb-6">
            <div className="w-1/2 pr-2">
              <h2 className="text-lg font-medium mb-2">Elementos do Conjunto A</h2>
              <div className="flex flex-wrap gap-2">
                {setA.map(a => (
                  <div
              key={`a-${a}`}
              className={`
                px-3 py-2 border rounded cursor-pointer transition-colors
                ${selectedA === a 
                  ? (darkMode ? 'border-blue-400 text-blue-300' : 'border-blue-600 text-blue-700')
                  : (darkMode ? 'border-blue-700 text-blue-200' : 'border-blue-400 text-blue-600')
                }
                bg-transparent
                ${darkMode 
                  ? 'hover:bg-blue-900/30 hover:border-blue-500' 
                  : 'hover:bg-blue-50 hover:border-blue-500'
                }
              `}
              onClick={() => handleClickA(a)}
            >
              {a}
            </div>
                ))}
              </div>
            </div>
            
            <div className="w-1/2 pl-2">
              <h2 className="text-lg font-medium mb-2">Elementos do Conjunto B</h2>
              <div className="flex flex-wrap gap-2">
          {setB.map(b => (
            <div
              key={`b-${b}`}
              className={`
                px-3 py-2 border rounded cursor-pointer transition-colors
                bg-transparent
                ${darkMode 
                  ? 'border-purple-700 text-purple-300 hover:bg-purple-900/30 hover:border-purple-500' 
                  : 'border-purple-400 text-purple-700 hover:bg-purple-50 hover:border-purple-500'
                }
              `}
              onClick={() => handleClickB(b)}
            >
              {b}
            </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Produto Cartesiano A × B</h2>
            <p className="mb-2">Identifique o par ordenado onde a bolinha está antes que ela se mova!</p>
            
            {/* Temporizador como barra de progresso */}
            {gameStarted && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium text-blue-500`}>
                    Tempo restante: {timeLeft}s
                  </span>
                </div>
                <Progress 
                  value={(timeLeft / 5) * 100} 
                  className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  indicatorClassName={
                    timeLeft > 2 
                      ? (darkMode ? 'bg-green-400' : 'bg-green-600')
                      : (darkMode ? 'bg-red-400' : 'bg-red-600')
                  }
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4 min-h-[60px]">
              {userPairs.map((pair, index) => (
                <div 
                  key={index}
                  className={`px-3 py-2 rounded flex items-center ${
                    darkMode 
                      ? 'bg-green-900 border border-green-700' 
                      : 'bg-green-100 border border-green-300'
                  }`}
                >
                  <span>({pair[0]}, {pair[1]})</span>
                  <button 
                    className={`ml-2 ${
                      darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'
                    }`}
                    onClick={() => setUserPairs([])}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          {!gameStarted ? (
            <button
              onClick={startGame}
              className={`
                px-4 py-2 rounded border transition-colors
                bg-transparent 
                ${darkMode 
                  ? 'border-green-700 text-green-400 hover:bg-green-900/30 hover:border-green-600' 
                  : 'border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600'
                }
              `}
            >
              Iniciar Jogo
            </button>
          ) : (
            <button
              onClick={endGame}
              className={`
                px-4 py-2 rounded border transition-colors
                bg-transparent 
                ${darkMode 
                  ? 'border-red-700 text-red-400 hover:bg-red-900/30 hover:border-red-600' 
                  : 'border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600'
                }
              `}
            >
              Encerrar Jogo
            </button>
          )}
          
          <button
            onClick={checkAnswer}
            disabled={!gameStarted || userPairs.length === 0}
            className={`
              px-4 py-2 rounded border transition-colors
              bg-transparent
              ${gameStarted && userPairs.length > 0
                ? (darkMode 
                   ? 'border-blue-500 text-blue-300 hover:bg-blue-900/30 hover:border-blue-400' 
                   : 'border-blue-600 text-blue-700 hover:bg-blue-50 hover:border-blue-700')
                : (darkMode 
                   ? 'border-gray-600 text-gray-400 opacity-50' 
                   : 'border-gray-300 text-gray-500 opacity-50')
              } 
              ${!gameStarted || userPairs.length === 0 ? 'cursor-not-allowed' : ''}
            `}
          >
            Verificar Par
          </button>
        </div>
        
        {feedback && (
          <div className={`p-3 rounded text-center mb-4 ${
            feedback.includes('Correto') 
              ? (darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800')
              : feedback.includes('Incorreto')
                ? (darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800')
                : (darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800')
          } transition-colors`}>
            {feedback}
          </div>
        )}

         <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialogContent className={darkMode ? 'bg-gray-800 text-white border border-gray-700' : ''}>
            <AlertDialogHeader>
              <AlertDialogTitle className={darkMode ? 'text-white' : ''}>
                {alertType === 'gameOver' ? 'Jogo Encerrado' : 'Parabéns!'}
              </AlertDialogTitle>
              <AlertDialogDescription className={darkMode ? 'text-gray-300' : ''}>
                {alertType === 'gameOver' 
                  ? `Você fez ${score} pontos!` 
                  : 'Você identificou corretamente o par ordenado!'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={handleAlertClose}
                  className={`
                    px-4 py-2 rounded border transition-colors
                    bg-transparent
                    ${darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500' 
                      : 'border-gray-400 text-gray-600 hover:bg-gray-100 hover:border-gray-500'
                    }
                  `}
              >
                Próximo desafio
              </AlertDialogAction>
              
              <AlertDialogAction 
                onClick={handleAlertClose}
                  className={`
                    px-4 py-2 rounded border transition-colors
                    bg-transparent
                    ${darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500' 
                      : 'border-gray-400 text-gray-600 hover:bg-gray-100 hover:border-gray-500'
                    }
                  `}
              >
                Sair
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
      </div>
    </DndProvider>
  );
}

export default CartesianGame;