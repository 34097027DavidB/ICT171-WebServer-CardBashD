// higher.js — exposes window.GAMES.higher with init(panel) and destroy()
window.GAMES = window.GAMES || {};
(function(){
  let state = {};

  function buildUI(panel){
    panel.innerHTML = `
        <div style="display:flex;align-items:center">
          <h1 id="title">Higher or Lower</h1>
          <div class="score" id="score">Score: 0 | Streak: 0</div>
        </div>
        <p class="muted">Guess whether the next card (1–10) will be higher or lower than the shown card. Equal counts as a loss.</p>
        <div style="display:flex;gap:18px;margin-top:18px;align-items:flex-start">
          <div>
            <div style="font-size:13px;color:var(--muted);margin-bottom:6px">Current card</div>
            <div class="card" id="cardA">—</div>
          </div>
          <div>
            <div style="font-size:13px;color:var(--muted);margin-bottom:6px">Next card</div>
            <div class="card hidden" id="cardB">Hidden</div>
          </div>
        </div>
        <div class="controls">
          <div class="actions">
            <button id="btnHigher" class="small">Higher ↑</button>
            <button id="btnLower" class="small">Lower ↓</button>
            <button id="btnReveal" class="small secondary">Reveal</button>
          </div>
          <button id="btnNew" class="small secondary" style="margin-left:auto">New Round</button>
        </div>
        <div class="status" id="status">Click Higher or Lower to make a guess.</div>
    `;
  }

  function randCard(){ return Math.floor(Math.random()*10)+1; }

  function init(panel){
    // create UI inside provided panel
    buildUI(panel);

    // State
    state.current = null;
    state.next = null;
    state.score = 0;
    state.streak = 0;
    state.guessed = false;
    state.panel = panel;

    // Elements (scoped to panel)
    state.cardA = panel.querySelector('#cardA');
    state.cardB = panel.querySelector('#cardB');
    state.status = panel.querySelector('#status');
    state.scoreEl = panel.querySelector('#score');
    state.btnHigher = panel.querySelector('#btnHigher');
    state.btnLower = panel.querySelector('#btnLower');
    state.btnReveal = panel.querySelector('#btnReveal');
    state.btnNew = panel.querySelector('#btnNew');

    // Functions (bound to state)
    function render(){
      state.cardA.textContent = state.current === null ? '—' : state.current;
      state.cardA.classList.remove('hidden');
      if(state.guessed){
        state.cardB.textContent = state.next;
        state.cardB.classList.remove('hidden');
      } else {
        state.cardB.textContent = '';
        state.cardB.classList.add('hidden');
      }
      state.scoreEl.textContent = `Score: ${state.score} | Streak: ${state.streak}`;
    }

    function enableGuessButtons(enabled){
      state.btnHigher.disabled = !enabled;
      state.btnLower.disabled = !enabled;
      state.btnReveal.disabled = !enabled && !state.guessed;
    }

    function startRound(firstCard = null){
      state.guessed = false;
      state.current = firstCard === null ? randCard() : firstCard;
      state.next = randCard();
      state.cardB.classList.remove('reveal', 'flip-back');
      state.status.textContent = 'Make a guess: Higher or Lower?';
      enableGuessButtons(true);
      render();
    }

    function applyGuess(isHigher){
        if(state.guessed) return;
        state.guessed = true;
        state.cardB.classList.remove('hidden');  
        state.cardB.classList.add('reveal');      
        state.cardB.textContent = state.next;

        let correct = false;
        if(state.next === state.current) {
            correct = false;
        } else if(isHigher) {
            correct = state.next > state.current;
        } else {
            correct = state.next < state.current;
        }

        if(correct){
            state.score += 10;
            state.streak += 1;
            state.status.textContent = `Correct! ${state.next} ${isHigher ? '>' : '<'} ${state.current}. +10 points.`;
        } else {
            state.score = Math.max(0, state.score - 5);
            state.streak = 0;
            state.status.textContent = `Wrong. ${state.next} ${state.next === state.current ? '=' : (state.next > state.current ? '>' : '<')} ${state.current}. -5 points.`;
        }
        enableGuessButtons(false);
        render();
    }


    // attach listeners (store so we can remove on destroy)
    state._handlers = {
      higher: () => applyGuess(true),
      lower: () => applyGuess(false),
      reveal: () => {
        if(!state.guessed){
            state.guessed = true;
            state.cardB.classList.remove('hidden');
            state.cardB.classList.add('reveal');     
            state.cardB.textContent = state.next;
            state.status.textContent = `Revealed: ${state.next}. You didn't guess; no score change.`;
            enableGuessButtons(false);
        }
    },
      newRound: () => startRound(state.next)
    };

    state.btnHigher.addEventListener('click', state._handlers.higher);
    state.btnLower.addEventListener('click', state._handlers.lower);
    state.btnReveal.addEventListener('click', state._handlers.reveal);
    state.btnNew.addEventListener('click', state._handlers.newRound);

    // Start round
    startRound();
  }

  function destroy(){
    if(!state.panel) return;
    // remove listeners
    if(state.btnHigher) state.btnHigher.removeEventListener('click', state._handlers.higher);
    if(state.btnLower) state.btnLower.removeEventListener('click', state._handlers.lower);
    if(state.btnReveal) state.btnReveal.removeEventListener('click', state._handlers.reveal);
    if(state.btnNew) state.btnNew.removeEventListener('click', state._handlers.newRound);
    // clear panel
    state.panel.innerHTML = '';
    // reset internal state
    state = {};
  }

  window.GAMES.higher = { init, destroy };
})();
