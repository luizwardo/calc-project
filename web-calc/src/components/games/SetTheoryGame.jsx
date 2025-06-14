import React, { useState, useEffect,} from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Play, Square, Check, RotateCcw, Trophy, Target, BookOpen } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Draggable Element Component
const DraggableElement = ({ element, darkMode, isPlaced, originalSet }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { element, originalSet },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`
        px-3 py-2 rounded-lg text-sm font-semibold cursor-move transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${isPlaced
          ? (darkMode ? 'bg-gray-700 text-gray-400 border border-gray-600' : 'bg-gray-200 text-gray-500 border border-gray-300')
          : (darkMode ? 'bg-gray-600 text-gray-100 border border-gray-500 hover:bg-gray-500' : 'bg-blue-500 text-white border border-blue-600 hover:bg-blue-600')
        }
        shadow-sm hover:shadow-md transform hover:scale-105
      `}
      style={{
        cursor: isPlaced ? 'not-allowed' : 'move'
      }}
    >
      {element}
    </div>
  );
};

// Droppable Circle Component
const DroppableCircle = ({ setName, elements, onDrop, darkMode, color }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item) => onDrop(item.element, setName, item.originalSet),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const getCircleColor = () => {
    if (color === 'A') return darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)';
    if (color === 'B') return darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)';
    if (color === 'C') return darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)';
    return darkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.2)';
  };

  const getBorderColor = () => {
    if (color === 'A') return darkMode ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.5)';
    if (color === 'B') return darkMode ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.5)';
    if (color === 'C') return darkMode ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.5)';
    return darkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(156, 163, 175, 0.5)';
  };

  return (
    <div
      ref={drop}
      className={`
        relative w-40 h-40 rounded-full border-4 border-dashed flex flex-col items-center justify-center p-4 transition-all duration-300
        ${isOver && canDrop ? 'scale-110 shadow-lg' : 'scale-100'}
      `}
      style={{
        backgroundColor: getCircleColor(),
        borderColor: getBorderColor(),
        boxShadow: isOver && canDrop ? `0 0 20px ${getBorderColor()}` : 'none'
      }}
    >
      {/* Set Label */}
      <div className={`absolute -top-8 font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Conjunto {setName}
      </div>
      
      {/* Elements in this set */}
      <div className="flex flex-wrap gap-1 justify-center items-center h-full">
        {elements.map((element, index) => (
          <div
            key={index}
            className={`
              px-2 py-1 rounded text-xs font-semibold
              ${darkMode ? 'bg-gray-800 text-gray-200 border border-gray-600' : 'bg-white text-gray-700 border border-gray-300'}
              shadow-sm
            `}
          >
            {element}
          </div>
        ))}
      </div>
      
      {/* Drop indicator */}
      {isOver && canDrop && (
        <div className={`absolute inset-0 rounded-full border-4 border-solid animate-pulse`}
          style={{ borderColor: getBorderColor() }}
        />
      )}
    </div>
  );
};

// Droppable Area Component for Venn Diagram sections (Visual Only)
const DroppableArea = ({ areaId, onDrop, darkMode, areaStyle, label, setColor }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item, monitor) => {
      if (monitor.didDrop()) return; // Prevent multiple drops
      onDrop(item.element, areaId, item.originalSet);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [areaId, onDrop]);
  
  // Set color mapping
  const getAreaColor = () => {
    if (setColor === 'A') return darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
    if (setColor === 'B') return darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)';
    if (setColor === 'C') return darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)';
    if (setColor === 'AB') return darkMode ? 'rgba(236, 133, 82, 0.15)' : 'rgba(236, 133, 82, 0.1)';
    if (setColor === 'AC') return darkMode ? 'rgba(149, 99, 157, 0.15)' : 'rgba(149, 99, 157, 0.1)';
    if (setColor === 'BC') return darkMode ? 'rgba(46, 164, 170, 0.15)' : 'rgba(46, 164, 170, 0.1)';
    if (setColor === 'ABC') return darkMode ? 'rgba(150, 150, 150, 0.2)' : 'rgba(150, 150, 150, 0.15)';
    return darkMode ? 'rgba(55, 65, 81, 0.1)' : 'rgba(243, 244, 246, 0.3)';
  };
  
  const getBorderColor = () => {
    if (setColor === 'A') return darkMode ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.8)';
    if (setColor === 'B') return darkMode ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.8)';
    if (setColor === 'C') return darkMode ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.8)';
    if (setColor === 'AB') return darkMode ? 'rgba(236, 133, 82, 0.6)' : 'rgba(236, 133, 82, 0.8)';
    if (setColor === 'AC') return darkMode ? 'rgba(149, 99, 157, 0.6)' : 'rgba(149, 99, 157, 0.8)';
    if (setColor === 'BC') return darkMode ? 'rgba(46, 164, 170, 0.6)' : 'rgba(46, 164, 170, 0.8)';
    if (setColor === 'ABC') return darkMode ? 'rgba(150, 150, 150, 0.6)' : 'rgba(150, 150, 150, 0.8)';
    return darkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(156, 163, 175, 0.5)';
  };

  return (
    <div
      ref={drop}
      className={`
        absolute flex items-center justify-center transition-all duration-300
        ${isOver && canDrop ? 'scale-105' : 'scale-100'}
        border-2 border-dashed
      `}
      style={{
        ...areaStyle,
        backgroundColor: isOver && canDrop 
          ? (darkMode ? `${getBorderColor().replace('0.6', '0.3')}` : `${getBorderColor().replace('0.8', '0.2')}`)
          : getAreaColor(),
        borderColor: isOver && canDrop 
          ? getBorderColor()
          : (darkMode ? `${getBorderColor().replace('0.6', '0.4')}` : `${getBorderColor().replace('0.8', '0.5')}`),
        pointerEvents: 'auto'
      }}
    >
      {/* Area Label - Only show when hovering */}
      {label && (
        <div className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} pointer-events-none text-center opacity-70`}>
          {label}
        </div>
      )}
    </div>
  );
};

// Sidebar Classification Area Component
const SidebarArea = ({ areaId, elements, onDrop, darkMode, label, setColor }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item) => onDrop(item.element, areaId, item.originalSet),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const safeElements = elements || [];
  
  const getAreaColor = () => {
    if (setColor === 'A') return darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
    if (setColor === 'B') return darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)';
    if (setColor === 'C') return darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)';
    if (setColor === 'AB') return darkMode ? 'rgba(236, 133, 82, 0.15)' : 'rgba(236, 133, 82, 0.1)';
    if (setColor === 'AC') return darkMode ? 'rgba(149, 99, 157, 0.15)' : 'rgba(149, 99, 157, 0.1)';
    if (setColor === 'BC') return darkMode ? 'rgba(46, 164, 170, 0.15)' : 'rgba(46, 164, 170, 0.1)';
    if (setColor === 'ABC') return darkMode ? 'rgba(150, 150, 150, 0.2)' : 'rgba(150, 150, 150, 0.15)';
    return darkMode ? 'rgba(55, 65, 81, 0.1)' : 'rgba(243, 244, 246, 0.3)';
  };
  
  const getBorderColor = () => {
    if (setColor === 'A') return darkMode ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.8)';
    if (setColor === 'B') return darkMode ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.8)';
    if (setColor === 'C') return darkMode ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.8)';
    if (setColor === 'AB') return darkMode ? 'rgba(236, 133, 82, 0.6)' : 'rgba(236, 133, 82, 0.8)';
    if (setColor === 'AC') return darkMode ? 'rgba(149, 99, 157, 0.6)' : 'rgba(149, 99, 157, 0.8)';
    if (setColor === 'BC') return darkMode ? 'rgba(46, 164, 170, 0.6)' : 'rgba(46, 164, 170, 0.8)';
    if (setColor === 'ABC') return darkMode ? 'rgba(150, 150, 150, 0.6)' : 'rgba(150, 150, 150, 0.8)';
    return darkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(156, 163, 175, 0.5)';
  };

  return (
    <div
      ref={drop}
      className={`
        flex flex-wrap gap-1 items-start p-3 min-h-[60px] rounded-lg border-2 border-dashed transition-all duration-300
        ${isOver && canDrop ? 'scale-102' : 'scale-100'}
      `}
      style={{
        backgroundColor: isOver && canDrop 
          ? (darkMode ? `${getBorderColor().replace('0.6', '0.3')}` : `${getBorderColor().replace('0.8', '0.2')}`)
          : getAreaColor(),
        borderColor: isOver && canDrop 
          ? getBorderColor()
          : (darkMode ? `${getBorderColor().replace('0.6', '0.4')}` : `${getBorderColor().replace('0.8', '0.5')}`),
      }}
    >
      <div className={`w-full mb-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label} ({safeElements.length})
      </div>
      
      {/* Elements in this area */}
      <div className="flex flex-wrap gap-1 w-full">
        {safeElements.map((element, index) => (
          <DraggableElement
            key={`${areaId}-${element}-${index}`}
            element={element}
            darkMode={darkMode}
            isPlaced={false}
            originalSet={areaId}
          />
        ))}
      </div>
      
      {safeElements.length === 0 && (
        <div className={`text-center w-full py-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Arraste elementos aqui
        </div>
      )}
    </div>
  );
};

function SetTheoryGame({ darkMode }) {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [availableElements, setAvailableElements] = useState([]);
  const [placedElements, setPlacedElements] = useState({
    onlyA: [], onlyB: [], onlyC: [],
    AB: [], AC: [], BC: [],
    ABC: [], outside: []
  });
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [problemIndex, setProblemIndex] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('success');

  // Problems database with Venn diagram logic
  const problems = [
    {
      id: 1,
      description: "A = {números pares}, B = {números < 8}, C = {múltiplos de 3}",
      elements: [2, 3, 4, 6, 8, 9, 10, 12, 15, 18],
      solution: {
        onlyA: [10], // apenas pares e >= 8 e não múltiplos de 3
        onlyB: [], // não há elementos que são só < 8
        onlyC: [9, 15], // apenas múltiplos de 3 e >= 8 e ímpares
        AB: [2, 4, 8], // pares e < 8 mas não múltiplos de 3
        AC: [12, 18], // pares e múltiplos de 3 mas >= 8
        BC: [3], // < 8 e múltiplos de 3 mas ímpares
        ABC: [6], // pares e < 8 e múltiplos de 3
        outside: [] // não pertence a nenhum conjunto
      },
      explanation: "Classifique os números conforme suas propriedades: pares, menores que 8, múltiplos de 3"
    },
    {
      id: 2,
      description: "A = {vogais}, B = {consoantes}, C = {letras da palavra 'CASA'}",
      elements: ['A', 'C', 'S', 'E', 'I', 'O', 'B', 'T', 'R'],
      solution: {
        onlyA: ['E', 'I', 'O'], // vogais não em CASA
        onlyB: ['B', 'T', 'R'], // consoantes não em CASA
        onlyC: [], // não há letras só em CASA
        AB: [], // impossível ser vogal E consoante
        AC: ['A'], // vogal em CASA
        BC: ['C', 'S'], // consoantes em CASA
        ABC: [], // impossível ser vogal E consoante
        outside: [] // todas as letras são vogais ou consoantes
      },
      explanation: "Classifique as letras como vogais, consoantes e se estão em 'CASA'"
    }
  ];

  // Initialize game
  useEffect(() => {
    if (problems.length > 0) {
      loadProblem(0);
    }
  }, []);

  const loadProblem = (index) => {
    const problem = problems[index % problems.length];
    setCurrentProblem(problem);
    setAvailableElements([...problem.elements]);
    setPlacedElements({
      onlyA: [], onlyB: [], onlyC: [],
      AB: [], AC: [], BC: [],
      ABC: [], outside: []
    });
    setFeedback(`Problema ${index + 1}: ${problem.description}`);
    setProblemIndex(index);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    loadProblem(0);
    setFeedback('Jogo iniciado! Arraste os elementos para as áreas corretas do diagrama de Venn.');
  };

  const stopGame = () => {
    setGameStarted(false);
    setFeedback('');
    setAvailableElements([]);
    setPlacedElements({
      onlyA: [], onlyB: [], onlyC: [],
      AB: [], AC: [], BC: [],
      ABC: [], outside: []
    });
  };

  const handleDrop = (element, targetArea, originalSet) => {
    if (!gameStarted) return;

    // Check if element is already in the target area
    if (placedElements[targetArea].includes(element)) {
      setFeedback(`Elemento "${element}" já está nesta área!`);
      return;
    }

    // Remove element from available elements if coming from there
    if (originalSet === 'available') {
      setAvailableElements(prev => prev.filter(el => el !== element));
    } else {
      // Remove from previous area if moving between areas
      setPlacedElements(prev => ({
        ...prev,
        [originalSet]: prev[originalSet].filter(el => el !== element)
      }));
    }
    
    // Add element to target area
    setPlacedElements(prev => ({
      ...prev,
      [targetArea]: [...prev[targetArea], element]
    }));

    const areaLabels = {
      onlyA: 'Apenas A',
      onlyB: 'Apenas B', 
      onlyC: 'Apenas C',
      AB: 'A ∩ B',
      AC: 'A ∩ C',
      BC: 'B ∩ C',
      ABC: 'A ∩ B ∩ C',
      outside: 'Fora dos conjuntos'
    };

    setFeedback(`Elemento "${element}" adicionado à área: ${areaLabels[targetArea]}`);
  };

  const checkAnswer = () => {
    if (!gameStarted || !currentProblem) return;

    const solution = currentProblem.solution;
    let correct = true;
    let totalCorrect = 0;
    let totalElements = 0;

    // Check each area
    Object.keys(solution).forEach(areaId => {
      const userArea = placedElements[areaId];
      const correctArea = solution[areaId];
      
      totalElements += correctArea.length;
      
      // Count correct elements in this area
      const correctInArea = userArea.filter(el => correctArea.includes(el)).length;
      totalCorrect += correctInArea;
      
      // Check if all elements are correctly placed
      if (userArea.length !== correctArea.length || 
          !userArea.every(el => correctArea.includes(el))) {
        correct = false;
      }
    });

    // Check if all elements are placed
    if (availableElements.length > 0) {
      setFeedback('Você precisa colocar todos os elementos no diagrama!');
      return;
    }

    const accuracy = totalElements > 0 ? (totalCorrect / totalElements) * 100 : 0;
    const points = Math.round(accuracy / 10); // 10 points max per problem

    if (correct) {
      setScore(prev => prev + points);
      setFeedback(`🎉 Correto! +${points} pontos. ${currentProblem.explanation}`);
      
      setTimeout(() => {
        if (problemIndex < problems.length - 1) {
          loadProblem(problemIndex + 1);
        } else {
          setAlertType('gameComplete');
          setAlertOpen(true);
        }
      }, 3000);
    } else {
      setFeedback(`Incorreto! Acertou: ${accuracy.toFixed(1)}%. ${currentProblem.explanation}`);
    }
  };

  const resetCurrentProblem = () => {
    if (currentProblem) {
      setAvailableElements([...currentProblem.elements]);
      setPlacedElements({
        onlyA: [], onlyB: [], onlyC: [],
        AB: [], AC: [], BC: [],
        ABC: [], outside: []
      });
      setFeedback(`Problema resetado: ${currentProblem.description}`);
    }
  };

  const nextProblem = () => {
    loadProblem(problemIndex + 1);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    if (alertType === 'gameComplete') {
      stopGame();
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`p-2 md:p-4 ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'} transition-all duration-300`}>
        <div className={`max-w-7xl mx-auto ${darkMode ? 'bg-gray-900/95 border border-gray-800/50' : 'bg-white/95 border border-gray-200/50'} rounded-xl shadow-2xl backdrop-blur-lg transition-all duration-300`}>
          
          {/* Header */}
          <div className={`p-3 md:p-4 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'}`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} mr-3`}>
                <BookOpen className={`h-6 w-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <h1 
                className={`text-2xl md:text-3xl font-bold text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Teoria dos Conjuntos: Classificação
              </h1>
            </div>
            
            {/* Game Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'} backdrop-blur-sm`}>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Problema Atual</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {currentProblem ? `${problemIndex + 1} de ${problems.length}` : 'Não iniciado'}
                </p>
              </div>
              
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'} backdrop-blur-sm`}>
                <div className="flex items-center">
                  <Trophy className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} mr-2`} />
                  <div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pontuação</p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{score}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Game Area */}
          <div className="p-3 md:p-4">
            
            {/* Available Elements */}
            <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200'} backdrop-blur-sm`}>
              <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Elementos Disponíveis ({availableElements.length})
              </h3>
              <div className="flex flex-wrap gap-2 min-h-[50px] p-2 border-2 border-dashed rounded-lg"
                style={{
                  borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(156, 163, 175, 0.5)',
                  backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.2)' : 'rgba(243, 244, 246, 0.5)'
                }}
              >
                {availableElements.map((element, index) => (
                  <DraggableElement
                    key={`${element}-${index}`}
                    element={element}
                    darkMode={darkMode}
                    isPlaced={false}
                    originalSet="available"
                  />
                ))}
                {availableElements.length === 0 && (
                  <div className={`text-center w-full py-4 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Todos os elementos foram classificados
                  </div>
                )}
              </div>
            </div>
            
            {/* Main Game Area with Sidebar */}
            <div className="flex gap-4 mb-4">
              
              {/* Venn Diagram */}
              <div className="flex-1 relative h-[400px] flex items-center justify-center rounded-lg" 
                style={{
                  backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.3)' : 'rgba(249, 250, 251, 0.5)'
                }}
              >
                {/* SVG Venn Diagram Background */}
                <svg
                  width="400"
                  height="400"
                  viewBox="0 0 400 350"
                  className="absolute inset-0 mx-auto pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  {/* Circle A (Red) - Top Left */}
                  <circle
                    cx="125"
                    cy="130"
                    r="120"
                    fill={darkMode ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)'}
                    stroke={darkMode ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.8)'}
                    strokeWidth="2"
                  />
                  
                  {/* Circle B (Green) - Top Right */}
                  <circle
                    cx="275"
                    cy="130"
                    r="120"
                    fill={darkMode ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.03)'}
                    stroke={darkMode ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.8)'}
                    strokeWidth="2"
                  />
                  
                  {/* Circle C (Blue) - Bottom */}
                  <circle
                    cx="200"
                    cy="240"
                    r="120"
                    fill={darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)'}
                    stroke={darkMode ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.8)'}
                    strokeWidth="2"
                  />
                  
                  {/* Set Labels */}
                  <text x="100" y="100" className={`text-lg font-bold ${darkMode ? 'fill-red-400' : 'fill-red-600'}`}>A</text>
                  <text x="300" y="100" className={`text-lg font-bold ${darkMode ? 'fill-green-400' : 'fill-green-600'}`}>B</text>
                  <text x="190" y="310" className={`text-lg font-bold ${darkMode ? 'fill-blue-400' : 'fill-blue-600'}`}>C</text>
                </svg>
                
                <div className="absolute inset-0" style={{ zIndex: 10 }}>
                  <DroppableArea
                    areaId="onlyA"
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="A"
                    setColor="A"
                    areaStyle={{ 
                      top: '34px', 
                      left: '258px', 
                      width: '242px', 
                      height: '242px',
                      borderRadius: '50%'
                    }}
                  />
                  
                  <DroppableArea
                    areaId="onlyB"
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="B"
                    setColor="B"
                    areaStyle={{ 
                      top: '34px', 
                      left: '408px', 
                      width: '242px', 
                      height: '242px',
                      borderRadius: '50%'
                    }}
                  />
                  
                  <DroppableArea
                    areaId="onlyC"
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="C"
                    setColor="C"
                    areaStyle={{ 
                      top: '144px', 
                      left: '333px', 
                      width: '242px', 
                      height: '242px',
                      borderRadius: '50%'
                    }}
                  />
                  
                  <DroppableArea
                    areaId="AB"
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="A∩B"
                    setColor="AB"
                    areaStyle={{ 
                      top: '85px', 
                      left: '170px', 
                      width: '50px', 
                      height: '50px',
                      borderRadius: '50%'
                    }}
                  />
                  
                  <DroppableArea
                    areaId="AC"
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="A∩C"
                    setColor="AC"
                    areaStyle={{ 
                      top: '155px', 
                      left: '135px', 
                      width: '50px', 
                      height: '50px',
                      borderRadius: '50%'
                    }}
                  />
                  
                  <DroppableArea
                    areaId="BC"
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="B∩C"
                    setColor="BC"
                    areaStyle={{ 
                      top: '155px', 
                      left: '207px', 
                      width: '50px', 
                      height: '50px',
                      borderRadius: '50%'
                    }}
                  />
                  
                  <DroppableArea
                    areaId="ABC"
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="A∩B∩C"
                    setColor="ABC"
                    areaStyle={{ 
                      top: '140px', 
                      left: '181px', 
                      width: '30px', 
                      height: '20px',
                      borderRadius: '50%'
                    }}
                  />
                  
                  <DroppableArea
                    areaId="outside"
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="Fora"
                    setColor="outside"
                    areaStyle={{ 
                      top: '20px', 
                      left: '20px', 
                      width: '80px', 
                      height: '40px',
                      borderRadius: '10px'
                    }}
                  />
                </div>
              </div>
              
              {/* Sidebar with Classification Areas */}
              <div className={`w-72 p-3 rounded-lg ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200'} backdrop-blur-sm`}>
                <h3 className={`text-base font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Classificação
                </h3>
                
                <div className="space-y-3 max-h-[360px] overflow-y-auto">
                  <SidebarArea
                    areaId="onlyA"
                    elements={placedElements.onlyA}
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="Apenas A"
                    setColor="A"
                  />
                  
                  <SidebarArea
                    areaId="onlyB"
                    elements={placedElements.onlyB}
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="Apenas B"
                    setColor="B"
                  />
                  
                  <SidebarArea
                    areaId="onlyC"
                    elements={placedElements.onlyC}
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="Apenas C"
                    setColor="C"
                  />
                  
                  <SidebarArea
                    areaId="AB"
                    elements={placedElements.AB}
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="A ∩ B"
                    setColor="AB"
                  />
                  
                  <SidebarArea
                    areaId="AC"
                    elements={placedElements.AC}
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="A ∩ C"
                    setColor="AC"
                  />
                  
                  <SidebarArea
                    areaId="BC"
                    elements={placedElements.BC}
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="B ∩ C"
                    setColor="BC"
                  />
                  
                  <SidebarArea
                    areaId="ABC"
                    elements={placedElements.ABC}
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="A ∩ B ∩ C"
                    setColor="ABC"
                  />
                  
                  <SidebarArea
                    areaId="outside"
                    elements={placedElements.outside}
                    onDrop={handleDrop}
                    darkMode={darkMode}
                    label="Fora dos conjuntos"
                    setColor="outside"
                  />
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
              {!gameStarted ? (
                <button
                  onClick={startGame}
                  className={`
                    col-span-2 md:col-span-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2
                    ${darkMode 
                      ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-100 shadow-lg shadow-gray-700/25' 
                      : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from.gray-600 hover:to-gray-500 text-white shadow-lg shadow-gray-600/25'
                    }
                  `}
                >
                  <Play className="h-4 w-4" />
                  <span>Iniciar</span>
                </button>
              ) : (
                <button
                  onClick={stopGame}
                  className={`
                    col-span-2 md:col-span-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2
                    ${darkMode 
                      ? 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from_gray-500 hover:to-gray-400 text-gray-100 shadow-lg shadow-gray-600/25' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from_gray-500 hover:to-gray-400 text-white shadow-lg shadow-gray-500/25'
                    }
                  `}
                >
                  <Square className="h-4 w-4" />
                  <span>Parar</span>
                </button>
              )}
              
              <button
                onClick={checkAnswer}
                disabled={!gameStarted || availableElements.length > 0}
                className={`
                  col-span-2 md:col-span-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform flex items-center justify-center space-x-2
                  ${gameStarted && availableElements.length === 0
                    ? (darkMode 
                       ? 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-gray-100 shadow-lg shadow-gray-700/25 hover:scale-105 active:scale-95'
                       : 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white shadow-lg shadow-gray-700/25 hover:scale-105 active:scale-95')
                    : (darkMode 
                       ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                       : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300')
                  }
                `}
              >
                <Check className="h-4 w-4" />
                <span>Verificar</span>
              </button>
              
              <button
                onClick={resetCurrentProblem}
                disabled={!gameStarted}
                className={`
                  col-span-2 md:col-span-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2
                  ${gameStarted
                    ? (darkMode 
                       ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from_gray-600 hover:to-gray-500 text-gray-100 shadow-lg shadow-gray-700/25' 
                       : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from_gray-600 hover:to-gray-500 text-white shadow-lg shadow-gray-600/25')
                    : (darkMode 
                       ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                       : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300')
                  }
                `}
              >
                <RotateCcw className="h-4 w-4" />
                <span>Resetar</span>
              </button>
              
              <button
                onClick={nextProblem}
                disabled={!gameStarted}
                className={`
                  col-span-2 md:col-span-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2
                  ${gameStarted
                    ? (darkMode 
                       ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from_gray-600 hover:to-gray-500 text-gray-100 shadow-lg shadow-gray-700/25' 
                       : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from_gray-600 hover:to-gray-500 text-white shadow-lg shadow-gray-600/25')
                    : (darkMode 
                       ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                       : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300')
                  }
                `}
              >
                <Target className="h-4 w-4" />
                <span>Próximo</span>
              </button>
            </div>
            
            {/* Feedback */}
            {feedback && (
              <div className={`p-2 rounded-lg text-center text-xs font-medium backdrop-blur-sm transition-all duration-300 ${
                feedback.includes('🎉') 
                  ? (darkMode ? 'bg-gradient-to-r from-green-900/50 to-green-800/30 text-green-200 border border-green-700/50' : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300')
                  : feedback.includes('❌')
                    ? (darkMode ? 'bg-gradient-to-r from-red-900/50 to-red-800/30 text-red-200 border border-red-700/50' : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300')
                    : (darkMode ? 'bg-gradient-to-r from-gray-800/70 to-gray-700/50 text-gray-200 border border-gray-600/50' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300')
              } shadow-sm`}>
                {feedback}
              </div>
            )}
          </div>
        </div>

        {/* Alert Dialog */}
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialogContent className={`${darkMode ? 'bg-gray-900 text-gray-100 border border-gray-800' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl backdrop-blur-lg`}>
            <AlertDialogHeader>
              <AlertDialogTitle className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                🎉 Parabéns!
              </AlertDialogTitle>
              <AlertDialogDescription className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Você completou todos os problemas! Pontuação final: {score} pontos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={handleAlertClose}
                className={`
                  px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105
                  ${darkMode 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from_gray-600 hover:to-gray-500 text-gray-100 shadow-lg' 
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from_gray-600 hover:to-gray-500 text-white shadow-lg'
                  }
                `}
              >
                Fechar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DndProvider>
  );
}

export default SetTheoryGame;
