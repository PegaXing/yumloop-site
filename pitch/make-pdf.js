// Renders the pitch page to pitch/Sightline-Pitch.pdf (print stylesheet, A4 landscape) and the three
// device mockups to pitch/devices/*.png, using the Electron already installed for the Steam shell.
//   cd ~/Downloads/sightline-ios/steam && node_modules/.bin/electron ~/Downloads/yumloop-site/pitch/make-pdf.js [?to=rawfury]
// The page is loaded from the local site folder over file://, so fonts come from Google (needs network)
// and every asset path resolves exactly as it does on yumloop.net.
const { app, BrowserWindow } = require('electron');
const path = require('path'), fs = require('fs');
const SITE = path.join(__dirname, '..');
const QUERY = (process.argv.slice(2).find(a => a.startsWith('?')) || '?to=rawfury') + '&static=1';   // static=1: no falling tiles in the renders
app.disableHardwareAcceleration();   // software compositor: capturePage is reliable here, and the GPU path threw UnknownVizError
app.commandLine.appendSwitch('force-device-scale-factor', '2');
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1400, height: 900, show: true, x: 0, y: 0, webPreferences: {} });   // shown briefly: capturePage needs a real compositor
  await win.loadURL('file://' + path.join(SITE, 'sightline-pitch.html') + QUERY);
  await new Promise(r => setTimeout(r, 2500));
  // reveal everything (the page reveals on scroll) and let the demo settle on its final state
  await win.webContents.executeJavaScript(`document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); document.querySelectorAll('.meter .bar i').forEach(b => b.style.width = b.dataset.w); 1`);
  await new Promise(r => setTimeout(r, 800));
  // device mockups as PNGs
  fs.mkdirSync(path.join(__dirname, 'devices'), { recursive: true });
  const devs = await win.webContents.executeJavaScript(`document.documentElement.style.scrollBehavior='auto'; [...document.querySelectorAll('.devices .dev')].map(d => { const r = d.getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height, label: d.querySelector('.lbl').textContent }; })`);
  const names = ['steam-deck', 'iphone', 'laptop'];
  for(let i = 0; i < devs.length; i++){
    const d = devs[i];
    await win.webContents.executeJavaScript(`document.documentElement.style.scrollBehavior='auto'; scrollTo({ top: ${Math.max(0, d.y - 40)}, behavior: 'instant' }); 1`);
    await new Promise(r => setTimeout(r, 400));
    const y = await win.webContents.executeJavaScript(`document.querySelectorAll('.devices .dev')[${i}].getBoundingClientRect().top`);
    await win.webContents.executeJavaScript(`document.querySelectorAll('video').forEach(v => { try { v.pause(); } catch(_){} }); 1`);
    let full = null; for(let k = 0; k < 5 && !full; k++){ try { full = await win.webContents.capturePage(); if(full.isEmpty() || full.getSize().width < 100){ full = null; throw new Error('empty capture'); } } catch(e){ console.error('capturePage retry', k, names[i], String(e)); await new Promise(r => setTimeout(r, 900)); } }
    if(!full) continue;
    const sz = full.getSize(), sc = sz.width / 1400;    // device pixels per CSS pixel (scale factor 2)
    const rx = Math.max(0, Math.round((d.x - 12) * sc)), ry = Math.max(0, Math.round((y - 12) * sc));
    const img = full.crop({ x: rx, y: ry, width: Math.min(sz.width - rx, Math.round((d.w + 40) * sc)), height: Math.min(sz.height - ry, Math.round((d.h + 40) * sc)) });
    fs.writeFileSync(path.join(__dirname, 'devices', names[i] + '.png'), img.toPNG());
    console.log('device png', names[i], img.getSize(), d.label);
  }
  await win.webContents.executeJavaScript(`scrollTo(0,0); 1`);
  const pdf = await win.webContents.printToPDF({ landscape: true, pageSize: 'A4', printBackground: true, margins: { top: 0.55, bottom: 0.55, left: 0.55, right: 0.55 }, preferCSSPageSize: false });
  const out = path.join(__dirname, 'Sightline-Pitch.pdf');
  fs.writeFileSync(out, pdf);
  console.log('pdf', out, (pdf.length / 1024 / 1024).toFixed(1) + ' MB');
  app.quit();
}).catch(e => { console.error(e); app.exit(1); });
