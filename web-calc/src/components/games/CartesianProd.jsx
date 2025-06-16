import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Plot from 'react-plotly.js';
import { Progress } from "@/components/ui/progress"
import { Play, Square, Check, RotateCcw, Trophy, Target } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function CartesianGame({ darkMode }) {
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
  const newPosition = getRandomPosition();
  if (!newPosition) return;
  
  // If there's no current position (first time), set it directly
  if (!currentBallPosition) {
    setCurrentBallPosition(newPosition);
    updatePlotData(newPosition);
    return;
  }
  
  // If the new position is the same as current, find another
  if (currentBallPosition.plotPosition[0] === newPosition.plotPosition[0] && 
      currentBallPosition.plotPosition[1] === newPosition.plotPosition[1]) {
    moveToRandomPosition();
    return;
  }
    
    // Iniciar a animação entre as duas posições
    animateBallMovement(currentBallPosition, newPosition);
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
        color: darkMode ? 'rgba(156, 163, 175, 1)' : 'rgba(75, 85, 99, 1)',
        size: 18,
        line: {
          color: darkMode ? 'rgba(107, 114, 128, 1)' : 'rgba(55, 65, 81, 1)',
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
          color: darkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(75, 85, 99, 0.3)',
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
  setPositionHistory([]);
  
  // Get initial position and immediately show the ball
  const initialPosition = getRandomPosition();
  if (initialPosition) {
    setCurrentBallPosition(initialPosition);
    updatePlotData(initialPosition);
  }
  
  setTimeLeft(5);
  
  // Set up timer to move ball every 5 seconds
  timerRef.current = setInterval(() => {
    moveToRandomPosition();
    setTimeLeft(5);
  }, 5000);
  
  // Set up countdown interval
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
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className={`min-h-100 p-1 md:p-2 ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'} transition-all duration-300`}>
      <div className={`max-w-7xl mx-auto ${darkMode ? 'bg-gray-900/95 border border-gray-800/50' : 'bg-white/95 border border-gray-200/50'} rounded-lg shadow-2xl backdrop-blur-lg transition-all duration-300`}>
        
        {/* Header Section */}
        <div className={`p-2 md:p-3 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className={`p-1.5 rounded-full ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} mr-2`}>
                <Target className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <h1 
                className={`text-lg md:text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Produto Cartesiano: Capture a Bolinha!
              </h1>
            </div>
          </div>
          
          {/* Game Info Cards */}
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'} backdrop-blur-sm`}>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Conjunto A</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{`{${setA.join(', ')}}`}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Conjunto B</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{`{${setB.join(', ')}}`}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Pontuação</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{score}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Area - Layout em Grid */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Plano Cartesiano - Mais compacto */}
            <div className="lg:col-span-2">
              <div className={`relative w-full h-[300px] md:h-[350px] ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'} rounded-lg shadow-inner mb-4 overflow-hidden`}>
                
                <Plot
                  data={plotData.length > 0 ? plotData : [
                    {
                      x: [],
                      y: [],
                      mode: 'markers',
                      type: 'scatter',
                      hoverinfo: 'none',
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 30, r: 30, b: 30, t: 30 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: {
                      color: darkMode ? '#e5e7eb' : '#374151',
                      size: 10,
                      family: "'Inter', sans-serif"
                    },
                    xaxis: {
                      title: {
                        text: 'Conjunto A',
                        font: { size: 11, color: darkMode ? '#9ca3af' : '#6b7280' }
                      },
                      range: [Math.min(...setA) - 1, Math.max(...setA) + 1],
                      tickmode: 'array',
                      tickvals: setA,
                      ticktext: setA.map(String),
                      zeroline: true,
                      showgrid: true,
                      gridcolor: darkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(156, 163, 175, 0.3)',
                      gridwidth: 1,
                      zerolinecolor: darkMode ? 'rgba(107, 114, 128, 0.6)' : 'rgba(107, 114, 128, 0.5)',
                      zerolinewidth: 2
                    },
                    yaxis: {
                      title: {
                        text: 'Conjunto B',
                        font: { size: 11, color: darkMode ? '#9ca3af' : '#6b7280' }
                      },
                      range: [0, setB.length + 1],
                      tickmode: 'array',
                      tickvals: Array.from({length: setB.length}, (_, i) => i + 1),
                      ticktext: setB.map(String),
                      zeroline: true,
                      showgrid: true,
                      gridcolor: darkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(156, 163, 175, 0.3)',
                      gridwidth: 1,
                      zerolinecolor: darkMode ? 'rgba(107, 114, 128, 0.6)' : 'rgba(107, 114, 128, 0.5)',
                      zerolinewidth: 2
                    },
                    showlegend: false,
                    hovermode: 'closest',
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
                
                {/* Timer overlay */}
                {gameStarted && (
                  <div className={`absolute top-3 right-3 ${darkMode ? 'bg-gray-900/90 border border-gray-700' : 'bg-white/90 border border-gray-300'} px-3 py-1 rounded-lg backdrop-blur-sm shadow-lg`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${timeLeft > 2 ? (darkMode ? 'bg-gray-400' : 'bg-gray-600') : (darkMode ? 'bg-gray-600' : 'bg-gray-700')} animate-pulse`}></div>
                      <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{timeLeft}s</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Painel Lateral de Controles */}
            <div className="lg:col-span-1 space-y-4">
              
              {/* Timer Progress Bar */}
              {gameStarted && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200'} backdrop-blur-sm`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tempo: {timeLeft}s
                    </span>
                  </div>
                  <Progress 
                    value={(timeLeft / 5) * 100} 
                    className={`h-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full overflow-hidden`}
                    indicatorClassName={darkMode ? 'bg-gradient-to-r from-gray-500 to-gray-400' : 'bg-gradient-to-r from-gray-600 to-gray-700'}
                  />
                </div>
              )}

              {/* Selected Pairs Display */}
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200'} backdrop-blur-sm`}>
                <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Par Selecionado:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userPairs.length > 0 ? (
                    userPairs.map((pair, index) => (
                      <div 
                        key={index}
                        className={`px-3 py-2 rounded-lg flex items-center text-sm font-semibold ${
                          darkMode 
                            ? 'bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500 text-gray-200' 
                            : 'bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-400 text-gray-800'
                        } shadow-sm`}
                      >
                        <span>({pair[0]}, {pair[1]})</span>
                        <button 
                          className={`ml-2 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                            darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          } transition-colors`}
                          onClick={() => setUserPairs([])}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className={`px-3 py-2 rounded-lg border-2 border-dashed text-xs ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-500'}`}>
                      Selecione A e B
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons - Compactos */}
              <div className="grid grid-cols-1 gap-2">
                {!gameStarted ? (
                  <button
                    onClick={startGame}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 relative overflow-hidden
                      ${darkMode 
                        ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-500/30' 
                        : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-800 shadow-lg shadow-gray-600/30 border border-gray-400/40'
                      }
                      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                    `}
                  >
                    <Play className="h-4 w-4" />
                    <span>Iniciar</span>
                  </button>
                ) : (
                  <button
                    onClick={endGame}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 relative overflow-hidden
                      ${darkMode 
                        ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-500/30' 
                        : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-800 shadow-lg shadow-gray-600/30 border border-gray-400/40'
                      }
                      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                    `}
                  >
                    <Square className="h-4 w-4" />
                    <span>Encerrar</span>
                  </button>
                )}
                
                <button
                  onClick={generateNewSets}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 relative overflow-hidden
                    ${darkMode 
                      ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-500/30' 
                      : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-800 shadow-lg shadow-gray-600/30 border border-gray-400/40'
                    }
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                  `}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Novos Conjuntos</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Selection Areas - Mais compactas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Conjunto A */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200'} backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Conjunto A
                </h2>
                <div className="w-12 h-12 flex items-center justify-center">
                  {/* Empty space for symmetry */}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {setA.map(a => (
                  <button
                    key={`a-${a}`}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden
                      ${selectedA === a 
                        ? (darkMode 
                           ? 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-400/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700' 
                           : 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 text-gray-800 shadow-lg shadow-gray-600/30 border border-gray-300/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700')
                        : (darkMode 
                           ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-300 border border-gray-500/30 shadow-lg shadow-gray-900/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700' 
                           : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-700 border border-gray-400/40 shadow-lg shadow-gray-500/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700')
                      }
                    `}
                    onClick={() => handleClickA(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Conjunto B */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200'} backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Conjunto B
                </h2>
                <button
                  onClick={checkAnswer}
                  disabled={!gameStarted || userPairs.length === 0}
                  className={`
                    w-12 h-12 rounded-lg font-semibold transition-all duration-200 transform flex items-center justify-center relative overflow-hidden flex-shrink-0
                    ${gameStarted && userPairs.length > 0
                      ? (darkMode 
                         ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-500/30 hover:scale-105 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700'
                         : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-800 shadow-lg shadow-gray-600/30 border border-gray-400/40 hover:scale-105 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700')
                      : (darkMode 
                         ? 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-gray-500 cursor-not-allowed border border-gray-600/30 shadow-inner' 
                         : 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 text-gray-500 cursor-not-allowed border border-gray-300/40 shadow-inner')
                    }
                  `}
                >
                  <Check className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {setB.map(b => (
                  <button
                    key={`b-${b}`}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden
                      ${darkMode 
                        ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-300 border border-gray-500/30 shadow-lg shadow-gray-900/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700' 
                        : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-700 border border-gray-400/40 shadow-lg shadow-gray-500/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700'
                      }
                    `}
                    onClick={() => handleClickB(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Feedback Section - Compacto */}
          {feedback && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium backdrop-blur-sm transition-all duration-300 ${
              feedback.includes('Correto') 
                ? (darkMode ? 'bg-gradient-to-r from-gray-800/70 to-gray-700/50 text-gray-200 border border-gray-600/50' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300')
                : feedback.includes('Incorreto')
                  ? (darkMode ? 'bg-gradient-to-r from-gray-800/70 to-gray-700/50 text-gray-300 border border-gray-600/50' : 'bg-gradient-to-r from_gray-100 to_gray-200 text-gray-700 border border-gray-300')
                  : (darkMode ? 'bg-gradient-to-r from-gray-800/70 to_gray-700/50 text-gray-200 border border-gray-600/50' : 'bg-gradient-to-r from_gray-100 to_gray-200 text-gray-800 border border-gray-300')
            } shadow-sm`}>
              {feedback}
            </div>
          )}
        </div>
      </div>

      {/* Alert Dialog mantido igual */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className={`${darkMode ? 'bg-gray-900 text-gray-100 border border-gray-800' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl backdrop-blur-lg`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {alertType === 'gameOver' ? '🎮 Jogo Encerrado' : '🎉 Parabéns!'}
            </AlertDialogTitle>
            <AlertDialogDescription className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {alertType === 'gameOver' 
                ? `Você conquistou ${score} pontos! Continue praticando para melhorar sua pontuação.` 
                : 'Você identificou corretamente o par ordenado! Excelente trabalho!'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogAction 
              onClick={handleAlertClose}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105
                ${darkMode 
                  ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-100 shadow-lg' 
                  : 'bg-gradient-to-r from-gray-700 to_gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg'
                }
              `}
            >
              Próximo Desafio
            </AlertDialogAction>
            
            <AlertDialogAction 
              onClick={handleAlertClose}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105
                ${darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
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