/* Search only public cards and the acting player's own hand. No deck peeking. */
const SplendorAI = (() => {
  const total = a => a.reduce((s, n) => s + n, 0);
  const clonePlayer = p => ({...p, tokens:p.tokens.slice(), bonus:p.bonus.slice(), reserved:p.reserved.slice(), cards:p.cards.slice(), nobles:p.nobles.slice()});
  const deficit = (p,c) => c.cost.map((n,i)=>Math.max(0,n-p.bonus[i]-p.tokens[i]));
  const distance = (p,c) => Math.max(0,total(deficit(p,c))-p.tokens[5]);
  const affordable = (p,c) => distance(p,c) === 0;
  const nobleDistance = (p,n) => total(n.cost.map((v,i)=>Math.max(0,v-p.bonus[i])));
  function snapshot(g, actor) {
    return {p:clonePlayer(g.players[actor]), bank:g.bank.slice(), market:g.market.flat().filter(Boolean), nobles:g.nobles.slice()};
  }
  function actions(s) {
    const result=[];
    for(const c of [...s.market,...s.p.reserved]) if(affordable(s.p,c)) result.push({type:'buy',id:c.id});
    // All legal distinct-colour subsets, including one/two when useful.
    for(let mask=1;mask<32;mask++) {
      const a=[0,0,0,0,0,0];
      for(let i=0;i<5;i++) a[i]=(mask>>i)&1;
      if(total(a)<=3&&a.every((n,i)=>n<=s.bank[i])) result.push({type:'take',tokens:a});
    }
    for(let i=0;i<5;i++) if(s.bank[i]>=4) {const a=[0,0,0,0,0,0];a[i]=2;result.push({type:'take',tokens:a});}
    if(s.p.reserved.length<3) for(const c of s.market) result.push({type:'reserve',id:c.id});
    return result;
  }
  function potential(s) {
    const p=s.p;
    const targets=[...s.market,...p.reserved].map(c=>{
      const need=deficit(p,c),missing=distance(p,c);
      const turns=1+Math.max(Math.ceil(missing/3),Math.ceil((Math.max(...need)-p.tokens[5])/2));
      const nobleGain=s.nobles.some(n=>n.cost.every((v,i)=>v<=p.bonus[i]+(i===c.color?1:0)))?3:0;
      const engine=2.4/(1+p.bonus[c.color]*.3);
      return (c.points*3+nobleGain*3+engine)/turns;
    }).sort((a,b)=>b-a);
    return (targets[0]||0)+(targets[1]||0)*.25+(targets[2]||0)*.1;
  }
  function evaluate(s) {
    const p=s.p, engine=p.bonus.slice(0,5).reduce((v,b)=>v+Math.log2(1+b),0);
    const noble=s.nobles.map(n=>3.8/(1+nobleDistance(p,n))).sort((a,b)=>b-a);
    const tokenValue=p.tokens.slice(0,5).reduce((v,n,i)=>v+Math.min(n,Math.max(0,...[...s.market,...p.reserved].map(c=>c.cost[i]-p.bonus[i])))*.17,0);
    return p.points*5.5+engine*(p.points<10?1.35:.7)+potential(s)*.8+(noble[0]||0)+(noble[1]||0)*.3+tokenValue+p.tokens[5]*.65-p.reserved.length*.16;
  }
  function trim(s) {
    const returned=[0,0,0,0,0,0];
    while(total(s.p.tokens)>10) {
      let best=-Infinity, colour=-1;
      for(let i=0;i<6;i++) if(s.p.tokens[i]) {
        s.p.tokens[i]--;const value=evaluate(s);s.p.tokens[i]++;
        if(value>best){best=value;colour=i;}
      }
      s.p.tokens[colour]--;s.bank[colour]++;returned[colour]++;
    }
    return returned;
  }
  function apply(s,a) {
    const n={p:clonePlayer(s.p),bank:s.bank.slice(),market:s.market.slice(),nobles:s.nobles.slice()},p=n.p;
    if(a.type==='take') a.tokens.forEach((v,i)=>{p.tokens[i]+=v;n.bank[i]-=v;});
    else {
      const c=[...n.market,...p.reserved].find(c=>c.id===a.id);
      if(!c)return null;
      n.market=n.market.filter(x=>x.id!==c.id);
      if(a.type==='buy') {
        c.cost.forEach((v,i)=>{const need=Math.max(0,v-p.bonus[i]),pay=Math.min(need,p.tokens[i]);p.tokens[i]-=pay;n.bank[i]+=pay;p.tokens[5]-=need-pay;n.bank[5]+=need-pay;});
        p.reserved=p.reserved.filter(x=>x.id!==c.id);p.cards.push(c);p.bonus[c.color]++;p.points+=c.points;
      } else {p.reserved.push(c);if(n.bank[5]){n.bank[5]--;p.tokens[5]++;}}
    }
    trim(n);
    const noble=n.nobles.find(x=>nobleDistance(p,x)===0);
    if(noble){p.points+=3;p.nobles.push(noble);n.nobles=n.nobles.filter(x=>x.id!==noble.id);}
    return n;
  }
  function ranked(s,width) {
    const seen=new Set();
    return actions(s).map(a=>({a,s:apply(s,a)})).filter(x=>{
      const key=JSON.stringify([x.s.p.tokens,x.s.p.bonus,x.s.p.points,x.s.p.reserved.map(c=>c.id)]);
      if(seen.has(key))return false;seen.add(key);return true;
    }).map(x=>({...x,value:evaluate(x.s)})).sort((a,b)=>b.value-a.value).slice(0,width);
  }
  // Predict each intervening opponent's strongest visible purchase/reservation.
  // Unknown hands stay unknown. Market replacements are not invented.
  function opposition(s,g,actor) {
    let risk=0;
    const next={...s,bank:s.bank.slice(),market:s.market.slice(),nobles:s.nobles.slice()};
    for(let offset=1;offset<g.players.length;offset++) {
      const opponent=g.players[(actor+offset)%g.players.length];
      const os={p:{...clonePlayer({...opponent,reserved:[]}),reserved:[]},bank:next.bank.slice(),market:next.market.slice(),nobles:next.nobles.slice()};
      const options=ranked(os,1);if(!options.length)continue;
      const best=options[0];
      if(best.a.type==='buy'||best.a.type==='reserve'){
        next.market=best.s.market;next.bank=best.s.bank;next.nobles=best.s.nobles;
        risk+=Math.max(0,best.s.p.points-opponent.points)*.3;
        if(best.s.p.points>=15&&(best.s.p.points>next.p.points||(best.s.p.points===next.p.points&&best.s.p.cards.length<=next.p.cards.length)))risk+=150;
      }else{next.bank=best.s.bank;}
    }
    return {s:next,risk};
  }
  function choose(g,actor,level=g.players[actor].level) {
    const initial=snapshot(g,actor),master=level==='마스터';
    const depth=master?3:2,width=master?14:9;
    const root=ranked(initial,width);if(!root.length)return {type:'pass'};
    // Never delay a winning purchase for speculative future engine value.
    const winning=root.filter(x=>x.s.p.points>=15&&x.a.type==='buy');
    if(winning.length)return winning.sort((a,b)=>b.s.p.points-a.s.p.points||a.s.p.cards.length-b.s.p.cards.length)[0].a;
    let best=root[0].a, bestScore=-Infinity;
    for(const candidate of root){
      let state=candidate.s,penalty=0;
      if(master){const response=opposition(state,g,actor);state=response.s;penalty=response.risk;}
      let beam=[{s:state,value:evaluate(state),score:candidate.value,root:candidate.a}];
      const horizon=g.final?1:depth;
      for(let d=1;d<horizon;d++){
        let expanded=[];
        for(const node of beam){
          if(node.s.p.points>=15){expanded.push({...node,score:node.score+180/(d+1)});continue;}
          const children=ranked(node.s,master?7:5);
          if(!children.length)expanded.push(node);
          for(const child of children) expanded.push({s:child.s,value:child.value,score:node.score+(child.value-node.value)*Math.pow(.88,d)});
        }
        beam=expanded.sort((a,b)=>b.score-a.score).slice(0,master?7:4);
      }
      const score=(beam[0]?.score??candidate.value)-penalty;
      if(score>bestScore){bestScore=score;best=candidate.a;}
    }
    return best;
  }
  return {snapshot,actions,apply,evaluate,trim,choose,distance};
})();
if(typeof module!=='undefined')module.exports=SplendorAI;
