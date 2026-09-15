// Contact sheet of shortlisted candidates (solved boards + the first deductions in words) for choosing by eye.
const fs=require('fs'), path=require('path');
const R=require('./render.js'); const {H,grade,solveTrace}=require(path.join(process.env.HOME,'Downloads/sightline-ios/qa/ams_pick.js'));
console.warn=()=>{};
const win=H.__win;
function byTag(tag){ const m=/^L(\d+)(?:n(\d+))?$/.exec(tag); const L=+m[1]; if(!m[2]) return H.makeBoard(L);
  const saved=H.PRECOMPUTED_LEVELS[L]; delete H.PRECOMPUTED_LEVELS[L]; let b=null; try { win._seedNudge=+m[2]; b=H.makeBoard(L); } finally { win._seedNudge=0; H.PRECOMPUTED_LEVELS[L]=saved; } b.level=L; return b; }
const words=t=>{ const s=t.source||{}; const det=t.determines.map(d=>d[0]+(d[1]==='M'?' bomb':' safe')).join(', '); return (s.type==='sightline'?('('+s.from+') looks '+s.dir):'clue')+' → '+det; };
const tags=process.argv.slice(2);
let html='<!doctype html><meta charset="utf-8"><style>body{font-family:Archivo,sans-serif;margin:16px;background:#fff}'+
 fs.readFileSync('Sightline_Andrews_McMeel_Submission.html','utf8').match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\.page\{[^}]*\}/,'')+
 '.card{display:inline-block;vertical-align:top;margin:10px;padding:10px;border:1px solid #ccc;width:420px}.card h4{margin:0 0 6px;font:700 13px Sora,sans-serif}.card ol{font-size:10.5px;margin:6px 0 0;padding-left:16px;line-height:1.35}.pair{display:flex;gap:8px}</style>';
for(const tag of tags){ const b=byTag(tag); const g=grade(b); const {trace}=solveTrace(b);
  html+='<div class="card"><h4>'+tag+' · '+b.w+'x'+b.h+'/'+b.mines.length+' · '+g.mechs+' · score '+g.score+' · rounds '+g.rounds+' steps '+g.steps+'</h4><div class="pair">'+R.board(b,'puzzle',{t:34})+R.board(b,'solution',{t:34})+'</div><ol>'+trace.slice(0,7).map(t=>'<li>r'+t.round+' '+words(t)+'</li>').join('')+(trace.length>7?'<li>… '+(trace.length-7)+' more</li>':'')+'</ol></div>'; }
fs.writeFileSync('sheet.html', html); console.log('sheet.html', tags.length, 'cards');
