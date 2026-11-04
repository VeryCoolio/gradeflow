"""Build caption timings directly from the synthesizer word boundaries."""
from pathlib import Path
from math import ceil
import json,re
R=Path(__file__).resolve().parent
sources=json.loads((R/"voice-boundaries.json").read_text());scenes=[];at=0
norm=lambda x:re.sub(r"[^\w]","",x.lower())
for s in sources:
    canonical=s["text"].split();actual=s["words"]
    assert len(canonical)==len(actual) and all(norm(a)==norm(b["text"]) for a,b in zip(canonical,actual)),s["id"]
    pre=.14;duration=ceil(max(s["duration"]+pre+.25,8.5 if s["id"]=="outro" else 0)*30)/30
    words=[dict(text=text,start=round(w["start"]+pre,4),end=round(w["end"]+pre,4)) for text,w in zip(canonical,actual)]
    assert all(a["end"]<=b["start"]+.001 for a,b in zip(words,words[1:])),s["id"]
    merged=[];i=0
    patterns=[(["zwei","komma","null"],"2,00"),(["eins","komma","null"],"1,00"),(["eins","komma","sieben","fünf"],"1,75")]
    while i<len(words):
        for pattern,label in patterns:
            if [norm(w["text"]) for w in words[i:i+len(pattern)]]==pattern:
                last=words[i+len(pattern)-1];punct=re.search(r"[^\w]+$",last["text"])
                merged.append(dict(text=label+(punct.group() if punct else ""),start=words[i]["start"],end=last["end"]));i+=len(pattern);break
        else:merged.append(words[i]);i+=1
    captions=[];group=[]
    def flush():
        if group:captions.append(dict(start=group[0]["start"],end=group[-1]["end"],words=list(group)));group.clear()
    for w in merged:
        if group and (len(group)>=6 or sum(len(x["text"])+1 for x in group)+len(w["text"])>43 or w["start"]-group[-1]["end"]>.3):flush()
        group.append(w)
        if w["text"][-1] in ".?!:":flush()
    flush()
    assert words[-1]["end"]<duration-.2
    scenes.append(dict(id=s["id"],start=round(at,4),duration=duration,words=words,captions=captions,voice_start=pre,voice_duration=s["duration"]))
    at+=duration
D=ceil(max(at,108)*30)/30
scenes[-1]["duration"]=round(scenes[-1]["duration"]+D-at,4)
assert D<=120,D
assert all(a["start"]+a["duration"]<=b["start"]+.001 for a,b in zip(scenes,scenes[1:]))
(R/"timing.json").write_text(json.dumps(dict(duration=D,scenes=scenes),ensure_ascii=False,indent=2)+"\n")
print("Duration:",D,"seconds; native speech:",round(sum(s["voice_duration"] for s in scenes),3))
print([(s["id"],s["start"],s["duration"]) for s in scenes])
