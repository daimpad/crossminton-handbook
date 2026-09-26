import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let ok = true, fehler = 0;
async function txt(route, herkunft) {
  const ctx = await b.newContext();
  const z = { version:1, einstellungen:{sprache:'pl',thema:'hell'}, diagnose:{stufe:'beginner',trainer:false,herkunft:herkunft||null,ziel:null} };
  await ctx.addInitScript((zz)=>localStorage.setItem('crossminton.zustand.v1',JSON.stringify(zz)), z);
  const p = await ctx.newPage();
  p.on('console',(m)=>{if(m.type()==='error'){fehler++;console.log('  [err]',m.text().slice(0,100));}});
  await p.goto('http://localhost:8000/#/'+route,{waitUntil:'networkidle'});
  await p.waitForTimeout(400);
  const t = await p.evaluate(()=>document.querySelector('#ansicht').innerText);
  await ctx.close(); return t;
}
function pruef(name,t,muss){const miss=muss.filter(m=>!t.includes(m));console.log(`${miss.length?'FEHLER':'OK '} ${name}${miss.length?' — fehlt: '+miss.join(' | '):''}`);ok=ok&&miss.length===0;}
// griff regulär: erklaerteil + uebungsteil polnisch
pruef('griff', await txt('baustein/griff?kontext=kompetenz'),
  ['chwyt uniwersalny','jak bat','Chwyt na ślepo','Twoja ręka sama znajduje']);
// grundposition
pruef('grundposition', await txt('baustein/grundposition?kontext=kompetenz'),
  ['pozycję podstawową','bramkarzu przed rzutem karnym','Naładuj się i wystartuj']);
// aufschlag: uebungsteil zweiteilig
pruef('aufschlag', await txt('baustein/aufschlag?kontext=kompetenz'),
  ['Serwis otwiera każdą wymianę','poniżej dłoni uderzającej','Odczytaj opadanie']);
// beinarbeit
pruef('beinarbeit', await txt('baustein/beinarbeit?kontext=kompetenz'),
  ['split-step','Przebiegnij obieg','ruchliwości na polu']);
// BAD-Delta bei griff: erklaerteil ersetzt, uebungsteil bleibt regulär
pruef('griff+BAD-Delta', await txt('baustein/griff?kontext=kompetenz','BAD'),
  ['oduczyć','zmiany chwytu','lotka','Chwyt na ślepo','przechodzących z']);
console.log('\nKonsolenfehler:', fehler);
await b.close();
console.log(ok && fehler===0 ? 'ALLES OK':'FEHLER'); process.exit(ok&&fehler===0?0:1);
