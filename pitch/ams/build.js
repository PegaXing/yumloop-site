// Builds the Andrews McMeel submission: pitch/ams/boards.json -> Sightline_Andrews_McMeel_Submission.html
// -> the PDF, printed by the same Electron that renders the publisher pitch PDF.
//   cd ~/Downloads/sightline-ios/steam && node_modules/.bin/electron ~/Downloads/yumloop-site/pitch/ams/build.js
// Design tokens, fonts and tile styling come from sightline-pitch.html and the game itself.
const path = require('path'), fs = require('fs');
const R = require('./render.js');
const DIR = __dirname, SITE = path.join(DIR, '..', '..');
const spec = JSON.parse(fs.readFileSync(path.join(DIR, 'boards.json'), 'utf8'));
const OUT_HTML = path.join(DIR, 'Sightline_Andrews_McMeel_Submission.html');
const OUT_PDF  = path.join(DIR, 'Sightline_Andrews_McMeel_Submission.pdf');
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

// ---------------------------------------------------------------- mechanic explainers (tiny boards, real ray logic)
// an EMPTY validCells set means "no cells" to the engine, so every demo strip lists all of its cells explicitly
function strip(cells, w, h, extra){ if(!cells){ cells=[]; for(let y=0;y<h;y++) for(let x=0;x<w;x++) cells.push(x+','+y); }
  return Object.assign({ w, h, mines:[], occluders:[], hchan:[], vchan:[], defF:[], defB:[], nbr:[], portals:[], portalDir:'right', portalDirs:{}, o1u:[], o1d:[], o1l:[], o1r:[], rh:[], rv:[], opening:[], validCells:cells }, extra); }
const MECH = {
  wall: { name:'Walls', line:'Walls stop sightlines completely.',
    detail:'A sightline ends the moment it reaches a wall. Whatever lies beyond the wall is simply not counted.',
    demo(){ const b=strip(null,6,1,{ occluders:['4,0'], mines:['2,0'], opening:['0,0'] }); return R.board(b,'puzzle',{t:52, showMines:true, beams:[{from:'0,0',dir:'right'}]}); },
    caption:'The clue on the left sees 1 bomb, then stops at the wall. The tile behind the wall is out of sight.' },
  mirror: { name:'Mirrors', line:'Mirrors turn sightlines by 90 degrees.',
    detail:'The number on a clue counts bombs along the whole bent path, so one clue can look around a corner.',
    demo(){ const b=strip(null,5,3,{ defB:['3,0'], mines:['3,2'], opening:['0,0'] }); return R.board(b,'puzzle',{t:52, showMines:true, beams:[{from:'0,0',dir:'right'}]}); },
    caption:'Looking right, the sightline meets the mirror, turns down, and finds the bomb below it: the clue reads 1.' },
  oneway: { name:'One-way arrows', line:'Arrows let sight through only the way they point.',
    detail:'A sightline travelling with the arrow passes straight through. Coming back against it, or crossing it sideways, it is blocked like a wall.',
    demo(){ const b=strip(null,5,3,{ o1r:['2,1'], mines:['4,1','2,0'], opening:['0,1','2,2'] }); return R.board(b,'puzzle',{t:52, showMines:true, beams:[{from:'0,1',dir:'right'},{from:'2,2',dir:'up'}]}); },
    caption:'From the left, sight passes through the arrow and reaches the bomb. From below, the same arrow blocks the view.' },
  portal: { name:'Portals', line:'A sightline entering a portal continues from its paired portal.',
    detail:'Each portal wears an arrow. Sight enters a portal only when moving in that direction, and leaves the partner along the partner’s own arrow. Reached any other way, a portal blocks sight like a wall.',
    demo(){ const b=strip(null,6,2,{ portals:['2,0','1,1'], portalDirs:{'2,0':'right','1,1':'right'}, mines:['4,1'], opening:['0,0'] }); return R.board(b,'puzzle',{t:52, showMines:true, beams:[{from:'0,0',dir:'right'}]}); },
    caption:'Looking right, sight enters the top portal, reappears at its partner on the row below, and continues to the bomb.' },
  chan: { name:'Channels', line:'Channels pass sight along their arrows, in either direction, and block it across.',
    detail:'A horizontal channel is a window for sightlines travelling left or right; to a sightline travelling up or down it is a wall.',
    demo(){ const b=strip(null,5,3,{ hchan:['2,1'], mines:['4,1','2,0'], opening:['0,1','2,2'] }); return R.board(b,'puzzle',{t:52, showMines:true, beams:[{from:'0,1',dir:'right'},{from:'2,2',dir:'up'}]}); },
    caption:'Left to right the channel is open and the bomb is seen. From below it is a wall.' },
};

// ---------------------------------------------------------------- annotated example for page 2
function annotatedExample(){
  const b = strip(null,5,5,{ mines:['0,2','2,0','2,4','4,1'], opening:['2,2'] });
  const c = R.clueAt(b,2,2);
  const html = R.board(b,'puzzle',{t:76, beams:[{from:'2,2',dir:'left'},{from:'2,2',dir:'right'},{from:'2,2',dir:'up'},{from:'2,2',dir:'down'}], showMines:true});
  return { html, c };
}

// ---------------------------------------------------------------- pages
function cover(){
  return `<section class="page blue cover">
    <img class="brandmark" src="../../yumloop-logo.png" alt="Yumloop">
    <div class="cover-mid">
      <img class="appicon" src="../../press/sightline-icon-1024.png" alt="">
      <div class="lockup"><div class="wm">Sightline</div><span class="lp">Logic puzzle</span></div>
      <h1>A New Daily<br>Logic Puzzle</h1>
      <div class="kicker">Created by Yumloop</div>
    </div>
    <p class="tag">“Every puzzle has a logical solution. No guessing.”</p>
    <div class="foot-line"><span>Puzzle submission · Andrews McMeel Syndication</span><span>yumloop.net</span></div>
  </section>`;
}
function thePuzzle(){
  const ex = annotatedExample();
  return `<section class="page">
    <div class="kicker">The puzzle</div>
    <h2>Every number can see something.</h2>
    <hr class="rule">
    <div class="two">
      <div>
        <p class="lede">Sightline is a pure deduction puzzle where clues do not tell you what is immediately next to them.</p>
        <p class="body">Instead, a number tells you how many bombs are visible in one direction: up, down, left or right. The edge it sits on is the way it looks.</p>
        <p class="body">Players combine overlapping sightlines to work out which tiles hold bombs and which are safe. Every puzzle is solvable entirely through logic.</p>
        <p class="body strong">No guessing. No luck. Just deduction.</p>
      </div>
      <div class="example">
        ${ex.html}
        <div class="callouts">
          <div class="co"><b>One clue tile.</b> Its four numbers each look one way from the edge they sit on.</div>
          <div class="co"><b>Left ${ex.c.left}, up ${ex.c.up}, down ${ex.c.down}.</b> One bomb is hidden somewhere along each of those lines.</div>
          <div class="co"><b>Right ${ex.c.right}.</b> Nothing that way, so every tile to the right is safe.</div>
          <div class="co"><b>Sightlines stop at the edge of the board</b> — and, later, at walls. A bomb that sits off all four lines is invisible to this clue.</div>
        </div>
      </div>
    </div>
  </section>`;
}
function whyDaily(){
  const pts = ['Easy to understand core rule','Short daily play sessions','Pure deduction','Controlled difficulty','Procedural puzzle generation','Effectively unlimited puzzle supply','Daily puzzle support','Suitable for desktop, mobile and touch','Clear completion state','Supports completion times and leaderboards','Scales from approachable beginner puzzles to difficult expert boards'];
  return `<section class="page">
    <div class="kicker">Why it works as a daily puzzle</div>
    <h2>One rule. A new board every day.</h2>
    <hr class="rule">
    <ul class="checks">${pts.map(p=>'<li>'+esc(p)+'</li>').join('')}</ul>
    <p class="big">Sightline can support a new puzzle every day without relying on a manually authored finite puzzle library.</p>
    <p class="body">Every board is generated, then proven by a solver to have exactly one solution reachable by deduction alone. The solver also grades how the solve unfolds, so difficulty is a dial rather than a lottery: a Monday can be gentle and a Saturday can be a proper sit-down.</p>
    <div class="linkbox"><div class="kicker">Playable game and trailer</div><a href="https://yumloop.net/sightline-pitch.html">https://yumloop.net/sightline-pitch.html</a></div>
  </section>`;
}
function mechCard(key, ghost){
  const m = MECH[key]; if(!m) return '';
  return `<div class="mech${ghost ? ' ghost' : ''}"><div class="mech-demo">${m.demo()}</div><div class="mech-text"><div class="kicker">New: ${esc(m.name)}</div><p class="mline">${esc(m.line)}</p><p class="mdetail">${esc(m.detail)}</p><p class="mcap">${esc(m.caption)}</p></div></div>`;
}
// board slot: ~768px tall on a plain sample page, ~550px beneath a mechanic card (measured); cells cap at 104px
function cellSize(b, hasMech){ const avail = hasMech ? 500 : 560; return Math.floor(Math.min(avail / Math.max(b.w,b.h), 104)); }
function samplePages(s, i){
  const b = s.board; const n = i+1; const t = cellSize(b, !!s.intro);
  const meta = `Difficulty: ${esc(s.difficulty)} · ${b.w}×${b.h} · ${b.mines.length} bombs`;
  return `<section class="page sample">
    <div class="kicker">Sample ${n} · ${esc(s.difficulty)}</div>
    <h2>${esc(s.title)}</h2>
    <hr class="rule">
    ${s.intro ? mechCard(s.intro) : ''}
    <div class="boardwrap">${R.board(b,'puzzle',{t})}</div>
    <div class="foot"><div class="meta">${meta}</div>${s.note ? '<p class="note">'+esc(s.note)+'</p>' : ''}</div>
  </section>
  <section class="page sample">
    <div class="kicker">Sample ${n} · Solution</div>
    <h2>${esc(s.title)}</h2>
    <hr class="rule">
    ${s.intro ? mechCard(s.intro, true) : ''}
    <div class="boardwrap">${R.board(b,'solution',{t})}</div>
    <div class="foot"><div class="meta">${meta}</div><p class="note">${s.solve ? esc(s.solve) : 'Every safe tile revealed with its clues, every bomb shown. Compare with the puzzle page: same board, same scale.'}</p></div>
  </section>`;
}
function contact(){
  return `<section class="page blue close">
    <div class="lockup"><div class="wm">Sightline</div><span class="lp">Logic puzzle</span></div>
    <h2 class="c">Every clue has a point of view.</h2>
    <p class="sub c">Sightline is currently playable across iOS, Android, PC and macOS and is being developed as both a standalone puzzle game and a recurring Daily puzzle format.</p>
    <p class="sub c">The core rules are simple, while walls, mirrors, directional channels and portals allow the puzzle system to expand into increasingly sophisticated deductions.</p>
    <p class="sub c">I would be very interested in discussing Sightline as a syndicated puzzle for Andrews McMeel.</p>
    <div class="linkbox inv"><div class="kicker">Playable game, trailer and additional information</div><a href="https://yumloop.net/sightline-pitch.html">https://yumloop.net/sightline-pitch.html</a></div>
    <div class="contact">
      <div class="kicker">Contact</div>
      <p><b>Yoni</b><br>Founder, Yumloop<br>Former Rockstar Designer</p>
      <p><a href="mailto:yoni@yumloop.net">yoni@yumloop.net</a><br><a href="https://yumloop.net">yumloop.net</a></p>
    </div>
    <img class="brandmark bottom" src="../../yumloop-logo.png" alt="Yumloop">
  </section>`;
}

const CSS = `
@page { size: A4 portrait; margin: 0; }
:root{ --blue:#140FD7; --lilac:#BFA6FD; --gold:#F5B301; --red:#ff2e2e; --ink:#06062B; --muted:#6b6d8a;
  --sans:Archivo,-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif; --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace; --display:Sora,var(--sans);
  --c-mine:#ff2e2e; --c-beam:#3d6aff; --c-chan:#0040f7; --c-oneway:#0d9488; --c-nbr:#a040d8; --c-defl:#ffb88a; --c-portal:#22c55e; --c-refl:#ff5fa9;
  --n1:#000000; --n2:#0eb14a; --n3:#7d2bd6; --n4:#ff9500; --n5:#e60000; --ui:Sora,sans-serif; --bw:3px; }
*{box-sizing:border-box} html,body{margin:0;padding:0;background:#fff;color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;padding:18mm 18mm 16mm;position:relative;overflow:hidden;break-after:page;page-break-after:always;display:flex;flex-direction:column}
.page.blue{background:var(--blue);color:#fff}
.kicker{font-family:var(--mono);font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
.page.blue .kicker{color:rgba(255,255,255,.7)}
h1{font-family:var(--display);font-weight:800;font-size:58px;line-height:.96;letter-spacing:-.02em;margin:.25em 0 .35em}
h2{font-family:var(--display);font-weight:800;font-size:34px;letter-spacing:-.015em;line-height:1.04;margin:0 0 14px}
h2.c{text-align:center;font-size:36px;margin:8px 0 18px}
.rule{height:1px;background:#c9cadb;border:0;margin:0 0 20px} .page.blue .rule{background:rgba(255,255,255,.3)}
p{line-height:1.5;margin:0 0 .8em}
.lede{font-family:var(--sans);font-weight:600;font-size:18px;line-height:1.4;max-width:34ch}
.body{font-size:14px;max-width:44ch;color:#2a2b4a} .body.strong{font-weight:600;color:var(--ink)}
.big{font-family:var(--display);font-weight:800;font-size:22px;line-height:1.2;letter-spacing:-.01em;max-width:30ch;margin:26px 0 12px}
.sub{font-size:15px;line-height:1.5;color:rgba(255,255,255,.9);max-width:56ch} .sub.c{text-align:center;margin:0 auto .7em}
.two{display:grid;grid-template-columns:1fr 1.05fr;gap:26px;align-items:start}
.example{display:flex;flex-direction:column;align-items:center;gap:16px}
.callouts{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;width:100%}
.co{font-size:12.5px;line-height:1.45;color:#2a2b4a;border-top:2px solid var(--blue);padding-top:8px} .co b{color:var(--ink)}
.checks{list-style:none;padding:0;margin:0 0 6px;columns:2;column-gap:28px}
.checks li{font-size:14.5px;line-height:1.35;padding:7px 0 7px 18px;position:relative;break-inside:avoid;border-bottom:1px solid #e6e6f0}
.checks li::before{content:"";position:absolute;left:0;top:14px;width:9px;height:9px;background:var(--blue)}
.linkbox{margin-top:auto;border:1px solid #8f90a8;padding:14px 16px} .linkbox .kicker{margin-bottom:6px} .linkbox a{color:var(--blue);font-weight:600;text-decoration:none;font-size:15px;word-break:break-all}
.linkbox.inv{margin:26px auto 0;border-color:rgba(255,255,255,.45);width:100%;max-width:560px} .linkbox.inv a{color:#fff}
/* cover */
.cover{justify-content:space-between;align-items:stretch}
.brandmark{width:48px;height:auto} .brandmark.bottom{margin:auto auto 0;width:44px}
.cover-mid{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;margin:auto 0}
.appicon{width:118px;height:118px;border-radius:26px;box-shadow:0 12px 34px rgba(0,0,0,.35);margin-bottom:22px}
.lockup{display:flex;flex-direction:column;align-items:center;gap:8px} .lockup .wm{font-family:'Nunito Sans',Archivo,sans-serif;font-weight:400;font-size:52px;line-height:1;letter-spacing:.42em;text-indent:.42em;text-transform:uppercase}
.lockup .lp{font-family:var(--mono);font-size:10px;letter-spacing:.24em;text-transform:uppercase;border:1px solid rgba(255,255,255,.7);padding:5px 9px}
.cover h1{font-size:54px;margin:26px 0 12px;text-align:center}
.cover .kicker{color:rgba(255,255,255,.75);margin:0}
.tag{font-family:var(--display);font-weight:800;font-size:19px;text-align:center;margin:0 0 22px;letter-spacing:-.01em}
.foot-line{display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.62)}
/* close */
.close{align-items:stretch} .close .lockup{margin:4px auto 6px} .close .lockup .wm{font-size:40px}
.contact{margin-top:22px;text-align:center;font-size:15px;line-height:1.5} .contact p{margin:0 0 10px} .contact a{color:#fff;text-decoration:none;font-weight:600}
/* samples */
.sample .boardwrap{display:flex;justify-content:center;align-items:center;flex:1;padding:6px 0}
.sample .foot{flex:0 0 auto;height:132px;display:flex;flex-direction:column;justify-content:flex-start}
.meta{font-family:var(--mono);font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);text-align:center;margin-top:8px}
.note{font-size:13px;color:#2a2b4a;text-align:center;max-width:64ch;margin:10px auto 0;line-height:1.45}
.mech{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;border:1px solid #c9cadb;padding:14px 16px;margin:0 0 6px}
.mech.ghost{visibility:hidden}   /* the solution page keeps the card's exact footprint, so the board lands in the same place */
.mech .kicker{margin-bottom:4px;color:var(--blue)} .mline{font-family:var(--display);font-weight:800;font-size:16px;margin:0 0 6px;letter-spacing:-.01em} .mdetail{font-size:12.5px;color:#2a2b4a;margin:0 0 6px;line-height:1.45} .mcap{font-size:11.5px;color:var(--muted);margin:0;line-height:1.4}
/* board — the game's tiles */
.bd{display:grid;grid-template-columns:repeat(var(--n),var(--t));grid-auto-rows:var(--t);background:#000;padding:3px;width:max-content;margin:0 auto}
.cell{position:relative;width:var(--t);height:var(--t);box-shadow:inset 0 0 0 var(--bw) #000;overflow:hidden}
.cell.void{background:#fff;box-shadow:none}
.cell.hidden{background:#fff}
.cell.safe{background:#f4f0e6}
.cell.mine{background:var(--c-mine)} .cell.mine::after{content:"";position:absolute;inset:28%;background:#000;border-radius:50%}
.cell.occ{background:#2a2622} .cell.occ::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,#000 0 4px,transparent 4px 10px)}
.cell.chan{background:var(--c-chan)} .cell.chan svg{position:absolute;inset:0;width:100%;height:100%;fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.cell.defl{background:var(--c-defl)} .cell.defl svg{position:absolute;inset:0;width:100%;height:100%} .cell.defl line{stroke:#000;stroke-width:5}
.cell.refl{background:var(--c-refl)} .cell.refl svg{position:absolute;inset:0;width:100%;height:100%;fill:none;stroke:#000;stroke-width:6;stroke-linecap:round}
.cell.portal{background:var(--c-portal)} .cell.portal svg{position:absolute;inset:0;width:100%;height:100%;fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round} .cell.portal svg circle{fill:#fff;stroke:none}
.cell.portal-right svg{transform:rotate(0deg)} .cell.portal-down svg{transform:rotate(90deg)} .cell.portal-left svg{transform:rotate(180deg)} .cell.portal-up svg{transform:rotate(270deg)}
.cell.oneway{background:var(--c-oneway)} .cell.oneway svg{position:absolute;inset:0;width:100%;height:100%;fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.cell.oneway-right svg{transform:rotate(0deg)} .cell.oneway-down svg{transform:rotate(90deg)} .cell.oneway-left svg{transform:rotate(180deg)} .cell.oneway-up svg{transform:rotate(270deg)}
.cell.nbr{background:var(--c-nbr)} .cell.nbr .nclue{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--ui);font-weight:900;font-size:calc(var(--t)*.52);color:#fff}
.cell.beam{background:var(--c-beam)!important} .cell.mine.beam{background:var(--c-mine)!important;box-shadow:inset 0 0 0 var(--bw) #000, inset 0 0 0 7px var(--c-beam)} .cell.beam .clue{color:#fff!important} .cell.beam .clue span{color:#fff!important} .cell.beam.defl line{stroke:#fff}
.clue{position:absolute;inset:0;font-family:var(--ui);font-weight:900;color:#1a1a1a;font-size:calc(var(--t)*.36)}
.clue span{position:absolute;line-height:1}
.clue .u{top:8%;left:50%;transform:translateX(-50%)} .clue .d{bottom:8%;left:50%;transform:translateX(-50%)} .clue .l{left:10%;top:50%;transform:translateY(-50%)} .clue .r{right:10%;top:50%;transform:translateY(-50%)}
.clue .z{top:50%;left:50%;transform:translate(-50%,-50%);width:34%;height:34%;color:#999;display:flex;align-items:center;justify-content:center} .clue .z svg{width:100%;height:100%;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;fill:none}
.clue .n1{color:var(--n1)} .clue .n2{color:var(--n2)} .clue .n3{color:var(--n3)} .clue .n4{color:var(--n4)} .clue .n5{color:var(--n5)}
.mk{position:absolute;right:6%;bottom:4%;font-family:var(--mono);font-size:calc(var(--t)*.22);color:var(--blue);font-weight:700}
`;

function html(){
  const samples = spec.samples.map(samplePages).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sightline — Andrews McMeel submission</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600&family=JetBrains+Mono:wght@500;700&family=Nunito+Sans:wght@400;700&family=Sora:wght@700;800;900&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
${cover()}
${thePuzzle()}
${whyDaily()}
${samples}
${contact()}
</body></html>`;
}

fs.writeFileSync(OUT_HTML, html());
console.log('html', OUT_HTML);
if(process.versions.electron){
  const { app, BrowserWindow } = require('electron');
  app.disableHardwareAcceleration();
  app.whenReady().then(async () => {
    const win = new BrowserWindow({ width: 900, height: 1200, show: false, webPreferences: {} });
    await win.loadURL('file://' + OUT_HTML);
    await new Promise(r => setTimeout(r, 3500));   // web fonts
    await win.webContents.executeJavaScript('document.fonts.ready.then(()=>1)');
    const pdf = await win.webContents.printToPDF({ landscape:false, pageSize:'A4', printBackground:true, margins:{ top:0, bottom:0, left:0, right:0 }, preferCSSPageSize:true });
    fs.writeFileSync(OUT_PDF, pdf);
    console.log('pdf', OUT_PDF, (pdf.length/1024/1024).toFixed(2)+' MB');
    app.quit();
  }).catch(e => { console.error(e); app.exit(1); });
}
