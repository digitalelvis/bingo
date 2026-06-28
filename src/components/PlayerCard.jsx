import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import '../index.css';

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

// Generate a random bingo card
const generateCard = () => {
  const getNumbers = (min, max, count) => {
    const nums = new Set();
    while (nums.size < count) {
      nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(nums).sort((a, b) => a - b);
  };

  return {
    B: getNumbers(1, 15, 5),
    I: getNumbers(16, 30, 5),
    N: (() => {
      const nums = getNumbers(31, 45, 5);
      nums[2] = 'FREE'; // Free space in the middle
      return nums;
    })(),
    G: getNumbers(46, 60, 5),
    O: getNumbers(61, 75, 5),
  };
};

export default function PlayerCard() {
  const [card, setCard] = useState(null);
  const [selectedCells, setSelectedCells] = useState(new Set());

  useEffect(() => {
    // Generate card on initial load
    setCard(generateCard());
    
    // Auto-select FREE space
    const initialSelected = new Set();
    initialSelected.add('N-2');
    setSelectedCells(initialSelected);
  }, []);

  const toggleCell = (col, row) => {
    if (col === 'N' && row === 2) return; // Cannot toggle FREE space
    
    const cellKey = `${col}-${row}`;
    setSelectedCells(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(cellKey)) {
        newSelected.delete(cellKey);
      } else {
        newSelected.add(cellKey);
      }
      return newSelected;
    });
  };

  const generateNewCard = () => {
    if (window.confirm("Deseja gerar uma nova cartela? O progresso atual será perdido.")) {
      setCard(generateCard());
      const initialSelected = new Set();
      initialSelected.add('N-2');
      setSelectedCells(initialSelected);
    }
  };

  const goBack = () => {
    window.location.href = window.location.pathname;
  };

  if (!card) return null;

  return (
    <div className="player-card-view">
      <header className="player-card-header">
        <button className="btn btn-secondary" onClick={goBack} style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} /> Voltar
        </button>
        <button className="btn btn-secondary" onClick={generateNewCard} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          Nova Cartela
        </button>
      </header>

      <main className="player-card-main">
        <div className="bingo-card glass">
          <div className="bingo-card-header">
            {BINGO_LETTERS.map(letter => (
              <div key={letter} className="bingo-card-letter">{letter}</div>
            ))}
          </div>
          
          <div className="bingo-card-grid">
            {BINGO_LETTERS.map(col => (
              <div key={col} className="bingo-card-col">
                {card[col].map((number, row) => {
                  const cellKey = `${col}-${row}`;
                  const isSelected = selectedCells.has(cellKey);
                  const isFree = number === 'FREE';
                  
                  return (
                    <button 
                      key={cellKey}
                      className={`bingo-cell ${isSelected ? 'selected' : ''} ${isFree ? 'free-space' : ''}`}
                      onClick={() => toggleCell(col, row)}
                    >
                      {isFree ? '★' : number}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
