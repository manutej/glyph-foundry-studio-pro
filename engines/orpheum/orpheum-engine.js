// orpheum-engine.js — a double operad for geometry and colour, with a sheaf-glued palette.
//
// OPERAD O (geometry): colours of the operad are shape-sets. An operation of arity n takes n
//   shape-sets and returns one. Composition γ(f; g₁…gₙ) is tree nesting — a compositional unit IS
//   a tree, and editing a leaf re-derives every ancestor (live). flatten() evaluates a subtree to
//   atoms (the operad's "forgetful" map onto its free algebra).
// OPERAD C (colour): acts on ranks into the palette ramp. Every geometric operation carries a rank
//   action; the two operads act componentwise on (shape, rank) pairs — hence "double".
// SHEAF: colour is a section over the plate. On an overlap the stalk holds two ranks; the gluing
//   rule glue(a,b) = (a+b+1) mod m is symmetric, so sections agree on every intersection and no
//   fill can leave the palette (palette closure). Rendering re-cuts each overlap as a flat colour.
// ASSOCIAHEDRON: the 'assoc' operation composes n children through a NON-associative binary law.
//   Its parameter space is K_{n} — vertices are full bracketings (Tamari), edges are single
//   associativity moves. Walking an edge is the A∞ homotopy between two bracketings; we realise it
//   as a pointwise interpolation of the two evaluated shape-sets.
import {PALETTES, wadaToPalette, renderPrintPNG, loadImageLuma, paletteFromSource} from './linead-engine.js';
import {fft2, filterSpectrum, radialSpectrum, spectrumGraphSVG, PHI, GOLDEN_ANGLE} from './kspace-engine.js';
export {PALETTES, wadaToPalette, renderPrintPNG, loadImageLuma, paletteFromSource, radialSpectrum, spectrumGraphSVG, PHI, GOLDEN_ANGLE};

export const W=1000, H=1000, M=96; // plate size, points per closed form
const q=n=>Math.round(n*100)/100;
let _id=1; export const uid=()=>'n'+(_id++)+'_'+Math.random().toString(36).slice(2,6);

// ── atoms ────────────────────────────────────────────────────────────────
function polyUnit(k,phase){ // regular k-gon, unit circumradius, M points uniform along edges
  const V=[]; for(let i=0;i<k;i++){ const a=phase+2*Math.PI*i/k; V.push([Math.cos(a),Math.sin(a)]); }
  const out=[], per=M/k;
  for(let i=0;i<k;i++){ const a=V[i], b=V[(i+1)%k]; for(let j=0;j<per;j++){ const f=j/per; out.push([a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f]); } }
  return out;
}
const BASE={
  circle:(()=>{ const o=[]; for(let i=0;i<M;i++){ const a=2*Math.PI*i/M; o.push([Math.cos(a),Math.sin(a)]); } return o; })(),
  square:polyUnit(4,-Math.PI/4),
  triangle:polyUnit(3,-Math.PI/2)
};
export const ATOMS=[
  {key:'circle',  name:'Circle',   orphic:'the Point of Origin, extended'},
  {key:'square',  name:'Square',   orphic:'the Ground — four directions held'},
  {key:'triangle',name:'Triangle', orphic:'the Ascent — three as one'}
];
export function makeAtom(shape,x=W/2,y=H/2,rank=1,size=120){
  return {id:uid(), kind:'atom', shape, t:{x,y,s:1,r:0}, size, rank, children:[]};
}
export function makeOp(op,children,p){
  const def=OPS[op]; return {id:uid(), kind:'op', op, p:Object.assign({},def.defaults,p||{}), t:{x:0,y:0,s:1,r:0}, rank:0, children};
}

// ── geometry helpers ─────────────────────────────────────────────────────
export function centroidOf(shapes){
  let x=0,y=0,n=0; for(const s of shapes)for(const p of s.pts){x+=p[0];y+=p[1];n++;}
  if(!n)return {x:W/2,y:H/2,r:1};
  x/=n;y/=n; let r=1; for(const s of shapes)for(const p of s.pts){ const d=Math.hypot(p[0]-x,p[1]-y); if(d>r)r=d; }
  return {x,y,r};
}
export function bboxOf(shapes){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const s of shapes)for(const p of s.pts){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1]; }
  return x0>x1?null:{x0,y0,x1,y1};
}
function xform(shapes,{cx,cy,s=1,r=0,dx=0,dy=0,dr=0}){
  const c=Math.cos(r), sn=Math.sin(r);
  return shapes.map(sh=>({...sh, rank:sh.rank+dr, pts:sh.pts.map(p=>{ const ex=(p[0]-cx)*s, ey=(p[1]-cy)*s; return [cx+ex*c-ey*sn+dx, cy+ex*sn+ey*c+dy]; })}));
}
function resample(pts,n=M){
  const L=[0]; let tot=0;
  for(let i=0;i<pts.length;i++){ const p=pts[i],r=pts[(i+1)%pts.length]; tot+=Math.hypot(r[0]-p[0],r[1]-p[1]); L.push(tot); }
  if(tot<1e-6)return pts.slice(0,n);
  const out=[]; let seg=0;
  for(let j=0;j<n;j++){ const t=tot*j/n; while(seg<pts.length-1&&L[seg+1]<t)seg++;
    const p=pts[seg%pts.length], r=pts[(seg+1)%pts.length], f=(t-L[seg])/Math.max(1e-9,L[seg+1]-L[seg]);
    out.push([p[0]+(r[0]-p[0])*f, p[1]+(r[1]-p[1])*f]); }
  return out;
}
function area(pts){ let a=0; for(let i=0;i<pts.length;i++){ const p=pts[i],r=pts[(i+1)%pts.length]; a+=p[0]*r[1]-r[0]*p[1]; } return a/2; }

// ── Fourier recut: truncated series on a frequency ladder ────────────────
export function fourierTrunc(pts,K,basis='all',bloom=0){
  const rs=resample(pts,M), ks=[0];
  const LAD=basis==='fib'?[1,2,3,5,8,13,21,34]:basis==='phi'?[1,2,4,7,11,18,29,47]:basis==='odd'?[1,3,5,7,9,11,13,15,17,19,21,23]:null;
  if(LAD)LAD.forEach(f=>{ if(f<=K)ks.push(f,-f); }); else for(let k=1;k<=K;k++)ks.push(k,-k);
  const re={},im={};
  for(const k of ks){ let cr=0,ci=0; for(let j=0;j<M;j++){ const a=-2*Math.PI*j*k/M, c=Math.cos(a), s=Math.sin(a); cr+=rs[j][0]*c-rs[j][1]*s; ci+=rs[j][0]*s+rs[j][1]*c; } re[k]=cr/M; im[k]=ci/M; }
  if(bloom>0){ // inject golden-angle phased partials so even a disc moves at the radical end
    const m1p=Math.hypot(re[1]||0,im[1]||0), m1n=Math.hypot(re[-1]||0,im[-1]||0), dom=m1p>=m1n?1:-1, A1=Math.max(m1p,m1n), ph1=Math.atan2(im[dom]||0,re[dom]||0);
    const INJ=(LAD||[2,3,4,5,6,7,8]).filter(f=>f!==1).slice(0,6); let i=1;
    for(const f of INJ){ const fs=f*dom; if(!(fs in re)){re[fs]=0;im[fs]=0;ks.push(fs);} const amp=bloom*A1*Math.pow(PHI,-(i*0.35+0.7)), ph=ph1+i*GOLDEN_ANGLE; re[fs]+=amp*Math.cos(ph); im[fs]+=amp*Math.sin(ph); i++; }
  }
  const out=[];
  for(let j=0;j<M;j++){ let x=0,y=0; for(const k of ks){ const a=2*Math.PI*j*k/M, c=Math.cos(a), s=Math.sin(a); x+=re[k]*c-im[k]*s; y+=re[k]*s+im[k]*c; } out.push([x,y]); }
  return out;
}

// ── associahedron K_n: bracketings of n leaves, Tamari edges, Loday coordinates ──
const _assocCache={};
export function associahedron(n){
  if(_assocCache[n])return _assocCache[n];
  // trees over leaf range [i,j] as nested arrays; leaves are integers
  const memo={};
  const trees=(i,j)=>{ if(i===j)return [i]; const k=i+'-'+j; if(memo[k])return memo[k]; const out=[];
    for(let m=i;m<j;m++)for(const L of trees(i,m))for(const R of trees(m+1,j))out.push([L,R]); return memo[k]=out; };
  const all=trees(0,n-1);
  const str=t=>Array.isArray(t)?'('+str(t[0])+' '+str(t[1])+')':String.fromCharCode(97+t);
  const leaves=t=>Array.isArray(t)?leaves(t[0])+leaves(t[1]):1;
  const minLeaf=t=>Array.isArray(t)?minLeaf(t[0]):t;
  const coords=t=>{ const c=new Array(n-1).fill(0); const walk=u=>{ if(!Array.isArray(u))return; const a=leaves(u[0]), b=leaves(u[1]); const gap=minLeaf(u[1])-1; c[gap]=a*b; walk(u[0]); walk(u[1]); }; walk(t); return c; };
  const rotations=t=>{ // all single associativity moves of t
    const out=[]; const rec=(u,rebuild)=>{ if(!Array.isArray(u))return;
      if(Array.isArray(u[0])) out.push(rebuild([u[0][0],[u[0][1],u[1]]]));        // (ab)c → a(bc)
      if(Array.isArray(u[1])) out.push(rebuild([[u[0],u[1][0]],u[1][1]]));        // a(bc) → (ab)c
      rec(u[0],x=>rebuild([x,u[1]])); rec(u[1],x=>rebuild([u[0],x])); }; rec(t,x=>x); return out; };
  const verts=all.map((t,i)=>({i,tree:t,label:str(t),c:coords(t)}));
  const idx={}; verts.forEach(v=>idx[v.label]=v.i);
  const edges=[]; const seen={};
  verts.forEach(v=>rotations(v.tree).forEach(r=>{ const j=idx[str(r)]; const key=Math.min(v.i,j)+'-'+Math.max(v.i,j); if(j!=null&&!seen[key]){seen[key]=1; edges.push([v.i,j]);} }));
  // 2D projection: Loday's realisation lies in a hyperplane ⟂ (1,…,1); project on two vectors orthogonal to it
  const d=n-1, u=[],w=[]; for(let i=0;i<d;i++){ u.push(Math.cos(2*Math.PI*i/d)); w.push(Math.sin(2*Math.PI*i/d)+(d>3?0.25*Math.cos(4*Math.PI*i/d):0)); }
  verts.forEach(v=>{ let x=0,y=0; for(let i=0;i<d;i++){ x+=v.c[i]*u[i]; y+=v.c[i]*w[i]; } v.x=x; v.y=y; });
  verts.forEach(v=>{ v.nb=edges.filter(e=>e[0]===v.i||e[1]===v.i).map(e=>e[0]===v.i?e[1]:e[0]); });
  return _assocCache[n]={n,verts,edges};
}

// ── the operations ───────────────────────────────────────────────────────
// each op: arity ('n' variadic | 2+), defaults, params schema (for the inspector), apply(children shape-sets, p, node)
export const OPS={
  harmonic:{name:'Harmonic series', glyph:'1 ½ ⅓', arity:'n', orphic:'the overtone row — one form sounding at every integer division',
    defaults:{n:4, law:'1/k', mode:'nested', phase:0, rankStep:1},
    schema:[{k:'n',label:'partials',min:1,max:9,step:1},{k:'law',label:'amplitude law',opts:['1/k','1/φ^k','1/√k','1/k²']},{k:'mode',label:'placement',opts:['nested','ring','row','spiral']},{k:'phase',label:'phase °',min:0,max:360,step:5},{k:'rankStep',label:'rank step',min:0,max:3,step:1}],
    apply(sets,p){ const S=sets.flat(); const {x,y,r}=centroidOf(S); const out=[];
      for(let k=1;k<=p.n;k++){ const f=p.law==='1/φ^k'?Math.pow(PHI,1-k):p.law==='1/√k'?1/Math.sqrt(k):p.law==='1/k²'?1/(k*k):1/k;
        let dx=0,dy=0; const ph=p.phase*Math.PI/180;
        if(p.mode==='ring'&&k>1){ const a=ph+2*Math.PI*(k-1)/Math.max(1,p.n-1); dx=r*Math.cos(a); dy=r*Math.sin(a); }
        if(p.mode==='row'){ let acc=0; for(let j=1;j<k;j++)acc+=2*r*(p.law==='1/φ^k'?Math.pow(PHI,1-j):p.law==='1/√k'?1/Math.sqrt(j):p.law==='1/k²'?1/(j*j):1/j); dx=(acc+r*(1-f))*Math.cos(ph); dy=(acc+r*(1-f))*Math.sin(ph); }
        if(p.mode==='spiral'&&k>1){ const a=ph+(k-1)*GOLDEN_ANGLE, rr=r*(1-f)*1.2; dx=rr*Math.cos(a); dy=rr*Math.sin(a); }
        out.push(...xform(S,{cx:x,cy:y,s:f,dx,dy,dr:(k-1)*p.rankStep})); }
      return out; } },
  fourier:{name:'Fourier recut', glyph:'∑ eⁱᵏᶿ', arity:'n', orphic:'the form resynthesised from its own partials — truncated, it blooms',
    defaults:{K:6, basis:'all', bloom:0.4},
    schema:[{k:'K',label:'harmonics kept',min:1,max:48,step:1},{k:'basis',label:'ladder',opts:['all','odd','fib','phi']},{k:'bloom',label:'bloom',min:0,max:1,step:0.05}],
    apply(sets,p){ return sets.flat().map(s=>({...s, pts:fourierTrunc(s.pts,p.K,p.basis,p.bloom)})); } },
  echo:{name:'φ echo', glyph:'137.5°', arity:'n', orphic:'the golden-angle echo — the form returns smaller, turned, never repeating',
    defaults:{n:3, gain:1, about:'self', rankStep:1},
    schema:[{k:'n',label:'echoes',min:1,max:8,step:1},{k:'gain',label:'scale per echo (×1/φ)',min:0.5,max:1.5,step:0.05},{k:'about',label:'about',opts:['self','plate']},{k:'rankStep',label:'rank step',min:0,max:3,step:1}],
    apply(sets,p){ const S=sets.flat(); const c=p.about==='plate'?{x:W/2,y:H/2}:centroidOf(S); const out=S.slice();
      for(let k=1;k<=p.n;k++){ out.push(...xform(S,{cx:c.x,cy:c.y,s:Math.pow(PHI,-k)*Math.pow(p.gain,k),r:k*GOLDEN_ANGLE,dr:k*p.rankStep})); } return out; } },
  affine:{name:'Affine series', glyph:'T ⁿ', arity:'n', orphic:'the same gesture, iterated — scale, turn, step, by ratio',
    defaults:{copies:3, s:0.8, r:15, dx:40, dy:0, rankStep:1},
    schema:[{k:'copies',label:'iterations',min:0,max:12,step:1},{k:'s',label:'scale ratio',min:0.3,max:1.5,step:0.01},{k:'r',label:'turn °',min:-180,max:180,step:1},{k:'dx',label:'step x',min:-300,max:300,step:2},{k:'dy',label:'step y',min:-300,max:300,step:2},{k:'rankStep',label:'rank step',min:0,max:3,step:1}],
    apply(sets,p){ let S=sets.flat(); const out=S.slice(); const c=centroidOf(S);
      for(let k=1;k<=p.copies;k++){ S=xform(S,{cx:c.x+p.dx*(k-1),cy:c.y+p.dy*(k-1),s:p.s,r:p.r*Math.PI/180,dx:p.dx,dy:p.dy,dr:p.rankStep}); out.push(...S); } return out; } },
  assoc:{name:'Associate', glyph:'K ₙ', arity:2, orphic:'n forms bound two at a time — the bracketing is the composition; the associahedron is its map',
    defaults:{law:'1/φ', vertex:0, walk:0, toward:-1, rankStep:1},
    schema:[{k:'law',label:'binding ratio',opts:['1/φ','1/2','1/3','2/3']},{k:'rankStep',label:'rank step',min:0,max:3,step:1}],
    bind(A,B,p,depth){ // the non-associative law: B is scaled to ρ·radius(A) and set on A's rim at a golden-angle arm
      const a=centroidOf(A), b=centroidOf(B); const rho=p.law==='1/2'?0.5:p.law==='1/3'?1/3:p.law==='2/3'?2/3:1/PHI;
      const s=rho*a.r/Math.max(1e-6,b.r), ang=-Math.PI/2+depth*GOLDEN_ANGLE, d=a.r;
      return A.concat(xform(B,{cx:b.x,cy:b.y,s,dx:a.x+d*Math.cos(ang)-b.x,dy:a.y+d*Math.sin(ang)-b.y,dr:p.rankStep})); },
    evalTree(tree,sets,p){ const rec=(t,depth)=>Array.isArray(t)?this.bind(rec(t[0],depth+1),rec(t[1],depth+1),p,depth):sets[t]; return rec(tree,0); },
    apply(sets,p){ const n=sets.length; if(n<2)return sets.flat(); const K=associahedron(n); const vi=Math.max(0,Math.min(K.verts.length-1,p.vertex|0)); const V=K.verts[vi];
      const A=this.evalTree(V.tree,sets,p); const t=p.walk||0; const to=p.toward>=0&&V.nb.includes(p.toward)?p.toward:V.nb[0];
      if(t<=0||to==null)return A;
      const B=this.evalTree(K.verts[to].tree,sets,p); // same leaf order ⇒ same shape count; lerp = the A∞ homotopy along the edge
      return A.map((s,i)=>{ const o=B[i]||s; return {...s, rank:t<0.5?s.rank:o.rank, pts:s.pts.map((pt,j)=>{ const op=o.pts[j]||pt; return [pt[0]+(op[0]-pt[0])*t, pt[1]+(op[1]-pt[1])*t]; })}; }); } },
  kfilter:{name:'k-space return', glyph:'ℱ⁻¹', arity:'n', orphic:'the unit rasterised, filtered in k-space, and traced back to vector form — geometry through the spectrum',
    defaults:{N:128, beta:0, echoes:0, echoRot:1, sectorN:0, sectorStr:0, ringStr:0, ringK0:0.1, phaseQ:0, whiten:0, lo:0, hi:1, levels:3, minArea:12},
    schema:[{k:'beta',label:'spectral slope β',min:-2,max:3,step:0.1},{k:'echoes',label:'spectral echoes',min:0,max:4,step:1},{k:'sectorN',label:'sector comb N',min:0,max:12,step:1},{k:'sectorStr',label:'sector strength',min:0,max:1,step:0.05},{k:'ringStr',label:'φ-ring comb',min:0,max:1,step:0.05},{k:'phaseQ',label:'phase quantise',min:0,max:12,step:1},{k:'whiten',label:'whiten',min:0,max:1,step:0.05},{k:'lo',label:'low cut',min:0,max:0.5,step:0.01},{k:'hi',label:'high cut',min:0.05,max:1,step:0.01},{k:'levels',label:'trace levels',min:2,max:6,step:1},{k:'N',label:'grid',opts:[64,128,256]}],
    apply(sets,p,node){ const S=sets.flat(); if(!S.length)return S;
      const key=JSON.stringify(p)+'|'+S.length+'|'+S.reduce((a,s)=>a+s.pts[0][0]*7+s.pts[0][1]*3+s.pts[M>>1][0]+s.rank*11,0).toFixed(1);
      if(node&&node._ck===key)return node._cv;
      const out=kReturn(S,p); if(node){node._ck=key;node._cv=out;} return out; } }
};
export const OP_KEYS=Object.keys(OPS);

// rasterise → FFT → filter → IFFT → threshold → marching squares → forms
function kReturn(S,p){
  const N=p.N|0, cv=document.createElement('canvas'); cv.width=cv.height=N; const x=cv.getContext('2d');
  x.fillStyle='#000'; x.fillRect(0,0,N,N); const sc=N/W;
  for(const s of S){ const g=Math.round(255*(0.35+0.65*((s.rank%4)+1)/4)); x.fillStyle=`rgb(${g},${g},${g})`; x.beginPath(); s.pts.forEach((pt,i)=>x[i?'lineTo':'moveTo'](pt[0]*sc,pt[1]*sc)); x.closePath(); x.fill(); }
  const d=x.getImageData(0,0,N,N).data, re=new Float64Array(N*N), im=new Float64Array(N*N); let mean=0;
  for(let i=0;i<N*N;i++){ re[i]=d[i*4]/255; mean+=re[i]; } mean/=N*N; for(let i=0;i<N*N;i++)re[i]-=mean;
  fft2(re,im,N,false); filterSpectrum(re,im,N,p); fft2(re,im,N,true);
  const v=Float64Array.from(re).sort(), lo=v[(N*N*0.02)|0], hi=v[(N*N*0.98)|0]||lo+1e-6, L=new Float32Array(N*N);
  for(let i=0;i<N*N;i++)L[i]=Math.max(0,Math.min(1,(re[i]-lo)/(hi-lo)));
  const out=[], k=W/N;
  for(let r=1;r<p.levels;r++){ const iso=r/p.levels; const inside=(X,Y)=>(X<0||Y<0||X>=N||Y>=N)?0:(L[Y*N+X]>iso?1:0);
    for(const lp of traceMask(inside,N,N)){ if(Math.abs(area(lp))<p.minArea||lp.length<6)continue; out.push({pts:resample(lp.map(q=>[q[0]*k,q[1]*k]),M), rank:r, leaf:'k'}); } }
  return out;
}
const MS={1:[['L','B']],2:[['B','R']],3:[['L','R']],4:[['T','R']],5:[['T','R'],['L','B']],6:[['T','B']],7:[['T','L']],8:[['T','L']],9:[['T','B']],10:[['T','L'],['B','R']],11:[['T','R']],12:[['L','R']],13:[['R','B']],14:[['L','B']]};
function traceMask(inside,w,h){
  const P=(cx,cy,e)=>e==='T'?[cx+0.5,cy]:e==='B'?[cx+0.5,cy+1]:e==='L'?[cx,cy+0.5]:[cx+1,cy+0.5];
  const key=p=>(p[0]*2)+','+(p[1]*2), start={}, segs=[];
  for(let y=-1;y<h;y++)for(let x=-1;x<w;x++){ const c=(inside(x,y)<<3)|(inside(x+1,y)<<2)|(inside(x+1,y+1)<<1)|inside(x,y+1); if(!c||c===15)continue;
    for(const [a,b] of MS[c]){ const s=[P(x,y,a),P(x,y,b)]; const i=segs.push(s)-1; (start[key(s[0])]||(start[key(s[0])]=[])).push(i); (start[key(s[1])]||(start[key(s[1])]=[])).push(i); } }
  const used=new Uint8Array(segs.length), loops=[];
  for(let i=0;i<segs.length;i++){ if(used[i])continue; used[i]=1; const lp=[segs[i][0]]; let cur=segs[i][1]; let guard=0;
    while(guard++<segs.length){ lp.push(cur); const cands=(start[key(cur)]||[]).filter(j=>!used[j]); if(!cands.length)break; const j=cands[0]; used[j]=1; const s=segs[j]; cur=key(s[0])===key(cur)?s[1]:s[0]; if(key(cur)===key(lp[0]))break; }
    if(lp.length>=3)loops.push(lp); }
  return loops;
}

// ── evaluation (the operad algebra) ──────────────────────────────────────
export function evaluate(node){
  if(node.kind==='atom'){ const b=node.shape==='poly'?node.pts:BASE[node.shape]; const R=node.size*node.t.s, c=Math.cos(node.t.r), s=Math.sin(node.t.r);
    return [{pts:b.map(p=>[node.t.x+(p[0]*c-p[1]*s)*R, node.t.y+(p[0]*s+p[1]*c)*R]), rank:node.rank, leaf:node.id}]; }
  const sets=node.children.map(evaluate); const def=OPS[node.op]; let out=def?def.apply(sets,node.p,node):sets.flat();
  const t=node.t; if(t.s!==1||t.r||t.x||t.y||node.rank){ const c=centroidOf(out); out=xform(out,{cx:c.x,cy:c.y,s:t.s,r:t.r,dx:t.x,dy:t.y,dr:node.rank}); }
  return out;
}
export function evaluateRoot(root){ const out=[]; for(const ch of root.children){ for(const s of evaluate(ch))out.push({...s, unit:ch.id}); } return out; }
// flatten: the forgetful map — evaluate a subtree and return equivalent 'poly' atoms
export function flatten(node){ const S=evaluate(node); return S.map(s=>{ const c=centroidOf([s]); const R=Math.max(1,c.r); return {id:uid(), kind:'atom', shape:'poly', pts:s.pts.map(p=>[(p[0]-c.x)/R,(p[1]-c.y)/R]), t:{x:c.x,y:c.y,s:1,r:0}, size:R, rank:s.rank, children:[]}; }); }
export function walk(node,fn,depth=0,parent=null){ fn(node,depth,parent); (node.children||[]).forEach(c=>walk(c,fn,depth+1,node)); }
export function findParent(root,id){ let P=null; walk(root,(n,d,p)=>{ if(n.id===id)P=p; }); return P; }
export function findNode(root,id){ let R=null; walk(root,n=>{ if(n.id===id)R=n; }); return R; }

// ── palette sheaf + SVG ──────────────────────────────────────────────────
export const pathD=pts=>'M'+pts.map(p=>q(p[0])+' '+q(p[1])).join('L')+'Z';
export const glue=(a,b,m)=>((a%m)+(b%m)+1)%m;
export function buildPlate(shapes,pal,{recut=true,stroke=0,maxPairs=600}={}){
  const m=pal.ramp.length, col=r=>pal.ramp[((r%m)+m)%m];
  const items=shapes.map((s,i)=>({d:pathD(s.pts), fill:col(s.rank), i})); const clips=[], overs=[];
  if(recut){ const bb=shapes.map(s=>bboxOf([s])); let np=0;
    for(let j=1;j<shapes.length&&np<maxPairs;j++)for(let i=0;i<j&&np<maxPairs;i++){ const A=bb[i],B=bb[j]; if(!A||!B||A.x1<B.x0||B.x1<A.x0||A.y1<B.y0||B.y1<A.y0)continue;
      const id='c'+i+'_'+j; clips.push({id,d:items[i].d}); overs.push({d:items[j].d, clip:'url(#'+id+')', fill:col(glue(shapes[i].rank,shapes[j].rank,m))}); np++; } }
  return {items,clips,overs,ground:pal.ground,ink:pal.ink,stroke};
}
export function plateSVG(P){
  const sw=P.stroke?` stroke="${P.ink}" stroke-width="${P.stroke}" stroke-linejoin="round"`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${P.ground}"/><defs>${P.clips.map(c=>`<clipPath id="${c.id}"><path d="${c.d}"/></clipPath>`).join('')}</defs>${P.items.map(s=>`<path d="${s.d}" fill="${s.fill}"${sw}/>`).join('')}${P.overs.map(o=>`<path d="${o.d}" fill="${o.fill}" clip-path="${o.clip}"/>`).join('')}</svg>`;
}

// ── k-space of the whole plate (on demand) ───────────────────────────────
export function plateSpectrum(shapes,pal,N=256){
  const cv=document.createElement('canvas'); cv.width=cv.height=N; const x=cv.getContext('2d'); const sc=N/W;
  x.fillStyle=pal.ground; x.fillRect(0,0,N,N); const m=pal.ramp.length;
  for(const s of shapes){ x.fillStyle=pal.ramp[((s.rank%m)+m)%m]; x.beginPath(); s.pts.forEach((p,i)=>x[i?'lineTo':'moveTo'](p[0]*sc,p[1]*sc)); x.closePath(); x.fill(); }
  const d=x.getImageData(0,0,N,N).data, re=new Float64Array(N*N), im=new Float64Array(N*N); let mean=0;
  for(let i=0;i<N*N;i++){ re[i]=(0.2126*d[i*4]+0.7152*d[i*4+1]+0.0722*d[i*4+2])/255; mean+=re[i]; } mean/=N*N; for(let i=0;i<N*N;i++)re[i]-=mean;
  fft2(re,im,N,false);
  const h=N/2, spec=new Float32Array(N*N); let mx=0;
  for(let y=0;y<N;y++)for(let X=0;X<N;X++){ const i=y*N+X, v=Math.log1p(Math.hypot(re[i],im[i])); spec[((y+h)%N)*N+((X+h)%N)]=v; if(v>mx)mx=v; }
  for(let i=0;i<N*N;i++)spec[i]/=mx||1;
  const rs=radialSpectrum(spec,N);
  return {spec,N,rs,beta:rs.beta,D:(8-rs.beta)/2};
}
export function paintSpec(cv,spec,N,tint){
  cv.width=N; cv.height=N; const x=cv.getContext('2d'), id=x.createImageData(N,N), d=id.data, t=tint||[212,168,75];
  for(let i=0;i<N*N;i++){ const v=Math.max(0,Math.min(1,spec[i])), g=Math.pow(v,1.6); d[i*4]=14+g*(t[0]-14); d[i*4+1]=14+g*(t[1]-14); d[i*4+2]=16+g*(t[2]-16); d[i*4+3]=255; }
  x.putImageData(id,0,0);
}
export function download(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
