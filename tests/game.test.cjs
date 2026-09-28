const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
function environment(seed=7){
  let state=seed,els={};const mock=()=>({value:'2',style:{},dataset:{},open:false,close(){this.open=false},showModal(){this.open=true},addEventListener(){},setAttribute(){}});
  const math=Object.create(Math);math.random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
  const c=vm.createContext({console,Math:math,document:{querySelector:s=>els[s]??=mock(),querySelectorAll:()=>[]},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){}});
  for(const file of ['cards.js','ai.js','game.js'])vm.runInContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),c);
  vm.runInContext('render=()=>{};tone=()=>{};animateTokens=()=>{};queueAI=()=>{};soundOn=false;',c);
  return {run:code=>vm.runInContext('{'+code+'}',c),c};
}
test('90 unique cards; correct tier counts and gold payment after discounts',()=>{
  const e=environment();assert.equal(e.run('CARDS.length'),90);
  assert.deepEqual(JSON.parse(e.run('JSON.stringify([1,2,3].map(t=>CARDS.filter(c=>c.tier===t).length))')),[40,30,20]);
  e.run(`start(['중']);game.players[0].tokens=[0,0,0,0,0,2];game.players[0].bonus=[1,0,0,0,0,0];game.market[0][0]={id:900,tier:1,color:1,points:1,cost:[2,1,0,0,0]};buy(900);`);
  assert.equal(e.run('game.players[0].points'),1);assert.equal(e.run('game.players[0].tokens[5]'),0);assert.equal(e.run('game.players[0].bonus[1]'),1);
});
test('gold counts toward ten; take and reserve cannot finish before return',()=>{
  const e=environment();e.run(`start(['중']);game.players[0].tokens=[2,2,2,2,0,1];take([1,1,1,0,0,0]);`);
  assert.equal(e.run('game.phase'),'return');assert.equal(e.run('game.turn'),0);
  assert.equal(e.run('sum(game.players[0].tokens)'),12);assert.equal(e.run('buy(game.market[0][0].id)'),false);
  e.run('returnToken(5);');assert.equal(e.run('game.turn'),0);
  e.run('returnToken(0);');assert.equal(e.run('sum(game.players[0].tokens)'),10);assert.equal(e.run('game.turn'),1);
  e.run(`start(['중']);game.players[0].tokens=[2,2,2,2,1,1];reserve(game.market[0][0].id);`);
  assert.equal(e.run('game.phase'),'return');assert.equal(e.run('game.players[0].tokens[5]'),2);
  e.run('returnToken(5)');assert.equal(e.run('sum(game.players[0].tokens)'),10);
});
test('take validation and hand limit',()=>{
  const e=environment();e.run('start(["중"]);game.bank[0]=3;');
  assert.equal(e.run('validTake([2,0,0,0,0,0])'),false);
  assert.equal(e.run('validTake([0,0,0,0,0,1])'),false);
  assert.equal(e.run('validTake([-1,1,1,0,0,0])'),false);
  e.run('game.players[0].reserved=CARDS.slice(0,3);');assert.equal(e.run('reserve(game.market[0][0].id)'),false);
});
test('master buys a winning card and reserves a visible opponent winning card',()=>{
  const e=environment();e.run(`start(['마스터']);game.turn=1;game.players[1].points=14;game.players[1].tokens=[1,0,0,0,0,0];game.market=[[{id:901,tier:1,color:0,points:1,cost:[1,0,0,0,0]}],[],[]];`);
  assert.equal(e.run('SplendorAI.choose(game,1).type'),'buy');
  e.run(`game.players[1].points=0;game.players[1].tokens=zero();game.players[0].points=14;game.players[0].tokens=[4,0,0,0,0,0];game.market=[[{id:902,tier:1,color:0,points:1,cost:[4,0,0,0,0]}],[],[]];`);
  assert.equal(e.run('SplendorAI.choose(game,1).type'),'reserve');
});
test('hidden deck and opponent hand cannot affect master decisions',()=>{
  const e=environment();e.run(`start(['마스터']);game.turn=1;`);
  const first=e.run('JSON.stringify(SplendorAI.choose(game,1))');
  e.run(`game.decks.forEach(d=>d.reverse());game.players[0].reserved=CARDS.slice(-3);`);
  assert.equal(e.run('JSON.stringify(SplendorAI.choose(game,1))'),first);
});
test('new difficulty choices appear in every selector',()=>{
  const e=environment();assert.ok(e.run(`$('#levels').innerHTML.includes('<option>최상</option><option>마스터</option>')`));
});
module.exports={environment};
