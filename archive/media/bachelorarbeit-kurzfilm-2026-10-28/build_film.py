"""Build the compact, source-checked Gradeflow bachelor-thesis film."""
from pathlib import Path
from html import escape
import json,re
R=Path(__file__).resolve().parent
C=R/'composition'
def screen(src,x,y,w,h,crop=None,id=''):
    if crop:
        cx,cy,cw,ch=crop;z=max(w/cw,h/ch);st=f'width:{1440*z:.2f}px;height:{960*z:.2f}px;left:{-cx*z:.2f}px;top:{-cy*z:.2f}px'
    else: st='width:100%;height:100%;object-fit:contain'
    return f'<figure class="screen" id="{id}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><div class="camera" data-layout-allow-overflow><img data-layout-allow-overflow src="assets/ui/{src}.png" style="{st}" alt="Gradeflow: {escape(src)}"></div></figure>'
def copy(label,title,body='',x=88,y=190,w=565):
    return f'<div class="copy" style="left:{x}px;top:{y}px;width:{w}px"><p class="eyebrow">{label}</p><h1>{title}</h1>'+ (f'<p class="body">{body}</p>' if body else '')+'</div>'
def note(s):return '<p class="bottom-note">'+s+'</p>'
scenes=[]
def add(id,t,d,content):
    scenes.append((id,t,d,f'<section class="clip" id="{id}" data-start="{t}" data-duration="{d}" data-track-index="1"><div class="scene-inner">{content}</div></section>'))
add('hook',0,7,copy('MÜNDLICHE MITARBEIT','Unterricht vergeht.<em>Was bleibt nachvollziehbar?</em>','Gradeflow hält die Einschätzungen einer Lehrkraft pro Person und Stunde fest.',y=202,w=780)+screen('table',956,310,875,465,(260,330,1170,622),'hook-ui')+'<div class="hook-symbols" data-layout-ignore><span>−−</span><span>−</span><span>0</span><span>+</span><span>++</span></div>')
add('thesis',7,10,copy('DIE IDEE HINTER DER BACHELORARBEIT','Eine Idee.<em>Begründet weiterentwickelt.</em>','Dokumentation fachlich begründen und technisch nachvollziehbar umsetzen.',w=650,y=210)+'''<div class="research-path"><div class="research-step"><span>01</span><strong>Fachliche Anforderungen</strong></div><div class="path-link" data-layout-ignore></div><div class="research-step"><span>02</span><strong>Technische Umsetzung</strong></div><div class="path-link" data-layout-ignore></div><div class="research-step"><span>03</span><strong>Bedienbarkeit prüfen</strong></div></div>'''+note('Ziel: kontinuierliche und transparente Dokumentation.'))
add('prototype',17,8,copy('BESTANDSANALYSE → ENTWICKLUNGSBEDARF','Weshalb<em>der Umbau?</em>','',w=560,y=205)+'''<div class="before-after"><div class="historic"><p>URSPRÜNGLICHER PROTOTYP</p><img src="assets/ui/historischer-prototyp.png" alt="Historische Bewertungskarte mit dokumentiert fiktiven Personen"></div><div class="today"><p>WEITERENTWICKLUNG</p><div class="requirement">AW und NB unterscheiden</div><div class="requirement">Jede Eingabe sofort speichern</div><div class="requirement">Puffer konsistent berechnen</div></div></div>''')
add('assess',25,11,copy('EINSCHÄTZUNG DURCH DIE LEHRKRAFT','Eine Person.<em>Eine ganze Stunde.</em>','Die fachbezogene Gesamtleistung einschätzen – relativ zum bisherigen Stand.',w=535,y=205)+screen('assessment-before',690,235,1150,745,(480,145,950,615),'assessment-ui')+'''<div class="example-bar"><small>Beispiel für „etwas besser“</small><div><strong>2,00</strong><span class="rating-chip">+</span><span>→</span><strong class="good">1,75</strong></div></div><svg class="demo-cursor" id="assess-cursor" viewBox="0 0 35 45" width="35" height="45" aria-hidden="true"><path d="M3 2 L3 36 L13 27 L20 42 L26 39 L19 24 L32 23 Z" fill="#242238" stroke="#f6f5f8" stroke-width="3"/></svg><div class="click-ring" id="assess-ring"></div>''')
add('model',36,9,copy('EIGENE MODELLENTSCHEIDUNGEN','2,00 zum Start.<em>Bewusst gewählt.</em>','Ein positiver Ausgangswert mit Verbesserungsspielraum.',w=590,y=205)+'''<div class="model-panel"><div class="start-value"><span>Startwert</span><strong>2,00</strong></div><div class="buffer-value"><span>Puffer bei</span><strong>1,00</strong><div class="buffer-dots" data-layout-ignore><i></i><i></i><i></i></div><p>Bis zu 3 Punkte gegen negative Schritte.</p></div></div>'''+note('Motivationswirkung nicht nachgewiesen.'))
add('status',45,8,copy('BEOBACHTUNG UND BEWERTUNG TRENNEN','Fehlende Beobachtung<em>ist keine Bewertung.</em>','',w=595,y=205)+screen('complete',800,230,1020,663,(250,100,1100,715),'complete-ui')+'''<div class="status-pair"><span><i class="aw"></i>AW · Abwesend</span><span><i class="nb"></i>NB · Nicht beobachtet</span></div>'''+note('AW und NB verändern weder den Stand noch den Puffer.'))
add('continuity',53,8,copy('ZUVERLÄSSIGE DOKUMENTATION','Jede Eingabe.<em>Sofort lokal gespeichert.</em>','Unterbrochene Stunden bleiben fortsetzbar. Korrekturen lösen eine Neuberechnung aus.',w=560,y=200)+screen('assessment-ada-saved',755,225,1060,690,(480,145,950,615),'saved-ui'))
add('trace',61,8,copy('NACHVOLLZIEHBARKEIT IM SINNE DER BA','Die Verarbeitung<em>wird sichtbar.</em>','Tabelle, Verlauf und Excel zeigen den Rechenweg.',w=760,y=160)+screen('table',86,575,820,290,(272,585,1115,395),'table-detail')+'''<div class="history-panel"><p class="panel-kicker">ADA BERGER · PERSÖNLICHER VERLAUF</p><img src="assets/ui/history-chart.png" alt="Echter Verlauf des gespeicherten Zahlenwerts"><div class="history-footer"><span>Start <b>2,00</b></span><span>Aktueller Stand <b>1,75</b></span></div></div><p class="mini-label" style="left:90px;top:530px">GESPEICHERTE EINSCHÄTZUNGEN IM BLICK</p>'''+note('Ein Symbol allein enthält noch keine fachliche Begründung.'))
add('backup',69,8,copy('LOKALER UMFANG DER BA-VERSION','Lokal arbeiten.<em>Bewusst sichern.</em>','Der Bestand liegt im jeweiligen Browser. Eine heruntergeladene JSON-Datei dient als vollständige Sicherung.',w=590,y=205)+screen('backup',780,200,1040,757,(260,105,970,706),'backup-ui')+note('Keine automatische Synchronisierung zwischen Geräten.'))
add('evaluation',77,8,copy('TECHNISCHE PRÜFUNG UND USABILITY','Funktion prüfen.<em>Bedienung untersuchen.</em>','',w=655,y=240)+'''<div class="evaluation-panel"><div class="evaluation-item tested"><span class="evaluation-state">GEPRÜFT</span><h2>Technische Prüfung</h2><p>Rechnen und Speichern getestet.</p></div><div class="evaluation-item planned"><span class="evaluation-state">VORBEREITET</span><h2>Usability-Test</h2><p>Mit Lehramtsstudierenden.</p></div></div>'''+note('Kein Nachweis pädagogischer Wirkung.'))
add('outro',85,5,'''<div class="outro-copy"><p class="eyebrow">AUS DER BACHELORARBEIT IN DIE ANWENDUNG</p><h1>Gradeflow<span class="logo-dot">.</span></h1><p class="closing-line">Beobachten.<br>Dokumentieren.<br><em>Nachvollziehen.</em></p></div>'''+screen('table',1005,310,820,435,(260,330,1170,621),'outro-ui')+'<p class="teacher">Die Entscheidung bleibt bei der Lehrkraft.</p><p class="prototype">Bachelorarbeitsprototyp · Version 0.10.0</p>')
assert sum(d for _,_,d,_ in scenes)==90
for (a,t,d,_),(b,t2,_,_) in zip(scenes,scenes[1:]):assert t+d==t2,(a,b)
base=(C/'style.css').read_text()
extra='''
#hook h1{font-size:89px}#hook .body{max-width:670px}#thesis h1{font-size:78px}#thesis .body{max-width:600px}#thesis .bottom-note{font-size:25px}.research-path{position:absolute;left:835px;top:270px;width:975px}.research-step{display:flex;align-items:center;gap:27px;border:2px solid #baaccb;border-radius:17px;padding:30px;background:#eee9f6;color:#483264;min-height:114px}.research-step>span{font-size:22px;font-weight:800;border-radius:11px;padding:12px 14px;background:#f6f5f8}.research-step strong{font-size:35px;letter-spacing:-1px}.path-link{height:45px;width:2px;margin-left:65px;background:#baaccb;transform-origin:top center}.before-after{position:absolute;left:720px;top:225px;display:flex;gap:32px;align-items:center}.historic{width:610px}.historic>p,.today>p{font-size:19px;letter-spacing:1.3px;font-weight:800;color:#5b477e;margin:0 0 20px}.historic img{width:610px;height:520px;object-fit:contain;background:#fff;border-radius:20px;border:2px solid #dcd9e3;box-shadow:0 20px 50px #24223812}.today{width:450px}.requirement{font-size:27px;line-height:1.3;font-weight:700;background:#eee9f6;border:2px solid #baaccb;border-radius:14px;padding:26px 24px;margin-bottom:19px}.example-bar{position:absolute;left:90px;top:753px}.example-bar small{font-size:22px;color:#615d70;display:block;margin-bottom:15px}.example-bar>div{display:flex;align-items:center;gap:18px;font-size:37px}.example-bar strong{font-size:53px;letter-spacing:-2px}.rating-chip{background:#e4f1ed;color:#315d4b;border:1px solid #9ebfb3;padding:0px 15px;border-radius:10px}.good{color:#315d4b}.model-panel{position:absolute;left:765px;top:270px;width:1050px;height:540px;background:#fff;border:2px solid #dcd9e3;border-radius:20px;box-shadow:0 25px 60px #24223812;display:flex;align-items:center}.model-panel>div{width:50%;text-align:center}.start-value{border-right:2px solid #dcd9e3;padding:45px 20px}.start-value>span,.buffer-value>span{font-size:26px;color:#615d70;display:block}.model-panel strong{font-size:126px;letter-spacing:-7px;color:#5b477e;line-height:1.15}.buffer-dots{display:flex;justify-content:center;gap:16px;margin:18px 0}.buffer-dots i{display:block;width:32px;height:32px;border:2px solid #5b477e;border-radius:50%;background:#baaccb}.buffer-value p{font-size:25px;max-width:350px;margin:24px auto 0;line-height:1.4;color:#615d70}.status-pair{top:747px;font-size:25px}#status h1{font-size:77px}#status .body{font-size:27px}.save-proof{position:absolute;left:795px;top:835px;background:#e9f0e7;color:#315d4b;border:1px solid #a9bda4;border-radius:12px;padding:15px 23px;font-size:23px;display:flex;flex-direction:column;gap:6px}.save-proof span{font-size:21px}.evaluation-panel{position:absolute;left:840px;top:270px;width:975px}.evaluation-item{border:2px solid #dcd9e3;border-radius:19px;padding:32px 38px;background:#fff;margin-bottom:28px;box-shadow:0 16px 40px #24223809}.evaluation-item h2{font-size:37px;margin:20px 0 12px;letter-spacing:-1px}.evaluation-item p{font-size:29px;color:#615d70;margin:0}.evaluation-state{font-size:19px;letter-spacing:1.5px;font-weight:800;border-radius:8px;padding:8px 13px;background:#e9f0e7;color:#315d4b}.planned .evaluation-state{background:#f5eedf;color:#705927}#trace h1{font-size:77px}#trace .body{font-size:28px;margin-top:24px}#trace .bottom-note{font-size:24px}#evaluation .bottom-note{font-size:26px}
'''
html='''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><title>Gradeflow · BA kompakt</title><script src="assets/gsap.min.js"></script><style>'''+base+extra+'''</style></head><body><div id="root" data-composition-id="gradeflow-ba-kompakt" data-start="0" data-width="1920" data-height="1080" data-duration="90"><div class="top-rule" data-layout-ignore></div><div class="brand"><span class="brand-symbol">G</span>Gradeflow</div><div class="top-meta">IDEE · BEGRÜNDUNG · ANWENDUNG</div>'''+''.join(x[3] for x in scenes)+'''<div class="footer-rule" data-layout-ignore><div class="progress"></div></div><div class="footnote">ECHTE APP · FIKTIVE BEISPIELDATEN</div><audio id="music" src="assets/music/gradeflow-score.mp3" data-start="0" data-duration="90" data-track-index="10" data-volume="0.85"></audio>'''
match=re.search(r'(<figure[^>]+id="assessment-ui"[^>]*><div class="camera"[^>]*>)(<img[^>]+>)(</div>)',html);assert match
img=match.group(2).replace('assessment-before.png','assessment-ada-saved.png').replace('<img ','<img id="assessment-after" ',1).replace('style="','style="opacity:0;',1)
html=html[:match.end(2)]+img+html[match.end(2):]
for i,t in enumerate([7.2,17.2,31.3,37.2,45.2,53.2,69.3,85.1]):
    click=i in [2,4,5];src='click_003.ogg' if click else 'impactSoft_medium_000.ogg'
    html+=f'<audio id="sfx-{i}" src="assets/sfx/{src}" data-start="{t}" data-duration="{.012 if click else .12}" data-track-index="{11+i}" data-volume="0.12"></audio>'
js='''
const tl=gsap.timeline({paused:true});
const scenes='''+json.dumps([[id,t,d] for id,t,d,_ in scenes])+''';
scenes.forEach(([id,t,d])=>{
 const r=document.getElementById(id),inner=r.querySelector('.scene-inner');
 if(t>0)tl.fromTo(inner,{opacity:0},{opacity:1,duration:.3,ease:'power1.out'},t);
 tl.fromTo(r.querySelector('h1'),{y:24,opacity:id==='hook'?1:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},t+.08);
 const body=r.querySelector('.body');if(body)tl.fromTo(body,{y:14,opacity:0},{y:0,opacity:1,duration:.5,ease:'power2.out'},t+.45);
 const fig=r.querySelector('.screen,.research-path,.before-after,.model-panel,.history-panel,.evaluation-panel');
 if(fig)tl.fromTo(fig,{y:24,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out'},t+.2);
 if(t+d<90)tl.to(inner,{opacity:0,duration:.23,ease:'power1.in'},t+d-.23);
});
function focus(selector,at,zoom,ax=50,ay=50,duration=1.1){
 const world=document.querySelector(selector),max=50*(zoom-1);
 const x=Math.max(-max,Math.min(max,-(ax-50)*zoom)),y=Math.max(-max,Math.min(max,-(ay-50)*zoom));
 tl.fromTo(world,{scale:1,xPercent:0,yPercent:0},{scale:zoom,xPercent:x,yPercent:y,duration,ease:'power2.inOut'},at);
}
tl.fromTo('#hook-ui',{rotation:1.8},{rotation:0,duration:2,ease:'power2.out'},.4);
tl.fromTo('.hook-symbols span',{y:12,opacity:0},{y:0,opacity:1,stagger:.2,duration:.45,ease:'power2.out'},1.8);
tl.fromTo('.research-step',{x:26,opacity:0},{x:0,opacity:1,stagger:.65,duration:.5,ease:'power2.out'},7.7);
tl.fromTo('.path-link',{scaleY:0},{scaleY:1,stagger:.65,duration:.4,ease:'power1.out'},8.0);
tl.fromTo('.requirement',{x:20,opacity:0},{x:0,opacity:1,stagger:.45,duration:.5,ease:'power2.out'},17.5);
tl.fromTo('#assess-cursor',{x:90,y:90,opacity:0},{x:0,y:0,opacity:1,duration:.7,ease:'power2.inOut'},29.7);
tl.to('#assess-cursor',{x:-132,y:-135,duration:.8,ease:'power2.inOut'},30.45);
tl.fromTo('#assess-ring',{scale:.4,opacity:0},{scale:1.8,opacity:.7,duration:.35,ease:'power2.out'},31.25);
tl.to('#assess-ring',{opacity:0,duration:.25},31.6);
tl.to('#assess-cursor',{opacity:0,duration:.3},32.1);
tl.fromTo('#assessment-after',{opacity:0},{opacity:1,duration:.12,ease:'none'},31.4);
tl.fromTo('.example-bar',{y:15,opacity:0},{y:0,opacity:1,duration:.5,ease:'power2.out'},31.7);
tl.fromTo('.buffer-dots i',{scale:.5,opacity:0},{scale:1,opacity:1,stagger:.4,duration:.4,ease:'power2.out'},37.2);
tl.fromTo('.status-pair span',{x:-15,opacity:0},{x:0,opacity:1,stagger:.4,duration:.45,ease:'power2.out'},45.6);

focus('#backup-ui .camera',71,1.06,45,43,1.4);
tl.fromTo('.evaluation-item',{x:25,opacity:0},{x:0,opacity:1,duration:.5,stagger:.7,ease:'power2.out'},77.5);
tl.fromTo('.progress',{scaleX:0},{scaleX:1,duration:90,ease:'none'},0);
window.__timelines['gradeflow-ba-kompakt']=tl;
'''
html+='</div><script>'+js+'</script></body></html>'
(C/'index.html').write_text(html)
(C/'index.motion.json').write_text(json.dumps({'duration':90,'assertions':[{'kind':'appearsBy','selector':'#hook h1','bySec':.3},{'kind':'staysInFrame','selector':'.brand'},{'kind':'staysInFrame','selector':'.teacher'}]},indent=2)+'\n')
(R/'scene-timing.json').write_text(json.dumps([{'id':id,'start':t,'duration':d} for id,t,d,_ in scenes],indent=2)+'\n')
print('Built 11 scenes / 90 seconds / 1920×1080. User maximum: 120 seconds.')
