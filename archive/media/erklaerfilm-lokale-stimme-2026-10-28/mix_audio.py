"""Rebuild the finished soundtrack from the included edited voice stems and own music."""
from pathlib import Path
import json,re,shutil,subprocess
R=Path(__file__).resolve().parent;C=R/'composition';T=json.loads((R/'timing.json').read_text());S=T['scenes'];D=T['duration']
ff=shutil.which('ffmpeg')
if not ff:raise SystemExit('FFmpeg is required to rebuild the local soundtrack.')
cmd=[ff,'-y','-v','error'];filters=[];labels=[]
for i,s in enumerate(S):
 cmd+=['-i',str(C/'assets/voice'/f'{s["id"]}.mp3')]
 ms=round((s['start']+s['voice_start'])*1000);lab=f'v{i}';labels.append(lab)
 filters.append(f'[{i}:a]atrim=duration={s["voice_duration"]},aresample=48000,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms}[{lab}]')
i=len(S);cmd+=['-i',str(C/'assets/music/gradeflow-score.mp3')];filters.append(f'[{i}:a]volume=0.16[bed]');labels.append('bed')
rating=next(s for s in S if s['id']=='rating');words=rating['words'];click=rating['start']+next(w['start'] for j,w in enumerate(words[:-1]) if w['text']=='Ein' and words[j+1]['text']=='Plus')+.7
cues=[(click,'click_003.ogg',.13),(43.25,'impactSoft_medium_000.ogg',.10),(63.25,'impactSoft_medium_000.ogg',.10),(98.2,'impactSoft_medium_000.ogg',.10)]
for n,(at,name,volume) in enumerate(cues):
 idx=len(S)+1+n;cmd+=['-i',str(C/'assets/sfx'/name)];ms=round(at*1000);lab=f'fx{n}';labels.append(lab);filters.append(f'[{idx}:a]volume={volume},adelay={ms}|{ms}[{lab}]')
filters.append(''.join('['+s+']' for s in labels)+f'amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=duration={D},loudnorm=I=-16:TP=-1.5:LRA=9[out]')
cmd+=['-filter_complex',';'.join(filters),'-map','[out]','-ar','48000','-ac','2','-c:a','libmp3lame','-b:a','192k',str(C/'assets/music/film-mix.mp3')]
subprocess.run(cmd,check=True);assert (C/'assets/music/film-mix.mp3').stat().st_size>0
(R/'audio-mix.json').write_text(json.dumps({'duration':D,'voice_stems':len(S),'music_gain':.16,'target_loudness_lufs':-16,'cues':[{'start':round(at,3),'file':name,'gain':v} for at,name,v in cues]},indent=2)+'\n')
print('Local soundtrack rebuilt. Click follows the visible action at',round(click,3),'seconds.')
