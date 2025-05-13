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

function VectorGame({ onClose }) {
  // Estados para o jogo
  const [level, setLevel] = useState(1);
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
    
    // Configuração do plano cartesiano
    plotData.push({
      x: [-10, 10],
      y: [0, 0],
      mode: 'lines',
      line: { color: 'rgba(0, 0, 0, 0.3)', width: 1 },
      hoverinfo: 'none',
      showlegend: false
    });
    
    plotData.push({
      x: [0, 0],
      y: [-10, 10],
      mode: 'lines',
      line: { color: 'rgba(0, 0, 0, 0.3)', width: 1 },
      hoverinfo: 'none',
      showlegend: false
    });
    
    // Mostrar vetor a ser decomposto
    plotData.push({
      x: [0, vectorToDecompose.x],
      y: [0, vectorToDecompose.y],
      mode: 'lines+markers',
      line: { color: 'purple', width: 3 },
      marker: { size: 8, symbol: 'circle' },
      name: `Vetor (${vectorToDecompose.x}, ${vectorToDecompose.y})`,
      hoverinfo: 'name'
    });
    
    // Mostrar componentes do usuário
    plotData.push({
      x: [0, userComponents.x],
      y: [0, 0],
      mode: 'lines+markers',
      line: { color: 'red', width: 2 },
      marker: { size: 6, symbol: 'circle' },
      name: `Componente X: ${round2Decimals(userComponents.x)}`,
      hoverinfo: 'name'
    });
    
    plotData.push({
      x: [userComponents.x, userComponents.x],
      y: [0, userComponents.y],
      mode: 'lines+markers',
      line: { color: 'blue', width: 2 },
      marker: { size: 6, symbol: 'circle' },
      name: `Componente Y: ${round2Decimals(userComponents.y)}`,
      hoverinfo: 'name'
    });
    
    // Mostrar vetor resultante da decomposição do usuário
    plotData.push({
      x: [0, userComponents.x],
      y: [0, userComponents.y],
      mode: 'lines',
      line: { color: 'green', width: 2, dash: 'dash' },
      name: `Vetor Resultante: (${round2Decimals(userComponents.x)}, ${round2Decimals(userComponents.y)})`,
      hoverinfo: 'name'
    });
    
    return plotData;
  };

  // Lidar com o próximo nível
  const handleNextLevel = () => {
    setLevel(level + 1);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div 
        className="top-2 left-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer transition-colors flex items-center justify-center"
        onClick={onClose}
        title="Fechar jogo"
      >
        <span className="text-white text-lg font-bold">×</span>
      </div>
      
      <h1 className="text-2xl font-bold mb-4 text-center">Decomposição Vetorial</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="font-bold mr-2">Nível:</span>
          <span className="text-lg">{level}</span>
        </div>
      </div>
      
      {/* Plano Cartesiano */}
      <div className="w-full h-[350px] border-2 border-blue-300 rounded-lg shadow-md mb-6 bg-gray-50">
        <Plot
          ref={plotRef}
          data={getPlotData()}
          layout={{
            autosize: true,
            margin: { l: 40, r: 40, b: 40, t: 40 },
            xaxis: {
              title: 'x',
              range: [-10, 10],
              zeroline: true,
              gridcolor: '#d0d0d0',
              gridwidth: 1
            },
            yaxis: {
              title: 'y',
              range: [-10, 10],
              zeroline: true,
              gridcolor: '#d0d0d0',
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
        
        <div className="p-3 bg-gray-100 rounded mb-4">
          <p><strong>Vetor a decompor:</strong> ({round2Decimals(userComponents.x)}, {round2Decimals(userComponents.y)}) </p>
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
      
      <div className="flex justify-between items-center mt-6 mb-4">
        <button
          onClick={() => generateLevel(level)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Novo Problema
        </button>
        
        <button
          onClick={checkAnswer}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Verificar Decomposição
        </button>
      </div>
      
      {feedback && (
        <div className={`p-3 rounded text-center mb-4 ${
          feedback.includes('Parabéns') 
            ? 'bg-green-100 text-green-800'
            : feedback.includes('Quase')
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
        }`}>
          {feedback}
        </div>
      )}

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Parabéns!</AlertDialogTitle>
            <AlertDialogDescription>
              Você decompôs o vetor corretamente!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setAlertOpen(false);
              handleNextLevel();
            }}>
              Próximo nível
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default VectorGame;