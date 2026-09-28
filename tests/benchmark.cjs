const {environment}=require('./game.test.cjs');
const results={};
for(const level of ['최상','마스터']){
  results[level]={wins:0,losses:0,ties:0,games:0,maxDecisionMs:0,rounds:0};
  for(let seed=1;seed<=8;seed++)for(let seat=0;seat<2;seat++){
    const e=environment(seed),r=results[level];
    e.run(`start(['상']);game.players[${seat}].level='${level}';game.players[${1-seat}].level='상';`);
    for(let step=0;step<600&&!e.run('game.over');step++){
      const before=performance.now();e.run('aiMove()');r.maxDecisionMs=Math.max(r.maxDecisionMs,performance.now()-before);
      e.run(`if(game.phase==='return'){const s=SplendorAI.snapshot(game,0),returned=SplendorAI.trim(s);returned.forEach((n,i)=>{for(let j=0;j<n;j++)returnToken(i)})}if(game.phase==='noble'){chooseNoble(game.nobles.find(n=>n.cost.every((v,i)=>game.players[0].bonus[i]>=v)).id)}`);
      e.run(`for(let i=0;i<6;i++){if(game.bank[i]+game.players.reduce((s,p)=>s+p.tokens[i],0)!==(i===5?5:4))throw Error('Token conservation');if(game.bank[i]<0||game.players.some(p=>p.tokens[i]<0))throw Error('Negative token')}if(game.players.some(p=>sum(p.tokens)>10||p.reserved.length>3))throw Error('Limit violated');const ids=[...game.decks.flat(),...marketCards(),...game.players.flatMap(p=>[...p.cards,...p.reserved])].map(c=>c.id);if(ids.length!==90||new Set(ids).size!==90)throw Error('Deck integrity');`);
    }
    if(!e.run('game.over'))throw Error('Stalled game '+level+' '+seed);
    const players=JSON.parse(e.run('JSON.stringify(game.players.map(p=>({points:p.points,cards:p.cards.length})))'));
    const a=players[seat],b=players[1-seat],outcome=a.points-b.points||b.cards-a.cards;
    r[outcome>0?'wins':outcome<0?'losses':'ties']++;r.games++;r.rounds+=e.run('game.round-1');
  }
  console.log('BENCHMARK',level,JSON.stringify(results[level]));
}
