"""Build the local, editable Gradeflow product film from verified UI captures."""
from pathlib import Path
from html import escape
import json,shutil
import openpyxl
ROOT=Path(__file__).resolve().parent
C=ROOT/'composition'
def screen(src,x,y,w,h,crop=None,id='',extra=''):
    if crop:
        cx,cy,cw,ch=crop;s=max(w/cw,h/ch);style=f'width:{1440*s:.2f}px;height:{960*s:.2f}px;left:{-cx*s:.2f}px;top:{-cy*s:.2f}px'
    else:style='width:100%;height:100%;object-fit:cover'
    return f'<figure class="screen {extra}" id="{id}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><div class="camera" data-layout-allow-overflow><img data-layout-allow-overflow src="assets/ui/{src}.png" style="{style}" alt="Gradeflow: {escape(src)}"></div></figure>'
def copy(k,title,body='',x=88,y=182,w=550):
    return f'<div class="copy" style="left:{x}px;top:{y}px;width:{w}px"><p class="eyebrow">{k}</p><h1>{title}</h1>'+ (f'<p class="body">{body}</p>' if body else '')+'</div>'
def scene(id,start,dur,content):
    return f'<section id="{id}" class="clip" data-start="{start}" data-duration="{dur}" data-track-index="1"><div class="scene-inner">{content}</div></section>'
s=[]
s.append(scene('hook',0,7,copy('MÜNDLICHE MITARBEIT','Viele Stunden.<em>Ein nachvollziehbarer Verlauf.</em>','Gradeflow dokumentiert die Entwicklung im Unterricht.',w=790,y=202)+screen('table',956,310,875,465,(260,330,1170,622),id='hook-ui')+'<div class="hook-symbols" data-layout-ignore><span>−−</span><span>−</span><span>0</span><span>+</span><span>++</span></div>'))
s.append(scene('classes',7,7,copy('01 / ORIENTIERUNG','Die richtige Klasse.<em>Sofort.</em>','Pastellfarben zuordnen.<br>Reihenfolge selbst wählen.')+screen('classes',730,202,1100,733,id='classes-ui')+'<p class="bottom-note">Nach Klassenstufe, zuletzt benutzt oder am längsten nicht benutzt.</p>'))
s.append(scene('assess',14,11,copy('02 / DOKUMENTATION','Eine Person.<em>Eine Stunde.</em>','Die Gesamtleistung der Stunde einschätzen – relativ zum bisherigen Stand.',w=530,y=232)+screen('assessment-before',690,235,1150,745,(480,145,950,615),id='assessment-ui')+'<div class="saved-label">Jede Auswahl wird sofort lokal gespeichert.</div><svg class="demo-cursor" id="assess-cursor" viewBox="0 0 35 45" width="35" height="45" aria-hidden="true"><path d="M3 2 L3 36 L13 27 L20 42 L26 39 L19 24 L32 23 Z" fill="#242238" stroke="#f6f5f8" stroke-width="3"/></svg><div class="click-ring" id="assess-ring"></div>'))
s.append(scene('example',25,8,copy('03 / KONKRETES BEISPIEL','Was bedeutet<em>ein „+“?</em>','Ada wurde etwas besser eingeschätzt als ihr bisheriger Stand.',w=520,y=184)+screen('assessment-before',825,215,1000,465,(862,390,540,251),id='example-ui')+'<div class="math"><div><small>Stand vorher</small><strong>2,00</strong></div><span class="math-symbol">+</span><span class="math-arrow">→</span><div class="math-result"><small>Stand danach</small><strong>1,75</strong><span>Anzeige: 2+</span></div></div><p class="bottom-note">„+“ ist eine relative Einschätzung. Das Beispiel startet bei 2,00.</p>'))
s.append(scene('complete',33,7,copy('04 / KLARE ZUSTÄNDE','Auch ohne Bewertung<em>eindeutig.</em>','Abwesenheit und fehlende Beobachtung getrennt dokumentieren.',w=555)+screen('complete',760,220,1060,690,(250,100,1100,715),id='complete-ui')+'<div class="status-pair"><span><i class="aw"></i>AW · Abwesend</span><span><i class="nb"></i>NB · Nicht beobachtet</span></div><p class="bottom-note">Beide verändern den Stand nicht. Eine vollständige Stunde wird klar bestätigt.</p>'))
s.append(scene('history',40,9,copy('05 / NACHVOLLZIEHBARKEIT','Entwicklung<em>wird sichtbar.</em>','Klassenübersicht und persönlicher Verlauf. Auch frühere Eingaben lassen sich korrigieren.',w=760,y=160)+screen('table',86,575,820,290,(272,585,1115,395),id='table-detail')+'<div class="history-panel"><p class="panel-kicker">ADA BERGER · PERSÖNLICHER VERLAUF</p><img src="assets/ui/history-chart.png" alt="Tatsächlicher Verlauf von Ada Berger in Gradeflow"><div class="history-footer"><span>Start <b>2,00</b></span><span>Aktueller Stand <b>1,75</b></span></div></div><p class="mini-label" style="left:90px;top:530px">ALLE PERSONEN IM BLICK</p>'))
w=openpyxl.load_workbook(C/'assets/ui/Gradeflow_Beispielbericht.xlsx',data_only=True)
def fmt(c,i):
    return f'{float(c):.2f}'.replace('.',',') if i in [1,2] else str(c)
rows=''.join('<tr>'+''.join(f'<td>{escape(fmt(c,i))}</td>' for i,c in enumerate(row))+'</tr>' for row in w.worksheets[0].iter_rows(min_row=6,max_row=10,values_only=True))
tabs=''.join(f'<span>{escape(n)}</span>' for n in w.sheetnames)
s.append(scene('excel',49,8,copy('06 / EXPORT','Von der Klasse<em>zur einzelnen Person.</em>','Eine Excel-Datei mit Klassenübersicht und einem Tabellenblatt je Person.',w=575,y=215)+f'<div class="workbook"><p class="panel-kicker">VORSCHAU DER EXPORTIERTEN EXCEL-DATEI</p><h2>8a · Deutsch</h2><p>Bewertungszeitraum · Schuljahr 2026/2027</p><table><thead><tr><th>Person</th><th>Startwert</th><th>Aktuell</th><th>Puffer</th></tr></thead><tbody>{rows}</tbody></table><div class="sheet-tabs">{tabs}</div><p class="workbook-note">Die Namen verlinken direkt auf das jeweilige Personenblatt.</p></div>'))
s.append(scene('personal',57,8,copy('07 / INDIVIDUELL','Dein Unterricht.<em>Deine Übersicht.</em>','App-Farbe selbst wählen.<br>Klassen in Pastelltönen ordnen.',w=545,y=195)+'<div class="swatches" data-layout-ignore><i></i><i></i><i></i><i></i><i></i></div><div class="phone"><div class="phone-ear" data-layout-ignore></div><img data-layout-allow-overflow src="assets/ui/mobile-assessment.png" alt="Gradeflow-Bewertung im Smartphone-Format"></div>'+screen('demo-full',1200,335,620,320,(250,355,1160,600),id='demo-ui')+'<div class="demo-info"><strong>5 Wochen Demo</strong><p>25 fiktive Stunden – auf Wunsch ergänzen.</p></div><p class="bottom-note">Erst die Demo-Klasse anlegen. Danach die Beispielwerte erstellen.</p>'))
s.append(scene('backup',65,8,copy('08 / DATEN','Lokal gespeichert.<em>Bewusst gesichert.</em>','Der Bestand liegt im jeweiligen Browser. JSON regelmäßig herunterladen und geschützt aufbewahren.',w=590,y=205)+screen('backup',780,200,1040,757,(260,105,970,706),id='backup-ui')+'<p class="bottom-note">Keine automatische Synchronisierung zwischen Geräten.</p>'))
s.append(scene('outro',73,7,'<div class="outro-copy"><p class="eyebrow">MÜNDLICHE MITARBEIT IM UNTERRICHT</p><h1>Gradeflow<span class="logo-dot">.</span></h1><p class="closing-line">Beobachten.<br>Dokumentieren.<br><em>Nachvollziehen.</em></p></div>'+screen('table',1005,310,820,435,(260,330,1170,621),id='outro-ui')+'<p class="teacher">Die pädagogische Entscheidung bleibt bei der Lehrkraft.</p><p class="prototype">Bachelorarbeitsprototyp · Version 0.10.0</p>'))
css='''
@font-face{font-family:Manrope;src:url('assets/fonts/manrope.ttf');font-weight:200 800;font-style:normal;font-display:block}
@font-face{font-family:InstrumentSerif;src:url('assets/fonts/instrument-serif.ttf');font-weight:400;font-style:normal;font-display:block}
:root{--paper:#f6f5f8;--ink:#242238;--accent:#5b477e;--soft:#eee9f6;--muted:#615d70}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Manrope,sans-serif}#root{position:relative;width:100%;height:100%;overflow:hidden;background:var(--paper)}
.clip{position:absolute;inset:0}.scene-inner{position:absolute;inset:0}.brand{position:absolute;left:88px;top:54px;font-size:33px;font-weight:800;letter-spacing:-1.6px;z-index:10}.brand-symbol{display:inline-grid;place-items:center;width:37px;height:37px;background:var(--accent);color:#f6f5f8;border-radius:10px;font-size:25px;margin-right:10px}.top-rule{position:absolute;left:88px;right:88px;top:116px;height:2px;background:#dcd9e3}.top-meta{position:absolute;right:90px;top:64px;letter-spacing:3px;font-size:17px;color:var(--muted);font-weight:700;z-index:10}.footer-rule{position:absolute;left:88px;right:88px;bottom:38px;height:2px;background:#dcd9e3}.progress{height:2px;background:var(--accent);transform-origin:left center}.footnote{position:absolute;left:88px;bottom:62px;font-size:16px;letter-spacing:1.3px;color:var(--muted);z-index:9}.copy{position:absolute}.eyebrow{font-size:20px;letter-spacing:3px;color:var(--accent);font-weight:800;margin:0 0 30px}h1{font-size:82px;letter-spacing:-4px;line-height:1.06;font-weight:800;margin:0}h1 em{display:block;font:400 1.12em/1.02 InstrumentSerif,serif;letter-spacing:-1px;color:var(--accent);margin-top:7px}.body{font-size:30px;line-height:1.52;color:var(--muted);margin:36px 0 0}.body br{display:block}.screen{position:absolute;margin:0;border-radius:20px;border:2px solid #dcd9e3;overflow:hidden;background:#fff;box-shadow:0 28px 65px #24223816}.camera{position:absolute;inset:0;transform-origin:50% 50%;will-change:transform}.camera img{position:absolute;display:block;max-width:none}.bottom-note{position:absolute;left:88px;bottom:103px;margin:0;max-width:1730px;font-size:26px;color:var(--muted);line-height:1.3}.hook-symbols{position:absolute;left:88px;top:865px;display:flex;gap:14px}.hook-symbols span{font-size:30px;font-weight:800;border-radius:13px;background:var(--soft);padding:9px 22px;color:var(--accent)}#hook h1{font-size:97px}#hook .body{max-width:680px}#hook-ui{border-color:#baaccb}.saved-label{position:absolute;left:730px;top:900px;background:#e9f0e7;color:#315d4b;border:1px solid #a9bda4;border-radius:10px;padding:17px 24px;font-size:25px;font-weight:700}.demo-cursor{position:absolute;left:1600px;top:740px;z-index:3}.click-ring{position:absolute;left:1460px;top:605px;width:44px;height:44px;border-radius:50%;border:3px solid var(--accent);z-index:3}.math{position:absolute;left:825px;top:735px;display:flex;align-items:center;gap:36px}.math>div{display:flex;flex-direction:column}.math small{font-size:22px;color:var(--muted);margin-bottom:4px}.math strong{font-size:78px;line-height:1.1;letter-spacing:-4px}.math-symbol{font-size:55px;background:#e4f1ed;border:2px solid #9ebfb3;color:#315d4b;border-radius:19px;padding:0px 24px}.math-arrow{font-size:58px;color:#8f889c}.math-result strong{color:#315d4b}.math-result>span{font-size:23px;color:#315d4b;margin-top:8px}.status-pair{position:absolute;left:90px;top:725px;display:flex;flex-direction:column;gap:25px;font-size:26px;font-weight:700}.status-pair span{display:flex;align-items:center;gap:14px}.status-pair i{width:20px;height:20px;display:inline-block}.aw{background:#496b89;border-radius:3px}.nb{background:#957b45;rotate:45deg}.history-panel{position:absolute;left:952px;top:376px;width:870px;height:540px;padding:28px 26px;background:#fff;border:2px solid #dcd9e3;border-radius:20px;box-shadow:0 20px 60px #24223812}.panel-kicker{font-size:18px;letter-spacing:1.5px;color:var(--accent);font-weight:800;margin:0 0 24px}.history-panel img{width:100%;height:348px;object-fit:contain}.history-footer{display:flex;justify-content:space-between;font-size:23px;padding:22px 5px 0;color:var(--muted)}.history-footer b{color:var(--ink)}.mini-label{position:absolute;font-size:20px;letter-spacing:2px;font-weight:800;color:var(--accent);margin:0}#history h1{font-size:77px}#history .body{font-size:28px;max-width:710px;margin-top:24px}.workbook{position:absolute;left:740px;top:211px;width:1090px;background:#fff;border:2px solid #dcd9e3;border-radius:20px;padding:34px 36px;box-shadow:0 26px 60px #24223813}.workbook h2{font-size:37px;letter-spacing:-1.5px;margin:0 0 12px}.workbook>p:not(.panel-kicker){font-size:23px;margin:0 0 25px;color:var(--muted)}table{border-collapse:collapse;width:100%;font-size:26px;margin:35px 0 30px}th,td{padding:14px 15px;text-align:left;border:1px solid #dcd9e3}th{background:var(--soft);font-weight:800;color:var(--accent);font-size:22px}td:first-child{color:var(--accent);text-decoration:underline;text-underline-offset:5px;font-weight:700}td:not(:first-child){text-align:right}tr:nth-child(even){background:#f8f7fa}.sheet-tabs{display:flex;flex-wrap:wrap;gap:0;border-top:2px solid #dcd9e3}.sheet-tabs span{font-size:16px;padding:12px 9px 8px;border-right:1px solid #dcd9e3;color:var(--muted)}.sheet-tabs span:first-child{background:var(--soft);color:var(--accent);font-weight:800}.workbook .workbook-note{font-size:20px!important;margin:22px 0 0!important}.phone{position:absolute;left:775px;top:174px;width:364px;height:716px;border:9px solid #242238;border-radius:48px;overflow:hidden;background:var(--paper);box-shadow:0 24px 55px #24223824}.phone img{width:100%;position:absolute;top:-145px;left:0}.phone-ear{position:absolute;left:127px;top:8px;width:90px;height:16px;border-radius:12px;background:#242238;z-index:2}.swatches{position:absolute;left:90px;top:725px;display:flex;gap:18px}.swatches i{width:54px;height:54px;border-radius:50%;border:2px solid #8f889c;background:#eee8f5}.swatches i:nth-child(2){background:#e7eff7}.swatches i:nth-child(3){background:#e9f0e7}.swatches i:nth-child(4){background:#f6e9ed}.swatches i:nth-child(5){background:#f5eedf}#personal .bottom-note{max-width:620px;font-size:24px}.demo-info{position:absolute;left:1200px;top:785px;width:640px}.demo-info strong{font-size:44px;letter-spacing:-2px}.demo-info p{font-size:25px;color:var(--muted);margin:12px 0}.outro-copy{position:absolute;left:88px;top:185px}.outro-copy h1{font-size:148px;letter-spacing:-8px}.logo-dot{color:var(--accent)}.closing-line{font-size:57px;line-height:1.18;letter-spacing:-2px;margin-top:40px;font-weight:700}.closing-line em{font:400 1.16em InstrumentSerif,serif;color:var(--accent)}.teacher{position:absolute;left:88px;top:883px;font-size:28px;line-height:1.4;margin:0}.prototype{position:absolute;right:95px;bottom:62px;font-size:16px;color:var(--muted);margin:0}.outro-copy .eyebrow{margin-bottom:20px}
'''
# br is only used for short displayed slogans and lists, not prose paragraphs.
css=css.replace('.body br{display:block}','.body br{display:block}')
html='''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><title>Gradeflow · Produktpitch</title><script src="assets/gsap.min.js"></script><style>'''+css+'''</style></head><body><div id="root" data-composition-id="gradeflow-pitch" data-start="0" data-width="1920" data-height="1080" data-duration="80"><div class="top-rule" data-layout-ignore></div><div class="brand"><span class="brand-symbol">G</span>Gradeflow</div><div class="top-meta">PRODUKTPITCH</div>'''+''.join(s)+'''<div class="footer-rule" data-layout-ignore><div class="progress"></div></div><div class="footnote">ECHTE APP · FIKTIVE BEISPIELDATEN</div><audio id="music" src="assets/music/gradeflow-score.mp3" data-start="0" data-duration="80" data-track-index="10" data-volume="0.85"></audio>'''
for i,t in enumerate([7.2,20.3,27.2,34.2,39.0,50.0,66.0,73.25]):
    src='click_003.ogg' if i in [1,2,3,6] else 'impactSoft_medium_000.ogg'
    html+=f'<audio id="sfx-{i}" src="assets/sfx/{src}" data-start="{t}" data-duration="{0.012 if src.startswith('click') else 0.12}" data-track-index="{11+i}" data-volume="0.12"></audio>'
js='''
const tl=gsap.timeline({paused:true});
const scenes=[['hook',0,7],['classes',7,7],['assess',14,11],['example',25,8],['complete',33,7],['history',40,9],['excel',49,8],['personal',57,8],['backup',65,8],['outro',73,7]];
scenes.forEach(([id,t,d])=>{
 const r=document.getElementById(id),inner=r.querySelector('.scene-inner');
 if(t>0)tl.fromTo(inner,{opacity:0},{opacity:1,duration:.35,ease:'power1.out'},t);
 const title=r.querySelector('h1');
 tl.fromTo(title,{y:28,opacity:id==='hook'?1:0},{y:0,opacity:1,duration:.65,ease:'power3.out'},t+.1);
 const body=r.querySelector('.body');if(body)tl.fromTo(body,{y:18,opacity:0},{y:0,opacity:1,duration:.55,ease:'power2.out'},t+.5);
 const fig=r.querySelector('.screen,.workbook,.history-panel,.phone');if(fig)tl.fromTo(fig,{y:30,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out'},t+.3);
 if(t+d<80)tl.to(inner,{opacity:0,duration:.27,ease:'power1.in'},t+d-.27);
});
// Adapted from Hyperframes registry primitive ui-focus-zoom: one world wrapper,
// a clamped anchored camera, and a settled final pose. No DOM measurements.
function focus(selector,at,zoom,ax=50,ay=50,duration=1.1){
 const world=document.querySelector(selector),max=50*(zoom-1);
 const x=Math.max(-max,Math.min(max,-(ax-50)*zoom));
 const y=Math.max(-max,Math.min(max,-(ay-50)*zoom));
 tl.fromTo(world,{scale:1,xPercent:0,yPercent:0},{scale:zoom,xPercent:x,yPercent:y,duration,ease:'power2.inOut'},at);
}
focus('#classes-ui .camera',9,1.5,22,41,1.5);


focus('#complete-ui .camera',35,1.06,50,44,1.2);
focus('#backup-ui .camera',67,1.09,45,43,1.4);
tl.fromTo('#hook-ui',{rotation:1.8},{rotation:0,duration:2.0,ease:'power2.out'},.4);
tl.fromTo('.hook-symbols span',{y:12,opacity:0},{y:0,opacity:1,stagger:.2,duration:.45,ease:'power2.out'},1.8);
tl.fromTo('#assess-cursor',{x:90,y:90,opacity:0},{x:0,y:0,opacity:1,duration:.75,ease:'power2.inOut'},18.7);
tl.to('#assess-cursor',{x:-132,y:-135,duration:.85,ease:'power2.inOut'},19.5);
tl.fromTo('#assess-ring',{scale:.4,opacity:0},{scale:1.8,opacity:.7,duration:.35,ease:'power2.out'},20.25);
tl.to('#assess-ring',{opacity:0,duration:.25},20.6);
tl.to('#assess-cursor',{opacity:0,duration:.3},21.1);
tl.fromTo('.saved-label',{y:12,opacity:0},{y:0,opacity:1,duration:.45,ease:'power2.out'},20.5);
tl.fromTo('.math-result',{y:20,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},27.25);
tl.fromTo('.math-symbol',{scale:.7,opacity:0},{scale:1,opacity:1,duration:.4,ease:'back.out(1.2)'},26.4);
tl.fromTo('.status-pair span',{x:-15,opacity:0},{x:0,opacity:1,stagger:.5,duration:.5,ease:'power2.out'},34);
tl.fromTo('.swatches i',{scale:.5,opacity:0},{scale:1,opacity:1,stagger:.13,duration:.45,ease:'back.out(1.2)'},58.2);
tl.fromTo('.demo-info',{y:20,opacity:0},{y:0,opacity:1,duration:.6,ease:'power2.out'},58.8);
tl.fromTo('.progress',{scaleX:0},{scaleX:1,duration:80,ease:'none'},0);

'''
html=html.replace('id="assessment-ui"', 'id="assessment-ui"')
from re import search
match=search(r'(<figure[^>]+id="assessment-ui"[^>]*><div class="camera"[^>]*>)(<img[^>]+>)(</div>)',html)
assert match
img=match.group(2).replace('assessment-before.png','assessment-ada-saved.png').replace('<img ','<img id="assessment-after" ',1).replace('style="','style="opacity:0;',1)
html=html[:match.end(2)]+img+html[match.end(2):]
js += "tl.fromTo('#assessment-after',{opacity:0},{opacity:1,duration:.12,ease:'none'},20.4);"
js += "window.__timelines['gradeflow-pitch']=tl;"
html+='</div><script>'+js+'</script></body></html>'
# Keep prose as text; line breaks in body copy become independent block lines.
html=html.replace('Pastellfarben zuordnen.<br>Reihenfolge selbst wählen.','Pastellfarben zuordnen. Reihenfolge selbst wählen.').replace('App-Farbe selbst wählen.<br>Klassen in Pastelltönen ordnen.','App-Farbe selbst wählen. Klassen in Pastelltönen ordnen.')
(C/'index.html').write_text(html)
(C/'index.motion.json').write_text(json.dumps({'duration':80,'assertions':[{'kind':'appearsBy','selector':'#hook h1','bySec':.3},{'kind':'staysInFrame','selector':'.brand'},{'kind':'staysInFrame','selector':'.teacher'}]},indent=2))
print('Built 10 scenes / 80 seconds / 1920×1080')
