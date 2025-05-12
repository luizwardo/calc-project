import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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

function CartesianGame({ onClose }) {
  // Estados
  const [setA, setSetA] = useState([1, 2, 3]);
  const [setB, setSetB] = useState(['a', 'b', 'c']);
  const [userPairs, setUserPairs] = useState([]);
  const [correctPairs, setCorrectPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [alertType, setAlertType] = useState('success'); // 'success', 'incomplete', ou 'incorrect'
  const [selectedA, setSelectedA] = useState(null);
  const [plotData, setPlotData] = useState([]);
  const [jitteredPositions, setJitteredPositions] = useState([]);

  // Inicializar o jogo
  useEffect(() => {
    generateNewSets();
  }, []);

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
    
    // Gerar conjunto B (letras ou símbolos)
    const possibleB = ['A', 'B', 'C', 'D', 'E', 'F',];
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
    setIsComplete(false);
    setSelectedA(null);
  };

  // Gerar pares corretos quando os conjuntos mudarem
  useEffect(() => {
    // Criar todos os pares possíveis do produto cartesiano
    const allPairs = [];
    setA.forEach(a => {
      setB.forEach(b => {
        allPairs.push([a, b]);
      });
    });
    
    // Selecionar um subconjunto aleatório de pares (50% a 80% do total)
    const minPairs = Math.max(3, Math.floor(allPairs.length * 0.5));
    const maxPairs = Math.max(4, Math.floor(allPairs.length * 0.8));
    let numPairs = Math.floor(Math.random() * (maxPairs - minPairs + 1)) + minPairs;
    
    // Se temos muito poucos pares, usar todos
    if (allPairs.length <= 4) {
      numPairs = allPairs.length;
    }
    
    // Embaralhar e pegar um subconjunto
    const shuffled = [...allPairs].sort(() => 0.5 - Math.random());
    const selectedPairs = shuffled.slice(0, numPairs);
    
    setCorrectPairs(selectedPairs);
    
  // Criar posições SEM jitter para os pontos no gráfico (exatamente nas interseções)
  const positions = selectedPairs.map(pair => {
    let yValue;
    if (typeof pair[1] === 'string') {
      if (pair[1].length === 1) {
        const code = pair[1].charCodeAt(0);
        if (code >= 97 && code <= 122) yValue = code - 96;
        else if (code >= 65 && code <= 90) yValue = code - 64;
        else yValue = setB.indexOf(pair[1]) + 1;
      } else {
        yValue = setB.indexOf(pair[1]) + 1;
      }
    } else {
      yValue = pair[1];
    }
    
    return {
      original: pair,
      plotPosition: [pair[0], yValue] // Sem jitter
    };
  });

    setJitteredPositions(positions);
    
    // Preparar dados para o plano cartesiano 
    updatePlotData(positions, []);
  }, [setA, setB]);

  // Função para atualizar os dados do plano cartesiano com jitter
  // Modificar a função updatePlotData para adicionar textos nos pontos
  const updatePlotData = (positions, userSelectedPairs) => {
    // Plotar todos os pontos possíveis (em cinza)
    const allPointsX = positions.map(pos => pos.plotPosition[0]);
    const allPointsY = positions.map(pos => pos.plotPosition[1]);

  // Encontrar posições dos pontos que o usuário selecionou
  const userPositions = userSelectedPairs.map(userPair => 
    positions.find(pos => 
      pos.original[0] === userPair[0] && pos.original[1] === userPair[1]
    )
  ).filter(Boolean);
  
  const userPointsX = userPositions.map(pos => pos.plotPosition[0]);
  const userPointsY = userPositions.map(pos => pos.plotPosition[1]);
  

    // Criar layout do gráfico
  const plotDataArray = [
    {
      x: allPointsX,
      y: allPointsY,
      mode: 'markers', // Removido "text" para não mostrar os rótulos
      type: 'scatter',
      hoverinfo: 'none', 
      marker: {
        color: 'rgba(170, 170, 170, 0.6)',
        size: 12,
        line: {
          color: 'rgba(120, 120, 120, 0.8)',
          width: 1
        }
      },
      name: 'Pares a coletar'
    }
  ];
  
  // Adicionar pontos selecionados pelo usuário se houver
  if (userPointsX.length > 0) {
    plotDataArray.push({
      x: userPointsX,
      y: userPointsY,
      mode: 'markers',
      type: 'scatter',
      hoverinfo: 'none', 
      marker: {
        color: 'rgb(50, 168, 82)',
        size: 14,
        line: {
          color: 'rgb(30, 120, 50)',
          width: 1
        }
      },
      name: 'Seus pares'
    });
  }
  
  setPlotData(plotDataArray);
};

  // Função para adicionar um par
  const addPair = (a, b) => {
    const newPair = [a, b];
    
    // Verificar se o par já existe nas seleções do usuário
    const pairExists = userPairs.some(
      pair => pair[0] === newPair[0] && pair[1] === newPair[1]
    );
    
    // Verificar se o par existe nos pares corretos
    const isValidPair = correctPairs.some(
      pair => pair[0] === newPair[0] && pair[1] === newPair[1]
    );
    
    if (!pairExists && isValidPair) {
      const newUserPairs = [...userPairs, newPair];
      setUserPairs(newUserPairs);
      
      // Atualizar o gráfico
      updatePlotData(jitteredPositions, newUserPairs);
      setFeedback(`Par (${a}, ${b}) adicionado.`);
    } else if (pairExists) {
      setFeedback(`Par (${a}, ${b}) já foi adicionado.`);
    } else if (!isValidPair) {
      setFeedback(`Par (${a}, ${b}) não faz parte dos pares a serem coletados.`);
    }
  };

  // Remover um par
  const removePair = (index) => {
    const newUserPairs = [...userPairs];
    const removedPair = newUserPairs[index];
    newUserPairs.splice(index, 1);
    setUserPairs(newUserPairs);
    
    // Atualizar o gráfico
    updatePlotData(jitteredPositions, newUserPairs);
    setFeedback(`Par (${removedPair[0]}, ${removedPair[1]}) removido.`);
  };

  // Verificar resposta
  const checkAnswer = () => {
    // Verificar se o usuário selecionou todos os pares corretos
    if (userPairs.length !== correctPairs.length) {
      setFeedback(`Você precisa selecionar todos os ${correctPairs.length} pares marcados no gráfico.`);
      setAlertType('incomplete');
      setAlertOpen(true);
      return;
    }
    
    // Verificar se todos os pares estão corretos (deve incluir todos os pares de correctPairs)
    const allCorrect = correctPairs.every(correctPair => 
      userPairs.some(
        userPair => 
          userPair[0] === correctPair[0] && 
          userPair[1] === correctPair[1]
      )
    );
  
    if (allCorrect) {
      const newScore = score + 10;
      setScore(newScore);
      setFeedback('Parabéns! Você encontrou todos os pares corretos!');
      setIsComplete(true);
      setAlertType('success');
      setAlertOpen(true);
    } else {
      setFeedback('Alguns pares não estão corretos. Verifique sua resposta!');
      setAlertType('incorrect');
      setAlertOpen(true);
    }
  };

  // Função para lidar com cliques nos elementos A
  const handleClickA = (value) => {
    setSelectedA(value);
    setFeedback(`Elemento ${value} selecionado. Agora selecione um elemento do conjunto B.`);
  };

  // Função para lidar com cliques nos elementos B
  const handleClickB = (value) => {
    if (selectedA !== null) {
      addPair(selectedA, value);
      setSelectedA(null);
    } else {
      setFeedback("Selecione primeiro um elemento do conjunto A.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div 
          className="top-2 left-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer transition-colors flex items-center justify-center"
          onClick={onClose}
          title="Fechar jogo"
        >
          <span className="text-white text-lg font-bold">×</span>
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-center">Produto Cartesiano: Colete os Pares Marcados</h1>
        
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
          <div className="w-full h-[300px] border-2 border-blue-300 rounded-lg shadow-md mb-6 bg-gray-50">
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                margin: { l: 40, r: 40, b: 40, t: 40 },
                xaxis: {
                  title: 'Conjunto A',
                  range: [0, Math.max(...setA) + 1],
                  tickmode: 'array',
                  tickvals: setA,
                  ticktext: setA.map(String),
                  zeroline: true,
                  gridcolor: '#d0d0d0',
                  gridwidth: 1
                },
                yaxis: {
                  title: 'Conjunto B',
                  range: [0, setB.length + 1],
                  tickmode: 'array',
                  tickvals: setB.map((_, i) => i + 1),
                  ticktext: setB.map(String),
                  zeroline: true,
                  gridcolor: '#d0d0d0',
                  gridwidth: 1
                },
                showlegend: true,
                hovermode: 'closest'
              }}
              config={{ 
                displayModeBar: false, 
                responsive: true 
              }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          </div>
          
          <div className="flex justify-between mb-6">
            <div className="w-1/2 pr-2">
              <h2 className="text-lg font-medium mb-2">Elementos do Conjunto A</h2>
              <div className="flex flex-wrap gap-2">
                {setA.map(a => (
                  <div
                    key={`a-${a}`}
                    className={`
                      px-3 py-2 border rounded cursor-pointer
                      ${selectedA === a ? 'bg-blue-300 border-blue-500' : 'bg-blue-100 border-blue-300'}
                      hover:bg-blue-200 transition-colors
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
                      px-3 py-2 border rounded cursor-pointer
                      bg-purple-100 border-purple-300 hover:bg-purple-200 
                      transition-colors
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
            <p className="mb-2">Selecione um elemento de A e depois um de B para formar os pares marcados no gráfico.</p>
            <p className={`font-medium mb-4 ${userPairs.length === correctPairs.length ? 'text-green-600' : 'text-orange-500'}`}>
              Pares selecionados: {userPairs.length} / {correctPairs.length}
              {userPairs.length === correctPairs.length && ' ✓'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4 min-h-[60px]">
              {userPairs.map((pair, index) => (
                <div 
                  key={index}
                  className="px-3 py-2 bg-green-100 border border-green-300 rounded flex items-center"
                >
                  <span>({pair[0]}, {pair[1]})</span>
                  <button 
                    className="ml-2 text-red-500 hover:text-red-700" 
                    onClick={() => removePair(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={generateNewSets}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Nova Questão
          </button>
          
          <button
            onClick={checkAnswer}
            disabled={userPairs.length !== correctPairs.length}
            className={`px-4 py-2 text-white rounded 
              ${userPairs.length === correctPairs.length 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-300 cursor-not-allowed'}`}
          >
            Verificar Resposta
          </button>
        </div>
        
        {feedback && (
          <div className={`p-3 rounded text-center mb-4 ${
            feedback.includes('Parabéns') || feedback.includes('adicionado')
              ? 'bg-green-100 text-green-800' 
              : feedback.includes('Selecione') || feedback.includes('selecionado')
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {feedback}
          </div>
        )}

        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {alertType === 'success' 
                  ? 'Parabéns!' 
                  : alertType === 'incomplete' 
                    ? 'Resposta Incompleta' 
                    : 'Resposta Incorreta'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {alertType === 'success' 
                  ? 'Você coletou corretamente todos os pares marcados no gráfico.' 
                  : alertType === 'incomplete'
                    ? `Você precisa coletar todos os ${correctPairs.length} pares marcados no gráfico.`
                    : 'Alguns dos pares selecionados não correspondem aos pares a serem coletados.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => {
                setAlertOpen(false);
                if (alertType === 'success') {
                  generateNewSets();
                }
              }}>
                {alertType === 'success' ? 'Próxima questão' : 'Tentar novamente'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>      
      </div>
    </DndProvider>
  );
}

export default CartesianGame;