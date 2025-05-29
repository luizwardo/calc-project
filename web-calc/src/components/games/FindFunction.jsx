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
import { FunctionSquare, Play, RotateCcw, Check, Settings } from 'lucide-react';

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
        func: () => 0,
        x: [-10, 10],
        y: [0, 0],
        equation: "f(x) = 0"
      };
  }
};

  return (
  <div className={`min-h-screen p-2 md:p-4 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} transition-all duration-300`}>
    <div className={`max-w-7xl mx-auto ${darkMode ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white/90 border border-gray-200/50'} rounded-xl shadow-2xl backdrop-blur-lg transition-all duration-300`}>
      
      {/* Header Section - Compacto */}
      <div className={`p-4 md:p-6 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
        <div className="flex items-center justify-center mb-4">
          <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'} mr-3`}>
            <FunctionSquare className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h1 
            className={`text-2xl md:text-3xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Descubra a Função
          </h1>
        </div>

        {/* Game Mode and Difficulty Controls - Compactos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'} backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Modo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="mode-switch" className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  {gameMode === 'quiz' ? 'Quiz' : 'Construção'}
                </Label>
                <Switch 
                  id="mode-switch"
                  checked={gameMode === 'construct'}
                  onCheckedChange={(checked) => setGameMode(checked ? 'construct' : 'quiz')}
                />
              </div>
            </div>
          </div>

          {gameMode === 'quiz' && (
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/30' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Dificuldade</span>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`
                    px-2 py-1 text-xs rounded-lg transition-colors font-medium
                    ${darkMode 
                      ? 'bg-green-900/30 border border-green-700/50 text-green-300 hover:bg-green-800/40' 
                      : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'
                    }
                  `}
                >
                  <option value="easy" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Fácil</option>
                  <option value="medium" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Médio</option>
                  <option value="hard" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Difícil</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div className="p-4 md:p-6">
        {currentFunction && (
          <>
            {/* Graph Section - Layout em Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Plano Cartesiano - Mais compacto */}
              <div className="lg:col-span-2">
                <div className={`relative w-full h-[300px] md:h-[350px] ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/50' : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'} rounded-xl shadow-inner mb-4 overflow-hidden`}>
                  <Plot
                    data={(() => {
                      const currentFunctionPoints = generatePoints(currentFunction.func, -10, 10, 100);
                      const userFunctionData = getUserFunction();
                      
                      const plotData = [];
                      
                      if (gameMode === 'quiz') {
                        plotData.push({
                          x: currentFunctionPoints.x,
                          y: currentFunctionPoints.y,
                          type: 'scatter',
                          mode: 'lines',
                          line: { color: darkMode ? '#3b82f6' : '#1d4ed8', width: 3 },
                          name: 'Função Mistério'
                        });
                      } else {
                        plotData.push({
                          x: userFunctionData.x,
                          y: userFunctionData.y,
                          type: 'scatter',
                          mode: 'lines',
                          line: { color: darkMode ? '#3b82f6' : '#1d4ed8', width: 3 },
                          name: 'Sua Função'
                        });
                        
                        plotData.push({
                          x: currentFunctionPoints.x,
                          y: currentFunctionPoints.y,
                          type: 'scatter',
                          mode: 'lines',
                          line: { color: darkMode ? '#ef4444' : '#dc2626', width: 3, dash: 'dash' },
                          visible: isComplete ? true : 'legendonly',
                          name: 'Função Alvo'
                        });
                      }
                      
                      return plotData;
                    })()}
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
                        zerolinewidth: 2
                      },
                      showlegend: gameMode === 'construct' && isComplete
                    }}
                    config={{ 
                      displayModeBar: false,
                      responsive: true
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
                
                {gameMode === 'construct' && (
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200'} backdrop-blur-sm`}>
                    <select
                      value={functionType}
                      onChange={(e) => setFunctionType(e.target.value)}
                      className={`
                        w-full px-3 py-2 text-sm rounded-lg font-medium transition-colors
                        ${darkMode 
                          ? 'bg-purple-900/30 border border-purple-700/50 text-purple-300 hover:bg-purple-800/40' 
                          : 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-50'
                        }
                      `}
                    >
                      <option value="linear" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Linear</option>
                      <option value="quadratic" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Quadrática</option>
                      <option value="sine" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Seno</option>
                      <option value="exponential" className={darkMode ? 'bg-gray-800' : 'bg-white'}>Exponencial</option>
                    </select>
                  </div>
                )}

                {/* Sliders para Construção */}
                {gameMode === 'construct' && (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'}`}>
                      <Label className={`mb-2 block text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        a: {userCoefficients.a.toFixed(1)}
                      </Label>
                      <Slider 
                        min={-5} 
                        max={5} 
                        step={0.1}
                        value={[userCoefficients.a]} 
                        onValueChange={(value) => setUserCoefficients({...userCoefficients, a: value[0]})}
                        className="mt-1"
                      />
                    </div>

                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-700/30' : 'bg-green-50 border border-green-200'}`}>
                      <Label className={`mb-2 block text-sm font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        b: {userCoefficients.b.toFixed(1)}
                      </Label>
                      <Slider 
                        min={-5} 
                        max={5} 
                        step={0.1}
                        value={[userCoefficients.b]} 
                        onValueChange={(value) => setUserCoefficients({...userCoefficients, b: value[0]})}
                        className="mt-1"
                      />
                    </div>

                    {(functionType === 'quadratic' || functionType === 'sine') && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-700/30' : 'bg-purple-50 border border-purple-200'}`}>
                        <Label className={`mb-2 block text-sm font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          c: {userCoefficients.c.toFixed(1)}
                        </Label>
                        <Slider 
                          min={functionType === 'sine' ? -Math.PI : -10} 
                          max={functionType === 'sine' ? Math.PI : 10} 
                          step={0.1}
                          value={[userCoefficients.c]} 
                          onValueChange={(value) => setUserCoefficients({...userCoefficients, c: value[0]})}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Equação atual */}
                {gameMode === 'construct' && (
                  <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-800/50 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {getUserFunction().equation}
                    </p>
                  </div>
                )}

                {/* Action Buttons - Compactos */}
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => generateNewProblem()}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2
                      ${darkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-600/25' 
                        : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-600/25'
                      }
                    `}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Novo</span>
                  </button>
                  
                  <button
                    onClick={gameMode === 'quiz' ? checkAnswer : checkConstruction}
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

            {/* Quiz Options - Compacto */}
            {gameMode === 'quiz' && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200'} backdrop-blur-sm mt-4`}>
                <h2 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Qual é a equação?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      className={`
                        p-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95
                        ${selectedOption === option 
                          ? (darkMode 
                              ? 'bg-blue-500/20 border-2 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/25' 
                              : 'bg-blue-100 border-2 border-blue-500 text-blue-700 shadow-lg shadow-blue-500/25')
                          : (darkMode 
                              ? 'bg-gray-800/50 border border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500' 
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm')
                        }
                      `}
                      onClick={() => setSelectedOption(option)}
                    >
                      {option.equation}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Section - Compacto */}
            {feedback && (
              <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium backdrop-blur-sm transition-all duration-300 ${
                feedback.includes('Correto') || feedback.includes('bom') 
                  ? (darkMode ? 'bg-gradient-to-r from-green-900/50 to-green-800/30 text-green-200 border border-green-700/50' : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300')
                  : (darkMode ? 'bg-gradient-to-r from-red-900/50 to-red-800/30 text-red-200 border border-red-700/50' : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300')
              } shadow-sm`}>
                {feedback}
              </div>
            )}
          </>
        )}
      </div>
    </div>

    {/* Alert Dialog mantido igual */}
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogContent className={`${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl backdrop-blur-lg`}>
        <AlertDialogHeader>
          <AlertDialogTitle className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            🎉 Parabéns!
          </AlertDialogTitle>
          <AlertDialogDescription className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {gameMode === 'quiz' 
              ? 'Você identificou a função corretamente!' 
              : 'Você construiu a função corretamente!'}
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

export default FunctionGame;