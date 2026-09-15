// Board + diagram renderer for the Andrews McMeel submission. Pure functions returning HTML strings.
// Visual language is the game's own: 3px black inset borders, white hidden tiles, cream revealed tiles,
// edge-positioned clue numbers in the game's number colours, red bomb tiles with a black dot, striped
// walls, blue channels, peach mirrors, teal one-way arrows, green portals — same colours, same SVG icons.
const path = require('path');
const H = require(path.join(process.env.HOME, 'Downloads/sightline-ios/qa/harness.js'));
const S = a => new Set(a || []);

const ICON = {
  H_ARROWS: '<svg viewBox="0 0 100 100"><line x1="28" y1="50" x2="72" y2="50"/><polyline points="36,40 28,50 36,60"/><polyline points="64,40 72,50 64,60"/></svg>',
  V_ARROWS: '<svg viewBox="0 0 100 100"><line x1="50" y1="28" x2="50" y2="72"/><polyline points="40,36 50,28 60,36"/><polyline points="40,64 50,72 60,64"/></svg>',
  DEFL_FWD: '<svg viewBox="0 0 100 100"><line x1="18" y1="82" x2="82" y2="18" stroke-linecap="round" stroke-width="10"/></svg>',
  DEFL_BACK: '<svg viewBox="0 0 100 100"><line x1="18" y1="18" x2="82" y2="82" stroke-linecap="round" stroke-width="10"/></svg>',
  PORTAL: '<svg viewBox="0 0 100 100"><circle cx="24" cy="50" r="10"/><line x1="34" y1="50" x2="82" y2="50"/><polyline points="68,36 86,50 68,64"/></svg>',
  ONEWAY: '<svg viewBox="0 0 100 100"><line x1="22" y1="50" x2="72" y2="50"/><polyline points="58,32 78,50 58,68"/></svg>',
  ZERO: '<svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
};

function xtraOf(b){ return { portals:S(b.portals), portalDir:b.portalDir, portalDirs:b.portalDirs||{}, o1U:S(b.o1u), o1D:S(b.o1d), o1L:S(b.o1l), o1R:S(b.o1r), rH:S(b.rh), rV:S(b.rv) }; }
function fixtures(b){ return new Set([...b.occluders,...b.hchan,...b.vchan,...b.defF,...b.defB,...b.portals,...b.o1u,...b.o1d,...b.o1l,...b.o1r,...b.rh,...b.rv,...(b.nbr||[])]); }
function clueAt(b, x, y){
  return H.clueAt(b.w, b.h, S(b.mines), S(b.occluders), S(b.hchan), S(b.vchan), S(b.defF), S(b.defB), x, y, S(b.validCells), xtraOf(b));
}
// The lit path of a sightline, INCLUDING the fixture cells it passes through or bends at — a port of the
// game's rayPathFull(), so diagrams show exactly what the game's own beam shows.
function rayPath(b, x, y, d){
  const occ=S(b.occluders), hSet=S(b.hchan), vSet=S(b.vchan), dF=S(b.defF), dB=S(b.defB), valid=S(b.validCells);
  const X=xtraOf(b); const out=[]; let p=x, q=y, dir=d;
  const steps={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}; const axis=dd=>(dd==='up'||dd==='down')?'V':'H';
  let s=steps[dir], A=axis(dir), hops=0;
  while(hops++<25){
    p+=s[0]; q+=s[1];
    if(p===x&&q===y) break;
    if(p<0||q<0||p>=b.w||q>=b.h) break;
    const k=p+','+q;
    if(valid.size>0 && !valid.has(k)) break;
    if(occ.has(k)) break;
    if(X.portals.has(k)){
      out.push(k);
      if(dir===((X.portalDirs&&X.portalDirs[k])||X.portalDir)){
        let partner=null; for(const pk of X.portals){ if(pk!==k){ partner=pk; break; } }
        if(partner){ out.push(partner); const sp=partner.indexOf(','); p=+partner.slice(0,sp); q=+partner.slice(sp+1); dir=(X.portalDirs&&X.portalDirs[partner])||X.portalDir||dir; s=steps[dir]; A=axis(dir); continue; }
      }
      break;
    }
    if(X.o1R.has(k)){ if(dir==='right'){out.push(k);continue;} break; }
    if(X.o1L.has(k)){ if(dir==='left' ){out.push(k);continue;} break; }
    if(X.o1U.has(k)){ if(dir==='up'   ){out.push(k);continue;} break; }
    if(X.o1D.has(k)){ if(dir==='down' ){out.push(k);continue;} break; }
    if(X.rH.has(k)){ if(A==='V'){ out.push(k); dir=(dir==='up')?'down':'up'; s=steps[dir]; continue; } break; }
    if(X.rV.has(k)){ if(A==='H'){ out.push(k); dir=(dir==='right')?'left':'right'; s=steps[dir]; continue; } break; }
    if(dF.has(k)){ out.push(k); dir=({up:'right',right:'up',down:'left',left:'down'})[dir]; s=steps[dir]; A=axis(dir); continue; }
    if(dB.has(k)){ out.push(k); dir=({up:'left',left:'up',down:'right',right:'down'})[dir]; s=steps[dir]; A=axis(dir); continue; }
    if(hSet.has(k)){ if(A==='H'){out.push(k);continue;} else break; }
    if(vSet.has(k)){ if(A==='V'){out.push(k);continue;} else break; }
    out.push(k);
  }
  return out;
}

function clueHtml(c){
  const tot=c.up+c.down+c.left+c.right;
  const nc=v=>'n'+Math.min(5,v);
  if(tot===0) return '<div class="clue"><span class="z">'+ICON.ZERO+'</span></div>';
  let s='<div class="clue">';
  if(c.up)    s+='<span class="u '+nc(c.up)+'">'+c.up+'</span>';
  if(c.down)  s+='<span class="d '+nc(c.down)+'">'+c.down+'</span>';
  if(c.left)  s+='<span class="l '+nc(c.left)+'">'+c.left+'</span>';
  if(c.right) s+='<span class="r '+nc(c.right)+'">'+c.right+'</span>';
  return s+'</div>';
}
function fixtureCell(b, k){
  const dir = (b.portalDirs && b.portalDirs[k]) || b.portalDir || 'right';
  if(b.occluders.includes(k)) return ['cell occ',''];
  if(b.portals.includes(k))   return ['cell portal portal-'+dir, ICON.PORTAL];
  if(b.o1r.includes(k)) return ['cell oneway oneway-right', ICON.ONEWAY];
  if(b.o1l.includes(k)) return ['cell oneway oneway-left',  ICON.ONEWAY];
  if(b.o1u.includes(k)) return ['cell oneway oneway-up',    ICON.ONEWAY];
  if(b.o1d.includes(k)) return ['cell oneway oneway-down',  ICON.ONEWAY];
  if(b.rh.includes(k)) return ['cell refl', '<svg viewBox="0 0 100 100"><line x1="14" y1="50" x2="86" y2="50"/></svg>'];
  if(b.rv.includes(k)) return ['cell refl', '<svg viewBox="0 0 100 100"><line x1="50" y1="14" x2="50" y2="86"/></svg>'];
  if(b.defF.includes(k)) return ['cell defl', ICON.DEFL_FWD];
  if(b.defB.includes(k)) return ['cell defl', ICON.DEFL_BACK];
  if(b.hchan.includes(k)) return ['cell chan', ICON.H_ARROWS];
  if(b.vchan.includes(k)) return ['cell chan', ICON.V_ARROWS];
  if((b.nbr||[]).includes(k)){
    let count=0; const [x,y]=k.split(',').map(Number); const ms=S(b.mines), valid=S(b.validCells);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy)continue; const nk=(x+dx)+','+(y+dy); if(x+dx<0||y+dy<0||x+dx>=b.w||y+dy>=b.h)continue; if(valid.size&&!valid.has(nk))continue; if(ms.has(nk))count++; }
    return ['cell nbr','<div class="clue nclue">'+count+'</div>'];
  }
  return null;
}
// mode: 'puzzle' (opening revealed, rest hidden) | 'solution' (every safe tile revealed, bombs shown)
// opts.beams: [{from:'x,y', dir}] lit paths;  opts.mark: {'x,y':'A'} letters;  opts.hideMines: keep bombs hidden in solution
function board(b, mode, opts){
  opts = opts || {};
  const t = opts.t || 64;
  const ms=S(b.mines), valid=S(b.validCells), fx=fixtures(b), opening=S(b.opening);
  const lit=new Set(); (opts.beams||[]).forEach(bm=>{ const [x,y]=bm.from.split(',').map(Number); rayPath(b,x,y,bm.dir).forEach(k=>lit.add(k)); lit.add(bm.from); });
  let html='<div class="bd" style="--n:'+b.w+';--m:'+b.h+';--t:'+t+'px">';
  for(let y=0;y<b.h;y++) for(let x=0;x<b.w;x++){
    const k=x+','+y;
    if(valid.size>0 && !valid.has(k)){ html+='<div class="cell void"></div>'; continue; }
    const f=fixtureCell(b,k);
    let cls, inner='';
    if(f){ cls=f[0]; inner=f[1]; }
    else if(ms.has(k)){
      if((mode==='solution' && !opts.hideMines) || opts.showMines) cls='cell mine';
      else cls='cell hidden';
    }
    else if(mode==='solution' || opening.has(k)){ cls='cell safe'; inner=clueHtml(clueAt(b,x,y)); }
    else cls='cell hidden';
    if(lit.has(k)) cls+=' beam';
    if(opts.mark && opts.mark[k]) inner+='<span class="mk">'+opts.mark[k]+'</span>';
    html+='<div class="'+cls+'" data-k="'+k+'">'+inner+'</div>';
  }
  return html+'</div>';
}
module.exports = { board, rayPath, clueAt, clueHtml, fixtures, ICON, H, S };
