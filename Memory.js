// memory.js — exposes window.GAMES.memory with init(panel) and destroy()
window.GAMES = window.GAMES || {};
(function()
  {
    let state = {};

    const SUITS = ['♠', '♥', '♦', '♣'];
    const RANKS = ['1', '2', '3', '4'];

    function buildUI(panel)
    {
      panel.innerHTML = `
        <div class="memory-header">
          <h1 id="title" class="memory-title">Memory Match</h1>
          <div class="score" id="score">Moves: 0 | Matches: 0/16</div>
          <div class="score" id="timer">Time: 0s</div>
        </div>
        <p class="muted">Find all matching pairs of cards.</p>
        <div class="game-board" id="gameBoard"></div>
        <div class="controls">
          <button id="btnNew" class="btn btn-primary">New Game</button>
          <button id="btnPause" class="btn btn-secondary">Pause</button>
        </div>
        <div class="status" id="status">Game started. Click cards to flip them.</div>
      `;
    }

    function shuffle(array)
    {
      const shuffled = [...array];
      for(let i = shuffled.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    function createCards()
    {
      const cardValues = [];
      for(let suit of SUITS){
        for(let rank of RANKS){
          cardValues.push({ suit, rank });
        }
      }

      const baseCards = shuffle(cardValues).map((card, index) => (
      {
        id: index,
        ...card,
        isFlipped: false,
        isMatched: false,
        pairId: null
      }));

      const pairs = baseCards.map((card, index) => (
      {
        ...card,
        id: baseCards.length + index,
        pairId: card.id
      }));

      return shuffle([...baseCards, ...pairs]);
    }

  function renderCards()
  {
    const board = state.panel.querySelector('#gameBoard');
    board.innerHTML = '';

  state.cards.forEach((card, index) => 
  {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    if(card.isFlipped || card.isMatched)
    {
      cardEl.innerHTML = `<span class="card-rank">${card.rank}</span><span class="card-suit">${card.suit}</span>`;
      const suitColor = card.suit === '♥' || card.suit === '♦' ? 'red-suit' : 'black-suit';
      cardEl.classList.add(suitColor);
      cardEl.style.transform = 'rotateY(0deg)';
    } 
    else 
    {
      cardEl.classList.add('hidden');
      cardEl.innerHTML = '';
      cardEl.style.transform = 'rotateY(180deg)'; 
    }

    if(card.isMatched)
    {
      cardEl.classList.add('matched');
    }

    cardEl.onclick = () => flipCard(index);
    board.appendChild(cardEl);
    });
  }


  function flipCard(index)
  {
    if(!state.canFlip || state.isPaused) return;
    if(state.cards[index].isMatched) return;
    if(state.flipped.includes(index)) return;

    state.cards[index].isFlipped = true;
    state.flipped.push(index);
    
    // Update just this card's display without rebuilding the entire board
    const board = state.panel.querySelector('#gameBoard');
    const cardEls = board.querySelectorAll('.card');
    const cardEl = cardEls[index];
    
    cardEl.classList.add('reveal');
    
    setTimeout(() => {
      const card = state.cards[index];
      cardEl.innerHTML = `<span class="card-rank">${card.rank}</span><span class="card-suit">${card.suit}</span>`;
      const suitColor = card.suit === '♥' || card.suit === '♦' ? 'red-suit' : 'black-suit';
      cardEl.classList.add(suitColor);
      cardEl.classList.remove('hidden');
    }, 300);

    if(state.flipped.length === 2)
    {
      checkMatch();
    }
  }

  function checkMatch()
  {
    state.canFlip = false;
    const [first, second] = state.flipped;
    const card1 = state.cards[first];
    const card2 = state.cards[second];

    const isMatch = 
      card1.rank === card2.rank && 
      card1.suit === card2.suit;

    if(isMatch)
    {
      state.cards[first].isMatched = true;
      state.cards[second].isMatched = true;
      state.matchCount++;
      setTimeout(() => {
        state.flipped = [];
        state.moves++;
        updateStatus();
        state.canFlip = true;
        renderCards();

        if(state.matchCount === 16)
        {
          gameComplete();
        }
      }, 600);
    } 
  else 
  {
    state.moves++;
    updateStatus();
    setTimeout(() => {
      const board = state.panel.querySelector('#gameBoard');
      const cardEls = board.querySelectorAll('.card');
      
      cardEls[first].classList.remove('reveal');
      cardEls[second].classList.remove('reveal');
      cardEls[first].classList.add('flip-back');
      cardEls[second].classList.add('flip-back');
      
      setTimeout(() => {
        cardEls[first].innerHTML = '';
        cardEls[first].classList.add('hidden');
        cardEls[first].classList.remove('suitColor');
        
        cardEls[second].innerHTML = '';
        cardEls[second].classList.add('hidden');
        cardEls[second].classList.remove('suitColor');
      }, 300);
      
      setTimeout(() => {
        state.cards[first].isFlipped = false;
        state.cards[second].isFlipped = false;
        state.flipped = [];
        state.canFlip = true;
        renderCards();
      }, 600);
    }, 1000);
  }
  }

  function updateStatus(){
    const scoreEl = state.panel.querySelector('#score');
    scoreEl.textContent = `Moves: ${state.moves} | Matches: ${state.matchCount}/16`;
  }

  function startTimer(){
    state.startTime = Date.now();
    state.timerInterval = setInterval(() => {
      if(!state.isPaused){
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const timerEl = state.panel.querySelector('#timer');
        if(timerEl) timerEl.textContent = `Time: ${elapsed}s`;
      }
    }, 100);
  }

  function gameComplete(){
    state.canFlip = false;
    clearInterval(state.timerInterval);
    const statusEl = state.panel.querySelector('#status');
    const timerEl = state.panel.querySelector('#timer');
    const timeStr = timerEl ? timerEl.textContent : 'Time: 0s';
    statusEl.textContent = `🎉 You won! ${state.moves} moves in ${timeStr}`;
  }

  function init(panel)
  {
    buildUI(panel);

    state.cards = createCards();
    state.moves = 0;
    state.matchCount = 0;
    state.flipped = [];
    state.isPaused = false;
    state.canFlip = true;
    state.startTime = null;
    state.timerInterval = null;
    state.panel = panel;

    state.btnNew = panel.querySelector('#btnNew');
    state.btnPause = panel.querySelector('#btnPause');
    state.statusEl = panel.querySelector('#status');

    state._handlers = {
      newGame: () => {
        clearInterval(state.timerInterval);
        state.cards = createCards();
        state.moves = 0;
        state.matchCount = 0;
        state.flipped = [];
        state.isPaused = false;
        state.canFlip = true;
        state.btnPause.textContent = 'Pause';
        state.btnPause.classList.remove('btn-paused');
        updateStatus();
        renderCards();
        startTimer();
      },
      pause: () => {
        state.isPaused = !state.isPaused;
        state.btnPause.textContent = state.isPaused ? 'Resume' : 'Pause';
        state.btnPause.classList.toggle('btn-paused', state.isPaused);
        if(state.isPaused){
          clearInterval(state.timerInterval);
          state.statusEl.textContent = 'Game paused.';
        } else {
          state.startTime = Date.now() - (state.moves * 500);
          startTimer();
          state.statusEl.textContent = 'Game resumed.';
        }
      }
    };

    state.btnNew.addEventListener('click', state._handlers.newGame);
    state.btnPause.addEventListener('click', state._handlers.pause);

    updateStatus();
    renderCards();
    startTimer();
  }

  function destroy()
  {
    if(!state.panel) return;
    if(state.btnNew) state.btnNew.removeEventListener('click', state._handlers.newGame);
    if(state.btnPause) state.btnPause.removeEventListener('click', state._handlers.pause);
    if(state.timerInterval) clearInterval(state.timerInterval);
    state.panel.innerHTML = '';
    state = {};
  }

  window.GAMES.memory = { init, destroy };
})();