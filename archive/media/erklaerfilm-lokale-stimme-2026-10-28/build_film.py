"""Build a voice-timed, modular Gradeflow explainer from verified product rules."""
from pathlib import Path
from html import escape
import json,re
R=Path(__file__).resolve().parent;C=R/'composition'
T=json.loads((R/'timing.json').read_text());D=T['duration'];S=T['scenes']
assert 0<D<=120
assert all(abs(a['start']+a['duration']-b['start'])<.05 for a,b in zip(S,S[1:]))

def copy(k,title,body='',x=88,y=75,w=650):
 return f'<div class="copy" style="left:{x}px;top:{y}px;width:{w}px"><p class="eyebrow">{k}</p><h1 class="title">{title}</h1>'+ (f'<p class="body">{body}</p>' if body else '')+'</div>'
def screen(src,x,y,w,h,crop=None,id='photo'):
 if crop:
  cx,cy,cw,ch=crop;z=max(w/cw,h/ch);st=f'width:{1440*z:.3f}px;height:{960*z:.3f}px;left:{-cx*z:.3f}px;top:{-cy*z:.3f}px'
 else:st='width:100%;height:100%;object-fit:contain;left:0;top:0'
 return f'<figure class="photo" id="{id}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><div class="camera" data-layout-allow-overflow><img data-layout-allow-overflow src="../assets/ui/{src}.png" style="{st}" alt="Echte Gradeflow-Ansicht mit fiktiven Beispieldaten"></div></figure>'
def popup(text,x,y,cls='',id=''):
 return f'<div id="{id}" class="popup {cls}" style="left:{x}px;top:{y}px">{text}</div>'
def tokens(n=3):return '<div class="buffer-tokens">'+''.join(f'<span class="buffer-token token-{i}">{i+1}</span>' for i in range(n))+'</div>'
def cursor(id,x,y):return f'<svg id="{id}" class="cursor" style="left:{x}px;top:{y}px" viewBox="0 0 35 45" aria-hidden="true" data-layout-ignore><path d="M3 2 L3 36 L13 27 L20 42 L26 39 L19 24 L32 23 Z" fill="#242238" stroke="#f6f5f8" stroke-width="3"/></svg>'
visual={}
visual['hook']=copy('MÜNDLICHE MITARBEIT','Von der Stunde<em>zum Verlauf.</em>','Einschätzungen pro Person. Über Wochen nachvollziehbar.',y=102,w=700)+screen('table',900,65,920,520,(260,330,1170,661),'hook-photo')+popup('Stunde → Eintrag → Entwicklung',990,569,id='hook-callout')
visual['start']=copy('WARUM BEI 2,00 BEGINNEN?','Positiv<em>starten.</em>','Ein gemeinsamer Bezugspunkt mit Raum für Verbesserungen.',w=630)+'''<div class="value-tile" id="start-two" style="left:780px;top:50px;width:570px;height:410px"><span class="small-label">GEMEINSAMER STARTWERT</span><div class="big-value">2,00</div></div><div class="go-arrow" id="start-arrow" style="left:1384px;top:220px">→</div><div class="value-tile" id="start-one" style="left:1510px;top:168px;width:305px;height:245px;padding:24px"><span class="small-label" style="font-size:21px">VERBESSERUNG</span><div class="big-value" style="font-size:110px;letter-spacing:-5px">1,00</div></div>'''+popup('Startwert ≠ bereits bewertete Stunde',860,533,id='start-callout')
visual['rating']=copy('DIE GANZE STUNDE EINSCHÄTZEN','Etwas besser?<em>Ein Plus.</em>','Verglichen wird mit dem bisherigen Stand.',w=550)+screen('assessment-before',700,20,1115,615,(480,145,950,524),'rating-photo')+'''<div class="math-line"><span id="rating-old">2,00</span><span class="rating-chip good" id="rating-plus">+</span><span id="rating-arrow">→</span><span class="answer" id="rating-answer">1,75</span></div>'''+cursor('rating-cursor',1466,357)+'<div class="ripple" id="rating-ring" style="left:1448px;top:345px"></div>'
visual['steps']=copy('KLEINE SCHRITTE STATT SPRÜNGE','Entwicklung<em>einordnen.</em>','Die Symbole beziehen sich auf den bisherigen Stand.',w=560)+'''<div class="step-table">'''+''.join(f'<div class="step-column" id="step-{i}"><span class="rating-chip {cl}">{sym}</span><strong>{val}</strong><small>{lab}</small></div>' for i,(sym,val,lab,cl) in enumerate([('−−','+0,50','Zahlenwert','bad'),('−','+0,25','Zahlenwert','bad'),('0','±0,00','unverändert',''),('+','−0,25','Zahlenwert','good'),('++','−0,50','Zahlenwert','good')]))+'</div>'+popup('Eine Gesamtleistung pro Stunde',840,480,id='steps-callout')
visual['buffer']=copy('WAS PASSIERT BEI 1,00?','Gute Leistung<em>bleibt sichtbar.</em>','Weitere positive Schritte füllen den Puffer.',w=620)+'''<div class="buffer-panel" id="buffer-board"><div class="buffer-grade"><p>BESTER BERECHNETER STAND</p><div class="big-value">1,00</div></div>'''+tokens()+'''<div class="buffer-count">Bis zu 3 Pufferpunkte</div></div>'''+popup('1 Punkt = 1 Viertelschritt',95,500,id='buffer-unit')
visual['buffer-example']=copy('RECHENBEISPIEL MIT ZWEI PUNKTEN','Erst der Puffer.<em>Dann der Stand.</em>','Ein Minus verbraucht einen Pufferpunkt.',w=640)+'''<div class="buffer-panel" id="consume-board"><div class="stage-label">MIT PUFFER</div><div class="buffer-grade" style="margin-top:30px"><p>STAND BLEIBT</p><div class="big-value">1,00</div></div><div class="buffer-tokens"><span class="buffer-token" id="consume-token-a">1</span><span class="buffer-token" id="consume-token-b">2</span><span class="buffer-token empty">○</span></div><div class="counter-box"><div class="counter-version" id="consume-count-two">Puffer 2 / 3</div><div class="counter-version" id="consume-count-one">Puffer 1 / 3</div></div></div><span class="rating-chip bad negative-chip" id="consume-minus">−</span><div class="buffer-final" id="consume-empty"><span class="small-label">BEISPIEL OHNE PUFFER</span><div class="big-value" style="margin-top:25px">1,00</div><div class="buffer-count">Puffer 0 / 3</div><div class="bottom-equation"><span class="rating-chip bad">−</span><span>→</span><strong>1,25</strong></div></div>'''
visual['graph']=copy('WOZU DER PERSÖNLICHE GRAPH?','Entwicklung<em>erkennen.</em>','Vom Startwert zu den Werten nach bewerteten Stunden.',w=520,y=77)+'''<div class="graph-readout"><span id="graph-date">Start</span><strong id="graph-value">2,00</strong></div><div class="graph-panel"><div class="graph-camera" data-layout-allow-overflow id="graph-camera"><img data-layout-allow-overflow src="../assets/ui/history-chart.png" alt="Tatsächlicher persönlicher Verlauf von Ada Berger"><div id="graph-pointer" class="graph-pointer" data-layout-ignore></div></div></div>'''+popup('Ein Zeitpunkt. Ein nachvollziehbarer Stand.',720,610,id='graph-callout')
visual['status']=copy('ABWESENHEIT UND FEHLENDE BEOBACHTUNG','Sichtbar bleiben.<em>Ohne Bewertung.</em>','Weder Stand noch Puffer ändern sich.',w=670)+'''<div class="status-stack"><div class="status-item" id="status-aw"><i class="status-marker"></i><strong>AW</strong><span>Abwesend</span></div><div class="status-item" id="status-nb"><i class="status-marker nb"></i><strong>NB</strong><span>Nicht beobachtet</span></div></div>'''+screen('history-status-chart',790,122,1030,441,None,'status-graph')
visual['records']=copy('EINTRÄGE PRÜFEN UND MITNEHMEN','Im Überblick.<em>Bis ins Gespräch.</em>','Tabelle und Excel verbinden den Stand mit den einzelnen Stunden.',w=600)+screen('table',760,35,1060,535,(260,330,1170,590),'records-table')+popup('Excel-Bericht mit Personenblättern',870,570,id='records-export')+screen('backup',770,10,1040,650,(260,105,970,606),'records-backup')+popup('Zusätzlich: vollständige Sicherung herunterladen',740,600,id='records-save')
visual['outro']='''<div class="end-copy"><p class="eyebrow">BEOBACHTEN · DOKUMENTIEREN · NACHVOLLZIEHEN</p><h1 class="title">Gradeflow<span style="color:var(--accent)">.</span></h1><div class="tagline">Der Verlauf wird sichtbar.<p><em>Die Entscheidung bleibt bei dir.</em></p></div></div>'''+screen('table',1100,120,720,440,(260,330,1170,715),'outro-photo')

# Cue positions are derived from actual, locally transcribed speech.
def cue(scene,phrase,fallback):
 words=scene['words'];target=re.findall(r'\w+',phrase.lower());norm=lambda x:re.sub(r'[^\w]','',x.lower())
 for i in range(len(words)-len(target)+1):
  if [norm(w['text']) for w in words[i:i+len(target)]]==target:return round(words[i]['start'],3)
 return round(scene['duration']*fallback,3)

hosts=[]
for sc in S:
 id=sc['id'];cid='gf-'+id;d=sc['duration'];caps=[];anim=[]
 for j,g in enumerate(sc['captions']):
  capid=f'{cid}-cap-{j}';fs=48 if sum(len(x['text'])+1 for x in g['words'])>44 else 53
  text=''.join(f'<span class="wave-word" data-layout-allow-overflow id="{capid}-w-{k}">{escape(w["text"])}</span>' for k,w in enumerate(g['words']))
  caps.append(f'<div id="{capid}" class="caption" style="font-size:{fs}px">{text}</div>')
  at=max(0,g['start']-.04);next_at=sc['captions'][j+1]['start'] if j+1<len(sc['captions']) else d;end=min(d-.05,g['end']+.04,next_at-.07)
  anim.append(f"tl.fromTo('#{capid}',{{opacity:0,y:12,scale:.98}},{{opacity:1,y:0,scale:1,duration:.14,ease:'power3.out'}},{at});")
  anim.append(f"tl.to('#{capid}',{{opacity:0,duration:.08,ease:'none'}},{max(at+.2,end-.08)});")
  for k,w in enumerate(g['words']):
   pos=max(at,w['start']);dur=min(.14,max(.08,(w['end']-w['start'])*.45))
   sel=f'#{capid}-w-{k}'
   anim.append(f"tl.to('{sel}',{{scale:1.17,y:-7,color:'#5b477e',duration:{dur},ease:'power2.out'}},{pos});tl.to('{sel}',{{scale:1,y:0,color:'#242238',duration:.19,ease:'power2.inOut'}},{pos+dur});")
 # Common entrances operate on children, never on the timed host clip.
 common=f"const tl=gsap.timeline({{paused:true}});tl.fromTo('#{cid} .world',{{opacity:0,x:35}},{{opacity:1,x:0,duration:.5,ease:'power3.out'}},0);tl.fromTo('#{cid} .title',{{y:20,opacity:0}},{{y:0,opacity:1,duration:.55,ease:'power3.out'}},.06);"
 if id!='outro':common+=f"tl.to('#{cid} .world',{{opacity:0,x:-18,duration:.2,ease:'power2.in'}},{d-.2});"
 js=''
 def pop(sel,at,fr=.78):return f"tl.fromTo('{sel}',{{scale:{fr},y:16,opacity:0}},{{scale:1,y:0,opacity:1,duration:.5,ease:'power3.out'}},{at});"
 def show(sel,at):return f"tl.fromTo('{sel}',{{opacity:0}},{{opacity:1,duration:.15,ease:'none'}},{at});"
 if id=='hook':
  js="tl.fromTo('#hook-photo .camera',{scale:1,xPercent:0,yPercent:0},{scale:1.13,xPercent:0,yPercent:-2,duration:2.4,ease:'power2.inOut'},1.5);"+pop('#hook-callout',d*.55)
 elif id=='start':
  js=pop('#start-two',.3)+pop('#start-arrow',cue(sc,'Raum',.32))+pop('#start-one',cue(sc,'Verbesserungen',.38))+pop('#start-callout',cue(sc,'Die Zwei',.76))
  js+="tl.to('#start-two .big-value',{scale:1.09,duration:.2,ease:'power2.out'},.85);tl.to('#start-two .big-value',{scale:1,duration:.45,ease:'power2.inOut'},1.05);"
 elif id=='rating':
  at=cue(sc,'Ein Plus',.42);result=cue(sc,'wird daraus',.77)
  js=f"tl.fromTo('#rating-photo .camera',{{scale:1,xPercent:0,yPercent:0}},{{scale:1.23,xPercent:-3,yPercent:3,duration:1.2,ease:'power2.inOut'}},{at-.6});"
  js+=f"tl.fromTo('#rating-cursor',{{x:160,y:150,opacity:0}},{{x:0,y:0,opacity:1,duration:.7,ease:'power2.inOut'}},{at});tl.fromTo('#rating-ring',{{scale:.4,opacity:0}},{{scale:1.5,opacity:.8,duration:.22,ease:'power2.out'}},{at+.7});tl.to('#rating-ring',{{opacity:0,duration:.22}},{at+.93});tl.to('#rating-cursor',{{opacity:0,duration:.2}},{at+1.5});"
  js+=pop('#rating-old',.5)+pop('#rating-plus',at)+pop('#rating-arrow',result)+pop('#rating-answer',result+.25)
 elif id=='steps':
  for i in range(5):js+=pop(f'#step-{i}',.35+i*.13)
  js+=pop('#steps-callout',cue(sc,'Es geht',.68))
  for i,phrase in [(3,'Plus'),(1,'Minus'),(4,'Doppelte'),(2,'Null')]:
   at=max(.55,cue(sc,phrase,.2+i*.08));js+=f"tl.to('#step-{i} .rating-chip',{{scale:1.08,y:-12,duration:.22,ease:'power2.out'}},{at});tl.to('#step-{i} .rating-chip',{{scale:1,y:0,duration:.4,ease:'power2.inOut'}},{at+.35});"
 elif id=='buffer':
  js=pop('#buffer-board',.15)+pop('#buffer-unit',cue(sc,'Puffer',.44))
  at=cue(sc,'positive Schritte',.42)
  for i in range(3):js+=pop(f'#buffer-board .token-{i}',at+i*.58,0)
  js+=f"tl.fromTo('#buffer-board .buffer-count',{{opacity:0,y:12}},{{opacity:1,y:0,duration:.4}},{at+1.45});"
 elif id=='buffer-example':
  at=cue(sc,'Ein Punkt',.3);empty=cue(sc,'Erst wenn',.67)
  js="tl.set('#consume-count-one',{opacity:0},0);"+pop('#consume-minus',cue(sc,'dann ein Minus',.2))+f"tl.to('#consume-token-b',{{x:-195,y:-60,scale:.2,opacity:0,duration:.65,ease:'power3.in'}},{at});tl.set('#consume-count-two',{{opacity:0}},{at+.4});tl.set('#consume-count-one',{{opacity:1}},{at+.4});"
  js+=f"tl.to('#consume-minus',{{opacity:0,scale:.5,duration:.24}},{at+.55});tl.to('#consume-board',{{opacity:0,scale:.96,duration:.2}},{max(0,empty-.2)});"+pop('#consume-empty',empty,.93)
 elif id=='graph':
  js=pop('#graph-callout',cue(sc,'So erkennst',.7))
  # Coordinates and values match the real captured Ada chart, including its start point.
  data=[(96.3,107.8,'Start','2,00'),(276,107.8,'12.10.2026','2,00'),(456.1,93.3,'14.10.2026','1,75'),(636.6,107.8,'16.10.2026','2,00'),(816.4,78.9,'19.10.2026','1,50'),(996.9,107.8,'23.10.2026','2,00'),(1177.3,93.3,'28.10.2026','1,75')]
  js+='const pts='+json.dumps(data,ensure_ascii=False)+''';const drive={p:0};function readGraph(){const f=drive.p*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),u=f-i,a=pts[i],b=pts[i+1];gsap.set('#graph-pointer',{x:a[0]+(b[0]-a[0])*u-15,y:a[1]+(b[1]-a[1])*u-15});const k=Math.round(f);document.getElementById('graph-date').textContent=pts[k][2];document.getElementById('graph-value').textContent=pts[k][3];}readGraph();'''
  js+=f"tl.to(drive,{{p:1,duration:{max(2,d*.55)},ease:'none',onUpdate:readGraph}},{d*.12});tl.fromTo('#graph-camera',{{scale:1,x:0,y:0}},{{scale:1.18,x:-100,y:0,duration:1.2,ease:'power2.inOut'}},{d*.72});"
 elif id=='status':
  js=pop('#status-aw',.25)+pop('#status-nb',cue(sc,'nicht beobachtet',.25))+"tl.fromTo('#status-graph .camera',{scale:1,xPercent:0,yPercent:0},{scale:1.12,xPercent:-2,yPercent:0,duration:1.4,ease:'power2.inOut'},1.4);"
 elif id=='records':
  backup=cue(sc,'Gespeichert wird',.52)
  js=pop('#records-export',cue(sc,'Excel',.22))+f"tl.to('#records-table,#records-export',{{opacity:0,y:-22,duration:.25}},{backup-.15});"+pop('#records-backup',backup,.96)+pop('#records-save',cue(sc,'vollständige Sicherung',.77))
  js+=f"tl.fromTo('#records-backup .camera',{{scale:1,xPercent:0,yPercent:0}},{{scale:1.07,xPercent:0,yPercent:3,duration:1.3,ease:'power2.inOut'}},{backup+1});"
 elif id=='outro':
  js=pop('#outro-photo',.3,.92)+f"tl.fromTo('#outro-photo .camera',{{scale:1}},{{scale:1.07,duration:{d-.5},ease:'power1.out'}},.4);"
 body=f'<div class="scene-frame"><div class="visual-zone"><div class="world">{visual[id]}</div></div><div class="caption-zone" data-layout-allow-caption-zone>{"".join(caps)}</div></div>'
 content=f'<!doctype html><html lang="de"><head><meta charset="utf-8"></head><body><template><style>#{cid}{{position:absolute;inset:0;color:#242238}}</style><div id="{cid}" data-composition-id="{cid}" data-width="1920" data-height="1080" data-duration="{d}">{body}</div><script>{{{common}{js}{"".join(anim)}window.__timelines["{cid}"]=tl;}}</script></template></body></html>'
 (C/'compositions'/f'{id}.html').write_text(content)
 hosts.append(f'<div class="clip" id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{id}.html" data-start="{sc["start"]}" data-duration="{d}" data-track-index="1" data-width="1920" data-height="1080"></div>')
css=(C/'style.css').read_text()
html=f'''<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Gradeflow · So funktioniert es</title><script src="assets/gsap.min.js"></script><style>{css}</style></head><body><div id="root" data-composition-id="gradeflow-erklaert" data-width="1920" data-height="1080" data-duration="{D}"><div class="brand"><b>G</b>Gradeflow</div><div class="top-meta">VERSTEHEN · ANWENDEN · NACHVOLLZIEHEN</div><div class="rule" data-layout-ignore></div>{''.join(hosts)}<div class="progress-track" data-layout-ignore><div class="progress"></div></div><div class="footer"><span>Echte App · Fiktive Beispieldaten · Schematische Rechenbeispiele</span><span>So funktioniert Gradeflow</span></div><audio id="film-audio" src="assets/music/film-mix.mp3" data-start="0" data-duration="{D}" data-track-index="10" data-volume="1"></audio></div><script>{{const tl=gsap.timeline({{paused:true}});tl.fromTo('.progress',{{scaleX:0}},{{scaleX:1,duration:{D},ease:'none'}},0);window.__timelines['gradeflow-erklaert']=tl;}}</script></body></html>'''
(C/'index.html').write_text(html)
(C/'meta.json').write_text(json.dumps({'name':'Gradeflow – So funktioniert es','description':'Startwert, relative Eingabe, Puffer und Graph – mit Stimme und Wortwelle.'},ensure_ascii=False,indent=2)+'\n')
(C/'index.motion.json').write_text(json.dumps({'duration':D,'assertions':[{'kind':'staysInFrame','selector':'.brand'},{'kind':'appearsBy','selector':'#gf-hook .title','bySec':.7},{'kind':'staysInFrame','selector':'#gf-outro .end-copy'}]},indent=2)+'\n')
(R/'scene-timing.json').write_text(json.dumps([{'id':s['id'],'start':s['start'],'duration':s['duration']} for s in S],indent=2)+'\n')
print(f'Built {len(S)} voice-timed scenes; {D}s; {sum(len(s["captions"]) for s in S)} kinetic caption groups.')
