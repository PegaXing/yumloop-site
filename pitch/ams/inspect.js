// Renders every page of the exported PDF to pitch/ams/inspect/page-NN.png through Chromium's own PDF
// viewer inside Electron, so the thing being checked is the PDF itself, not the HTML it came from.
//   cd ~/Downloads/sightline-ios/steam && node_modules/.bin/electron ~/Downloads/yumloop-site/pitch/ams/inspect.js
const { app, BrowserWindow } = require('electron');
const path = require('path'), fs = require('fs');
const PDF = path.join(__dirname, 'Sightline_Andrews_McMeel_Submission.pdf');
const OUT = path.join(__dirname, 'inspect');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.whenReady().then(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  // page count from the PDF's /Type /Page objects (not /Pages)
  const raw = fs.readFileSync(PDF, 'latin1');
  const pages = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const win = new BrowserWindow({ width: 900, height: 1250, show: true, x: 0, y: 0, webPreferences: { plugins: true } });
  for(let p = 1; p <= pages; p++){
    await win.loadURL('file://' + PDF + '?v=' + p + '#page=' + p + '&toolbar=0&view=Fit');   // a changing query forces a real reload per page
    await new Promise(r => setTimeout(r, 1800));
    let img = null;
    for(let k = 0; k < 4 && !img; k++){ try { img = await win.webContents.capturePage(); if(img.isEmpty()) img = null; } catch(_){} if(!img) await new Promise(r => setTimeout(r, 700)); }
    if(!img){ console.error('no capture for page', p); continue; }
    fs.writeFileSync(path.join(OUT, 'page-' + String(p).padStart(2,'0') + '.png'), img.toPNG());
    console.log('page', p, 'of', pages);
  }
  app.quit();
}).catch(e => { console.error(e); app.exit(1); });
