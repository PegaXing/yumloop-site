// Turns the chosen candidates into pitch/ams/boards.json for build.js.
// Edit PICKS (bucket -> candidate tag from candidates.json) and the copy; run: node select.js
const fs = require('fs'), path = require('path');
const C = JSON.parse(fs.readFileSync(path.join(__dirname, 'candidates.json'), 'utf8'));
const PICKS = JSON.parse(fs.readFileSync(path.join(__dirname, 'picks.json'), 'utf8'));
function find(bucket, tag){ const r = (C[bucket]||[]).find(x => x.tag === tag); if(!r) throw new Error('no candidate '+bucket+'/'+tag+' — have: '+(C[bucket]||[]).map(x=>x.tag).join(' ')); return r; }
const samples = PICKS.map(p => { const r = find(p.bucket, p.tag); return { bucket:p.bucket, tag:p.tag, level:r.level, difficulty:p.difficulty, title:p.title, intro:p.intro||null, note:p.note||'', solve:p.solve||'', metrics:{rounds:r.rounds, steps:r.steps, mines:r.mines, size:r.w+'x'+r.h, score:r.score}, board:r.board }; });
fs.writeFileSync(path.join(__dirname, 'boards.json'), JSON.stringify({ samples }, null, 1));
console.log(samples.map((s,i)=>'Sample '+(i+1)+': '+s.tag+' '+s.metrics.size+'/'+s.metrics.mines+' — '+s.title+' ('+s.difficulty+')').join('\n'));
