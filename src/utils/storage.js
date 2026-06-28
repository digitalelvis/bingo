const STORAGE_KEY = 'bingo_app_history';

export const getHistory = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveHistory = (history) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const saveCurrentGame = (drawnNumbers) => {
  if (drawnNumbers.length === 0) return;
  
  const history = getHistory();
  // Check if we are updating an existing active game or saving a new one
  const lastGame = history[0];
  
  const currentGame = {
    id: Date.now(),
    date: new Date().toISOString(),
    numbers: drawnNumbers
  };

  // simple logic: if last game is from today and we just started, we can just append, 
  // but to keep it simple, we just save each complete or paused state.
  // Actually, better: just save the current array as the "current_game" state
  localStorage.setItem('bingo_current_game', JSON.stringify(drawnNumbers));
};

export const loadCurrentGame = () => {
  const data = localStorage.getItem('bingo_current_game');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const archiveGame = (drawnNumbers, winnerName = 'Sem Vencedor') => {
  if (drawnNumbers.length === 0) return;
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    numbers: drawnNumbers,
    winner: winnerName
  });
  saveHistory(history);
  localStorage.removeItem('bingo_current_game');
};
