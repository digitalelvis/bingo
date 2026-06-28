import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, History, Trophy, X, LayoutGrid } from 'lucide-react';
import QRCode from 'react-qr-code';
import { loadCurrentGame, saveCurrentGame, archiveGame, getHistory } from './utils/storage';
import { playSpinningSound, stopSound, playRevealSound, playBingoVictorySound } from './utils/audio';
import BingoBall from './components/BingoBall';
import PlayerCard from './components/PlayerCard';
import './index.css'; // Make sure styles are loaded

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

const getLetterForNumber = (num) => {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  return '';
};

function App() {
  const [isPlayerCardView, setIsPlayerCardView] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('card') === 'true') {
      setIsPlayerCardView(true);
    }
  }, []);

  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [winner, setWinner] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBigBall, setCurrentBigBall] = useState(null);
  const [bingoWinner, setBingoWinner] = useState(null);

  useEffect(() => {
    // Load state from local storage on mount
    const saved = loadCurrentGame();
    if (saved && saved.length > 0) {
      setDrawnNumbers(saved);
    }
    setGameHistory(getHistory());
  }, []);

  useEffect(() => {
    // Save to local storage whenever drawn numbers change
    saveCurrentGame(drawnNumbers);
  }, [drawnNumbers]);

  const drawNumber = () => {
    if (drawnNumbers.length >= 75 || isDrawing) return;
    
    setIsDrawing(true);
    playSpinningSound();

    setTimeout(() => {
      let newNum;
      do {
        newNum = Math.floor(Math.random() * 75) + 1;
      } while (drawnNumbers.includes(newNum));
      
      stopSound();
      playRevealSound();
      setCurrentBigBall(newNum);

      setTimeout(() => {
        setDrawnNumbers(prev => [newNum, ...prev]);
        setCurrentBigBall(null);
        setIsDrawing(false);
      }, 2000); // tempo que a bola grande fica na tela

    }, 3000); // tempo que o globo "gira"
  };

  const startNewGame = () => {
    if (drawnNumbers.length > 0 && !winner) {
      archiveGame(drawnNumbers);
      setGameHistory(getHistory());
    }
    setWinner(null);
    setDrawnNumbers([]);
  };

  const handleBingo = () => {
    const name = window.prompt('🎉 BINGO! Qual é o nome do grande vencedor?');
    if (name) {
      setWinner(name);
      archiveGame(drawnNumbers, name);
      setGameHistory(getHistory());
      
      setBingoWinner(name);
      playBingoVictorySound();

      // Confetti effect (muitos confetes)
      var duration = 10 * 1000; // 10 segundos
      var animationEnd = Date.now() + duration;
      var defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 1000 };

      var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        var particleCount = 150 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: Math.random(), y: Math.random() - 0.2 } 
        }));
      }, 200);

      setTimeout(() => {
        setBingoWinner(null);
      }, 12000); // Overlay fica 12 segundos antes de sumir
    }
  };

  const lastDrawn = drawnNumbers[0];
  const previousDrawn = drawnNumbers.slice(1, 6);

  // Generate the board grid (columns format)
  const renderBoard = () => {
    // Group drawn numbers by B I N G O
    const grouped = { B: [], I: [], N: [], G: [], O: [] };
    drawnNumbers.forEach(num => grouped[getLetterForNumber(num)].push(num));
    BINGO_LETTERS.forEach(l => grouped[l].sort((a,b) => a - b));

    return (
      <div className="bingo-columns">
        {BINGO_LETTERS.map((letter) => (
          <div key={letter} className="bingo-column glass">
            <div className="bingo-col-header">{letter}</div>
            {grouped[letter].map(num => (
              <div key={num} className="drawn-ball-wrapper">
                <BingoBall number={num} size="sm" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (isPlayerCardView) {
    return <PlayerCard />;
  }

  return (
    <>
      <header>
        <h1>BINGO ONLINE</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setIsHistoryOpen(true)}>
            <History size={20} /> Histórico
          </button>
          <button className="btn btn-secondary" onClick={startNewGame}>
            <RotateCcw size={20} /> Novo Jogo
          </button>
          <button className="btn btn-secondary" onClick={() => window.open('?card=true', '_blank')}>
            <LayoutGrid size={20} /> Abrir Cartela
          </button>
          <div style={{ background: 'white', padding: '0.4rem', borderRadius: '8px', display: 'flex' }} title="Escaneie para abrir a cartela">
            <QRCode value={`${window.location.origin}?card=true`} size={80} level="L" />
          </div>
        </div>
      </header>

      <main>
        <section className="controls-section">
          <div className="glass draw-container">
            <button 
              className={`draw-btn ${isDrawing ? 'spinning' : ''}`} 
              onClick={drawNumber}
              disabled={drawnNumbers.length >= 75 || isDrawing || currentBigBall !== null}
            >
              <Play size={40} strokeWidth={2.5} style={{ marginBottom: '10px' }} />
              {isDrawing ? 'Sorteando...' : 'Sortear'}
            </button>
            
            {lastDrawn && (
              <div className="last-drawn">
                <span className="last-drawn-label">Última Bola</span>
                <BingoBall number={lastDrawn} size="md" />
              </div>
            )}

            {previousDrawn.length > 0 && (
              <div style={{ width: '100%' }}>
                <span className="last-drawn-label" style={{ fontSize: '0.9rem' }}>Anteriores</span>
                <div className="previous-balls">
                  {previousDrawn.map(num => (
                    <BingoBall key={num} number={num} size="sm" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', fontSize: '1.25rem', padding: '1rem' }} onClick={handleBingo}>
            <Trophy size={24} /> BINGO!
          </button>
        </section>

        <section className="board-section">
          {renderBoard()}
        </section>
      </main>

      {isHistoryOpen && (
        <div className="modal-overlay" onClick={() => setIsHistoryOpen(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Histórico de Jogos</h2>
              <button className="close-btn" onClick={() => setIsHistoryOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            {gameHistory.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>Nenhum jogo salvo ainda.</p>
            ) : (
              <div className="history-list">
                {gameHistory.map((game, i) => {
                  const grouped = { B: [], I: [], N: [], G: [], O: [] };
                  game.numbers.forEach(num => grouped[getLetterForNumber(num)].push(num));
                  BINGO_LETTERS.forEach(l => grouped[l].sort((a,b)=>a-b));

                  return (
                    <div key={game.id} className="history-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4>Jogo de {new Date(game.date).toLocaleString()}</h4>
                        {game.winner && game.winner !== 'Sem Vencedor' && (
                          <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            🏆 {game.winner}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                        Bolas sorteadas: {game.numbers.length}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', fontSize: '0.85rem' }}>
                        {BINGO_LETTERS.map(letter => (
                          <div key={letter} style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: 'var(--secondary)', marginBottom: '4px', textAlign: 'center' }}>{letter}</strong>
                            {grouped[letter].length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                                {grouped[letter].map(n => <span key={n}>{n}</span>)}
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', color: '#64748b' }}>-</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {isDrawing && (
        <div className="particle-container">
          {Array.from({ length: 25 }).map((_, i) => {
            const num = Math.floor(Math.random() * 75) + 1;
            const style = {
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
              animationDelay: `${Math.random() * 0.5}s`
            };
            return <BingoBall key={i} number={num} className="ball-particle" style={style} />;
          })}
        </div>
      )}

      {currentBigBall !== null && (
        <div className="giant-ball-overlay">
          <BingoBall number={currentBigBall} size="giant" />
        </div>
      )}

      {bingoWinner !== null && (
        <div className="giant-ball-overlay" style={{ flexDirection: 'column', gap: '2rem', textAlign: 'center', zIndex: 999 }}>
          <h1 style={{ fontSize: '6rem', color: '#f43f5e', textShadow: '0 0 50px rgba(244, 63, 94, 0.9), 0 0 20px #fff', margin: 0, animation: 'popIn 0.5s ease-out' }}>
            BINGO!
          </h1>
          <h2 style={{ fontSize: '3rem', color: 'white', textShadow: '0 0 20px rgba(255,255,255,0.5)', margin: 0, animation: 'slideDown 0.5s ease-out' }}>
            Parabéns {bingoWinner}
          </h2>
        </div>
      )}
    </>
  );
}

export default App;
