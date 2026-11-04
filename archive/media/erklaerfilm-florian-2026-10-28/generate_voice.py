"""Generate the public fictional explainer script with the free Edge online voice.
Requires edge-tts==7.3.1, internet access and FFprobe. No key or paid API is used.
Existing audio remains usable without contacting the service again.
"""
from pathlib import Path
import asyncio,json,shutil,subprocess,time
import edge_tts
R=Path(__file__).resolve().parent
VOICE="de-DE-FlorianMultilingualNeural"
RATE="+5%"
async def main():
    items=json.loads((R/"narration.json").read_text())
    folder=R/"composition/assets/voice"
    folder.mkdir(parents=True,exist_ok=True)
    guard=asyncio.Semaphore(2)
    async def one(item):
        async with guard:
            words=[]
            destination=folder/(item["id"]+".mp3")
            temporary=destination.with_suffix(".partial")
            try:
                speech=edge_tts.Communicate(item["text"],VOICE,rate=RATE,pitch="+0Hz",volume="+0%",boundary="WordBoundary",receive_timeout=45)
                with temporary.open("wb") as f:
                    async for event in speech.stream():
                        if event["type"]=="audio":f.write(event["data"])
                        elif event["type"]=="WordBoundary":
                            words.append(dict(text=event["text"],start=round(event["offset"]/10_000_000,4),end=round((event["offset"]+event["duration"])/10_000_000,4)))
                assert words and temporary.stat().st_size>1000,item["id"]
                temporary.replace(destination)
            finally:
                temporary.unlink(missing_ok=True)
            probe=json.loads(subprocess.check_output([shutil.which("ffprobe"),"-v","error","-show_format","-of","json",str(destination)]))
            duration=float(probe["format"]["duration"])
            assert words[-1]["end"]<=duration+.1,(item["id"],words[-1],duration)
            result=dict(id=item["id"],text=item["text"],duration=duration,words=words)
            print(item["id"],round(duration,3),"seconds",len(words),"word boundaries",flush=True)
            return result
    start=time.monotonic()
    results=await asyncio.gather(*(one(x) for x in items))
    (R/"voice-boundaries.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n")
    (R/"voice-production.json").write_text(json.dumps(dict(voice=VOICE,service="Microsoft Edge online read-aloud",runtime="edge-tts 7.3.1",rate=RATE,pitch="+0Hz",boundary="WordBoundary",local_synthesis=False,local_editing=True,paid_api_calls=0,additional_cost_eur=0,voice_choice="Florian chosen by user after two audio samples",delivery="Connected conversational sentences; semantic punctuation; original neural timing and pitch, no artificial acceleration or pause removal",generation_seconds=round(time.monotonic()-start,2),segments=[dict(id=x["id"],duration=x["duration"]) for x in results]),ensure_ascii=False,indent=2)+"\n")
if __name__=="__main__":asyncio.run(main())
