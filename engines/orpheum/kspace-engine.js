// kspace-engine.js — image → 2D Fourier (k-space) → self-similar spectral filters → image.
// Radix-2 FFT, φ-ladder ring masks, dihedral sector combs, golden-angle spectral echoes,
// phase quantisation. Output luma re-enters the studio through extractBands, so P1 holds.
export const PHI=1.6180339887, GOLDEN_ANGLE=137.50776405*Math.PI/180;

function fft1(re,im,inv){
  const n=re.length;
  for(let i=1,j=0;i<n;i++){ let bit=n>>1; for(;j&bit;bit>>=1)j^=bit; j^=bit; if(i<j){ let t=re[i];re[i]=re[j];re[j]=t; t=im[i];im[i]=im[j];im[j]=t; } }
  for(let len=2;len<=n;len<<=1){
    const ang=2*Math.PI/len*(inv?1:-1), wr=Math.cos(ang), wi=Math.sin(ang);
    for(let i=0;i<n;i+=len){ let cr=1,ci=0;
      for(let j=0;j<len/2;j++){ const a=i+j,b=a+len/2;
        const xr=re[b]*cr-im[b]*ci, xi=re[b]*ci+im[b]*cr;
        re[b]=re[a]-xr; im[b]=im[a]-xi; re[a]+=xr; im[a]+=xi;
        const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } }
  }
  if(inv) for(let i=0;i<n;i++){ re[i]/=n; im[i]/=n; }
}
export function fft2(re,im,N,inv){
  const r=new Float64Array(N), m=new Float64Array(N);
  for(let y=0;y<N;y++){ fft1(re.subarray(y*N,y*N+N),im.subarray(y*N,y*N+N),inv); }
  for(let x=0;x<N;x++){ for(let y=0;y<N;y++){ r[y]=re[y*N+x]; m[y]=im[y*N+x]; } fft1(r,m,inv); for(let y=0;y<N;y++){ re[y*N+x]=r[y]; im[y*N+x]=m[y]; } }
}

// fit the source into an N×N square (aspect kept, centred, padded with its mean luma)
export function toSquare(src,N){
  const {w,h,luma}=src; let mean=0; for(let i=0;i<w*h;i++)mean+=luma[i]; mean/=w*h;
  const s=Math.min(N/w,N/h), fw=w*s, fh=h*s, ox=(N-fw)/2, oy=(N-fh)/2;
  const out=new Float64Array(N*N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const sx=(x-ox)/s, sy=(y-oy)/s;
    if(sx<0||sy<0||sx>=w||sy>=h){ out[y*N+x]=mean; continue; }
    out[y*N+x]=luma[(sy|0)*w+(sx|0)];
  }
  return {sq:out,mean,box:{x:ox,y:oy,w:fw,h:fh}};
}

// bilinear sample of a spectrum stored in FFT order, at CENTRED fractional coords (kx,ky ∈ [-N/2,N/2))
function sampleC(re,im,N,kx,ky){
  const h=N/2, fx=kx+h, fy=ky+h;
  if(fx<0||fy<0||fx>=N-1||fy>=N-1)return [0,0];
  const x0=fx|0,y0=fy|0,tx=fx-x0,ty=fy-y0;
  const at=(x,y)=>{ const ix=(x+h)%N, iy=(y+h)%N; return iy*N+ix; }; // centred index → FFT index
  const a=at(x0,y0),b=at(x0+1,y0),c=at(x0,y0+1),d=at(x0+1,y0+1);
  const R=(re[a]*(1-tx)+re[b]*tx)*(1-ty)+(re[c]*(1-tx)+re[d]*tx)*ty;
  const I=(im[a]*(1-tx)+im[b]*tx)*(1-ty)+(im[c]*(1-tx)+im[d]*tx)*ty;
  return [R,I];
}

// The filter. All gains are radial/angular functions of centred k; DC is always kept.
// p: {beta, ringStr, ringWidth, ringK0, sectorN, sectorStr, echoes, echoGain, echoRot,
//     phaseQ, whiten, lo, hi}
export function filterSpectrum(re,im,N,p){
  const h=N/2, kref=0.06;
  // 1. spectral echoes — F'(k) = F(k) + Σ g^n · F(R^-n k / φ^n), rotation by the golden angle.
  //    F(k/φⁿ) is the image shrunk by φⁿ about the plate centre; the centring phase (-1)^(kx+ky)
  //    is folded in so the scaling is about the middle, not the corner.
  if(p.echoes>0){
    const R0=Float64Array.from(re), I0=Float64Array.from(im);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const kx=((x+h)%N)-h, ky=((y+h)%N)-h, i=y*N+x, sgn=((kx+ky)&1)?-1:1;
      let ar=0, ai=0;
      for(let n=1;n<=p.echoes;n++){
        const sc=Math.pow(PHI,-n), ang=-(p.echoRot?n*GOLDEN_ANGLE:0), ca=Math.cos(ang), sa=Math.sin(ang);
        const qx=(kx*ca-ky*sa)*sc, qy=(kx*sa+ky*ca)*sc;
        const [sr,si]=sampleC(R0,I0,N,qx,qy);
        const g=Math.pow(p.echoGain,n)*sc*sc; // 1/s² so each echo carries φ-scaled energy
        // source sample sits on parity of its own rounded index — approximate with centred sign
        const s2=((Math.round(qx)+Math.round(qy))&1)?-1:1;
        ar+=g*sr*s2*sgn; ai+=g*si*s2*sgn;
      }
      re[i]+=ar; im[i]+=ai;
    }
  }
  const dcR=re[0], dcI=im[0];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const kx=((x+h)%N)-h, ky=((y+h)%N)-h, i=y*N+x;
    if(kx===0&&ky===0)continue;
    const k=Math.hypot(kx,ky)/h, th=Math.atan2(ky,kx);
    let g=1;
    // 2. spectral slope — 1/f^β re-weighting. β>0 → fractal, cloud-like; β<0 → whitened, edgy.
    if(p.beta)g*=Math.pow((k+0.004)/kref,-p.beta);
    // 3. φ-ladder rings — energy kept only near |k| = k0·φⁱ, a self-similar comb
    if(p.ringStr>0){ const L=Math.log(Math.max(k,1e-4)/p.ringK0)/Math.log(PHI); const d=Math.abs(L-Math.round(L));
      const m=Math.exp(-(d*d)/(2*p.ringWidth*p.ringWidth)); g*=(1-p.ringStr)+p.ringStr*m; }
    // 4. dihedral sector comb — N-fold angular gate; the image inherits N-directional grain
    if(p.sectorStr>0&&p.sectorN>0){ const m=Math.pow(0.5+0.5*Math.cos(p.sectorN*th),2); g*=(1-p.sectorStr)+p.sectorStr*m; }
    // 5. band limits — soft Butterworth
    if(p.lo>0)g*=1/(1+Math.pow(p.lo/k,8));
    if(p.hi<1)g*=1/(1+Math.pow(k/p.hi,8));
    let R=re[i]*g, I=im[i]*g;
    // 6. phase geometry — quantise to Q sectors (crystallises), whiten magnitude (phase-only image)
    if(p.phaseQ>0||p.whiten>0){
      let mag=Math.hypot(R,I), ph=Math.atan2(I,R);
      if(p.phaseQ>0){ const st=2*Math.PI/p.phaseQ; ph=Math.round(ph/st)*st; }
      if(p.whiten>0){ mag=Math.pow(mag,1-p.whiten); }
      R=mag*Math.cos(ph); I=mag*Math.sin(ph);
    }
    re[i]=R; im[i]=I;
  }
  re[0]=dcR; im[0]=dcI;
}

// full pass: square source → FFT → filter → IFFT → normalised luma + spectrum picture
export function kspacePass(src,N,p){
  const {sq,mean,box}=toSquare(src,N);
  const re=Float64Array.from(sq), im=new Float64Array(N*N);
  for(let i=0;i<N*N;i++)re[i]-=mean;
  fft2(re,im,N,false);
  const specBefore=logMag(re,im,N);
  filterSpectrum(re,im,N,p);
  // hand-painted k-space mask (centred N×N, 0..1); applied Hermitian-symmetrically so the return stays real
  if(p.mask){ const h=N/2, m=p.mask; for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const cx=(x+h)%N, cy=(y+h)%N; const g=m[cy*N+cx]; if(g!==1&&!(x===0&&y===0)){ const i=y*N+x; re[i]*=g; im[i]*=g; } } }
  const specAfter=logMag(re,im,N);
  fft2(re,im,N,true);
  // robust normalise: 1st–99th percentile → 0..1
  const v=Float64Array.from(re).sort(), lo=v[(N*N*0.01)|0], hi=v[(N*N*0.99)|0]||lo+1e-6;
  const out=new Float32Array(N*N);
  for(let i=0;i<N*N;i++)out[i]=Math.max(0,Math.min(1,(re[i]-lo)/(hi-lo)));
  return {luma:out,N,box,specBefore,specAfter,slope:measureSlope(specAfter,N)};
}
function logMag(re,im,N){
  const h=N/2, out=new Float32Array(N*N); let mx=0;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const i=y*N+x; const v=Math.log1p(Math.hypot(re[i],im[i])); out[((y+h)%N)*N+((x+h)%N)]=v; if(v>mx)mx=v; }
  for(let i=0;i<N*N;i++)out[i]/=mx||1;
  return out; // centred, 0..1
}
// least-squares slope of log power vs log k, radially averaged — the measured β; D ≈ (8−β)/2 for a 2-D surface
function measureSlope(spec,N){
  const h=N/2, bins=new Float64Array(h), cnt=new Float64Array(h);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const r=Math.round(Math.hypot(x-h,y-h)); if(r<2||r>=h)continue; bins[r]+=spec[y*N+x]; cnt[r]++; }
  let sx=0,sy=0,sxx=0,sxy=0,n=0;
  for(let r=2;r<h;r++){ if(!cnt[r])continue; const X=Math.log(r/h), Y=2*(bins[r]/cnt[r]); sx+=X;sy+=Y;sxx+=X*X;sxy+=X*Y;n++; }
  const b=n>1?-(n*sxy-sx*sy)/(n*sxx-sx*sx):0;
  return b;
}
// radially averaged spectrum: [{k, logP}] plus least-squares fit {beta, c} for logP = c − beta·log k
export function radialSpectrum(spec,N){
  const h=N/2, bins=new Float64Array(h), cnt=new Float64Array(h);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const r=Math.round(Math.hypot(x-h,y-h)); if(r<2||r>=h)continue; bins[r]+=spec[y*N+x]; cnt[r]++; }
  const pts=[]; let sx=0,sy=0,sxx=0,sxy=0,n=0;
  for(let r=2;r<h;r++){ if(!cnt[r])continue; const X=Math.log(r/h), Y=2*(bins[r]/cnt[r]); pts.push({k:r/h,logK:X,logP:Y}); sx+=X;sy+=Y;sxx+=X*X;sxy+=X*Y;n++; }
  const slope=n>1?(n*sxy-sx*sy)/(n*sxx-sx*sx):0, c=n?(sy-slope*sx)/n:0;
  return {pts,beta:-slope,c};
}
// SVG of the radial power spectrum with fitted 1/f^β line
export function spectrumGraphSVG(rs,opts={}){
  const W=opts.W||900,H=opts.H||560,pad={l:70,r:24,t:30,b:56},fg=opts.fg||'#edeae3',bg=opts.bg||'#0e0e10',ac=opts.accent||'#d4a84b',mu=opts.muted||'#908e87';
  const {pts,beta,c}=rs; if(!pts.length)return '';
  const xs=pts.map(p=>p.logK), ys=pts.map(p=>p.logP);
  const x0=Math.min(...xs),x1=Math.max(...xs); let y0=Math.min(...ys),y1=Math.max(...ys); const m=(y1-y0)*0.08||0.1; y0-=m;y1+=m;
  const X=v=>pad.l+(v-x0)/(x1-x0)*(W-pad.l-pad.r), Y=v=>H-pad.b-(v-y0)/(y1-y0)*(H-pad.t-pad.b);
  const path=pts.map((p,i)=>(i?'L':'M')+X(p.logK).toFixed(1)+' '+Y(p.logP).toFixed(1)).join('');
  const fit='M'+X(x0).toFixed(1)+' '+Y(c-beta*x0).toFixed(1)+'L'+X(x1).toFixed(1)+' '+Y(c-beta*x1).toFixed(1);
  const kt=[0.02,0.05,0.1,0.2,0.5,1].filter(k=>Math.log(k)>=x0-1e-9&&Math.log(k)<=x1+1e-9);
  const nyt=5, yt=Array.from({length:nyt},(_,i)=>y0+(y1-y0)*i/(nyt-1));
  const f="font-family:'Space Mono',monospace";
  let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'"><rect width="'+W+'" height="'+H+'" fill="'+bg+'"/>';
  kt.forEach(k=>{ const x=X(Math.log(k)); s+='<line x1="'+x+'" y1="'+pad.t+'" x2="'+x+'" y2="'+(H-pad.b)+'" stroke="'+fg+'" stroke-opacity=".08"/><text x="'+x+'" y="'+(H-pad.b+18)+'" fill="'+mu+'" font-size="11" text-anchor="middle" style="'+f+'">'+k+'</text>'; });
  yt.forEach(v=>{ const y=Y(v); s+='<line x1="'+pad.l+'" y1="'+y+'" x2="'+(W-pad.r)+'" y2="'+y+'" stroke="'+fg+'" stroke-opacity=".08"/><text x="'+(pad.l-8)+'" y="'+(y+4)+'" fill="'+mu+'" font-size="11" text-anchor="end" style="'+f+'">'+v.toFixed(2)+'</text>'; });
  s+='<line x1="'+pad.l+'" y1="'+(H-pad.b)+'" x2="'+(W-pad.r)+'" y2="'+(H-pad.b)+'" stroke="'+fg+'" stroke-opacity=".3"/><line x1="'+pad.l+'" y1="'+pad.t+'" x2="'+pad.l+'" y2="'+(H-pad.b)+'" stroke="'+fg+'" stroke-opacity=".3"/>';
  s+='<path d="'+fit+'" stroke="'+ac+'" stroke-width="1.5" stroke-dasharray="6 5" fill="none"/><path d="'+path+'" stroke="'+fg+'" stroke-width="1.6" fill="none" stroke-linejoin="round"/>';
  s+='<text x="'+(W/2)+'" y="'+(H-14)+'" fill="'+mu+'" font-size="11" text-anchor="middle" letter-spacing="1.5" style="'+f+'">|k| / k_nyquist (log)</text>';
  s+='<text transform="translate(18 '+(H/2)+') rotate(-90)" fill="'+mu+'" font-size="11" text-anchor="middle" letter-spacing="1.5" style="'+f+'">log power (radial mean)</text>';
  s+='<text x="'+(W-pad.r)+'" y="'+(pad.t-10)+'" fill="'+ac+'" font-size="12" text-anchor="end" style="'+f+'">fit 1/f^β · β = '+beta.toFixed(2)+' · D ≈ '+Math.max(2,Math.min(3,(8-beta)/2)).toFixed(2)+'</text>';
  s+='<text x="'+pad.l+'" y="'+(pad.t-10)+'" fill="'+mu+'" font-size="11" style="'+f+'">RADIAL POWER SPECTRUM · N='+(opts.N||'')+'</text></svg>';
  return s;
}
// paint a 0..1 field into a canvas, optional palette tint
export function paintField(cv,field,N,tint){
  cv.width=N; cv.height=N; const x=cv.getContext('2d'), id=x.createImageData(N,N), d=id.data;
  for(let i=0;i<N*N;i++){ const v=field[i]; const t=Math.max(0,Math.min(1,v));
    if(tint){ d[i*4]=tint[0]*t+tint[3]*(1-t); d[i*4+1]=tint[1]*t+tint[4]*(1-t); d[i*4+2]=tint[2]*t+tint[5]*(1-t); }
    else { d[i*4]=d[i*4+1]=d[i*4+2]=t*255; }
    d[i*4+3]=255; }
  x.putImageData(id,0,0);
}
// crop the square result back to the source's aspect box → a srcObj for extractBands
export function cropToSource(res){
  const {luma,N,box}=res; const w=Math.max(2,Math.round(box.w)), h=Math.max(2,Math.round(box.h)), out=new Float32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const sx=Math.min(N-1,(box.x+x)|0), sy=Math.min(N-1,(box.y+y)|0); out[y*w+x]=luma[sy*N+sx]; }
  return {w,h,luma:out};
}
