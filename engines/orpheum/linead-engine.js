// linead-engine.js — image → geometric forms → vector plates → lineads.
// Shared compositor + the v2 900-DPI print contract (tiled raster, user-space rewrite, pHYs).
export const PALETTES = {
  spectraPaper:{label:'Spectra · paper', ground:'#f4ede0', ink:'#141210', ramp:['#141210','#8c2f1e','#324555','#d97a3c','#7a9171','#d4a84b']},
  orpheum:{label:'Orpheum', ground:'#141210', ink:'#f4ede0', ramp:['#f4ede0','#d4a84b','#d97a3c','#8c2f1e','#7aa0d0','#86b89a']},
  sumi:{label:'Sumi · seal', ground:'#f6f1e6', ink:'#171512', ramp:['#171512','#3a352c','#6b6357','#a89f8d','#c0392b']},
  grayPaper:{label:'Gray · paper', ground:'#efece4', ink:'#1a1a1a', ramp:['#141414','#3d3d3d','#6e6e6e','#a3a3a3','#cfcac0']},
  noirLine:{label:'Noir · line', ground:'#0a0a0b', ink:'#ece7da', ramp:['#ece7da','#d4a84b','#b8b0a1','#7aa0d0','#e87258']},
  hermetic:{label:'Hermetic', ground:'#101623', ink:'#e8dfcb', ramp:['#e8dfcb','#d4a84b','#a67756','#7a9171','#d88b5c','#324555']},
  // Sanzo Wada — drawn from A Dictionary of Color Combinations; ramp[0] darkest
  wadaSango:{label:'Wada \u00B7 Sango & Peacock', ground:'#f2e8d5', ink:'#22201c', ramp:['#22201c','#00707a','#e2464a','#eaaa38','#7b8b6f','#d6958c']},
  wadaEtruscan:{label:'Wada \u00B7 Etruscan', ground:'#efe4cf', ink:'#2a1a12', ramp:['#2a1a12','#a04033','#d98e46','#606c38','#283d3b','#c9b25b']},
  wadaNight:{label:'Wada \u00B7 Night Green', ground:'#101913', ink:'#ecdfc3', ramp:['#ecdfc3','#d5a021','#89a06b','#c96f4a','#5f8b8a','#b44d3c']},
  wadaBiskra:{label:'Wada \u00B7 Biskra', ground:'#f5eddc', ink:'#1c2531', ramp:['#1c2531','#476c8a','#c8a63c','#9a4a35','#7a9a7e','#d3b8a1']},
  wadaMauve:{label:'Wada \u00B7 Mauve & Gold', ground:'#f1e9dc', ink:'#33262e', ramp:['#33262e','#7e5a75','#d3a94e','#496a63','#b3593f','#93a8b6']},
  wadaScarlet:{label:'Wada \u00B7 Scarlet & Slate', ground:'#ede7db', ink:'#232730', ramp:['#232730','#c22f2f','#546a7b','#dca63f','#3f5747','#a8836b']},
  wadaOpal:{label:'Wada \u00B7 Opal Grey', ground:'#e9e6df', ink:'#2e2b28', ramp:['#2e2b28','#847e74','#b9553f','#4d6a6d','#c2a25a','#a6b0a0']},
  wadaIndigo:{label:'Wada \u00B7 Indigo & Maize', ground:'#f4eede', ink:'#1d2438', ramp:['#1d2438','#324a7e','#e0b23c','#a9502f','#6d8a70','#c8c2ae']},
  wadaCoral:{label:'Wada \u00B7 Coral & Jade', ground:'#f7efe2', ink:'#20231f', ramp:['#20231f','#e0705a','#2f7d6d','#e5b84a','#655a8c','#b5b09a']},
  wadaSumire:{label:'Wada \u00B7 Sumire', ground:'#efeae2', ink:'#272033', ramp:['#272033','#5c4a8a','#c99a3f','#8a3d43','#40656e','#a99f8a']}
};
const q = n => Math.round(n*100)/100;

// ── source loading (with configurable maxSide, progressive high-Q downsample & active pixel-space ROI cropping) ──
export function loadImageLuma(src, maxSide=2048, {trimMargin=false, marginPad=0.04}={}){
  return new Promise((res,rej)=>{
    const im=new Image();
    im.onload=()=>{
      const natW=im.naturalWidth||im.width||1000, natH=im.naturalHeight||im.height||1000;
      let sx=0, sy=0, sw=natW, sh=natH, activePixelRatio=1;
      // Optional Pixel-Space Optimization: detect active non-ground bounding box so 100% of grid pixels cover artwork
      if(trimMargin && natW>64 && natH>64){
        const probeS=Math.min(1, 512/Math.max(natW,natH));
        const pw=Math.max(8,Math.round(natW*probeS)), ph=Math.max(8,Math.round(natH*probeS));
        const pc=document.createElement('canvas'); pc.width=pw; pc.height=ph;
        const px=pc.getContext('2d',{willReadFrequently:true});
        px.drawImage(im,0,0,pw,ph);
        const pd=px.getImageData(0,0,pw,ph).data;
        // Estimate border ground luminance from the 4 corners
        const cornerL=(idx)=>{ const a=pd[idx+3]/255; return (0.2126*pd[idx]+0.7152*pd[idx+1]+0.0722*pd[idx+2])*a/255+(1-a); };
        const bgL=(cornerL(0)+cornerL((pw-1)*4)+cornerL((ph-1)*pw*4)+cornerL(((ph-1)*pw+(pw-1))*4))/4;
        let x0=pw, y0=ph, x1=0, y1=0, count=0;
        for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){
          const L=cornerL((y*pw+x)*4);
          if(Math.abs(L-bgL)>0.045){
            if(x<x0)x0=x; if(x>x1)x1=x;
            if(y<y0)y0=y; if(y>y1)y1=y;
            count++;
          }
        }
        pc.width=pc.height=0;
        if(count>16 && x1>x0 && y1>y0){
          const padX=Math.round((x1-x0)*marginPad), padY=Math.round((y1-y0)*marginPad);
          const cx0=Math.max(0,x0-padX), cy0=Math.max(0,y0-padY);
          const cx1=Math.min(pw-1,x1+padX), cy1=Math.min(ph-1,y1+padY);
          const boxRatio=((cx1-cx0+1)*(cy1-cy0+1))/(pw*ph);
          if(boxRatio<0.92 && boxRatio>0.04){
            sx=Math.floor(cx0/probeS); sy=Math.floor(cy0/probeS);
            sw=Math.min(natW-sx, Math.ceil((cx1-cx0+1)/probeS));
            sh=Math.min(natH-sy, Math.ceil((cy1-cy0+1)/probeS));
            activePixelRatio=1/Math.max(0.1,boxRatio);
          }
        }
      }
      const effMax=(maxSide&&maxSide>0)?maxSide:Math.min(4096,Math.max(sw,sh));
      const s=Math.min(1, effMax/Math.max(sw,sh));
      const w=Math.max(2,Math.round(sw*s)), h=Math.max(2,Math.round(sh*s));
      // Progressive 2x halving when downsampling from huge 900-DPI scans so thin lines never alias
      let curCanvas=im, curX=sx, curY=sy, curW=sw, curH=sh;
      while(curW>w*2.1 && curH>h*2.1){
        const hw=Math.max(w,Math.round(curW*0.5)), hh=Math.max(h,Math.round(curH*0.5));
        const tc=document.createElement('canvas'); tc.width=hw; tc.height=hh;
        const tx=tc.getContext('2d'); tx.imageSmoothingEnabled=true; tx.imageSmoothingQuality='high';
        tx.drawImage(curCanvas,curX,curY,curW,curH,0,0,hw,hh);
        curCanvas=tc; curX=0; curY=0; curW=hw; curH=hh;
      }
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      const x=c.getContext('2d',{willReadFrequently:true});
      x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high';
      x.drawImage(curCanvas,curX,curY,curW,curH,0,0,w,h);
      const d=x.getImageData(0,0,w,h).data, luma=new Float32Array(w*h);
      for(let i=0;i<w*h;i++){ const a=d[i*4+3]/255;
        // alpha over white so transparent PNG drawings read as light ground
        luma[i]=(0.2126*d[i*4]+0.7152*d[i*4+1]+0.0722*d[i*4+2])*a/255 + (1-a);
      }
      const step=Math.max(1,Math.floor(w*h/4000)), rgb=[];
      for(let i=0;i<w*h;i+=step){ const a=d[i*4+3]/255;
        rgb.push([Math.round(d[i*4]*a+255*(1-a)),Math.round(d[i*4+1]*a+255*(1-a)),Math.round(d[i*4+2]*a+255*(1-a))]);
      }
      c.width=c.height=0;
      res({w,h,luma,rgb,nativeW:natW,nativeH:natH,activePixelRatio,cropBox:{x:sx,y:sy,w:sw,h:sh}});
    };
    im.onerror=()=>rej(new Error('image load failed'));
    im.src=src;
  });
}

// ── marching squares on a binary/continuous band (with Sub-Pixel Iso-Contour Interpolation) ──
// corner bits TL=8 TR=4 BR=2 BL=1; canonical integer edge keys guarantee 100% watertight loop chaining
// while linear root interpolation places vertices at exact sub-pixel luminance crossings.
const MS_TABLE={1:[['L','B']],2:[['B','R']],3:[['L','R']],4:[['T','R']],5:[['T','R'],['L','B']],
  6:[['T','B']],7:[['T','L']],8:[['T','L']],9:[['T','B']],10:[['T','L'],['B','R']],
  11:[['T','R']],12:[['L','R']],13:[['R','B']],14:[['L','B']]};

function taubinFairLoop(pts, passes=1){
  if(pts.length<8||passes<=0)return pts;
  let cur=pts;
  const step=(arr,w)=>{
    const n=arr.length, nxt=new Array(n);
    for(let i=0;i<n;i++){
      const p0=arr[(i+n-1)%n], p1=arr[i], p2=arr[(i+1)%n];
      nxt[i]=[p1[0]+w*(0.5*(p0[0]+p2[0])-p1[0]), p1[1]+w*(0.5*(p0[1]+p2[1])-p1[1])];
    }
    return nxt;
  };
  for(let p=0;p<passes;p++){
    cur=step(cur, 0.36);
    cur=step(cur, -0.375);
  }
  return cur;
}

export function traceMask(inside,w,h,valAt=null,iso=0.5,subpixel=true){
  const segs=[]; // {k0, k1, p0, p1}
  const edgeKey=(cx,cy,e)=>
    e==='T'?('H:'+cx+','+cy) :
    e==='B'?('H:'+cx+','+(cy+1)) :
    e==='L'?('V:'+cx+','+cy) :
            ('V:'+(cx+1)+','+cy);
  const interp=(v0,v1)=>{
    if(!subpixel||!valAt)return 0.5;
    const dv=v1-v0;
    if(Math.abs(dv)<1e-6)return 0.5;
    const t=(iso-v0)/dv;
    return t<0.02?0.02:(t>0.98?0.98:t);
  };
  const edgePt=(cx,cy,e)=>{
    if(!subpixel||!valAt){
      return e==='T'?[cx+0.5,cy] : e==='B'?[cx+0.5,cy+1] : e==='L'?[cx,cy+0.5] : [cx+1,cy+0.5];
    }
    if(e==='T') return [cx+interp(valAt(cx,cy),valAt(cx+1,cy)), cy];
    if(e==='B') return [cx+interp(valAt(cx,cy+1),valAt(cx+1,cy+1)), cy+1];
    if(e==='L') return [cx, cy+interp(valAt(cx,cy),valAt(cx,cy+1))];
    return [cx+1, cy+interp(valAt(cx+1,cy),valAt(cx+1,cy+1))];
  };
  for(let cy=-1;cy<h;cy++)for(let cx=-1;cx<w;cx++){
    const tl=inside(cx,cy),tr=inside(cx+1,cy),br=inside(cx+1,cy+1),bl=inside(cx,cy+1);
    const cs=tl*8+tr*4+br*2+bl;
    if(cs===0||cs===15)continue;
    for(const [a,b] of MS_TABLE[cs]){
      segs.push({k0:edgeKey(cx,cy,a), k1:edgeKey(cx,cy,b), p0:edgePt(cx,cy,a), p1:edgePt(cx,cy,b)});
    }
  }
  const adj=new Map();
  segs.forEach((s,i)=>{
    for(const k of [s.k0, s.k1]){
      if(!adj.has(k))adj.set(k,[]); adj.get(k).push(i);
    }
  });
  const used=new Uint8Array(segs.length), loops=[];
  for(let i=0;i<segs.length;i++){
    if(used[i])continue;
    used[i]=1;
    const loop=[segs[i].p0, segs[i].p1];
    const startKey=segs[i].k0;
    let tailKey=segs[i].k1;
    let guard=segs.length+4;
    while(guard-->0){
      const cands=(adj.get(tailKey)||[]).filter(j=>!used[j]);
      if(!cands.length)break;
      const j=cands[0]; used[j]=1;
      const s=segs[j];
      const forward=(s.k0===tailKey);
      const nxtPt=forward?s.p1:s.p0;
      tailKey=forward?s.k1:s.k0;
      if(tailKey===startKey) break;
      loop.push(nxtPt);
    }
    if(loop.length>=6) loops.push((subpixel&&valAt)?taubinFairLoop(loop,1):loop);
  }
  return loops;
}
function shoelace(pts){ let a=0; for(let i=0;i<pts.length;i++){ const p=pts[i],r=pts[(i+1)%pts.length]; a+=p[0]*r[1]-r[0]*p[1]; } return a/2; }
function centroid(pts){ let x=0,y=0; for(const p of pts){x+=p[0];y+=p[1];} return [x/pts.length,y/pts.length]; }

// ── simplification (Douglas-Peucker) ────────────────────────────────────
function dpSimplify(pts,eps){
  if(pts.length<5||eps<=0)return pts;
  const keep=new Uint8Array(pts.length); keep[0]=keep[pts.length-1]=1;
  const stack=[[0,pts.length-1]];
  while(stack.length){
    const [a,b]=stack.pop(); if(b-a<2)continue;
    const ax=pts[a][0],ay=pts[a][1],bx=pts[b][0],by=pts[b][1];
    const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||1e-9;
    let mi=-1,md=-1;
    for(let i=a+1;i<b;i++){
      const d=Math.abs(dy*(pts[i][0]-ax)-dx*(pts[i][1]-ay))/len;
      if(d>md){md=d;mi=i;}
    }
    if(md>eps){ keep[mi]=1; stack.push([a,mi],[mi,b]); }
  }
  const out=[]; for(let i=0;i<pts.length;i++)if(keep[i])out.push(pts[i]);
  return out;
}

// ── Fourier-descriptor resynthesis (the abstraction dial) ───────────────
// resample closed contour uniformly, truncate its DFT to H harmonics, resynthesize.
function fourierAbstract(pts,H,basis){
  const M=512;
  // uniform arc-length resample
  const L=[0]; let total=0;
  for(let i=0;i<pts.length;i++){ const p=pts[i],r=pts[(i+1)%pts.length]; total+=Math.hypot(r[0]-p[0],r[1]-p[1]); L.push(total); }
  if(total<1e-6)return pts;
  const rs=[]; let seg=0;
  for(let j=0;j<M;j++){
    const t=total*j/M;
    while(seg<pts.length-1 && L[seg+1]<t)seg++;
    const p=pts[seg%pts.length], r=pts[(seg+1)%pts.length];
    const f=(t-L[seg])/Math.max(1e-9,L[seg+1]-L[seg]);
    rs.push([p[0]+(r[0]-p[0])*f, p[1]+(r[1]-p[1])*f]);
  }
  const K=Math.max(1,Math.min(128,H|0));
  const LAD=basis==='fib'?[1,2,3,5,8,13,21,34,55,89]:basis==='phi'?[1,2,4,7,11,18,29,47,76,123]:null;
  const ks=[0];
  if(LAD)LAD.forEach(f=>{ if(f<=K)ks.push(f,-f); });
  else for(let k=1;k<=K;k++)ks.push(k,-k);
  const re={},im={};
  for(const k of ks){
    let cr=0,ci=0;
    for(let j=0;j<M;j++){
      const a=-2*Math.PI*j*k/M, c=Math.cos(a), s=Math.sin(a);
      cr+=rs[j][0]*c-rs[j][1]*s; ci+=rs[j][0]*s+rs[j][1]*c;
    }
    re[k]=cr/M; im[k]=ci/M;
  }
  {
    const inj=Math.max(0,(24-K)/24);
    if(inj>0){
      const GA=2.399963229728653, GPHI=1.6180339887;
      const m1p=Math.hypot(re[1]||0,im[1]||0), m1n=Math.hypot(re[-1]||0,im[-1]||0);
      const dom=m1p>=m1n?1:-1, A1=Math.max(m1p,m1n);
      const ph1=Math.atan2(im[dom]||0,re[dom]||0);
      const keep=1-inj*0.6;
      for(const k of ks){ if(k!==0&&k!==dom){ re[k]=(re[k]||0)*keep; im[k]=(im[k]||0)*keep; } }
      const INJ=(LAD||[2,3,4,5,6,7,8,9]).filter(f=>f!==1).slice(0,7);
      let i=1;
      for(const f of INJ){
        const fs=f*dom;
        if(!(fs in re)){ re[fs]=0; im[fs]=0; ks.push(fs); }
        const amp=inj*A1*Math.pow(GPHI,-(i*0.35+0.7)), ph=ph1+i*GA;
        re[fs]+=amp*Math.cos(ph); im[fs]+=amp*Math.sin(ph);
        i++;
      }
    }
  }
  let kmax=1; for(const k of ks)kmax=Math.max(kmax,Math.abs(k));
  const N=Math.max(128,Math.min(768,kmax*10)), out=[];
  for(let j=0;j<N;j++){
    let x=0,y=0;
    for(const k of ks){
      const a=2*Math.PI*j*k/N, c=Math.cos(a), s=Math.sin(a);
      x+=re[k]*c-im[k]*s; y+=re[k]*s+im[k]*c;
    }
    out.push([x,y]);
  }
  return out;
}

// ── Corner-Preserving Chord-Normalized Cubic Bézier Spline Fitting ──────
// Converts a closed polygon into a C¹-continuous SVG Cubic Bézier path ('C'),
// while keeping sharp geometric corners (cos θ < 0.55) razor-sharp and
// collapsing collinear segments to 'L'.
export function loopToPath(pts, bezier=true, tension=0.33){
  const n0=pts.length;
  if(n0<3)return '';
  if(!bezier)return 'M'+pts.map(p=>q(p[0])+' '+q(p[1])).join('L')+'Z';
  const P=[];
  for(let i=0;i<n0;i++){
    const a=pts[i], b=pts[(i+1)%n0];
    if(Math.hypot(b[0]-a[0],b[1]-a[1])>1e-3)P.push(a);
  }
  const n=P.length;
  if(n<3)return 'M'+pts.map(p=>q(p[0])+' '+q(p[1])).join('L')+'Z';
  const ux=new Float64Array(n), uy=new Float64Array(n), len=new Float64Array(n);
  for(let i=0;i<n;i++){
    const a=P[i], b=P[(i+1)%n], dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy)||1e-9;
    ux[i]=dx/d; uy[i]=dy/d; len[i]=d;
  }
  const tx=new Float64Array(n), ty=new Float64Array(n), corner=new Uint8Array(n);
  for(let i=0;i<n;i++){
    const im=(i+n-1)%n;
    const dot=ux[im]*ux[i]+uy[im]*uy[i];
    if(dot<0.55){ corner[i]=1; }
    else {
      const bx=ux[im]+ux[i], by=uy[im]+uy[i], bl=Math.hypot(bx,by)||1;
      tx[i]=bx/bl; ty[i]=by/bl;
    }
  }
  let out='M'+q(P[0][0])+' '+q(P[0][1]);
  for(let i=0;i<n;i++){
    const ip=(i+1)%n, a=P[i], b=P[ip], d=len[i];
    const colA=corner[i]||(Math.abs(tx[i]*uy[i]-ty[i]*ux[i])<1e-3);
    const colB=corner[ip]||(Math.abs(tx[ip]*uy[i]-ty[ip]*ux[i])<1e-3);
    if(colA&&colB){
      out+='L'+q(b[0])+' '+q(b[1]);
    } else {
      const k=d*tension;
      const c1x=corner[i]?a[0]+ux[i]*(d*0.15):a[0]+tx[i]*k;
      const c1y=corner[i]?a[1]+uy[i]*(d*0.15):a[1]+ty[i]*k;
      const c2x=corner[ip]?b[0]-ux[i]*(d*0.15):b[0]-tx[ip]*k;
      const c2y=corner[ip]?b[1]-uy[i]*(d*0.15):b[1]-ty[ip]*k;
      out+='C'+q(c1x)+' '+q(c1y)+' '+q(c2x)+' '+q(c2y)+' '+q(b[0])+' '+q(b[1]);
    }
  }
  return out+'Z';
}

// ── band extraction: luma → vector plates ───────────────────────────────
// levels bands, band r = "darker than threshold t_r"; nested masks stack light→dark.
export function extractBands(srcObj,{levels=4,invert=false,minArea=60,eps=0.55,harmonics=0,adapt=0,basis='all',subpixel=true,bezier=true}={}){
  const {w,h,luma}=srcObj;
  const bands=[];
  const L=Math.max(2,Math.min(8,levels|0));
  const areaScale=(w*h)/(1000*1000);
  const scaledMinArea=minArea*areaScale;
  const scaledEps=eps*Math.sqrt(areaScale);
  let pct=null;
  if(adapt>0){
    const n=w*h, hist=new Float64Array(256);
    for(let i=0;i<n;i++){ const v=invert?1-luma[i]:luma[i]; hist[Math.max(0,Math.min(255,v*255|0))]++; }
    let cum=0; const cdf=new Float64Array(256);
    for(let i=0;i<256;i++){ cum+=hist[i]; cdf[i]=cum/n; }
    pct=(p)=>{ let i=0; while(i<255&&cdf[i]<p)i++; return (i+0.5)/256; };
  }
  const valAt=(x,y)=>{
    if(x<0||y<0||x>=w||y>=h)return 1.0;
    return invert?(1-luma[y*w+x]):luma[y*w+x];
  };
  for(let r=0;r<L-1;r++){
    const u=(r+1)/L;   // ascending thresholds; r=0 darkest band
    const iso=pct?u*(1-adapt)+pct(u)*adapt:u;
    const inside=(x,y)=>(x<0||y<0||x>=w||y>=h)?0:(valAt(x,y)<iso?1:0);
    let loops=traceMask(inside,w,h,valAt,iso,subpixel)
      .filter(lp=>Math.abs(shoelace(lp))>=scaledMinArea)
      .map(lp=>dpSimplify(lp,scaledEps));
    if(harmonics>0) loops=loops.map(lp=>fourierAbstract(lp,harmonics,basis));
    loops=loops.filter(lp=>lp.length>=3);
    if(!loops.length)continue;
    const d=loops.map(lp=>loopToPath(lp,bezier)).join('');
    const anchors=loops.map(lp=>{ const c=centroid(lp); return {x:c[0],y:c[1],area:Math.abs(shoelace(lp))}; })
      .sort((a,b)=>b.area-a.area).slice(0,6);
    bands.push({rank:r, iso, d, loops:loops.length, pts:loops.reduce((n,l)=>n+l.length,0), anchors});
  }
  return bands; // rank 0 = darkest; DRAW in reverse rank order (light first)
}
// ── forms: like extractBands but loops kept separate, normalised about their
// centroids — motifs cut from the image itself, reusable under any armature.
export function extractForms(srcObj,{levels=4,invert=false,minArea=60,eps=0.55,harmonics=0,adapt=0,basis='all',subpixel=true}={}){
  const {w,h,luma}=srcObj;
  const L=Math.max(2,Math.min(8,levels|0));
  const areaScale=(w*h)/(1000*1000);
  const scaledMinArea=minArea*areaScale;
  const scaledEps=eps*Math.sqrt(areaScale);
  let pct=null;
  if(adapt>0){
    const n=w*h, hist=new Float64Array(256);
    for(let i=0;i<n;i++){ const v=invert?1-luma[i]:luma[i]; hist[Math.max(0,Math.min(255,v*255|0))]++; }
    let cum=0; const cdf=new Float64Array(256);
    for(let i=0;i<256;i++){ cum+=hist[i]; cdf[i]=cum/n; }
    pct=(p)=>{ let i=0; while(i<255&&cdf[i]<p)i++; return (i+0.5)/256; };
  }
  const valAt=(x,y)=>{
    if(x<0||y<0||x>=w||y>=h)return 1.0;
    return invert?(1-luma[y*w+x]):luma[y*w+x];
  };
  const out=[];
  for(let r=0;r<L-1;r++){
    const u=(r+1)/L, iso=pct?u*(1-adapt)+pct(u)*adapt:u;
    const inside=(x,y)=>(x<0||y<0||x>=w||y>=h)?0:(valAt(x,y)<iso?1:0);
    let loops=traceMask(inside,w,h,valAt,iso,subpixel)
      .filter(lp=>Math.abs(shoelace(lp))>=scaledMinArea)
      .map(lp=>dpSimplify(lp,scaledEps));
    if(harmonics>0) loops=loops.map(lp=>fourierAbstract(lp,harmonics,basis));
    loops=loops.filter(lp=>lp.length>=3);
    const forms=loops.map(lp=>{
      const c=centroid(lp), area=Math.abs(shoelace(lp)); let rad=1;
      const pts=lp.map(p=>{ const ex=p[0]-c[0], ey=p[1]-c[1]; const rr=Math.hypot(ex,ey); if(rr>rad)rad=rr; return [ex,ey]; });
      return {pts,rad,area};
    }).sort((a,b)=>b.area-a.area).slice(0,24);
    if(forms.length)out.push({rank:r, iso, forms});
  }
  return out;
}
// ── φ / Fourier re-cut of ANY band list (incl. geome constructions) ───────
// samples each subpath geometrically, truncates its DFT on the chosen frequency
// ladder, resynthesizes — the abstraction dial extended to constructed geometry.
let _samplerP=null;
function samplerPath(){
  if(_samplerP)return _samplerP;
  const NS='http://www.w3.org/2000/svg';
  const sv=document.createElementNS(NS,'svg');
  sv.setAttribute('aria-hidden','true');
  sv.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  _samplerP=document.createElementNS(NS,'path');
  sv.appendChild(_samplerP); document.body.appendChild(sv);
  return _samplerP;
}
export function fourierRecutBands(bands,{harmonics=12,basis='fib',bezier=true}={}){
  if(!(harmonics>0))return bands;
  const pe=samplerPath();
  const resynth=(d)=>{
    if(!d)return d;
    const subs=d.match(/M[^M]+/g)||[]; let out='';
    for(const sd of subs){
      let pts=null;
      try{
        pe.setAttribute('d',sd);
        const len=pe.getTotalLength();
        if(len>1e-3){ const n=96; pts=[];
          for(let i=0;i<n;i++){ const p=pe.getPointAtLength(len*i/n); pts.push([p.x,p.y]); } }
      }catch(_){ pts=null; }
      if(!pts){ out+=sd; continue; }
      const rp=fourierAbstract(pts,harmonics,basis);
      out+=loopToPath(rp,bezier);
    }
    return out;
  };
  return bands.map(b=>Object.assign({},b,{d:resynth(b.d),dnz:resynth(b.dnz)}));
}
// ── scatter: the image's own extracted forms re-set under an armature ────
// Registers = tone plates (rank kept, so palette law is untouched); each
// plate's forms cycle through the armature's points. Same band structure out.
export function scatterBands(srcObj,exOpts,{seed=1,comp='field',order=8,jitter=0.35,angleQ=45,armP=null,bezier=true}={}){
  const {w,h}=srcObj;
  const raw=extractForms(srcObj,exOpts);
  if(!raw.length)return [];
  let st=(seed>>>0)||1; const rnd=()=>((st=(st*1664525+1013904223)>>>0)/4294967296);
  const P=Object.assign({scale:1,spread:0.5,stagger:0.5,axis:0},armP||{});
  const regs=armature(comp,rnd,{G:raw.length,count:Math.max(2,order|0),
    jitter:jitter==null?0.35:jitter,angleQ:angleQ==null?45:angleQ,P});
  if(P.axis){ const t=P.axis*Math.PI/180, ct=Math.cos(t), sn=Math.sin(t);
    regs.forEach(r=>r.forEach(pl=>{ const dx=pl.x-500, dy=pl.y-500;
      pl.x=500+dx*ct-dy*sn; pl.y=500+dx*sn+dy*ct; pl.rot+=t; })); }
  const sx=w/1000, sy=h/1000, s=Math.min(sx,sy);
  const useBez=exOpts&&exOpts.bezier!=null?exOpts.bezier:bezier;
  return raw.map((band,g)=>{
    let d='',pts=0,loops=0,anchors=[];
    regs[g%regs.length].forEach((pl,j)=>{
      const F=band.forms[j%band.forms.length];
      const x0=pl.x*sx, y0=pl.y*sy, k=(pl.sz*s)/F.rad, cr=Math.cos(pl.rot), sr=Math.sin(pl.rot);
      const xpts=F.pts.map(p=>{ const ex=p[0]*k, ey=p[1]*k;
        return [x0+ex*cr-ey*sr, y0+ex*sr+ey*cr]; });
      d+=loopToPath(xpts,useBez);
      pts+=F.pts.length; loops++; anchors.push({x:x0,y:y0,area:pl.sz*pl.sz*2});
    });
    return {rank:band.rank, iso:band.iso, d, loops, pts,
      anchors:anchors.sort((a,b)=>b.area-a.area).slice(0,8)};
  }).filter(b=>b.d);
}
export function rampColor(pal,rank,levels,roll=0){
  const m=pal.ramp.length;
  const idx=(Math.round(rank*(m-1)/Math.max(1,levels-2))+roll)%m;
  return pal.ramp[(idx+m)%m];
}
// Sanzo Wada combination (geome role model) → studio palette; ramp[0] = ink (darkest role first)
export function wadaToPalette(w){
  const ramp=[w.ink]; [w.disc,w.fA,w.fB,w.accent,w.tint].forEach(c=>{ if(c&&ramp.indexOf(c)<0)ramp.push(c); });
  return {label:'Wada '+w.id.split(':')[1]+' \u00B7 '+w.label, ground:w.bg, ink:w.ink, ramp};
}
// median-cut palette extraction from an uploaded source — the eyedropper, closed into a LAWFUL palette
// (fills still route only through the ramp, so P1 palette closure holds).
export function paletteFromSource(src,count=6){
  const px=(src.rgb||[]).slice(); if(px.length<count)return null;
  const lum=c=>0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
  const boxes=[px];
  while(boxes.length<count+1){
    boxes.sort((a,b)=>b.length-a.length);
    const bx=boxes.shift(); if(bx.length<2){ boxes.push(bx); break; }
    let ch=0,best=-1;
    for(let c=0;c<3;c++){ let mn=255,mx=0; for(const p of bx){ if(p[c]<mn)mn=p[c]; if(p[c]>mx)mx=p[c]; } if(mx-mn>best){best=mx-mn;ch=c;} }
    bx.sort((p,q)=>p[ch]-q[ch]);
    boxes.push(bx.slice(0,bx.length>>1), bx.slice(bx.length>>1));
  }
  const cols=boxes.map(bx=>[0,1,2].map(c=>Math.round(bx.reduce((s,p)=>s+p[c],0)/(bx.length||1))))
    .sort((a,b)=>lum(a)-lum(b));
  const hex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');
  return {label:'From source', ground:hex(cols[cols.length-1]), ink:hex(cols[0]), ramp:cols.slice(0,cols.length-1).map(hex)};
}

// ── linead derivation (Adi Da's second working principle) ───────────────
export function deriveLinead(anchors,W,H,mode){
  if(!anchors.length||mode==='none')return [];
  const tw=anchors.reduce((n,a)=>n+a.area,0)||1;
  const C=[anchors.reduce((n,a)=>n+a.x*a.area,0)/tw, anchors.reduce((n,a)=>n+a.y*a.area,0)/tw];
  const top=anchors.slice().sort((a,b)=>b.area-a.area).slice(0,mode==='dense'?16:9)
    .filter(a=>Math.hypot(a.x-C[0],a.y-C[1])>Math.min(W,H)*0.02);
  const border=(P)=>{ // extend C→P to the plate border
    const dx=P[0]-C[0],dy=P[1]-C[1];
    let t=Infinity;
    if(dx>1e-9)t=Math.min(t,(W-C[0])/dx); if(dx<-1e-9)t=Math.min(t,(0-C[0])/dx);
    if(dy>1e-9)t=Math.min(t,(H-C[1])/dy); if(dy<-1e-9)t=Math.min(t,(0-C[1])/dy);
    return isFinite(t)?[C[0]+dx*t,C[1]+dy*t]:P;
  };
  const segs=[];
  top.forEach(a=>{ const e=border([a.x,a.y]); segs.push([C[0],C[1],e[0],e[1]]); });
  const ring=top.slice().sort((a,b)=>Math.atan2(a.y-C[1],a.x-C[0])-Math.atan2(b.y-C[1],b.x-C[0]));
  for(let i=0;i<ring.length;i++){ const a=ring[i],b=ring[(i+1)%ring.length]; segs.push([a.x,a.y,b.x,b.y]); }
  if(mode==='dense'){
    for(let i=0;i<ring.length;i++){ const a=ring[i],b=ring[(i+2)%ring.length]; segs.push([a.x,a.y,b.x,b.y]); }
    top.forEach(a=>{ const e=border([2*C[0]-a.x,2*C[1]-a.y]); segs.push([C[0],C[1],e[0],e[1]]); });
  }
  return segs;
}

// gestural lineads — freely-curving strokes referred over the geome; deterministic.
function splineD(pts){
  if(pts.length<2)return '';
  if(pts.length===2)return 'M'+q(pts[0][0])+' '+q(pts[0][1])+'L'+q(pts[1][0])+' '+q(pts[1][1]);
  const P=i=>pts[Math.max(0,Math.min(pts.length-1,i))];
  let d='M'+q(pts[0][0])+' '+q(pts[0][1]);
  for(let i=0;i<pts.length-1;i++){
    const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2);
    d+='C'+q(p1[0]+(p2[0]-p0[0])/6)+' '+q(p1[1]+(p2[1]-p0[1])/6)+' '+q(p2[0]-(p3[0]-p1[0])/6)+' '+q(p2[1]-(p3[1]-p1[1])/6)+' '+q(p2[0])+' '+q(p2[1]);
  }
  return d;
}
export function deriveGesture(anchors,W,H){
  if(!anchors.length)return [];
  const tw=anchors.reduce((n,a)=>n+a.area,0)||1;
  const C=[anchors.reduce((n,a)=>n+a.x*a.area,0)/tw, anchors.reduce((n,a)=>n+a.y*a.area,0)/tw];
  const top=anchors.slice().sort((a,b)=>b.area-a.area).slice(0,12)
    .filter(a=>Math.hypot(a.x-C[0],a.y-C[1])>Math.min(W,H)*0.03);
  if(top.length<3)return [];
  const j=(i,m)=>((Math.sin(i*127.1+m*311.7)*43758.5453)%1)*Math.min(W,H)*0.014;
  const J=(p,i)=>[p[0]+j(i,1),p[1]+j(i,2)];
  const ext=(from,dir)=>{ const n=Math.hypot(dir[0],dir[1])||1e-9, t=Math.max(W,H)*1.5/n;
    return [from[0]+dir[0]*t,from[1]+dir[1]*t]; };
  const strokes=[];
  // 1 · the circuit: angular tour of the field, ends released past the border
  const ring=top.slice().sort((a,b)=>Math.atan2(a.y-C[1],a.x-C[0])-Math.atan2(b.y-C[1],b.x-C[0])).map((a,i)=>J([a.x,a.y],i));
  const r0=ring[0],r1=ring[1],rl=ring[ring.length-1],rp=ring[ring.length-2];
  strokes.push({d:splineD([ext(r0,[r0[0]-r1[0],r0[1]-r1[1]]),...ring,ext(rl,[rl[0]-rp[0],rl[1]-rp[1]])]),w:1});
  // 2 · the traverse: sweep along the dominant diagonal
  const tr=top.slice().sort((a,b)=>(a.x+a.y)-(b.x+b.y)).map((a,i)=>J([a.x,a.y],i+40));
  const t0=tr[0],t1=tr[1],tl=tr[tr.length-1],tp=tr[tr.length-2];
  strokes.push({d:splineD([ext(t0,[t0[0]-t1[0],t0[1]-t1[1]]),...tr,ext(tl,[tl[0]-tp[0],tl[1]-tp[1]])]),w:1.5});
  // 3 · the address: border → center → largest form → border
  const big=top[0], away=[C[0]-(big.x-C[0]),C[1]-(big.y-C[1])];
  strokes.push({d:splineD([ext(away,[away[0]-C[0],away[1]-C[1]]),J(away,7),C,J([big.x,big.y],9),ext([big.x,big.y],[big.x-C[0],big.y-C[1]])]),w:0.7});
  return strokes;
}

// ── plate compositor ─────────────────────────────────────────────────────
// layers: [{bands, srcW, srcH, tx:{dx,dy,rot,scale}, opacity, mode:'fills'|'lines'|'both',
//           palRoll, pb:'off'|'cycle1'|'cycle2'|'complement', levels, lineW, bandsOff:{}, lineadContrib}]
// Palette-true overlap: where this layer's plates cross a layer behind, the intersection is
// RE-CUT as a new flat palette colour (clip the front paths by the behind silhouette).
export function buildPlate(spec){
  const {W,H,pal,ground=true,layers,linead='none',lineadW=1.6,ghost=null}=spec;
  const fit=(ly)=>{ // fit source into plate + user transform, centered
    const s=Math.min(W/ly.srcW,H/ly.srcH)*(ly.tx.scale||1);
    const cx=W/2+(ly.tx.dx||0)*W, cy=H/2+(ly.tx.dy||0)*H;
    return `translate(${q(cx)} ${q(cy)}) rotate(${q(ly.tx.rot||0)}) scale(${q(s)}) translate(${q(-ly.srcW/2)} ${q(-ly.srcH/2)})`;
  };
  let defs='', body='';
  if(ground) body+=`<rect x="0" y="0" width="${W}" height="${H}" fill="${pal.ground}"/>`;
  if(ghost&&ghost.href&&ghost.opacity>0)
    body+=`<image href="${ghost.href}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet" opacity="${ghost.opacity}"/>`;
  const vis=layers.filter(l=>l.visible!==false);
  const anchors=[];
  vis.forEach((ly,i)=>{
    const T=fit(ly);
    const cutSet=ly.bandsCut||{};
    const shown=ly.bands.filter(b=>!ly.bandsOff[b.rank]&&!cutSet[b.rank]);
    const cuts=ly.bands.filter(b=>cutSet[b.rank]&&!ly.bandsOff[b.rank]);
    if(cuts.length) defs+=`<mask id="lmask${i}"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>`+cuts.map(b=>(b.d?`<path d="${b.d}" transform="${T}" fill="#000" fill-rule="evenodd"/>`:'')+(b.dnz?`<path d="${b.dnz}" transform="${T}" fill="#000"/>`:'')).join('')+`</mask>`;
    // silhouette clip of this layer (union of all its plates) for layers above
    defs+=`<clipPath id="lsil${i}">`+shown.map(b=>(b.d?`<path d="${b.d}" transform="${T}"/>`:'')+(b.dnz?`<path d="${b.dnz}" transform="${T}"/>`:'')).join('')+`</clipPath>`;
    const lp=ly.pal||pal; // per-layer palette — null inherits the plate palette
    let g=`<g opacity="${ly.opacity==null?1:ly.opacity}"${cuts.length?` mask="url(#lmask${i})"`:''}${ly.blend&&ly.blend!=='normal'?` style="mix-blend-mode:${ly.blend}"`:''}>`;
    const draw=shown.slice().sort((a,b)=>b.rank-a.rank); // light first, dark on top
    // base plates
    const mR=lp.ramp.length;
    // golden-angle echoes — ghost copies at 137.5° about the plate centre, φ-scaled,
    // palette-rolled, drawn behind the base plates. ly.echoes=0 (default) = off.
    if(ly.echoes>0&&ly.mode!=='lines'){
      const GPHI=1.6180339887, GAE=137.50776405;
      const estr=ly.echoStrength==null?0.85:ly.echoStrength;
      for(let e=ly.echoes;e>=1;e--){
        const esc=Math.pow(GPHI,-e/3), eop=Math.max(0.1,estr*Math.pow(GPHI,-(e-1)/4));
        const ET=`translate(${q(W/2)} ${q(H/2)}) rotate(${q(e*GAE)}) scale(${q(esc)}) translate(${q(-W/2)} ${q(-H/2)}) `;
        g+=`<g opacity="${q(eop)}">`;
        draw.forEach(b=>{
          const col=rampColor(lp,b.rank,ly.levels,(ly.palRoll||0)+e);
          if(b.d)g+=`<path d="${b.d}" transform="${ET+T}" fill="${col}" fill-rule="evenodd"/>`;
          if(b.dnz)g+=`<path d="${b.dnz}" transform="${ET+T}" fill="${col}" fill-rule="nonzero"/>`;
        });
        g+='</g>';
      }
    }
    draw.forEach(b=>{
      const ovc=ly.bandColors?ly.bandColors[b.rank]:null;
      const col=ovc==null?rampColor(lp,b.rank,ly.levels,ly.palRoll||0):lp.ramp[((ovc%mR)+mR)%mR];
      if(ly.mode!=='lines'){ if(b.d)g+=`<path d="${b.d}" transform="${T}" fill="${col}" fill-rule="evenodd"/>`; if(b.dnz)g+=`<path d="${b.dnz}" transform="${T}" fill="${col}" fill-rule="nonzero"/>`; }
      if(ly.mode!=='fills'){ const fs=Math.min(W/ly.srcW,H/ly.srcH)*(ly.tx.scale||1)||1, sc=ly.lineColor||(ly.mode==='lines'?col:lp.ink), sw=(ly.lineW||2)*Math.min(W,H)/800/fs;
        if(b.d)g+=`<path d="${b.d}" transform="${T}" fill="none" stroke="${sc}" stroke-width="${q(sw)}" stroke-linejoin="round" fill-rule="evenodd"/>`;
        if(b.dnz)g+=`<path d="${b.dnz}" transform="${T}" fill="none" stroke="${sc}" stroke-width="${q(sw)}" stroke-linejoin="round"/>`; }
    });
    // palette-true overlap re-cut against up to 2 nearest layers behind
    if(ly.pb&&ly.pb!=='off'&&ly.mode!=='lines'){
      const m=lp.ramp.length;
      const behind=vis.slice(0,i).slice(-2);
      behind.forEach((bl,bi)=>{
        const j=vis.indexOf(bl);
        const shift=ly.pb==='complement'?Math.max(1,Math.floor(m/2)):(ly.pb==='cycle2'?2:1)+bi;
        draw.forEach(b=>{
          const ovc=ly.bandColors?ly.bandColors[b.rank]:null;
          const baseIdx=ovc==null?(Math.round(b.rank*(m-1)/Math.max(1,ly.levels-2))+(ly.palRoll||0))%m:ovc;
          const col=lp.ramp[((baseIdx+shift)%m+m)%m];
          if(b.d)g+=`<path d="${b.d}" transform="${T}" fill="${col}" fill-rule="evenodd" clip-path="url(#lsil${j})"/>`;
          if(b.dnz)g+=`<path d="${b.dnz}" transform="${T}" fill="${col}" fill-rule="nonzero" clip-path="url(#lsil${j})"/>`;
        });
      });
    }
    g+='</g>';
    body+=g;
    // anchors for the linead web, mapped through the layer transform
    if(ly.lineadContrib!==false){
      const s=Math.min(W/ly.srcW,H/ly.srcH)*(ly.tx.scale||1);
      const rot=(ly.tx.rot||0)*Math.PI/180, cr=Math.cos(rot), sr=Math.sin(rot);
      const cx=W/2+(ly.tx.dx||0)*W, cy=H/2+(ly.tx.dy||0)*H;
      shown.forEach(b=>b.anchors.forEach(a=>{
        const x0=(a.x-ly.srcW/2)*s, y0=(a.y-ly.srcH/2)*s;
        anchors.push({x:cx+x0*cr-y0*sr, y:cy+x0*sr+y0*cr, area:a.area*s*s});
      }));
    }
  });
  if(linead==='gesture'){
    // per-stroke halo+ink pairs: later strokes knock out earlier ones at crossings — hand-layered
    deriveGesture(anchors,W,H).forEach(st=>{
      body+=`<path d="${st.d}" fill="none" stroke="${pal.ground}" stroke-width="${q(lineadW*3.4*st.w)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;
      body+=`<path d="${st.d}" fill="none" stroke="${pal.ink}" stroke-width="${q(lineadW*st.w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
  } else if(linead!=='none'){
    const segs=deriveLinead(anchors,W,H,linead);
    if(segs.length){
      const d=segs.map(s=>`M${q(s[0])} ${q(s[1])}L${q(s[2])} ${q(s[3])}`).join('');
      body+=`<path d="${d}" fill="none" stroke="${pal.ground}" stroke-width="${lineadW*3.2}" stroke-linecap="round" opacity="0.85"/>`;
      body+=`<path d="${d}" fill="none" stroke="${pal.ink}" stroke-width="${lineadW}" stroke-linecap="round"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`;
}

// ── 900-DPI print export (ported v2 contract) ───────────────────────────
function crc32(b){ let c,t=crc32.t;
  if(!t){ t=crc32.t=[]; for(let n=0;n<256;n++){ c=n; for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1; t[n]=c>>>0; } }
  c=0xffffffff; for(let i=0;i<b.length;i++)c=t[(c^b[i])&255]^(c>>>8); return (c^0xffffffff)>>>0;
}
export function pngWithDPI(buf,dpi){
  const u=new Uint8Array(buf), ppm=Math.round(dpi/0.0254);
  const ch=new Uint8Array(21), dv=new DataView(ch.buffer);
  dv.setUint32(0,9); ch.set([0x70,0x48,0x59,0x73],4); dv.setUint32(8,ppm); dv.setUint32(12,ppm); ch[16]=1;
  dv.setUint32(17,crc32(ch.subarray(4,17)));
  const parts=[u.subarray(0,8)]; let p=8, done=false;
  while(p+8<=u.length){
    const len=new DataView(u.buffer,u.byteOffset+p,4).getUint32(0);
    const type=String.fromCharCode(u[p+4],u[p+5],u[p+6],u[p+7]);
    const nxt=p+12+len;
    if(type==='pHYs'){ p=nxt; continue; }
    if(!done&&(type==='IDAT'||type==='IEND')){ parts.push(ch); done=true; }
    parts.push(u.subarray(p,nxt)); p=nxt;
  }
  const size=parts.reduce((n,a)=>n+a.length,0), out=new Uint8Array(size);
  let o=0; parts.forEach(a=>{ out.set(a,o); o+=a.length; });
  return out;
}
function loadSVG(svg){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
    const img=new Image();
    img.onload=()=>res({img,url});
    img.onerror=()=>{ URL.revokeObjectURL(url); rej(new Error('svg rasterise failed')); };
    img.src=url;
  });
}
function pngChunk(type, data){
  const L=data.length, out=new Uint8Array(12+L), dv=new DataView(out.buffer);
  dv.setUint32(0,L);
  for(let i=0;i<4;i++) out[4+i]=type.charCodeAt(i);
  out.set(data,8);
  dv.setUint32(8+L, crc32(out.subarray(4,8+L)));
  return out;
}

// Streaming strip-by-strip PNG encoder using CompressionStream('deflate').
// Never allocates more than one tw x 256 strip canvas, bypassing the 256 MP browser canvas cap.
export async function renderPrintPNGStream(svgStr,W,H,longPx,dpi,onProgress){
  if(typeof CompressionStream==='undefined') return renderPrintPNG(svgStr,W,H,longPx,dpi,onProgress);
  const m=svgStr.match(/^[\s\S]*?<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/);
  const bodyStr=m?m[1]:svgStr;
  const s=longPx/Math.max(W,H);
  const tw=Math.max(1,Math.round(W*s)), th=Math.max(1,Math.round(H*s));
  const STRIP=256, rows=Math.ceil(th/STRIP);
  const canvas=document.createElement('canvas'); canvas.width=tw;
  const ctx=canvas.getContext('2d',{alpha:true,willReadFrequently:true});
  const cs=new CompressionStream('deflate');
  const writer=cs.writable.getWriter();
  const reader=cs.readable.getReader();
  const zChunks=[];
  const pump=(async()=>{ while(true){ const {value,done}=await reader.read(); if(done)break; if(value)zChunks.push(value); } })();

  for(let r=0;r<rows;r++){
    const y0=r*STRIP, sh=Math.min(STRIP,th-y0);
    if(canvas.height!==sh) canvas.height=sh;
    ctx.clearRect(0,0,tw,sh);
    const tile=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${tw}" height="${sh}" viewBox="0 ${y0} ${tw} ${sh}"><g transform="scale(${s})">${bodyStr}</g></svg>`;
    const {img,url}=await loadSVG(tile);
    ctx.drawImage(img,0,0,tw,sh);
    URL.revokeObjectURL(url);
    const rgba=ctx.getImageData(0,0,tw,sh).data;
    const rowLen=tw*4+1, raw=new Uint8Array(sh*rowLen);
    for(let y=0;y<sh;y++){
      const ro=y*rowLen, so=y*tw*4;
      raw[ro]=y===0?0:2; // Up filter within strip
      if(y===0){
        raw.set(rgba.subarray(so,so+tw*4),ro+1);
      } else {
        const po=(y-1)*tw*4;
        for(let i=0;i<tw*4;i++) raw[ro+1+i]=(rgba[so+i]-rgba[po+i])&255;
      }
    }
    await writer.write(raw);
    if(onProgress) onProgress(r+1,rows);
    await new Promise(z=>setTimeout(z,0));
  }
  await writer.close();
  await pump;
  canvas.width=canvas.height=0;

  const sig=new Uint8Array([137,80,78,71,13,10,26,10]);
  const ihdr=new Uint8Array(13), idv=new DataView(ihdr.buffer);
  idv.setUint32(0,tw); idv.setUint32(4,th); ihdr[8]=8; ihdr[9]=6;
  const ppm=Math.round(dpi/0.0254), phys=new Uint8Array(9), pdv=new DataView(phys.buffer);
  pdv.setUint32(0,ppm); pdv.setUint32(4,ppm); phys[8]=1;
  const parts=[sig, pngChunk('IHDR',ihdr), pngChunk('pHYs',phys)];
  for(const zc of zChunks) parts.push(pngChunk('IDAT',zc));
  parts.push(pngChunk('IEND',new Uint8Array(0)));
  return new Blob(parts,{type:'image/png'});
}

// Legacy tiled fallback for environments without CompressionStream
export async function renderPrintPNG(svgStr,W,H,longPx,dpi,onProgress){
  if(typeof CompressionStream!=='undefined') return renderPrintPNGStream(svgStr,W,H,longPx,dpi,onProgress);
  const m=svgStr.match(/^[\s\S]*?<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/);
  const bodyStr=m?m[1]:svgStr;
  const s=longPx/Math.max(W,H);
  const tw=Math.round(W*s), th=Math.round(H*s), TL=2048;
  const cols=Math.ceil(tw/TL), rows=Math.ceil(th/TL), total=cols*rows;
  const canvas=document.createElement('canvas'); canvas.width=tw; canvas.height=th;
  const ctx=canvas.getContext('2d',{alpha:true}); ctx.imageSmoothingEnabled=false;
  let n=0;
  for(let r=0;r<rows;r++){
    const y0=Math.round(th*r/rows), y1=Math.round(th*(r+1)/rows);
    for(let c=0;c<cols;c++){
      const x0=Math.round(tw*c/cols), x1=Math.round(tw*(c+1)/cols);
      const tile=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${x1-x0}" height="${y1-y0}" viewBox="${x0} ${y0} ${x1-x0} ${y1-y0}"><g transform="scale(${s})">${bodyStr}</g></svg>`;
      const {img,url}=await loadSVG(tile);
      ctx.drawImage(img,x0,y0,x1-x0,y1-y0);
      URL.revokeObjectURL(url);
      if(onProgress)onProgress(++n,total);
      await new Promise(z=>setTimeout(z,0));
    }
  }
  const blob=await new Promise(res=>canvas.toBlob(res,'image/png'));
  const ab=await blob.arrayBuffer();
  canvas.width=canvas.height=0;
  return new Blob([pngWithDPI(ab,dpi)],{type:'image/png'});
}

// ── Session & Source Optimization (>100 MB prevention) ──────────────────
export function fastHash(str){
  let h1=0xdeadbeef^str.length, h2=0x41c6ce57^str.length;
  const step=str.length>65536?Math.floor(str.length/32768):1;
  for(let i=0;i<str.length;i+=step){
    const ch=str.charCodeAt(i);
    h1=Math.imul(h1^ch,2654435761);
    h2=Math.imul(h2^ch,1597334677);
  }
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
  h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return 'h'+(4294967296*(2097151&h2)+(h1>>>0)).toString(36);
}

// Downsamples giant >50 MB 900-DPI uploads to a clean 1400px working master so
// .linead.json sessions stay < 1.5 MB while producing 100% identical 1000px luma grids.
export async function compressSourceDataURL(dataURL, maxLongEdge=1400){
  if(!dataURL || typeof dataURL!=='string') return dataURL;
  if(dataURL.length < 350000) return dataURL;
  return new Promise((resolve)=>{
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1, maxLongEdge/Math.max(img.width||1, img.height||1));
      const w=Math.max(1,Math.round(img.width*scale)), h=Math.max(1,Math.round(img.height*scale));
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      const x=c.getContext('2d'); x.drawImage(img,0,0,w,h);
      let out=c.toDataURL('image/webp',0.90);
      if(!out || out.indexOf('data:image/webp')!==0) out=c.toDataURL('image/jpeg',0.90);
      c.width=c.height=0;
      resolve(out.length<dataURL.length?out:dataURL);
    };
    img.onerror=()=>resolve(dataURL);
    img.src=dataURL;
  });
}

// Deduplicates identical sources in a session and remaps layer.src indices
export function dedupeSessionSources(sources, layers){
  if(!Array.isArray(sources)||!Array.isArray(layers)) return {sources:sources||[], layers:layers||[]};
  const unique=[], hashToIdx={}, oldToNew={};
  sources.forEach((src,oldIdx)=>{
    const h=fastHash(src&&src.href||'');
    if(hashToIdx[h]==null){
      hashToIdx[h]=unique.length;
      unique.push(src);
    }
    oldToNew[oldIdx]=hashToIdx[h];
  });
  const newLayers=layers.map(ly=>Object.assign({},ly,{src:oldToNew[ly.src]!=null?oldToNew[ly.src]:0}));
  return {sources:unique, layers:newLayers};
}


// ── demo drawing (so the pipeline shows before any upload) ──────────────
export function demoDrawing(){
  const c=document.createElement('canvas'); c.width=900; c.height=1120;
  const x=c.getContext('2d');
  x.fillStyle='#f2ecdd'; x.fillRect(0,0,900,1120);
  x.strokeStyle='#181512'; x.fillStyle='#181512'; x.lineCap='round';
  x.lineWidth=26; x.beginPath(); x.arc(450,430,270,0,Math.PI*2); x.stroke();
  x.beginPath(); x.arc(450,430,120,0,Math.PI*2); x.fill();
  x.lineWidth=20;
  x.beginPath(); x.moveTo(160,940); x.lineTo(450,700); x.lineTo(740,940); x.closePath(); x.stroke();
  x.beginPath(); x.moveTo(450,700); x.lineTo(450,980); x.stroke();
  x.fillStyle='#5a544a';
  x.beginPath(); x.arc(180,180,64,0,Math.PI*2); x.fill();
  x.beginPath(); x.arc(720,180,64,0,Math.PI*2); x.fill();
  x.fillStyle='#a89f8d';
  x.beginPath(); x.arc(450,430,200,Math.PI*0.15,Math.PI*0.85); x.lineTo(450,430); x.closePath(); x.fill();
  x.strokeStyle='#39332b'; x.lineWidth=12;
  for(let i=0;i<5;i++){ x.beginPath(); x.moveTo(120+i*30,1040); x.lineTo(780-i*30,1040+i*14); x.stroke(); }
  return c.toDataURL('image/png');
}

// ── seeded geometric construction — the generator side of the suite ──────
// A subunit vocabulary (annulus, disc, petal, bar, diamond) replicated across a
// dihedral ring system; returns the SAME band structure as extractBands, so a
// construction composes with image layers: overlap re-cut, stencil cuts, lineads.
function polyD(pts){ return 'M'+pts.map(p=>q(p[0])+' '+q(p[1])).join('L')+'Z'; }
function circleD(cx,cy,r){ r=Math.max(0.5,r); return `M${q(cx-r)} ${q(cy)}a${q(r)} ${q(r)} 0 1 0 ${q(2*r)} 0a${q(r)} ${q(r)} 0 1 0 ${q(-2*r)} 0Z`; }
function arcBandD(cx,cy,r0,r1,a0,a1){
  const pts=[], n=10;
  for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; pts.push([cx+r1*Math.cos(a),cy+r1*Math.sin(a)]); }
  for(let i=n;i>=0;i--){ const a=a0+(a1-a0)*i/n; pts.push([cx+r0*Math.cos(a),cy+r0*Math.sin(a)]); }
  return polyD(pts);
}
// Custom (user-forged) subunit kinds — parametric defs registered by the studio.
// def: {key:'c:…', name, form:'poly'|'star'|'ellipse'|'arc', sides, size, inner, aspect, rot, span}
export let CUSTOM_KINDS=[];
let CUSTOM_MAP={};
export function setCustomKinds(list){
  CUSTOM_KINDS=Array.isArray(list)?list.slice():[];
  CUSTOM_MAP={}; CUSTOM_KINDS.forEach(c=>{ if(c&&c.key)CUSTOM_MAP[c.key]=c; });
}
export function allKinds(){
  return SUBUNIT_KINDS.concat(CUSTOM_KINDS.map(c=>({key:c.key,name:c.name,orphic:c.orphic||'forged piece \u2014 your own hand',custom:true})));
}
function customRing(cd,{cx,cy,rad,N,phase,sz,w}){
  const P=(r,a)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
  const S=Math.max(0.5,sz*(cd.size==null?1:cd.size)), rotO=(cd.rot||0)*Math.PI/180;
  const n=Math.max(3,(cd.sides|0)||5), inner=cd.inner==null?0.5:cd.inner;
  const aspect=cd.aspect==null?1:cd.aspect, span=cd.span==null?2:cd.span;
  let d='',pts=0,loops=0,anchors=[];
  for(let k=0;k<N;k++){
    const a=phase+k*2*Math.PI/N, pc=P(rad,a); let e,p;
    if(cd.form==='arc'){ e=arcBandD(cx,cy,Math.max(1,rad-S*0.5),rad+S*0.5,a-w*span,a+w*span); p=22; }
    else if(cd.form==='star'){ const v=[]; for(let j=0;j<n*2;j++){ const t=a+rotO+j*Math.PI/n, r=(j%2===0)?S:S*inner; v.push([pc[0]+r*Math.cos(t),pc[1]+r*Math.sin(t)]); } e=polyD(v); p=n*2; }
    else if(cd.form==='ellipse'){ const v=[],M=24,cr=Math.cos(a+rotO),sr=Math.sin(a+rotO);
      for(let j=0;j<M;j++){ const t=j*2*Math.PI/M, ex=S*Math.cos(t), ey=S*aspect*Math.sin(t);
        v.push([pc[0]+ex*cr-ey*sr, pc[1]+ex*sr+ey*cr]); } e=polyD(v); p=M; }
    else { const v=[]; for(let j=0;j<n;j++){ const t=a+rotO+j*2*Math.PI/n; v.push([pc[0]+S*Math.cos(t),pc[1]+S*Math.sin(t)]); } e=polyD(v); p=n; }
    d+=e; pts+=p; loops++; anchors.push({x:pc[0],y:pc[1],area:S*S*2});
  }
  return {d,pts,loops,anchors};
}
// The subunit vocabulary — each technical piece carries its orphic name.
export const SUBUNIT_KINDS=[
  {key:'annulus', name:'Ring',     orphic:'the Boundary of the Self'},
  {key:'disc',    name:'Disc',     orphic:'the Point of Origin'},
  {key:'petal',   name:'Petal',    orphic:'the Anima — opening outward'},
  {key:'bar',     name:'Bar',      orphic:'the Threshold'},
  {key:'diamond', name:'Diamond',  orphic:'the Shadow — light turned'},
  {key:'spoke',   name:'Spoke',    orphic:'the Linead seed — radial address'},
  {key:'crescent',name:'Crescent', orphic:'Luna — the receptive arc'},
  {key:'triangle',name:'Triangle', orphic:'primary geometry — the ascending'},
  {key:'square',  name:'Square',   orphic:'primary geometry — the ground'}
];
// Symbol presets: an archetype IS a recipe — an ordered subunit sequence + a symmetry order.
export const SYMBOLS=[
  {key:'self',     group:'Jungian', name:'The Self',          meaning:'Wholeness — the mandala that contains all opposites.',        recipe:['annulus','disc','petal','annulus'], order:8},
  {key:'shadow',   group:'Jungian', name:'The Shadow',        meaning:'What the light refuses — form turned against itself.',        recipe:['diamond','bar','diamond'],          order:6},
  {key:'anima',    group:'Jungian', name:'Anima / Animus',    meaning:'The inner other — opening and answering.',                    recipe:['petal','crescent','petal','disc'],  order:10},
  {key:'mother',   group:'Jungian', name:'The Great Mother',  meaning:'Containment and increase — arc within arc.',                  recipe:['crescent','annulus','petal'],       order:9},
  {key:'wise',     group:'Jungian', name:'The Wise Old Man',  meaning:'Order that speaks — spokes address the rim.',                 recipe:['spoke','annulus','disc'],           order:12},
  {key:'trickster',group:'Jungian', name:'The Trickster',     meaning:'Symmetry kept, expectation broken.',                          recipe:['bar','diamond','spoke'],            order:5},
  {key:'hero',     group:'Jungian', name:'The Hero',          meaning:'The crossing — four gates, one axis.',                        recipe:['spoke','petal','disc'],             order:4},
  {key:'sol',      group:'Hermetic',name:'Sol — the Sun',     meaning:'Radiance from a singular center.',                            recipe:['disc','spoke','annulus'],           order:12},
  {key:'luna',     group:'Hermetic',name:'Luna — the Moon',   meaning:'Reflection — the receptive crescent field.',                  recipe:['crescent','disc','crescent'],       order:8},
  {key:'mercurius',group:'Hermetic',name:'Mercurius',         meaning:'The messenger between plates — quick diagonals.',             recipe:['diamond','spoke','petal'],          order:6},
  {key:'quinta',   group:'Hermetic',name:'Quintessence',      meaning:'The fifth — all vocabularies bound in one ring.',             recipe:['annulus','petal','bar','diamond','disc'], order:10}
];
// one ring of a given piece kind, replicated across the dihedral order
function ringOf(kind,{cx,cy,rad,N,phase,sz,w,t}){
  const cd=(kind&&typeof kind==='object')?kind:CUSTOM_MAP[kind];
  if(cd) return customRing(cd,{cx,cy,rad,N,phase,sz,w});
  const P=(r,a)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
  if(kind==='annulus')
    return {d:circleD(cx,cy,rad)+circleD(cx,cy,Math.max(2,rad-t)), pts:48, loops:2,
      anchors:[{x:cx,y:cy,area:Math.PI*(rad*rad-(rad-t)*(rad-t))}]};
  let d='',pts=0,loops=0,anchors=[];
  for(let k=0;k<N;k++){
    const a=phase+k*2*Math.PI/N, pc=P(rad,a); let e,p=4;
    if(kind==='disc'){ e=circleD(pc[0],pc[1],sz*0.75); p=24; }
    else if(kind==='petal') e=polyD([P(rad-sz,a),P(rad+sz,a+w),P(rad+sz,a-w)]);
    else if(kind==='bar') e=polyD([P(rad-sz*0.6,a-w),P(rad-sz*0.6,a+w),P(rad+sz*0.6,a+w),P(rad+sz*0.6,a-w)]);
    else if(kind==='spoke') e=polyD([P(rad-sz*1.6,a-w*0.22),P(rad-sz*1.6,a+w*0.22),P(rad+sz*1.6,a+w*0.22),P(rad+sz*1.6,a-w*0.22)]);
    else if(kind==='crescent'){ e=arcBandD(cx,cy,rad-sz*0.45,rad+sz*0.45,a-w*2.2,a+w*2.2); p=22; }
    else if(kind==='triangle'){ e=polyD([0,2.0944,4.1888].map(t=>[pc[0]+sz*0.95*Math.cos(a+t),pc[1]+sz*0.95*Math.sin(a+t)])); p=3; }
    else if(kind==='square'){ e=polyD([0.7854,2.3562,3.927,5.4978].map(t=>[pc[0]+sz*0.8*Math.cos(a+t),pc[1]+sz*0.8*Math.sin(a+t)])); p=4; }
    else e=polyD([P(rad-sz,a),P(rad,a+w),P(rad+sz,a),P(rad,a-w)]); // diamond
    d+=e; pts+=p; loops++; anchors.push({x:pc[0],y:pc[1],area:sz*sz*2});
  }
  return {d,pts,loops,anchors};
}
export function subunitThumb(kind, ink='#d8d2c4'){
  const R=ringOf(kind,{cx:50,cy:50,rad:30,N:6,phase:-Math.PI/2,sz:11,w:0.35,t:9});
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto"><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.08)"/><path d="${R.d}" fill="${ink}" fill-rule="evenodd"/></svg>`;
}
// a single subunit ring at full working size, transparent ground — for piece export
export function subunitSVG(kind,{order=8, ink='#141210'}={}){
  const N=Math.max(3,order|0);
  const R=ringOf(kind,{cx:500,cy:500,rad:320,N,phase:-Math.PI/2,sz:110,w:2.1/N,t:85});
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><path d="${R.d}" fill="${ink}" fill-rule="evenodd"/></svg>`;
}
// ── single motif at an arbitrary point — the non-radial atom ────────────
function pieceD(kind,x,y,sz,rot){
  const cd=(kind&&typeof kind==='object')?kind:CUSTOM_MAP[kind];
  if(cd){
    const S=Math.max(0.5,sz*(cd.size==null?1:cd.size)), rotO=rot+(cd.rot||0)*Math.PI/180;
    const n=Math.max(3,(cd.sides|0)||5), inner=cd.inner==null?0.5:cd.inner;
    const aspect=cd.aspect==null?1:cd.aspect, span=cd.span==null?2:cd.span;
    if(cd.form==='arc')return {d:arcBandD(x,y,S*0.55,S,rotO-span*0.35,rotO+span*0.35),pts:22,loops:1};
    if(cd.form==='star'){ const v=[]; for(let j=0;j<n*2;j++){ const t=rotO+j*Math.PI/n, r=(j%2===0)?S:S*inner; v.push([x+r*Math.cos(t),y+r*Math.sin(t)]); } return {d:polyD(v),pts:n*2,loops:1}; }
    if(cd.form==='ellipse'){ const v=[],M=24,cr=Math.cos(rotO),sr=Math.sin(rotO);
      for(let j=0;j<M;j++){ const t=j*2*Math.PI/M, ex=S*Math.cos(t), ey=S*aspect*Math.sin(t); v.push([x+ex*cr-ey*sr,y+ex*sr+ey*cr]); } return {d:polyD(v),pts:M,loops:1}; }
    const v=[]; for(let j=0;j<n;j++){ const t=rotO+j*2*Math.PI/n; v.push([x+S*Math.cos(t),y+S*Math.sin(t)]); } return {d:polyD(v),pts:n,loops:1};
  }
  const px=Math.cos(rot),py=Math.sin(rot),qx=-py,qy=px;
  if(kind==='annulus')return {d:circleD(x,y,sz)+circleD(x,y,Math.max(1,sz*0.62)),pts:48,loops:2};
  if(kind==='disc')return {d:circleD(x,y,sz*0.8),pts:24,loops:1};
  if(kind==='petal')return {d:polyD([[x+sz*px,y+sz*py],[x-sz*px+sz*0.5*qx,y-sz*py+sz*0.5*qy],[x-sz*px-sz*0.5*qx,y-sz*py-sz*0.5*qy]]),pts:3,loops:1};
  if(kind==='bar'||kind==='spoke'){ const L=kind==='spoke'?sz*1.7:sz, Wd=kind==='spoke'?sz*0.16:sz*0.45;
    return {d:polyD([[x+L*px+Wd*qx,y+L*py+Wd*qy],[x+L*px-Wd*qx,y+L*py-Wd*qy],[x-L*px-Wd*qx,y-L*py-Wd*qy],[x-L*px+Wd*qx,y-L*py+Wd*qy]]),pts:4,loops:1}; }
  if(kind==='crescent')return {d:arcBandD(x,y,sz*0.6,sz,rot-1.15,rot+1.15),pts:22,loops:1};
  if(kind==='triangle')return {d:polyD([0,2.0944,4.1888].map(t=>[x+sz*Math.cos(rot+t),y+sz*Math.sin(rot+t)])),pts:3,loops:1};
  if(kind==='square')return {d:polyD([0.7854,2.3562,3.927,5.4978].map(t=>[x+sz*Math.cos(rot+t),y+sz*Math.sin(rot+t)])),pts:4,loops:1};
  return {d:polyD([[x+sz*px,y+sz*py],[x+sz*0.55*qx,y+sz*0.55*qy],[x-sz*px,y-sz*py],[x-sz*0.55*qx,y-sz*0.55*qy]]),pts:4,loops:1};
}
// ── armatures — placement laws beyond the dihedral ring ─────────────────
// Each returns G registers of placements {x,y,sz,rot} in the 1000×1000 space.
// Coherence without symmetry: low-discrepancy (R2) coverage, a shared
// quantised angle family, and a size hierarchy across registers.
function armature(comp,rnd,{G,count,jitter,angleQ,P}){
  const W=1000,H=1000;
  const qa=(t)=>{ if(!angleQ)return t; const st=Math.PI*angleQ/180; return Math.round(t/st)*st; };
  const J=(m)=>(rnd()*2-1)*m*jitter;
  const regs=Array.from({length:G},()=>[]);
  if(comp==='radial'){ // reachable from scatter — geome radial keeps its own classic path
    for(let g=0;g<G;g++){
      const rad=470*Math.pow((g+0.85)/G,1+(0.5-P.spread)*1.4)*0.94, step=470/G;
      const ph=(rnd()<0.5?0:Math.PI/count)+(g%2)*(P.stagger-0.5)*2*Math.PI/count;
      const sz=step*(0.30+rnd()*0.25)*P.scale;
      for(let k=0;k<count;k++){ const t=ph+k*2*Math.PI/count, rr=rad+J(step*0.5);
        regs[g].push({x:500+rr*Math.cos(t), y:500+rr*Math.sin(t), sz:sz*(0.85+rnd()*0.3), rot:t+Math.PI/2}); }
    }
  } else if(comp==='strata'){
    for(let g=0;g<G;g++){
      const y0=H*(g+0.5)/G, stepX=W/count, ph=rnd()*stepX+(g%2)*(P.stagger-0.5)*stepX;
      const sz=Math.min(H/(G*2.1),stepX*0.44)*(0.5+P.spread)*P.scale;
      for(let i=0;i<count;i++)
        regs[g].push({x:(ph+i*stepX+J(stepX*0.4)+W)%W, y:y0+J(H/(G*2.6)), sz:sz*(0.75+rnd()*0.55), rot:qa(rnd()*Math.PI*2)});
    }
  } else if(comp==='grid'){
    const sx=W/count, sy=H/G;
    for(let g=0;g<G;g++)for(let c=0;c<count;c++){
      const drop=rnd()<0.12;
      const p={x:sx*(c+0.5)+(g%2)*(P.stagger-0.5)*sx+J(sx*0.32), y:sy*(g+0.5)+J(sy*0.32),
        sz:Math.min(sx,sy)*0.38*(0.5+P.spread)*P.scale*(0.78+rnd()*0.5), rot:qa(rnd()*Math.PI*2)};
      if(!drop)regs[g].push(p);
    }
  } else if(comp==='cascade'){
    for(let g=0;g<G;g++){
      const x0=W*(0.06+rnd()*0.55), y0=H*(0.02+rnd()*0.25);
      const ang=qa(Math.PI*(0.18+rnd()*0.5)), len=1100*(0.6+rnd()*0.35)*(0.5+P.spread), k=(0.74+rnd()*0.55)*(0.7+P.stagger*0.6);
      let sz=Math.min(W,H)*(0.16/(1+g*0.35))*(0.8+rnd()*0.4)*P.scale;
      for(let i=0;i<count;i++){
        const t=count>1?i/(count-1):0;
        regs[g].push({x:x0+Math.cos(ang)*len*t+J(40), y:y0+Math.sin(ang)*len*t+J(40), sz:Math.max(8,sz), rot:qa(ang+(rnd()<0.5?0:Math.PI/2))});
        sz*=k;
      }
    }
  } else { // field + mirror — R2 constellation, few-large → many-small hierarchy
    const half=comp==='mirror';
    const ox=rnd(), oy=rnd(); let idx=0;
    for(let g=0;g<G;g++){
      const n=Math.max(1,Math.round(count*(g*0.5+0.6)/2));
      const base=Math.min(W,H)*(0.26/Math.pow(g+1,0.4+P.stagger*1.2)+0.045)*P.scale;
      const hw=0.43*(0.3+1.4*P.spread);
      for(let i=0;i<n;i++){
        const u=(ox+(++idx)*0.7548776662466927)%1, v=(oy+idx*0.5698402909980532)%1;
        const x=(half?(0.5-hw*1.02+hw*u):(0.5-hw+2*hw*u))*W+J(30), y=(0.5-hw+2*hw*v)*H+J(30);
        const sz=base*(0.72+rnd()*0.6), rot=qa(rnd()*Math.PI*2);
        regs[g].push({x,y,sz,rot});
        if(half)regs[g].push({x:W-x,y,sz,rot:Math.PI-rot});
      }
    }
  }
  return regs;
}
// non-radial construction — same band structure as the dihedral path, so every
// downstream law (palette ramp, pins, overlap re-cut, stencils, lineads) composes.
function compBands(seed,{comp,order,rings,levels,recipe,ringRanks,ringOver,jitter,angleQ,armP}){
  let st=(seed>>>0)||1; const rnd=()=>((st=(st*1664525+1013904223)>>>0)/4294967296);
  const NR=Math.max(1,Math.min(7,(levels|0)-1));
  const acc=Array.from({length:NR},()=>({d:'',dnz:'',anchors:[],pts:0,loops:0}));
  const KINDS=SUBUNIT_KINDS.map(k=>k.key);
  const P=Object.assign({scale:1,spread:0.5,stagger:0.5,axis:0},armP||{});
  const regs=armature(comp,rnd,{G:rings,count:order,jitter,angleQ,P});
  if(P.axis){ // rotate the whole field about the plate centre — vertical strata, diagonal grids, tilted mirror axis
    const t=P.axis*Math.PI/180, ct=Math.cos(t), sn=Math.sin(t);
    regs.forEach(r=>r.forEach(pl=>{ const dx=pl.x-500, dy=pl.y-500;
      pl.x=500+dx*ct-dy*sn; pl.y=500+dx*sn+dy*ct; pl.rot+=t; }));
  }
  for(let g=0;g<rings;g++){
    const kind=(recipe&&recipe.length)?recipe[g%recipe.length]:KINDS[Math.floor(rnd()*KINDS.length)];
    const rr=Math.floor(rnd()*NR); // consume rnd so pins never reshuffle the seed
    const rank=(ringRanks&&ringRanks[g]!=null)?Math.max(0,Math.min(NR-1,ringRanks[g]|0)):rr;
    const A=acc[rank];
    regs[g].forEach(pl=>{
      const P=pieceD(kind,pl.x,pl.y,pl.sz,pl.rot);
      if(ringOver&&ringOver[g]==='merge')A.dnz+=P.d; else A.d+=P.d;
      A.pts+=P.pts; A.loops+=P.loops; A.anchors.push({x:pl.x,y:pl.y,area:pl.sz*pl.sz*2});
    });
  }
  return acc.map((A,i)=>({rank:i, iso:(i+1)/NR, d:A.d, dnz:A.dnz, loops:A.loops, pts:A.pts,
    anchors:A.anchors.sort((x,y)=>y.area-x.area).slice(0,8)})).filter(b=>b.d||b.dnz);
}
export function geomeBands(seed,{order=8,rings=5,levels=4,recipe=null,ringRanks=null,ringOver=null,comp='radial',jitter=0.35,angleQ=45,armP=null}={}){
  if(comp&&comp!=='radial')return compBands(seed,{comp,order:Math.max(2,order|0),rings:Math.max(1,rings|0),levels,recipe,ringRanks,ringOver,jitter:jitter==null?0.35:jitter,angleQ:angleQ==null?45:angleQ,armP});
  const AP=Object.assign({scale:1,spread:0.5,stagger:0.5,axis:0},armP||{});
  const cx=500,cy=500,Rmax=470;
  let st=(seed>>>0)||1; const rnd=()=>((st=(st*1664525+1013904223)>>>0)/4294967296);
  const NR=Math.max(1,Math.min(7,(levels|0)-1));
  const acc=Array.from({length:NR},()=>({d:'',dnz:'',anchors:[],pts:0,loops:0}));
  const KINDS=SUBUNIT_KINDS.map(k=>k.key);
  const coreR=Rmax*(0.07+rnd()*0.09), coreRank=Math.floor(rnd()*NR);
  acc[coreRank].d+=circleD(cx,cy,coreR); acc[coreRank].pts+=24; acc[coreRank].loops++;
  acc[coreRank].anchors.push({x:cx,y:cy,area:Math.PI*coreR*coreR});
  const N=Math.max(3,order|0);
  for(let r=0;r<rings;r++){
    const rad=Rmax*Math.pow((r+0.85)/rings,1+(0.5-AP.spread)*1.4)*0.94, step=Rmax/rings;
    const kind=(recipe&&recipe.length)?recipe[r%recipe.length]:KINDS[Math.floor(rnd()*KINDS.length)];
    const rr=Math.floor(rnd()*NR); // always consume rnd so pins never reshuffle the seed
    const rank=(ringRanks&&ringRanks[r]!=null)?Math.max(0,Math.min(NR-1,ringRanks[r]|0)):rr;
    const R=ringOf(kind,{cx,cy,rad,N,phase:(rnd()<0.5?0:Math.PI/N)+AP.axis*Math.PI/180+(r%2)*(AP.stagger-0.5)*2*Math.PI/N,
      sz:step*(0.22+rnd()*0.34)*AP.scale, w:(0.2+rnd()*0.5)*Math.PI/N, t:step*(0.14+rnd()*0.3)*AP.scale});
    const A=acc[rank];
    // overlap law per ring: weave (evenodd — crossings cut) or merge (nonzero — crossings stay filled)
    if(ringOver&&ringOver[r]==='merge') A.dnz+=R.d; else A.d+=R.d;
    A.pts+=R.pts; A.loops+=R.loops; A.anchors.push(...R.anchors);
  }
  return acc.map((A,i)=>({rank:i, iso:(i+1)/NR, d:A.d, dnz:A.dnz, loops:A.loops, pts:A.pts,
    anchors:A.anchors.sort((x,y)=>y.area-x.area).slice(0,8)})).filter(b=>b.d||b.dnz);
}
