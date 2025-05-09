import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
  const [setA, ] = useState([1, 2, 3]);
  const [setB, ] = useState(['a', 'b', 'c']);
  const [userPairs, setUserPairs] = useState([]);
  const [correctPairs, setCorrectPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false); // Track if game is complete

  // Generate correct cartesian product pairs
  useEffect(() => {
    const pairs = [];
    setA.forEach(a => {
      setB.forEach(b => {
        pairs.push([a, b]);
      });
    });
    setCorrectPairs(pairs);
  }, [setA, setB]);

  // Element component (draggable)
  const Element = ({ item, type }) => {
    const [{ isDragging }, drag] = useDrag({
      type,
      item: { id: item, type },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging()
      })
    });

    return (
      <div
        ref={drag}
        className={`p-3 m-2 rounded-full ${type === 'setA' ? 'bg-blue-500' : 'bg-green-500'} 
        text-white font-bold text-center cursor-move w-12 h-12 flex items-center justify-center
        transition-transform ${isDragging ? 'scale-90 opacity-50' : 'scale-100'}`}
      >
        {item}
      </div>
    );
  };

  // Drop target for creating pairs
  const PairTarget = () => {
    const [{ isOver }, drop] = useDrop({
      accept: ['setA', 'setB'],
      drop: (item) => handleDrop(item),
      collect: (monitor) => ({
        isOver: !!monitor.isOver()
      })
    });

    const [currentPair, setCurrentPair] = useState([null, null]);

    const handleDrop = (item) => {
      const newPair = [...currentPair];
      if (item.type === 'setA') {
        newPair[0] = item.id;
      } else {
        newPair[1] = item.id;
      }
      
      if (newPair[0] !== null && newPair[1] !== null) {
        setUserPairs([...userPairs, newPair]);
        setCurrentPair([null, null]);
        checkPair(newPair);
      } else {
        setCurrentPair(newPair);
      }
    };

    return (
      <div 
        ref={drop} 
        className={`border-2 border-dashed ${isOver ? 'border-yellow-400 bg-yellow-100' : 'border-gray-300'} 
        p-4 rounded-lg min-h-[100px] flex flex-wrap justify-center items-center`}
      >
        {currentPair[0] !== null && (
          <div className="bg-blue-500 text-white p-2 rounded-full mr-2">{currentPair[0]}</div>
        )}
        {currentPair[0] !== null && currentPair[1] !== null && <span>,</span>}
        {currentPair[1] !== null && (
          <div className="bg-green-500 text-white p-2 rounded-full ml-2">{currentPair[1]}</div>
        )}
        {currentPair[0] === null && currentPair[1] === null && (
          <p className="text-gray-500">Arraste elementos aqui para criar pares</p>
        )}
      </div>
    );
  };

  // Check if a pair is correct
  const checkPair = (pair) => {
    const isCorrect = correctPairs.some(
      correctPair => correctPair[0] === pair[0] && correctPair[1] === pair[1]
    );
    
    if (isCorrect) {
      setScore(score + 10);
      setFeedback('Correto!');
      setTimeout(() => setFeedback(''), 1500);
    } else {
      setScore(Math.max(0, score - 5));
      setFeedback('Par incorreto');
      setTimeout(() => setFeedback(''), 1500);
    }
  };

  // Clear pairs
  const handleReset = () => {
    setUserPairs([]);
    setFeedback('');
    setScore(0);
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlertOpen(false);
    if (isComplete) {
      // Only reset if game was completed successfully
      handleReset();
      setScore(0);
    }
  };
  // Check if all correct pairs have been created
  const checkCompletion = () => {
    const allPairsCreated = correctPairs.every(correctPair => 
      userPairs.some(userPair => 
        userPair[0] === correctPair[0] && userPair[1] === correctPair[1]
      )
    );
    
    if (allPairsCreated) {
        
        setScore(score + 50);
        setIsComplete(true);
      } else {
        setIsComplete(false);
      }
      
      // Show alert in both cases
      setAlertOpen(true);
    };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">

        <div 
          className=" top-2 left-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer transition-colors flex items-center justify-center"
          onClick={onClose}
          title="Fechar jogo"
            >
          <span className="text-white text-xs font-bold">×</span>
        </div>


        <h1 className="text-2xl font-bold mb-4 text-center">Combine os Pares</h1>
        

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Conjunto A</h2>
            <h2 className="text-xl font-semibold">Conjunto B</h2>
          </div>
          
          <div className="flex justify-between">
            <div className="border-2 border-blue-300 p-4 rounded-lg w-[45%] min-h-[100px] flex flex-wrap">
              {setA.map((item, index) => (
                <Element key={`a-${index}`} item={item} type="setA" />
              ))}
            </div>
            
            <div className="border-2 border-green-300 p-4 rounded-lg w-[45%] min-h-[100px] flex flex-wrap">
              {setB.map((item, index) => (
                <Element key={`b-${index}`} item={item} type="setB" />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Crie Pares</h2>
          <PairTarget />
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Seus Pares</h2>
          <div className="border-2 border-gray-300 p-4 rounded-lg min-h-[100px] flex flex-wrap">
            {userPairs.map((pair, index) => (
              <div key={index} className="flex items-center m-2 p-2 bg-gray-100 rounded-lg">
                <span className="bg-blue-500 text-white p-2 rounded-full">{pair[0]}</span>
                <span className="mx-1">×</span>
                <span className="bg-green-500 text-white p-2 rounded-full">{pair[1]}</span>
              </div>
            ))}
            {userPairs.length === 0 && <p className="text-gray-500">Nenhum par criado ainda</p>}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="font-bold">Pontuação: </span>
            <span className="text-xl">{score}</span>
          </div>
          
          <div className="space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Reiniciar
            </button>
            <button
              onClick={checkCompletion}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Revisar
            </button>
          </div>
        </div>
        
        {feedback && (
          <div className={`p-3 rounded text-center mb-4 ${
            feedback.includes('Correto') || feedback.includes('Parabéns')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {feedback}
          </div>
        )}
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    {isComplete ? (
                    <>
                        <AlertDialogTitle>Parabéns!</AlertDialogTitle>
                        <AlertDialogDescription>
                        Você completou todos os pares corretamente!
                        </AlertDialogDescription>
                    </>
                    ) : (
                    <>
                        <AlertDialogTitle>Atenção!</AlertDialogTitle>
                        <AlertDialogDescription>
                        Existem pares faltando. Continue tentando!
                        </AlertDialogDescription>
                    </>
                    )}
            </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleAlertClose}>
                    {isComplete ? "Continuar" : "Voltar ao jogo"}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </DndProvider>
  );
}

export default CartesianGame;