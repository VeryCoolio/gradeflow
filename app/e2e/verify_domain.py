"""120 Fachübergänge und Importgrenzen über die laufende lokale Vite-App.

Aufruf mit derselben Playwright-Umgebung wie revision.py; Vite-Port 5186.
GRADEFLOW_AUDIT_OUTPUT bezeichnet einen bestehenden neuen Nachweisordner.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(os.environ.get('GRADEFLOW_AUDIT_OUTPUT', ROOT/'docs/revision-2026-10-18/umsetzung/abschluss-browser-v2'))
if (OUT/'fachpruefung.json').exists():raise SystemExit('Vorhandene Nachweise bleiben erhalten.')
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page(viewport=dict(width=1440,height=1000),locale='de-DE')
    page.goto('http://127.0.0.1:5186/');page.wait_for_load_state('networkidle')
    result=page.evaluate('''async()=>{
      const {applyRating}=await import('/src/domain/grading/gradingEngine.ts');
      const {parseClassImport,importClassFile}=await import('/src/infrastructure/importExport/classImport.ts');
      const {readNotebookBackup}=await import('/src/infrastructure/importExport/jsonBackup.ts');
      const symbols=['--','-','0','+','++'],deltas=[-2,-1,0,1,2];let checked=0;
      for(let grade=4;grade<=24;grade++)for(let buffer=0;buffer<=(grade===4?3:0);buffer++)for(let i=0;i<5;i++){
        const potential=Math.max(-20,Math.min(3,4-grade+buffer+deltas[i]));
        const expected={gradeQuarterSteps:potential>=0?4:4-potential,bufferPoints:Math.max(0,potential)};
        const actual=applyRating({gradeQuarterSteps:grade,bufferPoints:buffer},symbols[i]);
        if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error(JSON.stringify({grade,buffer,actual,expected}));checked++;
      }
      const csv=n=>'Vorname;Nachname\\n'+Array.from({length:n},(_,i)=>'Fiktiv;Person'+i).join('\\n');
      if(parseClassImport(csv(45),'klasse.csv').length!==45)throw Error('45 Personen');
      let rejected=false;try{parseClassImport(csv(46),'klasse.csv')}catch{rejected=true}
      if(!rejected)throw Error('46 Personen akzeptiert');
      let reads=0;
      for(const read of [importClassFile,readNotebookBackup]){
        let blocked=false;try{await read({name:'gross.csv',size:5*1024*1024+1,text:async()=>{reads++;return ''}})}catch{blocked=true}
        if(!blocked)throw Error('Dateigrenze fehlt');
      }
      if(reads!==0)throw Error('Datei vor Größenprüfung gelesen');
      return {transitions:checked,oracle:'Begrenztes Guthaben von -20 bis 3 Viertelschritten',persons45Accepted:true,persons46Rejected:true,oversizedFilesRead:reads};
    }''')
    data=json.loads((ROOT/'docs/revision-2026-10-18/nachweise/fixture-20-24.json').read_text())
    data['classes'][0]['students'][0]['id']='toString'
    data['classes'][0]['sessions']=data['classes'][0]['sessions'][:1]
    data['classes'][0]['sessions'][0]['observations']={}
    page.evaluate("data=>{localStorage.clear();localStorage.setItem('oral-grading-notebook-v1',JSON.stringify(data));history.replaceState(null,'',location.pathname)}",data)
    page.reload();page.wait_for_load_state('networkidle')
    assert page.locator('.student-list button small').first.inner_text()=='Offen'
    result['reservedIdMissingObservation']='Offen'
    browser.close()
(OUT/'fachpruefung.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False))
