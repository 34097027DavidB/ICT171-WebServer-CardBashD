// higher.js — exposes window.GAMES.higher with init(panel) and destroy()
window.GAMES = window.GAMES || {};
(function(){
  let state = {};
  const suits = ['♠','♥','♦','♣'];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  
  function makeDeck()
  { 
    const d=[]; 
    for(const s of suits) 
      for(const r of ranks) 
        d.push({suit:s,rank:r}); 
    return d; 
  }
  
  function shuffle(deck)
  { 
    for(let i=deck.length-1;i>0;i--)
      { 
        const j=Math.floor(Math.random()*(i+1)); 
        [deck[i],deck[j]]=[deck[j],deck[i]]; 
      } 
  }
  
  function cardValue(card)
  { 
    if(card.rank==='A') return 11; 
    if(['J','Q','K'].includes(card.rank)) 
      return 10; 
    return parseInt(card.rank,10); 
  }
  
  function handValue(hand)
  { 
    let total=0, aces=0; 
    for(const c of hand)
      { 
        total+=cardValue(c); 
        if(c.rank==='A') aces++; 
      } 
      while(total>21 && aces>0)
        { 
          total-=10; aces--; 
        } 
    return total; 
  }
  
  function renderCard(c, hide=false, animate=false)
  { 
    const div=document.createElement('div'); 
    div.className='card' + (hide ? ' hidden' : '');

    if(animate && !hide) 
    {
      div.classList.add('dealing');
    }

    if(!hide) 
      {
        if(c.suit === '♠' || c.suit === '♣') div.className += ' black-suit';
        else div.className += ' red-suit';
      }

    div.textContent = hide ? '' : (c.rank + c.suit); 
    return div; 
  }

  function renderUI(panel){
    panel.innerHTML = `
      <h1>Blackjack</h1>
      <div style="margin-top:8px">
        <div style="font-size:13px;color:var(--muted)">Dealer</div>
        <div id="bj_dealer" style="display:flex;gap:8px;margin-top:6px"></div>
        <div style="font-size:13px;color:var(--muted);margin-top:8px">Player</div>
        <div id="bj_player" style="display:flex;gap:8px;margin-top:6px"></div>
      </div>
      <div style="margin-top:12px">
        <button id="bj_deal">Deal</button>
        <button id="bj_hit">Hit</button>
        <button id="bj_stand">Stand</button>
        <label style="margin-left:12px;color:var(--muted)">Bet $</label>
        <input id="bj_bet" type="number" value="10" min="1" style="width:80px" />
      </div>
      <div id="bj_status" style="margin-top:10px;line-height:1.6"></div>
    `;
  }

  function start(panel){
    state.panel = panel;
    renderUI(panel);
    // elements
    state.dealerEl = panel.querySelector('#bj_dealer');
    state.playerEl = panel.querySelector('#bj_player');
    state.btnDeal = panel.querySelector('#bj_deal');
    state.btnHit = panel.querySelector('#bj_hit');
    state.btnStand = panel.querySelector('#bj_stand');
    state.betInput = panel.querySelector('#bj_bet');
    state.status = panel.querySelector('#bj_status');

    state.bank = 100;
    state.deck = [];
    state.dealer = [];
    state.player = [];
    state.inRound = false;

    function updateBank(){ 
      const bankText = `<strong>Bank: $${state.bank}</strong>`;
      if(!state.inRound && state.dealer.length === 0) {
        state.status.innerHTML = bankText + '<br/>Click "Deal" to start a new round.';
      } else if(state.status.innerHTML.includes('Bank:')) {
        state.status.innerHTML = bankText;
      }
    }

    function renderHands(showDealerHole=false, animate=false)
    {
      state.dealerEl.innerHTML='';
      for(let i=0;i<state.dealer.length;i++)
      {
        const hide = (i===1 && state.inRound && !showDealerHole);
        const cardEl = renderCard(state.dealer[i], hide, animate);

        if(i===1 && state.inRound === false && showDealerHole === true) 
        {
          cardEl.classList.add('reveal');
        }

        state.dealerEl.appendChild(cardEl);
      }
      
      state.playerEl.innerHTML='';
      for(const c of state.player) state.playerEl.appendChild(renderCard(c, false, animate));
    }



    function dealInitial(){
      const bet = Math.max(1, Math.floor(Number(state.betInput.value) || 1));  
      state.deck = makeDeck();   
      shuffle(state.deck);  
      state.dealer = [];   
      state.player = [];  
      state.player.push(state.deck.pop());  
      state.dealer.push(state.deck.pop());  
      state.player.push(state.deck.pop());  
      state.dealer.push(state.deck.pop());  
      state.inRound = true;

      renderHands(false, true);
      
      const playerVal = handValue(state.player);
      const dealerVisible = state.dealer[0].rank + state.dealer[0].suit;
      
      state.status.innerHTML = `
        <strong>Round started!</strong><br/>
        Bet: $${bet}<br/>
        Dealer showing: ${dealerVisible}<br/>
        Your hand value: ${playerVal}<br/>
        <em>Choose Hit or Stand.</em>
      `;
      
      state.btnHit.disabled=false; 
      state.btnStand.disabled=false; 
      state.btnDeal.disabled=true;
      
      if(playerVal === 21) {
        endRound('playerBlackjack');
      }
    }

    function playerHit()
    {
      if(!state.inRound) return;
      const newCard = state.deck.pop();
      state.player.push(newCard);
      const playerVal = handValue(state.player);
  
      state.status.innerHTML = `
        <strong>You drew a card.</strong><br/>
        New card: ${newCard.rank}${newCard.suit}<br/>
        Your hand value: ${playerVal}<br/>
      `;
  
      renderHands(false, true);
  
      if(playerVal > 21) 
      {
        endRound('playerBust');
      } 
      else if(playerVal === 21) 
      {
        state.status.innerHTML += '<em>You have 21! Stand to let the dealer play.</em>';
      }
    }

    function dealerTurn()
    {
      state.inRound = false;
      renderHands(true, true);
  
      const dealerVal = handValue(state.dealer);
      state.status.innerHTML = `
        <strong>Dealer's turn.</strong><br/>
        Dealer's hand value: ${dealerVal}<br/>
      `;

      let moveCount = 0;
      const dealerDrawInterval = setInterval(() => 
      {
        if(handValue(state.dealer) >= 17) 
          {
            clearInterval(dealerDrawInterval);
            const finalDealerVal = handValue(state.dealer);
            state.status.innerHTML += `Dealer stands at ${finalDealerVal}.<br/>`;
      
            const d = finalDealerVal, p = handValue(state.player);
            if(d>21) endRound('dealerBust');
            else if(d>p) endRound('dealerWin');
            else if(d<p) endRound('playerWin');
            else endRound('push');
            return;
          }
    
          const newCard = state.deck.pop();
          state.dealer.push(newCard);
          state.status.innerHTML += `Dealer drew: ${newCard.rank}${newCard.suit} (value: ${handValue(state.dealer)})<br/>`;
          renderHands(true, true);
        }, 800);
    }

    function endRound(reason){
      state.inRound = false;
      renderHands(true);
      state.btnHit.disabled=true; 
      state.btnStand.disabled=true; 
      state.btnDeal.disabled=false;
      
      const bet = Math.max(1, Math.floor(Number(state.betInput.value) || 1));
      const playerVal = handValue(state.player);
      const dealerVal = handValue(state.dealer);
      
      let resultMessage = '';
      let resultColor = 'color:var(--muted)';
      
      switch(reason){
        case 'playerBlackjack': 
          state.bank += Math.floor(bet*1.5); 
          resultMessage = `🎉 <strong style="${resultColor}">BLACKJACK!</strong><br/>You were dealt 21. You win $${Math.floor(bet*1.5)}!`;
          break;
        case 'playerBust': 
          state.bank -= bet; 
          resultMessage = `❌ <strong style="${resultColor}">BUST!</strong><br/>Your hand (${playerVal}) exceeded 21. You lose $${bet}.`;
          break;
        case 'dealerBust': 
          state.bank += bet; 
          resultMessage = `✓ <strong style="${resultColor}">DEALER BUST!</strong><br/>Dealer's hand (${dealerVal}) exceeded 21. You win $${bet}!`;
          break;
        case 'playerWin': 
          state.bank += bet; 
          resultMessage = `✓ <strong style="${resultColor}">YOU WIN!</strong><br/>Your ${playerVal} beats dealer's ${dealerVal}. You win $${bet}!`;
          break;
        case 'dealerWin': 
          state.bank -= bet; 
          resultMessage = `❌ <strong style="${resultColor}">DEALER WINS.</strong><br/>Dealer's ${dealerVal} beats your ${playerVal}. You lose $${bet}.`;
          break;
        case 'push': 
          resultMessage = `🤝 <strong style="${resultColor}">PUSH.</strong><br/>Both have ${playerVal}. No money changes hands.`;
          break;
      }
      
      if(state.bank<0) state.bank=0;
      
      state.status.innerHTML = `
        ${resultMessage}<br/>
        <br/>
        <strong>Bank: $${state.bank}</strong><br/>
        <em>Click "Deal" to play another round.</em>
      `;
    }

    // wire buttons
    state.btnDeal.addEventListener('click', () => { if(!state.inRound) dealInitial(); });
    state.btnHit.addEventListener('click', () => playerHit());
    state.btnStand.addEventListener('click', () => { if(state.inRound) dealerTurn(); });

    // initial
    state.btnHit.disabled=true; 
    state.btnStand.disabled=true; 
    updateBank();
  }

  function destroy(){
    if(state.panel) state.panel.innerHTML='';
    state = {};
  }

  window.GAMES.blackjack = { init: start, destroy };
})();
