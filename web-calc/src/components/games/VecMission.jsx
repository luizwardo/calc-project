import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Navigation, RotateCcw, Check, Target } from 'lucide-react';

function VectorGame({ onClose, darkMode }) {
  // Estados para o jogo
  const [level,] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Estados para o modo de decomposição
  const [vectorToDecompose, setVectorToDecompose] = useState({ x: 4, y: 3 });
  const [userComponents, setUserComponents] = useState({ x: 0, y: 0 });
  
  // Referência para o plano cartesiano
  const plotRef = useRef(null);

  // Gerar um novo nível com base na dificuldade
  const generateLevel = React.useCallback((levelNumber) => {
    setFeedback('');
    setIsComplete(false);
    generateDecompositionLevel(levelNumber);
  }, []);

  // Inicializar o jogo
  useEffect(() => {
    generateLevel(level);
  }, [level, generateLevel]);

  // Gerar nível de decomposição de vetores
  const generateDecompositionLevel = (difficulty) => {
    // Ajustar dificuldade - quanto maior o nível, maiores e mais complexos os vetores
    const multiplier = Math.min(difficulty, 5);
    
    // Gerar um vetor aleatório para decompor
    const vector = {
      x: Math.floor(Math.random() * (3 * multiplier)) - Math.floor(1.5 * multiplier),
      y: Math.floor(Math.random() * (3 * multiplier)) - Math.floor(1.5 * multiplier)
    };
    
    // Garantir que não temos o vetor nulo ou muito simples
    if (Math.abs(vector.x) < 2) vector.x = vector.x < 0 ? -2 : 2;
    if (Math.abs(vector.y) < 2) vector.y = vector.y < 0 ? -2 : 2;
    
    // Garantir alguma complexidade em níveis mais altos
    if (difficulty > 3) {
      // Usar valores não inteiros para níveis mais avançados
      if (Math.random() > 0.5) {
        vector.x += (Math.random() * 0.8).toFixed(1);
        vector.y += (Math.random() * 0.8).toFixed(1);
      }
    }
    
    setVectorToDecompose(vector);
    setUserComponents({ x: 0, y: 0 });
  };

  // Calcular o módulo (comprimento) de um vetor
  const calculateMagnitude = (vector) => {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  };

  // Calcular o ângulo de um vetor (em graus)
  const calculateAngle = (vector) => {
    return Math.atan2(vector.y, vector.x) * (180 / Math.PI);
  };

  // Arredondar um número para 2 casas decimais
  const round2Decimals = (num) => {
    return Math.round(num * 100) / 100;
  };

  // Verificar se a resposta do usuário está correta
  const checkAnswer = () => {
    // Verificar se a decomposição está correta
    const isXCorrect = Math.abs(userComponents.x - vectorToDecompose.x) < 0.2;
    const isYCorrect = Math.abs(userComponents.y - vectorToDecompose.y) < 0.2;
    
    if (isXCorrect && isYCorrect) {
      setFeedback('Parabéns! A decomposição está correta!');
      setIsComplete(true);
      setAlertOpen(true);
    } else {
      const xDiff = Math.abs(userComponents.x - vectorToDecompose.x);
      const yDiff = Math.abs(userComponents.y - vectorToDecompose.y);
      
      if (xDiff < 0.5 && yDiff < 0.5) {
        setFeedback('Quase lá! Faça pequenos ajustes nos valores.');
      } else {
        setFeedback('A decomposição ainda não está correta. Continue tentando!');
      }
    }
  };

  // Gerar os dados para o gráfico Plotly
  const getPlotData = () => {
    const plotData = [];
    
    // Cores adaptadas ao tema
    const axisColor = darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
    
    // Configuração do plano cartesiano
    plotData.push({
      x: [-10, 10],
      y: [0, 0],
      mode: 'lines',
      line: { color: axisColor, width: 1 },
      hoverinfo: 'none',
      showlegend: false
    });
    
    plotData.push({
      x: [0, 0],
      y: [-10, 10],
      mode: 'lines',
      line: { color: axisColor, width: 1 },
      hoverinfo: 'none',
      showlegend: false
    });

    
    // Mostrar componentes do usuário
    plotData.push({
      x: [0, userComponents.x],
      y: [0, 0],
      mode: 'lines+markers',
      line: { color: darkMode ? '#fca5a5' : 'red', width: 2 },
      marker: { size: 6, symbol: 'circle' },
      name: `Componente X: ${round2Decimals(userComponents.x)}`,
      hoverinfo: 'name'
    });
    
    plotData.push({
      x: [userComponents.x, userComponents.x],
      y: [0, userComponents.y],
      mode: 'lines+markers',
      line: { color: darkMode ? '#93c5fd' : 'blue', width: 2 },
      marker: { size: 6, symbol: 'circle' },
      name: `Componente Y: ${round2Decimals(userComponents.y)}`,
      hoverinfo: 'name'
    });
    
    // Mostrar vetor resultante da decomposição do usuário
    plotData.push({
      x: [0, userComponents.x],
      y: [0, userComponents.y],
      mode: 'lines',
      line: { color: darkMode ? '#86efac' : 'green', width: 2, dash: 'dash' },
      name: `Vetor Resultante: (${round2Decimals(userComponents.x)}, ${round2Decimals(userComponents.y)})`,
      hoverinfo: 'name'
    });
    
    return plotData;
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    if (isComplete) {
      setIsComplete(false);
    }
  };

  return (
    <div className={`min-h-screen p-2 md:p-4 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} transition-all duration-300`}>
      <div className={`max-w-7xl mx-auto ${darkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'} rounded-xl shadow-2xl backdrop-blur-lg transition-all duration-300`}>
        
        {/* Header Section */}
        <div className={`p-4 md:p-6 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
          <div className="flex items-center justify-center mb-4">
            <div className={`p-2 rounded-full ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'} mr-3`}>
              <Navigation className={`h-6 w-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <h1 
              className={`text-2xl md:text-3xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Missão Vetorial
            </h1>
          </div>
          
          {/* Vector Info Card */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/30' : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'} backdrop-blur-sm`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className={`text-xs font-medium ${darkMode ? 'text-orange-300' : 'text-orange-600'} mb-1`}>Vetor Alvo</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  ({round2Decimals(vectorToDecompose.x)}, {round2Decimals(vectorToDecompose.y)})
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${darkMode ? 'text-orange-300' : 'text-orange-600'} mb-1`}>Módulo</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {round2Decimals(calculateMagnitude(vectorToDecompose))}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${darkMode ? 'text-orange-300' : 'text-orange-600'} mb-1`}>Ângulo</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {round2Decimals(calculateAngle(vectorToDecompose))}°
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Plano Cartesiano */}
            <div className="lg:col-span-2">
              <div className={`relative w-full h-[300px] md:h-[350px] ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/50' : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'} rounded-xl shadow-inner mb-4 overflow-hidden`}>
                <Plot
                  ref={plotRef}
                  data={getPlotData()}
                  layout={{
                    autosize: true,
                    margin: { l: 50, r: 50, b: 50, t: 50 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: {
                      color: darkMode ? '#f9fafb' : '#111827',
                      size: 12,
                      family: "'Inter', sans-serif"
                    },
                    xaxis: {
                      title: { text: 'x', font: { size: 14 } },
                      range: [-10, 10],
                      zeroline: true,
                      showgrid: true,
                      gridcolor: darkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.8)',
                      gridwidth: 1,
                      zerolinecolor: darkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(156, 163, 175, 0.8)',
                      zerolinewidth: 2
                    },
                    yaxis: {
                      title: { text: 'y', font: { size: 14 } },
                      range: [-10, 10],
                      zeroline: true,
                      showgrid: true,
                      gridcolor: darkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.8)',
                      gridwidth: 1,
                      zerolinecolor: darkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(156, 163, 175, 0.8)',
                      zerolinewidth: 2,
                      scaleanchor: 'x',
                      scaleratio: 1
                    },
                    showlegend: true,
                    legend: {
                      x: 0,
                      y: 1,
                      orientation: 'h',
                      font: { size: 10 }
                    }
                  }}
                  config={{
                    displayModeBar: false,
                    responsive: true,
                    staticPlot: true
                  }}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '0.75rem'
                  }}
                  useResizeHandler={true}
                />
              </div>
            </div>

            {/* Painel Lateral de Controles */}
            <div className="lg:col-span-1 space-y-4">
              
              {/* Sliders para Componentes */}
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-200'}`}>
                  <Label className={`mb-2 block text-sm font-semibold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                    Componente X: {round2Decimals(userComponents.x)}
                  </Label>
                  <Slider
                    min={-10}
                    max={10}
                    step={0.1}
                    value={[userComponents.x]}
                    onValueChange={(value) => setUserComponents({...userComponents, x: value[0]})}
                    className="mt-1"
                  />
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'}`}>
                  <Label className={`mb-2 block text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Componente Y: {round2Decimals(userComponents.y)}
                  </Label>
                  <Slider
                    min={-10}
                    max={10}
                    step={0.1}
                    value={[userComponents.y]}
                    onValueChange={(value) => setUserComponents({...userComponents, y: value[0]})}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Vetor Resultante Display */}
              <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-800/50 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Vetor Resultante</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  ({round2Decimals(userComponents.x)}, {round2Decimals(userComponents.y)})
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => generateLevel(level)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2
                    ${darkMode 
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-orange-600/25' 
                      : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-orange-600/25'
                    }
                  `}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Novo Problema</span>
                </button>
                
                <button
                  onClick={checkAnswer}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2
                    ${darkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/25' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/25'
                    }
                  `}
                >
                  <Check className="h-4 w-4" />
                  <span>Verificar</span>
                </button>

                <button
                  onClick={onClose}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95
                    ${darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                    }
                  `}
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {feedback && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium backdrop-blur-sm transition-all duration-300 ${
              feedback.includes('Parabéns') 
                ? (darkMode ? 'bg-gradient-to-r from-green-900/50 to-green-800/30 text-green-200 border border-green-700/50' : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300')
                : feedback.includes('Quase')
                  ? (darkMode ? 'bg-gradient-to-r from-yellow-900/50 to-yellow-800/30 text-yellow-200 border border-yellow-700/50' : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300')
                  : (darkMode ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/30 text-blue-200 border border-blue-700/50' : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300')
            } shadow-sm`}>
              {feedback}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className={`${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl backdrop-blur-lg`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🎯 Parabéns!
            </AlertDialogTitle>
            <AlertDialogDescription className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Você decompôs o vetor corretamente! Excelente trabalho!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogAction 
              onClick={handleAlertClose}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105
                ${darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg'
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
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' 
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
  );
}

export default VectorGame;