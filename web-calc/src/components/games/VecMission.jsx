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

  // Inicializar o jogo
  useEffect(() => {
    generateLevel(level);
  }, [level]);

  // Gerar um novo nível com base na dificuldade
  const generateLevel = (levelNumber) => {
    setFeedback('');
    setIsComplete(false);
    generateDecompositionLevel(levelNumber);
  };

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
    <div className={`p-6 max-w-4xl mx-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg transition-colors relative`}>
     
      <h1 
        className="text-2xl font-bold mb-4 text-center"
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        Missão Vetorial
      </h1>      

      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="font-bold mr-2">Nível:</span>
          <span className="text-lg">{level}</span>
        </div>
      </div>
      
      {/* Plano Cartesiano */}
      <div className={`w-full h-[350px] border-2  border-gray-300 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-blue-300 bg-gray-50'} rounded-lg shadow-md mb-6 transition-colors overflow-hidden`}>
        <Plot
          ref={plotRef}
          data={getPlotData()}
          layout={{
            autosize: true,
            margin: { l: 40, r: 40, b: 40, t: 40 },
            paper_bgcolor: darkMode ? '#374151' : '#f9fafb',
            plot_bgcolor: darkMode ? '#374151' : '#f9fafb',
            font: {
              color: darkMode ? '#f9fafb' : '#111827'
            },
            xaxis: {
              title: 'x',
              range: [-10, 10],
              zeroline: true,
              gridcolor: darkMode ? '#4b5563' : '#d0d0d0',
              gridwidth: 1
            },
            yaxis: {
              title: 'y',
              range: [-10, 10],
              zeroline: true,
              gridcolor: darkMode ? '#4b5563' : '#d0d0d0',
              gridwidth: 1,
              scaleanchor: 'x',
              scaleratio: 1
            },
            showlegend: true,
            legend: {
              x: 0,
              y: 1,
              orientation: 'h'
            }
          }}
          config={{
            displayModeBar: false,
            responsive: true,
            staticPlot: true
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Decomponha o vetor em suas componentes x e y</h2>
        
        <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded mb-4 transition-colors`}>
          <p><strong>Vetor a decompor:</strong> ({round2Decimals(vectorToDecompose.x)}, {round2Decimals(vectorToDecompose.y)})</p>
          <p><strong>Módulo:</strong> {round2Decimals(calculateMagnitude(vectorToDecompose))}</p>
          <p><strong>Ângulo:</strong> {round2Decimals(calculateAngle(vectorToDecompose))}°</p>
          

        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-1 block">Componente X: {round2Decimals(userComponents.x)}</Label>
            <Slider
              min={-10}
              max={10}
              step={0.1}
              value={[userComponents.x]}
              onValueChange={(value) => setUserComponents({...userComponents, x: value[0]})}
            />
          </div>
          
          <div>
            <Label className="mb-1 block">Componente Y: {round2Decimals(userComponents.y)}</Label>
            <Slider
              min={-10}
              max={10}
              step={0.1}
              value={[userComponents.y]}
              onValueChange={(value) => setUserComponents({...userComponents, y: value[0]})}
            />
          </div>
        </div>
      </div>
      
      
      {/* Fix the button layout for better responsive behavior */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 mb-4 gap-4">
        <button
          onClick={onClose}
          className={`
            px-4 py-2 rounded border transition-colors
            bg-transparent w-full sm:w-auto
            ${darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500' 
              : 'border-gray-400 text-gray-600 hover:bg-gray-100 hover:border-gray-500'
            }
          `}
        >
          Voltar
        </button>
        
        <div className="flex flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => generateLevel(level)}
            className={`
              px-4 py-2 rounded border transition-colors
              bg-transparent flex-1 sm:flex-initial text-sm sm:text-base
              ${darkMode 
                ? 'border-yellow-700 text-yellow-400 hover:bg-yellow-900/30 hover:border-yellow-600' 
                : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-600'
              }
            `}
          >
            Novo Problema
          </button>
          
          <button
            onClick={checkAnswer}
            className={`
              px-4 py-2 rounded border transition-colors
              bg-transparent flex-1 sm:flex-initial text-sm sm:text-base
              ${darkMode 
                ? 'border-purple-500 text-purple-300 hover:bg-purple-900/30 hover:border-purple-400' 
                : 'border-purple-600 text-purple-700 hover:bg-purple-50 hover:border-purple-700'
              }
            `}
          >
            Verificar Decomposição
          </button>
        </div>
      </div>
      
      
      {feedback && (
        <div className={`p-3 rounded text-center mb-4 ${
          feedback.includes('Parabéns') 
            ? (darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800')
            : feedback.includes('Quase')
              ? (darkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800')
              : (darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800')
        } transition-colors`}>
          {feedback}
        </div>
      )}

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className={darkMode ? 'bg-gray-800 text-white border border-gray-700' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={darkMode ? 'text-white' : ''}>Parabéns!</AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? 'text-gray-300' : ''}>
              Você decompôs o vetor corretamente!
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
  );
}

export default VectorGame;