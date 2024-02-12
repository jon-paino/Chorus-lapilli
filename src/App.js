import React, { useState, useEffect } from 'react';


function Square({ value, onSquareClick, isSelected }) {
  return (
    <button className={`square ${isSelected ? "selected" : ""}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}


function Board({ xIsNext, squares, onPlay, phase, selectedSquare, setSelectedSquare }) {
  function handleClick(i) {
    const winner = calculateWinner(squares);
    // Prevent any interaction if the game has a winner or if trying to place a piece on an occupied square during the placing phase
    if (winner || (squares[i] && phase === 'Placing phase')) {
      return;
    }

    let validMoveMade = false; // Track if a valid move is made
    const nextSquares = squares.slice();
    const currentPlayer = xIsNext ? 'X' : 'O';
    let winningMoveAvailable = false;
    const isCenterPieceCurrentPlayer = squares[4] === currentPlayer;

    if (phase === 'Placing phase') {
      // Placing logic: place 'X' or 'O' based on whose turn it is
      nextSquares[i] = currentPlayer;
      validMoveMade = true;
    } else if (phase === 'Moving phase') {
      // Check if the clicked square contains the player's piece
      const isPlayersPiece = (xIsNext && squares[i] === 'X') || (!xIsNext && squares[i] === 'O');
      
      // Iterate through all pieces to check for any winning move
      for (let fromIndex = 0; fromIndex < squares.length; fromIndex++) {
        if (squares[fromIndex] === currentPlayer) {
          for (let toIndex = 0; toIndex < squares.length; toIndex++) {
            if (isValidMove(fromIndex, toIndex, squares) && simulateWinningMove(squares, fromIndex, toIndex, currentPlayer)) {
              winningMoveAvailable = true;
              break;
            }
          }
          if (winningMoveAvailable) break;
        }
      }

      if (isCenterPieceCurrentPlayer && !winningMoveAvailable) {
        // Automatically select the center piece if no winning move is available
        if (selectedSquare !== 4) {
          setSelectedSquare(4);
          // Do not proceed to make a move yet, just select the center piece
          return; // Early return to wait for the next click for the move
        } else if (i !== 4 && isValidMove(4, i, squares)) {
          // Move the center piece to a valid position
          nextSquares[4] = null;
          nextSquares[i] = currentPlayer;
          setSelectedSquare(null); // Reset selected square after moving
          validMoveMade = true;
        }
    } else if (selectedSquare === null && squares[i] && isPlayersPiece) {
        // Scenario 1: Select a square if it contains a piece belonging to the current player and no square is already selected
        setSelectedSquare(i);
      } else if (selectedSquare === i) {
        // Scenario 2: Deselect the currently selected square if it is clicked again
        setSelectedSquare(null);
      } else if (selectedSquare !== null && isPlayersPiece) {
        // Scenario 3: Select a different piece of the player's own pieces
        setSelectedSquare(i);
      } else if (selectedSquare !== null && isValidMove(selectedSquare, i, squares)) {
        // If a square is selected and the target square is a valid move, execute the move:
        // 1. Clear the original square
        // 2. Place the piece in the new square
        // 3. Deselect the square
        nextSquares[selectedSquare] = null;
        nextSquares[i] = currentPlayer;
        setSelectedSquare(null); // Reset selected square after moving
        validMoveMade = true;
      }
    }
    
    if (validMoveMade){
      onPlay(nextSquares);
    }
  }
  
  function isValidMove(fromIndex, toIndex, squares) {
    const adjacentIndices = [
      fromIndex - 3, fromIndex + 3, // vertical
      fromIndex % 3 === 0 ? fromIndex + 1 : fromIndex % 3 === 2 ? fromIndex - 1 : [fromIndex - 1, fromIndex + 1], // horizontal
      // Diagonal checks
      (fromIndex === 4) ? [0, 2, 6, 8] : [], // Center to corners
      ([0, 8].includes(fromIndex) || [2, 6].includes(fromIndex)) ? 4 : [], // Corners to center
      ([3,5].includes(fromIndex)) ? [1,7] : [] , // Edge to edge
      ([1,7].includes(fromIndex)) ? [3,5] : [] , // Edge to edge
    ].flat();
  
    return adjacentIndices.includes(toIndex) && !squares[toIndex];
  }
  

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} isSelected={selectedSquare === 0} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} isSelected={selectedSquare === 1} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} isSelected={selectedSquare === 2} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} isSelected={selectedSquare === 3} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} isSelected={selectedSquare === 4} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} isSelected={selectedSquare === 5} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} isSelected={selectedSquare === 6} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} isSelected={selectedSquare === 7} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} isSelected={selectedSquare === 8} />
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [phase, setPhase] = useState('Placing phase');
  const [selectedSquare, setSelectedSquare] = useState(null);

  useEffect(() => {
    const totalPieces = currentSquares.filter(square => square !== null).length;
    if (totalPieces >= 6) {
      setPhase('Moving phase');
    } else {
      setPhase('Placing phase');
    }
  }, [currentSquares]);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game-container">
      <h1 className="game-phase">{phase}</h1>
      <div className="game">
        <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          phase={phase}
          selectedSquare={selectedSquare}
          setSelectedSquare={setSelectedSquare}
        />
        </div>
        <div className="game-info">
          <ol>{moves}</ol>
        </div>
      </div>
    </div>
  );
  
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function simulateWinningMove(squares, fromIndex, toIndex, player) {
  const simulation = squares.slice(); // Copy the current board state
  simulation[fromIndex] = null; // Remove the piece from the original spot
  simulation[toIndex] = player; // Place the piece in the new spot
  return calculateWinner(simulation) === player; // Check if this move results in a win for the player
}
