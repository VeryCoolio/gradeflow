import numpy as np,wave,subprocess,json,math
from pathlib import Path
SR=48000;D=json.loads((Path(__file__).resolve().parent/'timing.json').read_text())['duration'];beat=.625;N=int(round(SR*D))
mix=np.zeros(N,dtype=np.float64);rng=np.random.default_rng(628)
def note(at,midi,length=1.9,amp=.12):
 n=min(int(length*SR),N-int(at*SR))
 if n<=0:return
 t=np.arange(n)/SR;f=440*2**((midi-69)/12)
 env=(1-np.exp(-t*140))*np.exp(-t*2.5)
 signal=(np.sin(2*np.pi*f*t)+.28*np.sin(2*np.pi*f*2.002*t)+.09*np.sin(2*np.pi*f*3*t))*env*amp
 start=int(at*SR);mix[start:start+n]+=signal
 for delay,g in [(.1875,.19),(.375,.08)]:
  ds=start+int(delay*SR);end=min(N,ds+n)
  if ds<N:mix[ds:end]+=signal[:end-ds]*g
chords=[[50,57,62,65],[46,53,58,62],[48,55,60,64],[41,48,57,60]]
for bar in range(math.ceil(D/(4*beat))):
 start=bar*4*beat;ch=chords[(bar//2)%4]
 for j in range(8):
  note(start+j*beat/2,ch[[0,2,1,3,2,1,3,2][j]]+12,length=1.6,amp=.044 if bar<3 else .065)
 note(start,ch[0]-12,length=2.3,amp=.14)
 if bar>=4:
  for j in [0,2]:
   t=np.arange(int(.23*SR))/SR
   kick=np.sin(2*np.pi*(48*t+32*(1-np.exp(-t*25))/25))*np.exp(-t*20)*.12
   st=int((start+j*beat)*SR);en=min(N,st+len(kick))
   if st<N:mix[st:en]+=kick[:en-st]
  for j in range(8):
   t=np.arange(int(.04*SR))/SR;tick=rng.standard_normal(len(t))*.009*np.exp(-t*105)
   st=int((start+(j+.5)*beat/2)*SR)
   if st+len(tick)<N:mix[st:st+len(tick)]+=tick
 if bar in [3,7,11,15,19,23,27,30]:
  for j,m in enumerate([ch[2]+24,ch[3]+24,ch[1]+24]):note(start+j*beat,m,length=2.4,amp=.06)
f=np.minimum(1,np.arange(N)/(SR*.8))*np.minimum(1,(N-np.arange(N))/(SR*3.5))
mix=np.tanh(mix*1.6)*f
stereo=np.column_stack([mix,np.roll(mix,int(.009*SR))*.96]);stereo/=max(1,np.max(np.abs(stereo))/.85)
import tempfile
cache=Path(tempfile.mkdtemp(prefix='gradeflow-score-'))
wav=str(cache/'score.wav')
with wave.open(wav,'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((stereo*32767).astype('<i2').tobytes())
out=Path(__file__).resolve().parent/'composition/assets/music';out.mkdir(exist_ok=True)
subprocess.run([__import__('shutil').which('ffmpeg') or 'ffmpeg','-v','error','-y','-i',wav,'-af','loudnorm=I=-19:TP=-2:LRA=7','-c:a','libmp3lame','-b:a','192k',str(out/'gradeflow-score.mp3')],check=True)
print(f'Original instrumental score, {D} seconds, 96 BPM')
