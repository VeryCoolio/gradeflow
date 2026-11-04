from pathlib import Path
import json,os
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent/'composition/assets/ui';OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('GRADEFLOW_VIDEO_BASE','http://127.0.0.1:4197/').rstrip('/')+'/'
T='2026-10-28T08:00:00.000Z'
N=['Ada Berger','Ben Fischer','Clara König','Deniz Weber','Emil Winter']
classes=[]
for k,(name,color) in enumerate([('7a','sage'),('7b','sage'),('8a · Deutsch','lavender'),('8b · Mathematik','lavender'),('9a','rose'),('10a','blue')]):
 students=[dict(id=f'p{k}{i}',displayName=n,startGradeQuarterSteps=8) for i,n in enumerate(N)]
 sessions=[]
 if k==2:
  for j,date in enumerate(['2026-10-12','2026-10-14','2026-10-16','2026-10-19','2026-10-23']):
   obs={s['id']:dict(status='bewertet',symbol=['0','+','-','++','--'][(i+j)%5]) for i,s in enumerate(students)}
   if j==1:obs[students[3]['id']]=dict(status='abwesend')
   if j==2:obs[students[4]['id']]=dict(status='nicht_beobachtet')
   sessions.append(dict(id=f's{j}',date=date,lessonSequence=1,createdAt=T,updatedAt=T,observations=obs))
 classes.append(dict(id=f'c{k}',name=name,color=color,periodLabel='Schuljahr 2026/2027',archived=False,createdAt=T,updatedAt=T,students=students,sessions=sessions))
seed=dict(schemaVersion=1,currentClassId='c2',classes=classes)
with sync_playwright() as pw:
 b=pw.chromium.launch(); c=b.new_context(viewport=dict(width=1440,height=960),device_scale_factor=2,locale='de-DE',accept_downloads=True)
 c.add_init_script("localStorage.setItem('gradeflow-tutorial-v2','gesehen')")
 p=c.new_page();p.set_default_timeout(6000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.on('dialog',lambda d:d.accept())
 p.goto(BASE);p.wait_for_load_state('networkidle');p.evaluate("s=>localStorage.setItem('oral-grading-notebook-v1',JSON.stringify(s))",seed)
 p.goto(BASE+'#seite=klasse&klasse=c2&ansicht=stunden');p.reload();p.wait_for_load_state('networkidle')
 def shot(name):
  p.evaluate('window.scrollTo(0,0)');p.wait_for_timeout(250);p.screenshot(path=str(OUT/(name+'.png')),animations='disabled');print(name,flush=True)
 def btn(name):return p.get_by_role('button',name=name,exact=True)
 def view(name):
  s=p.locator('[data-tour="view-select"]')
  if s.is_visible():s.select_option(name)
  else:p.locator(f'[data-tour="view-{name}"]').click()
 def nav(name):p.get_by_role('navigation',name='Hauptseiten').get_by_role('link',name=name,exact=True).click()
 shot('classes')
 p.get_by_label('Datum',exact=True).fill('2026-10-28')
 btn('Stunde beginnen').click();shot('assessment-before')
 btn('+').click();shot('assessment-ada-saved')
 btn('++').click();btn('0').click();shot('assessment-status')
 btn('Abwesend').click();btn('Nicht beobachtet').click();shot('complete')
 btn('Zur Klassenübersicht').click();view('tabelle');shot('table')
 p.get_by_text('Exportieren',exact=True).click()
 with p.expect_download() as d:btn('Klasse als Excel exportieren').click()
 d.value.save_as(OUT/'Gradeflow_Beispielbericht.xlsx')
 p.get_by_text('Exportieren',exact=True).click()
 view('verlauf');p.locator('#history-student').select_option('p20');shot('history');p.locator('.chart-scroll svg').screenshot(path=str(OUT/'history-chart.png'))
 p.locator('#history-student').select_option('p23');shot('history-status');p.locator('.chart-scroll svg').screenshot(path=str(OUT/'history-status-chart.png'))
 nav('Datensicherung');shot('backup')
 p.locator('.help-menu summary').click();p.get_by_role('link',name='Darstellung und Farben',exact=True).click();shot('appearance')
 nav('Klasse anlegen');btn('Demo-Klasse mit fiktiven Namen anlegen').click();shot('demo-empty')
 btn('Demowerte für fünf Wochen erstellen').click();view('tabelle');shot('demo-full')
 p.set_viewport_size(dict(width=430,height=932));p.evaluate('window.scrollTo(0,0)');shot('mobile-table')
 p.locator('#current-class').select_option('c2');view('verlauf');p.locator('#history-student').select_option('p20');shot('mobile-history')
 view('stunden');p.get_by_label('Datum',exact=True).fill('2026-10-29');btn('Stunde beginnen').click();shot('mobile-assessment')
 (OUT/'capture-check.json').write_text(json.dumps(dict(errors=errors,fictional=True,screenshots=len(list(OUT.glob('*.png'))),appVersion='0.10.0'),ensure_ascii=False,indent=2))
 assert not errors, errors
 c.close();b.close()
