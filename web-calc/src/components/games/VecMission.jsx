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
  const generateDecompositionLevel = () => {
    // Ajustar dificuldade - quanto maior o nível, maiores e mais complexos os vetores
    const maxRange = 15;
    
    // Gerar um vetor aleatório para decompor
    const vector = {
      x: Math.floor(Math.random() * (2 * maxRange + 1)) - maxRange,
      y: Math.floor(Math.random() * (2 * maxRange + 1)) - maxRange
    };
    
    // Garantir que não temos o vetor nulo ou muito simples
    if (vector.x === 0 && vector.y === 0) {
    vector.x = Math.random() > 0.5 ? 1 : -1;
    vector.y = Math.random() > 0.5 ? 1 : -1;
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
    const axisColor = darkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(107, 114, 128, 0.3)';
    
    // Configuração do plano cartesiano
    plotData.push({
      x: [-20, 20],
      y: [0, 0],
      mode: 'lines',
      line: { color: axisColor, width: 1 },
      hoverinfo: 'none',
      showlegend: false
    });
    
    plotData.push({
      x: [0, 0],
      y: [-20, 20],
      mode: 'lines',
      line: { color: axisColor, width: 1 },
      hoverinfo: 'none',
      showlegend: false
    });

    plotData.push({
    x: [vectorToDecompose.x],
    y: [vectorToDecompose.y],
    mode: 'markers',
    marker: { 
      size: 8,
      color: darkMode ? '#6b7280' : '#374151',
      line: { width: 1, color: darkMode ? '#9ca3af' : '#6b7280' }
    },
    showlegend: false
    });
    
    
    // Mostrar componentes do usuário
    plotData.push({
      x: [0, userComponents.x],
      y: [0, 0],
      mode: 'lines+markers',
      line: { color: darkMode ? '#9ca3af' : '#6b7280', width: 2 },
      name: `Componente X: ${round2Decimals(userComponents.x)}`,
      hoverinfo: 'name',
      showlegend: false
    });
    
    plotData.push({
      x: [userComponents.x, userComponents.x],
      y: [0, userComponents.y],
      mode: 'lines+markers',
      line: { color: darkMode ? '#6b7280' : '#374151', width: 2 },
      marker: { size: 6, symbol: 'circle' },
      name: `Componente Y: ${round2Decimals(userComponents.y)}`,
      hoverinfo: 'name',
      showlegend: false
    });
    
    // Mostrar vetor resultante da decomposição do usuário
    plotData.push({
      x: [0, userComponents.x],
      y: [0, userComponents.y],
      mode: 'lines',
      line: { color: darkMode ? '#4b5563' : '#9ca3af', width: 1, dash: 'dash' },
      name: `Vetor Resultante: (${round2Decimals(userComponents.x)}, ${round2Decimals(userComponents.y)})`,
      hoverinfo: 'name',
      showlegend: false
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
    <div className={`min-h-100 p-1 md:p-2 ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'} transition-all duration-300`}>
      <div className={`w-full h-full ${darkMode ? 'bg-gray-900/95 border border-gray-800/50' : 'bg-white/95 border border-gray-200/50'} rounded-lg shadow-2xl backdrop-blur-lg transition-all duration-300`}>
        
        {/* Header Section */}
        <div className={`p-2 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'} flex-shrink-0`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className={`p-1 rounded-full ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} mr-2`}>
                <Navigation className={`h-3 w-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <h1 
                className={`text-base md:text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Missão Vetorial
              </h1>
            </div>
            <button
              onClick={onClose}
              className={`
                px-2 py-1 rounded text-xs font-semibold transition-all duration-200 hover:scale-105 relative overflow-hidden
                ${darkMode 
                  ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-500/30' 
                  : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-800 shadow-lg shadow-gray-600/30 border border-gray-400/40'
                }
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
              `}
            >
              ✕
            </button>
          </div>
          
          {/* Vector Info Card */}
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'} backdrop-blur-sm`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Módulo</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {round2Decimals(calculateMagnitude(vectorToDecompose))}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Ângulo</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {round2Decimals(calculateAngle(vectorToDecompose))}°
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="p-2 md:p-3 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 h-full">
            
            {/* Plano Cartesiano */}
            <div className="lg:col-span-4">
              <div className={`relative w-full h-[400px] md:h-[500px] lg:h-[600px] ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'} rounded-lg shadow-inner overflow-hidden`}>
                <Plot
                  ref={plotRef}
                  data={getPlotData()}
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
                      title: { text: 'x', font: { size: 11, color: darkMode ? '#9ca3af' : '#6b7280' } },
                      range: [-20, 20],
                      zeroline: true,
                      showgrid: true,
                      gridcolor: darkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(156, 163, 175, 0.3)',
                      gridwidth: 1,
                      zerolinecolor: darkMode ? 'rgba(107, 114, 128, 0.6)' : 'rgba(107, 114, 128, 0.5)',
                      zerolinewidth: 2
                    },
                    yaxis: {
                      title: { text: 'y', font: { size: 11, color: darkMode ? '#9ca3af' : '#6b7280' } },
                      range: [-20, 20],
                      zeroline: true,
                      showgrid: true,
                      gridcolor: darkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(156, 163, 175, 0.3)',
                      gridwidth: 1,
                      zerolinecolor: darkMode ? 'rgba(107, 114, 128, 0.6)' : 'rgba(107, 114, 128, 0.5)',
                      zerolinewidth: 2,
                      scaleanchor: 'x',
                      scaleratio: 1
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
                    borderRadius: '0.5rem'
                  }}
                  useResizeHandler={true}
                />
              </div>
            </div>

            {/* Painel Lateral de Controles */}
            <div className="lg:col-span-1 space-y-2 flex flex-col">
              
              {/* Sliders para Componentes */}
              <div className="space-y-2 flex-shrink-0">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200'}`}>
                  <Label className={`mb-1 block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Componente X: {round2Decimals(userComponents.x)}
                  </Label>
                  <Slider
                    min={-15}
                    max={15}
                    step={1}
                    value={[userComponents.x]}
                    onValueChange={(value) => setUserComponents({...userComponents, x: value[0]})}
                    className="mt-1"
                  />
                </div>
                
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700/30' : 'bg-gray-100 border border-gray-200'}`}>
                  <Label className={`mb-1 block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Componente Y: {round2Decimals(userComponents.y)}
                  </Label>
                  <Slider
                    min={-15}
                    max={15}
                    step={1}
                    value={[userComponents.y]}
                    onValueChange={(value) => setUserComponents({...userComponents, y: value[0]})}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Vetor Resultante Display */}
              <div className={`p-2 rounded-lg text-center flex-shrink-0 ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Vetor Resultante</p>
                <p className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  ({round2Decimals(userComponents.x)}, {round2Decimals(userComponents.y)})
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-1.5 flex-1 content-start">
                <button
                  onClick={() => generateLevel(level)}
                  className={`
                    px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-1 relative overflow-hidden
                    ${darkMode 
                      ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-500/30' 
                      : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-800 shadow-lg shadow-gray-600/30 border border-gray-400/40'
                    }
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                  `}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Novo Problema</span>
                </button>
                
                <button
                  onClick={checkAnswer}
                  className={`
                    px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-1 relative overflow-hidden
                    ${darkMode 
                      ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-gray-100 shadow-lg shadow-gray-900/50 border border-gray-500/30' 
                      : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 text-gray-800 shadow-lg shadow-gray-600/30 border border-gray-400/40'
                    }
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                  `}
                >
                  <Check className="h-3 w-3" />
                  <span>Verificar</span>
                </button>
              </div>

              {/* Feedback Section */}
              {feedback && (
                <div className={`p-2 rounded-lg text-center text-xs font-medium backdrop-blur-sm transition-all duration-300 flex-shrink-0 ${
                  feedback.includes('Parabéns') 
                    ? (darkMode ? 'bg-gradient-to-r from-gray-800/70 to-gray-700/50 text-gray-200 border border-gray-600/50' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300')
                    : feedback.includes('Quase')
                      ? (darkMode ? 'bg-gradient-to-r from-gray-800/70 to-gray-700/50 text-gray-300 border border-gray-600/50' : 'bg-gradient-to-r from_gray-100 to_gray-200 text-gray-700 border border-gray-300')
                      : (darkMode ? 'bg-gradient-to-r from-gray-800/70 to-gray-700/50 text-gray-200 border border-gray-600/50' : 'bg-gradient-to-r from_gray-100 to_gray-200 text-gray-800 border border-gray-300')
                } shadow-sm`}>
                  {feedback}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className={`${darkMode ? 'bg-gray-900 text-gray-100 border border-gray-800' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl backdrop-blur-lg`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
               Parabéns!
            </AlertDialogTitle>
            <AlertDialogDescription className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Você decompôs o vetor corretamente!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogAction 
              onClick={() => { handleAlertClose(); generateLevel(level); }}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${darkMode 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' 
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
                }
              `}
            >
              Próximo
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
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default VectorGame;