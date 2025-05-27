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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Função para gerar um número aleatório dentro de um intervalo
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Função para gerar pontos x,y para um gráfico
const generatePoints = (func, min, max, steps) => {
  const x = [];
  const y = [];
  const step = (max - min) / steps;
  
  for (let i = 0; i <= steps; i++) {
    const xVal = min + i * step;
    const yVal = func(xVal);
    
    // Verifica se o valor é um número finito
    if (isFinite(yVal)) {
      x.push(xVal);
      y.push(yVal);
    }
  }
  
  return { x, y };
};

// Funções predefinidas para o jogo
const functionTemplates = [
  {
    name: "Linear",
    generate: () => {
      const a = getRandomNumber(-5, 5);
      const b = getRandomNumber(-10, 10);
      return {
        func: (x) => a * x + b,
        equation: `f(x) = ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`,
        coefficients: {
          a: a,
          b: b
        },
        type: "linear"
      };
    }
  },
  {
    name: "Quadrática",
    generate: () => {
      let a = getRandomNumber(-3, 3);
      if (a === 0) a = 1; // Agora funciona
      const b = getRandomNumber(-5, 5);
      const c = getRandomNumber(-10, 10);
      return {
        func: (x) => a * x * x + b * x + c,
        equation: `f(x) = ${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`,
        coefficients: {
          a: a,
          b: b,
          c: c
        },
        type: "quadratic"
      };
    }
  },
  {
    name: "Seno",
    generate: () => {
      const a = getRandomNumber(1, 3);
      const b = getRandomNumber(1, 3) / 2;
      const c = getRandomNumber(0, 4);
      return {
        func: (x) => a * Math.sin(b * x + c),
        equation: `f(x) = ${a}sin(${b}x ${c > 0 ? '+ ' + c : c < 0 ? '- ' + Math.abs(c) : ''})`,
        coefficients: {
          a: a,
          b: b,
          c: c
        },
        type: "sine"
      };
    }
  },
  {
    name: "Exponencial",
    generate: () => {
      const a = getRandomNumber(1, 3);
      const b = getRandomNumber(1, 3) / 10;
      return {
        func: (x) => a * Math.exp(b * x),
        equation: `f(x) = ${a}e^(${b}x)`,
        coefficients: {
          a: a,
          b: b
        },
        type: "exponential"
      };
    }
  }
];

function FunctionGame({ onClose, darkMode }) {
  // Estados para controle do jogo
  const [currentFunction, setCurrentFunction] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [gameMode, setGameMode] = useState('quiz'); // quiz ou construct
  
  // Estados para o modo de construção
  const [userCoefficients, setUserCoefficients] = useState({
    a: 1,
    b: 0,
    c: 0
  });
  const [functionType, setFunctionType] = useState('linear');
  
  // Gera uma nova função e opções
  const generateNewProblem = useCallback(() => {
    // Escolhe um tipo de função aleatoriamente
    const functionIndex = getRandomNumber(0, functionTemplates.length - 1);
    const targetFunction = functionTemplates[functionIndex].generate();
    setCurrentFunction(targetFunction);
    
    if (gameMode === 'quiz') {
      // Gera opções incorretas
      const numOptions = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
      const newOptions = [targetFunction];
      
      while (newOptions.length < numOptions) {
        const randomFunctionIndex = getRandomNumber(0, functionTemplates.length - 1);
        const newOption = functionTemplates[randomFunctionIndex].generate();
        
        // Verifica se a opção já não existe nas opções
        if (!newOptions.some(opt => opt.equation === newOption.equation)) {
          newOptions.push(newOption);
        }
      }
      
      // Embaralha as opções
      setOptions(newOptions.sort(() => Math.random() - 0.5));
    } else {
      // Modo de construção: define os coeficientes iniciais
      setFunctionType(targetFunction.type);
      setUserCoefficients(targetFunction.coefficients);
    }
    
    setSelectedOption(null);
    setFeedback('');
  }, [difficulty, gameMode]);
  
  // Inicializa o jogo
  useEffect(() => {
    generateNewProblem();
  }, [generateNewProblem]);
  
  // Verifica a resposta do jogador no modo quiz
  const checkAnswer = () => {
    if (!selectedOption) {
      setFeedback('Por favor, selecione uma opção.');
      return;
    }
    
    const isCorrect = selectedOption.equation === currentFunction.equation;
    
    if (isCorrect) {
      setIsComplete(true);
      setAlertOpen(true);
    } else {
      setFeedback('Incorreto. Tente novamente!');
    }
  };
  
  // Verifica a resposta no modo de construção
  const checkConstruction = () => {
    // Compara os coeficientes do usuário com os da função original
    const correctCoeffs = currentFunction.coefficients;
    let isClose = true;
    
    
    Object.keys(correctCoeffs).forEach(key => {
      if (userCoefficients[key] !== undefined) {
        const diff = Math.abs(userCoefficients[key] - correctCoeffs[key]);
        if (diff > 0.5) { // Tolerância para considerar "próximo"
          isClose = false;
        }
      }
    });
    
    if (isClose) {
      setIsComplete(true);
      setAlertOpen(true);
    } else {
      setFeedback('Ainda não está correto. Continue ajustando os coeficientes.');
    }
  };
  
  // Reinicia o jogo após completar um nível
  const handleAlertClose = () => {
    setAlertOpen(false);
    if (isComplete) {
      generateNewProblem();
      setIsComplete(false);
    }
  };
  
  // Função para obter a função do usuário no modo de construção
  const getUserFunction = () => {
    const { a, b, c } = userCoefficients;
    
    switch (functionType) {
    case 'linear': {
      const points = generatePoints((x) => a * x + b, -10, 10, 100);
      return {
        func: (x) => a * x + b,
        x: points.x,
        y: points.y,
        equation: `f(x) = ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`
      };
    }
    case 'quadratic': {
      const points = generatePoints((x) => a * x * x + b * x + c, -10, 10, 100);
      return {
        func: (x) => a * x * x + b * x + c,
        x: points.x,
        y: points.y,
        equation: `f(x) = ${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`
      };
    }
      case 'sine': {
      const points = generatePoints((x) => a * Math.sin(b * x + c), -10, 10, 100);
      return {
        func: (x) => a * Math.sin(b * x + c),
        x: points.x,
        y: points.y,
        equation: `f(x) = ${a}sin(${b}x ${c > 0 ? '+ ' + c : c < 0 ? '- ' + Math.abs(c) : ''})`
      };
    }
      case 'exponential': {
      const points = generatePoints((x) => a * Math.exp(b * x), -10, 10, 100);
      return {
        func: (x) => a * Math.exp(b * x),
        x: points.x,
        y: points.y,
        equation: `f(x) = ${a}e^(${b}x)`
      };
    }
    default:
      return {
        func: (x) => 0,
        x: [-10, 10],
        y: [0, 0],
        equation: "f(x) = 0"
      };
  }
};

  return (
    <div className={`p-6 max-w-4xl mx-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg transition-colors relative`}>
      
        <h1 
          className="text-2xl font-bold mb-4 text-center"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Descubra a Função
        </h1>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-bold mr-2">Modo:</span>
          <div className="flex items-center space-x-2">
            <Switch 
              id="mode-switch"
              checked={gameMode === 'construct'}
              onCheckedChange={(checked) => setGameMode(checked ? 'construct' : 'quiz')}
            />
            <Label htmlFor="mode-switch">{gameMode === 'quiz' ? 'Quiz' : 'Construção'}</Label>
          </div>
        </div>

        {gameMode === 'quiz' && (
          <div>
            <span className="font-bold mr-2">Dificuldade:</span>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`
                p-2 rounded transition-colors
                bg-transparent border
                ${darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50' 
                  : 'border-gray-400 text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <option value="easy" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Fácil</option>
              <option value="medium" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Médio</option>
              <option value="hard" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Difícil</option>
            </select>
          </div>
        )}
      </div>

      {currentFunction && (
        <div className="mb-6">
          <div className={`w-full h-[300px] border-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'} rounded-lg shadow-md mb-6 transition-colors overflow-hidden`}>
            <Plot
        data={(() => {
          // Generate points once and reuse
          const currentFunctionPoints = generatePoints(currentFunction.func, -10, 10, 100);
          const userFunctionData = getUserFunction();
          
          const plotData = [];
          
          if (gameMode === 'quiz') {
            // No modo quiz, mostra apenas a função correta
            plotData.push({
              x: currentFunctionPoints.x,
              y: currentFunctionPoints.y,
              type: 'scatter',
              mode: 'lines',
              line: { color: darkMode ? '#3b82f6' : '#1d4ed8', width: 2 }
            });
          } else {
            // No modo construção, mostra a função que o usuário está construindo
            plotData.push({
              x: userFunctionData.x,
              y: userFunctionData.y,
              type: 'scatter',
              mode: 'lines',
              line: { color: darkMode ? '#3b82f6' : '#1d4ed8', width: 2 }
            });
            
            // Para comparação no modo de construção, mostra a função alvo em pontilhado
            plotData.push({
              x: currentFunctionPoints.x,
              y: currentFunctionPoints.y,
              type: 'scatter',
              mode: 'lines',
              line: { color: darkMode ? '#ef4444' : '#dc2626', width: 2, dash: 'dash' },
              visible: isComplete ? true : 'legendonly',
              name: 'Função alvo'
            });
          }
          
          return plotData;
        })()}
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
            gridcolor: darkMode ? '#4b5563' : '#e5e5e5'
          },
          yaxis: { 
            title: 'y',
            range: [-10, 10],
            zeroline: true,
            gridcolor: darkMode ? '#4b5563' : '#e5e5e5'
          },
          showlegend: gameMode === 'construct' && isComplete
        }}
        config={{ 
          displayModeBar: false,
          responsive: true
        }}
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      />
    </div>

          {gameMode === 'quiz' ? (
            // MODO QUIZ: Mostra opções de equações
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Qual é a equação deste gráfico?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {options.map((option, index) => (
                  <button
                    key={index}
                    className={`
                      p-3 border-2 text-lg rounded-lg transition-colors
                      bg-transparent
                      ${selectedOption === option 
                        ? (darkMode 
                            ? 'border-blue-500 text-blue-300 bg-blue-900/20' 
                            : 'border-blue-500 text-blue-700 bg-blue-50')
                        : (darkMode 
                            ? 'border-gray-600 text-gray-300 hover:border-blue-400 hover:bg-blue-900/10' 
                            : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50')
                      }
                    `}
                    onClick={() => setSelectedOption(option)}
                  >
                    {option.equation}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // MODO CONSTRUÇÃO: Controles para ajustar a função
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Construa a função</h2>
                <select
                  value={functionType}
                  onChange={(e) => setFunctionType(e.target.value)}
                  className={`
                    p-2 rounded transition-colors
                    bg-transparent border
                    ${darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50' 
                      : 'border-gray-400 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <option value="linear" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Linear</option>
                  <option value="quadratic" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Quadrática</option>
                  <option value="sine" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Seno</option>
                  <option value="exponential" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Exponencial</option>
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-1 block">Coeficiente a: {userCoefficients.a.toFixed(1)}</Label>
                  <Slider 
                    min={-5} 
                    max={5} 
                    step={0.1}
                    value={[userCoefficients.a]} 
                    onValueChange={(value) => setUserCoefficients({...userCoefficients, a: value[0]})}
                  />
                </div>

                <div>
                  <Label className="mb-1 block">Coeficiente b: {userCoefficients.b.toFixed(1)}</Label>
                  <Slider 
                    min={-5} 
                    max={5} 
                    step={0.1}
                    value={[userCoefficients.b]} 
                    onValueChange={(value) => setUserCoefficients({...userCoefficients, b: value[0]})}
                  />
                </div>

                {functionType === 'quadratic' && (
                  <div>
                    <Label className="mb-1 block">Coeficiente c: {userCoefficients.c.toFixed(1)}</Label>
                    <Slider 
                      min={-10} 
                      max={10} 
                      step={0.1}
                      value={[userCoefficients.c]} 
                      onValueChange={(value) => setUserCoefficients({...userCoefficients, c: value[0]})}
                    />
                  </div>
                )}

                {functionType === 'sine' && (
                  <div>
                    <Label className="mb-1 block">Fase c: {userCoefficients.c.toFixed(1)}</Label>
                    <Slider 
                      min={-Math.PI} 
                      max={Math.PI} 
                      step={0.1}
                      value={[userCoefficients.c]} 
                      onValueChange={(value) => setUserCoefficients({...userCoefficients, c: value[0]})}
                    />
                  </div>
                )}
              </div>

              <div className={`
                mt-3 p-2 rounded text-center
                ${darkMode 
                  ? 'bg-gray-700/50 border border-gray-600' 
                  : 'bg-gray-100 border border-gray-200'
                }
              `}>
                <p className="text-center text-lg font-medium">
                  {getUserFunction().equation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      
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
            onClick={() => generateNewProblem()}
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
            onClick={gameMode === 'quiz' ? checkAnswer : checkConstruction}
            className={`
              px-4 py-2 rounded border transition-colors
              bg-transparent flex-1 sm:flex-initial text-sm sm:text-base
              ${darkMode 
                ? 'border-purple-500 text-purple-300 hover:bg-purple-900/30 hover:border-purple-400' 
                : 'border-purple-600 text-purple-700 hover:bg-purple-50 hover:border-purple-700'
              }
            `}
          >
            {gameMode === 'quiz' ? 'Verificar Resposta' : 'Verificar Construção'}
          </button>
        </div>
      </div>
            
      {feedback && (
        <div className={`p-3 rounded text-center mb-4 transition-colors ${
          feedback.includes('Correto') || feedback.includes('bom') 
            ? (darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800')
            : (darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800')
        }`}>
          {feedback}
        </div>
      )}

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className={darkMode ? 'bg-gray-800 text-white border border-gray-700' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={darkMode ? 'text-white' : ''}>
              Parabéns!
            </AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? 'text-gray-300' : ''}>
              {gameMode === 'quiz' 
                ? 'Você identificou a função corretamente!' 
                : 'Você construiu a função corretamente!'}
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

export default FunctionGame;