const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('all 90 card costs, bonuses and prestige match photographed base-game deck',()=>{
  const cards=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/cards.js'),'utf8')+';CARDS');
  const rows=fs.readFileSync(path.join(__dirname,'verified-cards.csv'),'utf8').trim().split(/\r?\n/).slice(1);
  const colors=['white','blue','green','red','black'];
  const expected=rows.map(row=>{const [id,points,...cost]=row.split(',');return JSON.stringify([+id.split('-')[1].slice(1),colors.indexOf(id.split('-')[0]),+points,cost.map(Number)]);}).sort();
  const actual=Array.from(cards,c=>JSON.stringify([c.tier,c.color,c.points,Array.from(c.cost)])).sort();
  assert.deepEqual(actual,expected);
});
