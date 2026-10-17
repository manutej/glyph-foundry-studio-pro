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
import {PALETTES, wadaToPalette, renderPrintPNG, loadImageLuma, paletteFromSource, loopToPath} from './linead-engine.js';
import {fft2, filterSpectrum, radialSpectrum, spectrumGraphSVG, PHI, GOLDEN_ANGLE} from './kspace-engine.js';
export {PALETTES, wadaToPalette, renderPrintPNG, loadImageLuma, paletteFromSource, loopToPath, fft2, filterSpectrum, radialSpectrum, spectrumGraphSVG, PHI, GOLDEN_ANGLE};

// the plate is a FRAME, not a coordinate system: atoms keep plate units; setPlate changes the frame.
export const plate={W:1000,H:1000}; export const M=144; // points per closed form (divisible by 3, 4, 6, 8, 12)
export const FORMATS=[{key:'square',name:'Plate — 1000×1000',W:1000,H:1000},{key:'portrait',name:'Portrait — 1000×1414',W:1000,H:1414},{key:'card',name:'Card — 700×1200',W:700,H:1200},{key:'wide',name:'Poster wide — 1600×1000',W:1600,H:1000},{key:'exh',name:'Exhibition 16:9 — 1920×1080',W:1920,H:1080},{key:'ultra',name:'Exhibition 21:9 — 2560×1080',W:2560,H:1080}];
export function setPlate(w,h){ plate.W=Math.max(100,w|0); plate.H=Math.max(100,h|0); return plate; }
export const live={drag:false, bezier:true}; // while dragging, expensive ops serve proxy cache and promote to Cubic Bézier on release
// re-fit a tree from one frame to another: uniform scale about centre so the old inscribed square sits inside the new frame
export function refitTree(root,from,to){ const f=Math.min(to.W,to.H)/Math.min(from.W,from.H); const cx0=from.W/2,cy0=from.H/2,cx1=to.W/2,cy1=to.H/2;
  walk(root,n=>{ if(n.id==='root')return; if(n.kind==='atom'){ n.t.x=cx1+(n.t.x-cx0)*f; n.t.y=cy1+(n.t.y-cy0)*f; n.t.s*=f; } else { n.t.x*=f; n.t.y*=f; } }); return f; }
const q=n=>Math.round(n*100)/100;
let _id=1; export const uid=()=>'n'+(_id++)+'_'+Math.random().toString(36).slice(2,6);

// ── atoms ────────────────────────────────────────────────────────────────
function polyUnit(k,phase){ // regular k-gon, unit circumradius, M points uniform along edges
  const V=[]; for(let i=0;i<k;i++){ const a=phase+2*Math.PI*i/k; V.push([Math.cos(a),Math.sin(a)]); }
  const out=[], per=M/k;
  for(let i=0;i<k;i++){ const a=V[i], b=V[(i+1)%k]; for(let j=0;j<per;j++){ const f=j/per; out.push([a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f]); } }
  return out;
}
export const BASE={
  circle:(()=>{ const o=[]; for(let i=0;i<M;i++){ const a=2*Math.PI*i/M; o.push([Math.cos(a),Math.sin(a)]); } return o; })(),
  square:polyUnit(4,-Math.PI/4),
  triangle:polyUnit(3,-Math.PI/2)
};
export const ATOMS=[
  {key:'circle',  name:'Circle',   orphic:'the Point of Origin, extended'},
  {key:'square',  name:'Square',   orphic:'the Ground — four directions held'},
  {key:'triangle',name:'Triangle', orphic:'the Ascent — three as one'}
];
export function makeAtom(shape,x=plate.W/2,y=plate.H/2,rank=1,size=120){
  return {id:uid(), kind:'atom', shape, t:{x,y,s:1,r:0}, size, rank, children:[]};
}
export function makeOp(op,children,p){
  const def=OPS[op]; return {id:uid(), kind:'op', op, p:Object.assign({},def.defaults,p||{}), t:{x:0,y:0,s:1,r:0}, rank:0, children};
}

// ── geometry helpers ─────────────────────────────────────────────────────
export function centroidOf(shapes){
  let x=0,y=0,n=0; for(const s of shapes)for(const p of s.pts){x+=p[0];y+=p[1];n++;}
  if(!n)return {x:plate.W/2,y:plate.H/2,r:1};
  x/=n;y/=n; let r=1; for(const s of shapes)for(const p of s.pts){ const d=Math.hypot(p[0]-x,p[1]-y); if(d>r)r=d; }
  return {x,y,r};
}
export function bboxOf(shapes){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const s of shapes)for(const p of s.pts){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1]; }
  return x0>x1?null:{x0,y0,x1,y1};
}
function xform(shapes,{cx,cy,s=1,r=0,dx=0,dy=0,dr=0,fx=false,fy=false}){
  const c=Math.cos(r), sn=Math.sin(r), mx=fx?-1:1, my=fy?-1:1;
  return shapes.map(sh=>({...sh, rank:sh.rank+dr, pts:sh.pts.map(p=>{ const ex=(p[0]-cx)*s*mx, ey=(p[1]-cy)*s*my; return [cx+ex*c-ey*sn+dx, cy+ex*sn+ey*c+dy]; })}));
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
      const ph=p.phase*Math.PI/180, ux=Math.cos(ph), uy=Math.sin(ph);
      let pMin=1e9, pMax=-1e9;
      for(const s of S)for(const pt of s.pts){ const pr=(pt[0]-x)*ux+(pt[1]-y)*uy; if(pr<pMin)pMin=pr; if(pr>pMax)pMax=pr; }
      const span=pMax>pMin?(pMax-pMin):2*r;
      const lawFn=j=>p.law==='1/φ^k'?Math.pow(PHI,1-j):p.law==='1/√k'?1/Math.sqrt(j):p.law==='1/k²'?1/(j*j):1/j;
      for(let k=1;k<=p.n;k++){ const f=lawFn(k);
        let dx=0,dy=0;
        if(p.mode==='ring'&&k>1){ const a=ph+2*Math.PI*(k-1)/Math.max(1,p.n-1); dx=r*Math.cos(a); dy=r*Math.sin(a); }
        if(p.mode==='row'&&k>1){ let acc=0.5*span*(1+f); for(let j=2;j<k;j++)acc+=span*lawFn(j); dx=acc*ux; dy=acc*uy; }
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
    apply(sets,p){ const S=sets.flat(); const c=p.about==='plate'?{x:plate.W/2,y:plate.H/2}:centroidOf(S); const out=S.slice();
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
      const B=this.evalTree(K.verts[to].tree,sets,p); // same leaf order ⇒ same shape count; straight-line edge homotopy
      return A.map((s,i)=>{ const o=B[i]||s; return {...s, rank:t<0.5?s.rank:o.rank, pts:s.pts.map((pt,j)=>{ const op=o.pts[j]||pt; return [pt[0]+(op[0]-pt[0])*t, pt[1]+(op[1]-pt[1])*t]; })}; }); } },
  group:{name:'Group', glyph:'( )', arity:'n', orphic:'a parenthesis — forms held as one, nothing else done to them',
    defaults:{rankStep:0}, schema:[{k:'rankStep',label:'rank shift',min:0,max:3,step:1}],
    apply(sets,p){ return sets.flat().map(s=>({...s, rank:s.rank+p.rankStep})); } },
  veil:{name:'Veil', glyph:'α', arity:'n', orphic:'the unit laid over the field as a tint — what is beneath shows through, un-recut',
    defaults:{alpha:0.55, blend:'multiply', rankStep:0},
    schema:[{k:'alpha',label:'opacity α',min:0.05,max:1,step:0.05},{k:'blend',label:'blend',opts:['normal','multiply','screen']},{k:'rankStep',label:'rank shift',min:0,max:3,step:1}],
    apply(sets,p){ return sets.flat().map(s=>({...s, rank:s.rank+p.rankStep, mode:'veil', alpha:p.alpha, blend:p.blend})); } },
  convex:{name:'Convexity split', glyph:'⟡⟡', arity:'n', orphic:'a complex form cut at its hollows into near-convex parts — limbs named without a name',
    defaults:{eps:2.5, rankStep:1, maxParts:12},
    schema:[{k:'eps',label:'simplify before cutting',min:0.5,max:12,step:0.5},{k:'maxParts',label:'max parts per form',min:2,max:24,step:1},{k:'rankStep',label:'rank step per part',min:0,max:3,step:1}],
    apply(sets,p){ const out=[]; for(const s of sets.flat()){ const parts=convexSplit(s.pts,p.eps,p.maxParts); parts.forEach((pts,i)=>out.push({...s, pts:resample(pts,M), rank:s.rank+i*p.rankStep})); } return out; } },
  fsplit:{name:'Fourier split', glyph:'∑|r', arity:'n', orphic:'the primary body (few partials, solid) and the form itself laid over it as a veil — likeness becomes a tint on a primary',
    defaults:{K:3, basis:'all', alpha:0.5, blend:'multiply', rankStep:1},
    schema:[{k:'K',label:'body harmonics',min:1,max:12,step:1},{k:'basis',label:'ladder',opts:['all','odd','fib','phi']},{k:'alpha',label:'detail opacity',min:0.05,max:1,step:0.05},{k:'blend',label:'blend',opts:['normal','multiply','screen']},{k:'rankStep',label:'detail rank shift',min:0,max:3,step:1}],
    apply(sets,p){ const S=sets.flat(), out=[]; for(const s of S)out.push({...s, pts:fourierTrunc(s.pts,p.K,p.basis,0), mode:'solid'}); for(const s of S)out.push({...s, rank:s.rank+p.rankStep, mode:'veil', alpha:p.alpha, blend:p.blend}); return out; } },
  ingest:{name:'Ingest', glyph:'⇪', arity:'n', orphic:'a drawing or photograph traced into forms — the source enters the operad as generators',
    defaults:{levels:4, grid:1200, cap:240, minArea:0.15, eps:1.0, invert:0, adapt:0.3, subpixel:1, nest:1, rankStep:0},
    schema:[{k:'levels',label:'tone levels',min:2,max:8,step:1},{k:'grid',label:'trace grid px',min:400,max:2400,step:100},{k:'cap',label:'max traced forms',min:60,max:600,step:20},{k:'minArea',label:'min area % of plate',min:0.01,max:3,step:0.02},{k:'eps',label:'simplify ε',min:0,max:6,step:0.25},{k:'adapt',label:'adaptive threshold',min:0,max:1,step:0.05},{k:'subpixel',label:'sub-pixel iso trace',opts:[1,0]},{k:'invert',label:'invert (light = form)',opts:[0,1]},{k:'nest',label:'nest bands as units',opts:[1,0]}],
    apply(sets,p){ return sets.flat().map(s=>({...s, rank:s.rank+p.rankStep})); } },
  extrude:{name:'Depth', glyph:'▱', arity:'n', orphic:'the unit lifted off the plate — a stacked shadow or a solid extrusion gives it a third dimension',
    defaults:{depth:28, angle:135, steps:6, shade:'ink', alpha:0.32, blend:'multiply', rankStep:1},
    schema:[{k:'depth',label:'depth px',min:0,max:160,step:2},{k:'angle',label:'light from °',min:0,max:360,step:5},{k:'steps',label:'layers',min:1,max:16,step:1},{k:'shade',label:'shade',opts:['ink','rank','ground']},{k:'alpha',label:'shadow opacity (ink/ground)',min:0.05,max:1,step:0.05},{k:'blend',label:'blend (ink)',opts:['multiply','normal','screen']},{k:'rankStep',label:'rank step (rank shade)',min:0,max:3,step:1}],
    apply(sets,p){ const S=sets.flat(), out=[]; const a=p.angle*Math.PI/180, ux=Math.cos(a), uy=Math.sin(a); const n=Math.max(1,p.steps|0);
      for(let i=n;i>=1;i--){ const d=p.depth*i/n, dx=ux*d, dy=uy*d;
        for(const s of S){ const pts=s.pts.map(q=>[q[0]+dx,q[1]+dy]);
          if(p.shade==='rank') out.push({...s, pts, rank:s.rank+p.rankStep*Math.ceil(i*2/n), mode:'solid'});
          else out.push({...s, pts, mode:'shadow', shade:p.shade, alpha:p.alpha*(p.shade==='ink'?(0.55+0.45*(1-(i-1)/n)):1), blend:p.shade==='ink'?p.blend:'normal'}); } }
      return out.concat(S); } },
  kfilter:{name:'k-space return', glyph:'ℱ⁻¹', arity:'n', orphic:'the unit rasterised, filtered in k-space, and traced back to vector form — geometry through the spectrum',
    defaults:{N:128, beta:0, echoes:0, echoGain:0.7, echoRot:1, sectorN:0, sectorStr:0, ringStr:0, ringWidth:0.18, ringK0:0.1, phaseQ:0, whiten:0, lo:0, hi:1, levels:3, minArea:12},
    schema:[{k:'beta',label:'spectral slope β',min:-2,max:3,step:0.1},{k:'echoes',label:'spectral echoes',min:0,max:4,step:1},{k:'echoGain',label:'echo gain',min:0.2,max:1.2,step:0.05},{k:'sectorN',label:'sector comb N',min:0,max:12,step:1},{k:'sectorStr',label:'sector strength',min:0,max:1,step:0.05},{k:'ringStr',label:'φ-ring comb',min:0,max:1,step:0.05},{k:'ringWidth',label:'ring width',min:0.05,max:0.5,step:0.01},{k:'phaseQ',label:'phase quantise',min:0,max:12,step:1},{k:'whiten',label:'whiten',min:0,max:1,step:0.05},{k:'lo',label:'low cut',min:0,max:0.5,step:0.01},{k:'hi',label:'high cut',min:0.05,max:1,step:0.01},{k:'levels',label:'trace levels',min:2,max:6,step:1},{k:'N',label:'grid',opts:[64,128,256]}],
    apply(sets,p,node){ const S=sets.flat(); if(!S.length)return S;
      const key=JSON.stringify(p)+'|'+S.length+'|'+S.reduce((a,s)=>a+s.pts[0][0]*7+s.pts[0][1]*3+s.pts[Math.min(s.pts.length-1,M>>1)][0]+s.rank*11,0).toFixed(1);
      if(node&&node._ck===key)return node._cv;
      if(node&&node._cv&&live.drag)return node._cv;
      const out=kReturn(S,p); if(node){node._ck=key;node._cv=out;} return out; } },
  fold:{name:'Dihedral fold', glyph:'Dₙ', arity:'n', orphic:'n-fold rotational and dihedral mirror symmetry about the self or plate center',
    defaults:{n:6, mirror:0, about:'self', radius:0, phase:0, rankStep:1},
    schema:[{k:'n',label:'folds n',min:2,max:16,step:1},{k:'mirror',label:'dihedral mirror',opts:[0,1]},{k:'about',label:'center',opts:['self','plate']},{k:'radius',label:'radial offset',min:0,max:320,step:4},{k:'phase',label:'phase °',min:0,max:360,step:5},{k:'rankStep',label:'rank step',min:0,max:3,step:1}],
    apply(sets,p){ const S=sets.flat(); if(!S.length)return S;
      const c=p.about==='plate'?{x:plate.W/2,y:plate.H/2}:centroidOf(S); const out=[];
      const ph=(p.phase||0)*Math.PI/180, n=Math.max(2,p.n|0);
      for(let k=0;k<n;k++){
        const a=ph+2*Math.PI*k/n, dx=(p.radius||0)*Math.cos(a), dy=(p.radius||0)*Math.sin(a);
        out.push(...xform(S,{cx:c.x,cy:c.y,s:1,r:a,dx,dy,dr:k*(p.rankStep||0)}));
        if(p.mirror){
          out.push(...xform(S,{cx:c.x,cy:c.y,s:1,r:a,dx,dy,dr:k*(p.rankStep||0)+1,fx:true}));
        }
      }
      return out; } },
  mirror:{name:'Mirror reflect', glyph:'⇌', arity:'n', orphic:'bilateral reflection across horizontal, vertical, or quad axes',
    defaults:{axis:'x', about:'self', offset:40, rankStep:1},
    schema:[{k:'axis',label:'axis',opts:['x','y','xy']},{k:'about',label:'about',opts:['self','plate']},{k:'offset',label:'separation px',min:-200,max:200,step:4},{k:'rankStep',label:'rank step',min:0,max:3,step:1}],
    apply(sets,p){ const S=sets.flat(); if(!S.length)return S;
      const c=p.about==='plate'?{x:plate.W/2,y:plate.H/2}:centroidOf(S); const d=p.offset||0, rs=p.rankStep||0;
      const out=xform(S,{cx:c.x,cy:c.y,dx:p.axis==='y'?0:-d/2,dy:p.axis==='x'?0:-d/2});
      if(p.axis==='x'||p.axis==='xy') out.push(...xform(S,{cx:c.x,cy:c.y,fx:true,dx:d/2,dy:p.axis==='xy'?-d/2:0,dr:rs}));
      if(p.axis==='y'||p.axis==='xy') out.push(...xform(S,{cx:c.x,cy:c.y,fy:true,dx:p.axis==='xy'?-d/2:0,dy:d/2,dr:rs}));
      if(p.axis==='xy') out.push(...xform(S,{cx:c.x,cy:c.y,fx:true,fy:true,dx:d/2,dy:d/2,dr:rs*2}));
      return out; } },
  lattice:{name:'Lattice grid', glyph:'⊞', arity:'n', orphic:'a 2D Bravais crystal — forms tiled across columns and rows with alternating rank',
    defaults:{cols:3, rows:3, dx:110, dy:110, stagger:0, scaleDecay:1, rankStep:1},
    schema:[{k:'cols',label:'columns',min:1,max:8,step:1},{k:'rows',label:'rows',min:1,max:8,step:1},{k:'dx',label:'pitch X px',min:20,max:320,step:4},{k:'dy',label:'pitch Y px',min:20,max:320,step:4},{k:'stagger',label:'hex stagger',min:0,max:1,step:0.25},{k:'scaleDecay',label:'radial scale',min:0.5,max:1.2,step:0.05},{k:'rankStep',label:'rank step',min:0,max:3,step:1}],
    apply(sets,p){ const S=sets.flat(); if(!S.length)return S;
      const c=centroidOf(S), cols=Math.max(1,p.cols|0), rows=Math.max(1,p.rows|0), out=[];
      const ox=(cols-1)*p.dx*0.5, oy=(rows-1)*p.dy*0.5;
      for(let r=0;r<rows;r++){
        const st=(r%2)*(p.stagger||0)*p.dx;
        for(let col=0;col<cols;col++){
          const dx=col*p.dx-ox+st, dy=r*p.dy-oy;
          const dist=Math.hypot(col-(cols-1)*0.5, r-(rows-1)*0.5);
          const sc=Math.pow(p.scaleDecay||1, dist);
          out.push(...xform(S,{cx:c.x,cy:c.y,s:sc,dx,dy,dr:(col+r)*(p.rankStep||0)}));
        }
      }
      return out; } },
  braid:{name:'Braid weave', glyph:'⋈', arity:'n', orphic:'strands woven in sinusoidal phase opposition — over and under across the axis',
    defaults:{strands:3, steps:6, amp:55, pitch:52, scale:0.72, phase:0, rankStep:1},
    schema:[{k:'strands',label:'strands',min:2,max:6,step:1},{k:'steps',label:'crossings',min:2,max:12,step:1},{k:'amp',label:'weave amp px',min:10,max:180,step:5},{k:'pitch',label:'step pitch px',min:16,max:140,step:4},{k:'scale',label:'node scale',min:0.3,max:1.2,step:0.05},{k:'phase',label:'axis °',min:0,max:360,step:15},{k:'rankStep',label:'rank step',min:0,max:3,step:1}],
    apply(sets,p){ const S=sets.flat(); if(!S.length)return S;
      const c=centroidOf(S), nStr=Math.max(2,p.strands|0), steps=Math.max(2,p.steps|0), out=[];
      const ph=(p.phase||0)*Math.PI/180, ux=Math.cos(ph), uy=Math.sin(ph), vx=-uy, vy=ux;
      const span=(steps-1)*(p.pitch||52);
      for(let k=0;k<steps;k++){
        const along=k*(p.pitch||52)-span*0.5;
        for(let st=0;st<nStr;st++){
          const theta=k*Math.PI*0.75 + (2*Math.PI*st)/nStr;
          const across=Math.sin(theta)*(p.amp||55);
          const turn=Math.cos(theta)*0.35;
          const dx=along*ux+across*vx, dy=along*uy+across*vy;
          out.push(...xform(S,{cx:c.x,cy:c.y,s:p.scale||0.72,r:turn,dx,dy,dr:(st+k)*(p.rankStep||1)}));
        }
      }
      return out; } }
};
export const OP_KEYS=Object.keys(OPS);

// rasterise → FFT → filter → IFFT → threshold → marching squares → forms
function kReturn(S,p){
  const N=p.N|0, cv=document.createElement('canvas'); cv.width=cv.height=N; const x=cv.getContext('2d');
  x.fillStyle='#000'; x.fillRect(0,0,N,N); const {W,H}=plate, sc=N/Math.max(W,H), bx=(N-W*sc)/2, by=(N-H*sc)/2; x.translate(bx,by);
  for(const s of S){ const g=Math.round(255*(0.35+0.65*((s.rank%4)+1)/4)); x.globalAlpha=(s.mode&&s.mode!=='solid')?(s.alpha||0.5):1; x.fillStyle=`rgb(${g},${g},${g})`; x.beginPath(); s.pts.forEach((pt,i)=>x[i?'lineTo':'moveTo'](pt[0]*sc,pt[1]*sc)); x.closePath(); x.fill(); }
  x.globalAlpha=1;
  const d=x.getImageData(0,0,N,N).data, re=new Float64Array(N*N), im=new Float64Array(N*N); let mean=0;
  for(let i=0;i<N*N;i++){ re[i]=d[i*4]/255; mean+=re[i]; } mean/=N*N; for(let i=0;i<N*N;i++)re[i]-=mean;
  fft2(re,im,N,false); filterSpectrum(re,im,N,p); fft2(re,im,N,true);
  const v=Float64Array.from(re).sort(), vmax=v[N*N-1]; let lo=v[(N*N*0.02)|0], hi=v[(N*N*0.98)|0]; const L=new Float32Array(N*N);
  if(!isFinite(lo)||!isFinite(hi))return S; // a bad filter degrades to the un-filtered unit, never to nothing
  if(hi-lo<0.2*(vmax-lo))hi=vmax; // small forms: the 98th percentile is still ground — don't amplify FFT noise into speckle
  if(hi-lo<1e-6)return S;
  for(let i=0;i<N*N;i++)L[i]=Math.max(0,Math.min(1,(re[i]-lo)/(hi-lo)));
  const out=[], k=1/sc;
  for(let r=1;r<p.levels;r++){ const iso=r/p.levels; const inside=(X,Y)=>(X<0||Y<0||X>=N||Y>=N)?0:(L[Y*N+X]>iso?1:0);
    const valAt=(X,Y)=>L[Math.max(0,Math.min(N-1,Y))*N+Math.max(0,Math.min(N-1,X))];
    for(const lp of traceMask(inside,N,N,valAt,iso,true)){ if(Math.abs(area(lp))<p.minArea||lp.length<6)continue; out.push({pts:resample(lp.map(q=>[(q[0]+0.5-bx)*k,(q[1]+0.5-by)*k]),M), rank:r, leaf:'k'}); } }
  return out;
}
const MS={1:[['L','B']],2:[['B','R']],3:[['L','R']],4:[['T','R']],5:[['T','R'],['L','B']],6:[['T','B']],7:[['T','L']],8:[['T','L']],9:[['T','B']],10:[['T','L'],['B','R']],11:[['T','R']],12:[['L','R']],13:[['R','B']],14:[['L','B']]};
function traceMask(inside,w,h,valAt=null,iso=0.5,subpixel=true){
  const edgeKey=(cx,cy,e)=>e==='T'?'H:'+cx+','+cy:e==='B'?'H:'+cx+','+(cy+1):e==='L'?'V:'+cx+','+cy:'V:'+(cx+1)+','+cy;
  const edgePt=(cx,cy,e)=>{
    if(!subpixel||!valAt)return e==='T'?[cx+0.5,cy]:e==='B'?[cx+0.5,cy+1]:e==='L'?[cx,cy+0.5]:[cx+1,cy+0.5];
    let x0=cx,y0=cy,x1=cx,y1=cy;
    if(e==='T'){x1=cx+1;} else if(e==='B'){y0=cy+1;x1=cx+1;y1=cy+1;} else if(e==='L'){y1=cy+1;} else {x0=cx+1;x1=cx+1;y1=cy+1;}
    const in0=inside(x0,y0), in1=inside(x1,y1);
    if(in0===in1)return [(x0+x1)*0.5,(y0+y1)*0.5];
    const v0=valAt(x0,y0), v1=valAt(x1,y1), dv=v1-v0;
    const t=Math.abs(dv)>1e-5?Math.max(0.02,Math.min(0.98,(iso-v0)/dv)):0.5;
    return [x0+(x1-x0)*t, y0+(y1-y0)*t];
  };
  const start={}, segs=[];
  for(let y=-1;y<h;y++)for(let x=-1;x<w;x++){ const c=(inside(x,y)<<3)|(inside(x+1,y)<<2)|(inside(x+1,y+1)<<1)|inside(x,y+1); if(!c||c===15)continue;
    for(const [a,b] of MS[c]){ const ka=edgeKey(x,y,a), kb=edgeKey(x,y,b), pa=edgePt(x,y,a), pb=edgePt(x,y,b);
      const i=segs.push({ka,kb,pa,pb})-1; (start[ka]||(start[ka]=[])).push(i); (start[kb]||(start[kb]=[])).push(i); } }
  const used=new Uint8Array(segs.length), loops=[];
  for(let i=0;i<segs.length;i++){ if(used[i])continue; used[i]=1; const lp=[segs[i].pa]; let curK=segs[i].kb, curP=segs[i].pb; const firstK=segs[i].ka; let guard=0;
    while(guard++<segs.length){ lp.push(curP); if(curK===firstK)break; const cands=(start[curK]||[]).filter(j=>!used[j]); if(!cands.length)break; const j=cands[0]; used[j]=1; const s=segs[j];
      if(s.ka===curK){curK=s.kb;curP=s.pb;} else {curK=s.ka;curP=s.pa;} }
    if(lp.length>=3){
      if(subpixel&&lp.length>=6){
        const n=lp.length, tmp=new Array(n), out=new Array(n);
        for(let k=0;k<n;k++){ const p0=lp[(k+n-1)%n], p1=lp[k], p2=lp[(k+1)%n]; tmp[k]=[p1[0]+0.36*((p0[0]+p2[0])*0.5-p1[0]), p1[1]+0.36*((p0[1]+p2[1])*0.5-p1[1])]; }
        for(let k=0;k<n;k++){ const p0=tmp[(k+n-1)%n], p1=tmp[k], p2=tmp[(k+1)%n]; out[k]=[p1[0]-0.375*((p0[0]+p2[0])*0.5-p1[0]), p1[1]-0.375*((p0[1]+p2[1])*0.5-p1[1])]; }
        loops.push(out);
      } else loops.push(lp);
    } }
  return loops;
}

// ── evaluation (the operad algebra) ──────────────────────────────────────
export const perf={evals:0,hits:0,lastMs:0};
function evalKey(node){ const t=node.t; const own=node.kind==='atom'?`a${node.shape}|${node.size}|${node.rank}|${node.mode||'solid'}|${node.alpha||1}|${node.blend||'normal'}|${node.pts?node.pts.length:0}`:`o${node.op}|${JSON.stringify(node.p)}|${node.rank}|${plate.W}x${plate.H}`;
  return own+'|'+t.x.toFixed(2)+','+t.y.toFixed(2)+','+t.s.toFixed(4)+','+t.r.toFixed(4)+','+(t.fx?1:0)+','+(t.fy?1:0)+(node.kind==='atom'?'':'['+node.children.map(c=>c._ek||evalKey(c)).join(';')+']'); }
export function evaluate(node){
  const key=evalKey(node); node._ek=key; if(node._ev&&node._evk===key){ perf.hits++; return node._ev; } perf.evals++;
  let out;
  if(node.kind==='atom'){ const b=node.shape==='poly'?node.pts:BASE[node.shape]; const R=node.size*node.t.s, c=Math.cos(node.t.r), s=Math.sin(node.t.r), mx=node.t.fx?-1:1, my=node.t.fy?-1:1;
    out=[{pts:b.map(p=>{ const px=p[0]*mx, py=p[1]*my; return [node.t.x+(px*c-py*s)*R, node.t.y+(px*s+py*c)*R]; }), rank:node.rank, leaf:node.id, mode:node.mode||'solid', alpha:node.alpha!=null?node.alpha:0.55, blend:node.blend||'multiply'}]; }
  else { const sets=node.children.map(evaluate); const def=OPS[node.op]; out=def?def.apply(sets,node.p,node):sets.flat();
    const t=node.t; if(t.s!==1||t.r||t.x||t.y||t.fx||t.fy||node.rank){ const c=centroidOf(out); out=xform(out,{cx:c.x,cy:c.y,s:t.s,r:t.r,dx:t.x,dy:t.y,dr:node.rank,fx:!!t.fx,fy:!!t.fy}); } }
  // the k-space op may legitimately return its stale cache mid-drag; don't pin that as the final value
  if(!(node.kind==='op'&&node.op==='kfilter'&&live.drag)){ node._ev=out; node._evk=key; }
  return out;
}
export function invalidate(node){ walk(node,n=>{ delete n._ev; delete n._evk; delete n._ek; delete n._ck; delete n._cv; }); }
const _unitCache=new WeakMap(); // per child array → tagged copy, so evaluateRoot is also stable when nothing moved
export function evaluateRoot(root){ const t0=performance.now(); const out=[]; for(const ch of root.children){ const S=evaluate(ch); let T=_unitCache.get(S); if(!T){ T=S.map(s=>({...s, unit:ch.id})); _unitCache.set(S,T); } for(const s of T)out.push(s); } perf.lastMs=performance.now()-t0; return out; }
// a source image enters the operad: traced forms under one live Ingest unit (re-trace by changing its params)
export async function ingestImage(url,p,label,maxSide=2048,{trimMargin=false}={}){ const src=await loadImageLuma(url,maxSide,{trimMargin}); const node=makeOp('ingest',traceSource(src,p),p); node.label=label||'source'; node._src=src; try{ node.img=await thumbDataURL(url,Math.max(1400,maxSide||2048)); }catch(err){} return {node,src}; }
export function retrace(node){ if(!node._src)return false; node.children=traceSource(node._src,node.p); return true; }
// flatten: the forgetful map — evaluate a subtree and return equivalent 'poly' atoms
export function flatten(node){ const S=evaluate(node); return S.map(s=>{ const c=centroidOf([s]); const R=Math.max(1,c.r); return {id:uid(), kind:'atom', shape:'poly', pts:s.pts.map(p=>[(p[0]-c.x)/R,(p[1]-c.y)/R]), t:{x:c.x,y:c.y,s:1,r:0}, size:R, rank:s.rank, children:[]}; }); }
export function walk(node,fn,depth=0,parent=null){ fn(node,depth,parent); (node.children||[]).forEach(c=>walk(c,fn,depth+1,node)); }
export function findParent(root,id){ let P=null; walk(root,(n,d,p)=>{ if(n.id===id)P=p; }); return P; }
export function findNode(root,id){ let R=null; walk(root,n=>{ if(n.id===id)R=n; }); return R; }

// ── palette sheaf + SVG ──────────────────────────────────────────────────
const _dCache=new WeakMap(), _dBezCache=new WeakMap(), _bbCache=new WeakMap();
export const pathD=pts=>{
  const useBez=live.bezier!==false&&!live.drag;
  const map=useBez?_dBezCache:_dCache;
  let d=map.get(pts);
  if(!d){
    d=useBez?loopToPath(pts,true):('M'+pts.map(p=>q(p[0])+' '+q(p[1])).join('L')+'Z');
    map.set(pts,d);
  }
  return d;
};
function bboxPts(pts){ let b=_bbCache.get(pts); if(!b){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const p of pts){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1]; } b={x0,y0,x1,y1}; _bbCache.set(pts,b); } return b; }
export const glue=(a,b,m)=>(((a%m)+m)+((b%m)+m)+1)%m;
// solids are glued pairwise (sheaf re-cut); veils are painted above every solid with alpha + blend and are never re-cut.
export function buildPlate(shapes,pal,{recut=true,stroke=0,maxPairs=900,relief=null}={}){
  const m=pal.ramp.length, col=r=>pal.ramp[((r%m)+m)%m];
const order=shapes.map((s,i)=>i).sort((a,b)=>((shapes[a].mode==='veil')?1:0)-((shapes[b].mode==='veil')?1:0));
  // shadow colour is chosen by luminance so depth reads on both grounds: a dark shadow multiplied on a light ground, a light one screened on a dark ground
  const lum=h=>{ const n=parseInt(String(h).slice(1),16); return isNaN(n)?0.5:(0.2126*(n>>16)+0.7152*((n>>8)&255)+0.0722*(n&255))/255; };
  const darkGround=lum(pal.ground)<0.5; const all=pal.ramp.concat([pal.ink]); const darkest=all.slice().sort((a,b)=>lum(a)-lum(b))[0], lightest=all.slice().sort((a,b)=>lum(b)-lum(a))[0];
  const items=order.map(i=>{ const s=shapes[i]; const veil=s.mode==='veil', shadow=s.mode==='shadow'; let fill=col(s.rank), blend=veil?(s.blend||'multiply'):'normal';
    if(shadow){ if(s.shade==='ground'){ fill=darkGround?lightest:darkest; blend='normal'; } else { fill=darkGround?lightest:darkest; blend=(s.blend&&s.blend!=='multiply')?s.blend:(darkGround?'screen':'multiply'); } }
    return {d:pathD(s.pts), fill, i, veil, shadow, op:(veil||shadow)?s.alpha:1, blend, unit:s.unit, leaf:s.leaf}; });
  const clips=[], overs=[]; let capped=false;
  if(recut&&!live.drag){ const sol=items.filter(it=>!it.veil&&!it.shadow); const bb=sol.map(it=>bboxPts(shapes[it.i].pts)); let np=0;
    // grid buckets: O(n) candidate pairs instead of O(n²)
    const cell=Math.max(40,Math.min(plate.W,plate.H)/12), grid=new Map(); const used=new Set();
    for(let j=0;j<sol.length;j++){ const B=bb[j]; const cx0=Math.floor(B.x0/cell),cx1=Math.floor(B.x1/cell),cy0=Math.floor(B.y0/cell),cy1=Math.floor(B.y1/cell);
      for(let gy=cy0;gy<=cy1;gy++)for(let gx=cx0;gx<=cx1;gx++){ const k=gx+','+gy; const bucket=grid.get(k); if(bucket){ for(const i of bucket){ const A=bb[i]; if(A.x1<B.x0||B.x1<A.x0||A.y1<B.y0||B.y1<A.y0)continue; const pk=i*65536+j; if(used.has(pk))continue; used.add(pk);
            if(np>=maxPairs){capped=true;continue;} if(!used.has('c'+i)){ used.add('c'+i); clips.push({id:'c'+sol[i].i,d:sol[i].d}); }
            overs.push({d:sol[j].d, clip:'url(#c'+sol[i].i+')', fill:col(glue(shapes[sol[i].i].rank,shapes[sol[j].i].rank,m))}); np++; } bucket.push(j); } else grid.set(k,[j]); } } }
  const veils=items.filter(it=>it.veil);
  return {items,clips,overs,veils,capped,ground:pal.ground,ink:pal.ink,stroke,relief};
}
export function plateSVG(P){
  const sw=P.stroke?` stroke="${P.ink}" stroke-width="${P.stroke}" stroke-linejoin="round"`:'';
  const solids=P.items.filter(s=>!s.veil);
  const {W,H}=plate; const rel=P.relief&&P.relief.dist>0?P.relief:null; const rf=rel?` filter="url(#relief)"`:'';
  const relDef=rel?`<filter id="relief" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="${q(rel.dx)}" dy="${q(rel.dy)}" stdDeviation="${q(rel.blur)}" flood-color="${P.ink}" flood-opacity="${rel.alpha}"/></filter>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${P.ground}"/><defs>${relDef}${P.clips.map(c=>`<clipPath id="${c.id}"><path d="${c.d}"/></clipPath>`).join('')}</defs>${solids.map(s=>s.shadow?`<path d="${s.d}" fill="${s.fill}" fill-opacity="${s.op}" style="mix-blend-mode:${s.blend}"/>`:`<path d="${s.d}" fill="${s.fill}"${sw}${rf}/>`).join('')}${P.overs.map(o=>`<path d="${o.d}" fill="${o.fill}" clip-path="${o.clip}"/>`).join('')}${P.veils.map(v=>`<path d="${v.d}" fill="${v.fill}" fill-opacity="${v.op}" style="mix-blend-mode:${v.blend}"/>`).join('')}</svg>`;
}

// ── decomposition: convexity split (Hertel–Mehlhorn flavoured) ───────────
function dp(pts,eps){ if(pts.length<5||eps<=0)return pts; const keep=new Uint8Array(pts.length); keep[0]=keep[pts.length-1]=1;
  const rec=(a,b)=>{ let mx=0,mi=-1; const A=pts[a],B=pts[b]; const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy);
    for(let i=a+1;i<b;i++){ const d=L<1e-9?Math.hypot(pts[i][0]-A[0],pts[i][1]-A[1]):Math.abs(dy*pts[i][0]-dx*pts[i][1]+B[0]*A[1]-B[1]*A[0])/L; if(d>mx){mx=d;mi=i;} } if(mx>eps){keep[mi]=1;rec(a,mi);rec(mi,b);} };
  // closed loops (first == last) have no chord to measure against: anchor the farthest point first
  const f=pts[0],l=pts[pts.length-1]; if(Math.hypot(f[0]-l[0],f[1]-l[1])<1e-9){ let mx=-1,mi=1; for(let i=1;i<pts.length-1;i++){ const d=Math.hypot(pts[i][0]-f[0],pts[i][1]-f[1]); if(d>mx){mx=d;mi=i;} } keep[mi]=1; rec(0,mi); rec(mi,pts.length-1); }
  else rec(0,pts.length-1);
  return pts.filter((p,i)=>keep[i]); }
function segX(a,b,c,d){ const o=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]); const o1=o(a,b,c),o2=o(a,b,d),o3=o(c,d,a),o4=o(c,d,b); return (o1*o2<0)&&(o3*o4<0); }
function pip(pt,poly){ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i],b=poly[j]; if(((a[1]>pt[1])!==(b[1]>pt[1]))&&(pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1]+1e-12)+a[0]))c=!c; } return c; }
function reflexSet(poly){ const n=poly.length, sgn=area(poly)>0?1:-1, out=[]; for(let i=0;i<n;i++){ const p=poly[(i+n-1)%n],q=poly[i],r=poly[(i+1)%n]; const cr=(q[0]-p[0])*(r[1]-q[1])-(q[1]-p[1])*(r[0]-q[0]); if(cr*sgn<-1e-9)out.push(i); } return out; }
export function convexSplit(pts,eps=2.5,maxParts=12){
  let poly=dp(pts.concat([pts[0]]),eps); poly=poly.slice(0,-1); if(poly.length<4)return [pts];
  const parts=[], queue=[poly];
  while(queue.length&&parts.length+queue.length<maxParts){ const P=queue.shift(); const R=reflexSet(P); if(!R.length||P.length<4){parts.push(P);continue;}
    let best=null; const n=P.length;
    for(const i of R){ for(let j=0;j<n;j++){ if(j===i||j===(i+1)%n||j===(i+n-1)%n)continue; const a=P[i],b=P[j]; let ok=true;
        for(let k=0;k<n&&ok;k++){ const c=P[k],d=P[(k+1)%n]; if(k===i||(k+1)%n===i||k===j||(k+1)%n===j)continue; if(segX(a,b,c,d))ok=false; }
        if(!ok||!pip([(a[0]+b[0])/2,(a[1]+b[1])/2],P))continue;
        const L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(!best||L<best.L)best={i,j,L}; } }
    if(!best){parts.push(P);continue;}
    const {i,j}=best, lo=Math.min(i,j), hi=Math.max(i,j); const A=P.slice(lo,hi+1), B=P.slice(hi).concat(P.slice(0,lo+1));
    if(Math.abs(area(A))<4||Math.abs(area(B))<4){parts.push(P);continue;} queue.push(A,B); }
  return parts.concat(queue);
}

// ── ingest: luma source → traced poly atoms, fitted to the plate ──────────
// returns a tree: nest ? ingest(group(band₀…), group(band₁…), …) : ingest(atoms…)
export function traceSource(src,p,cap){
  const cfg=Object.assign({},OPS.ingest.defaults,p||{});
  const gridMax=Math.max(200,cfg.grid||1200), maxForms=Math.max(20,cap||cfg.cap||240), useSubpixel=cfg.subpixel!==0;
  const long=Math.max(src.w,src.h), ds=Math.max(1,Math.ceil(long/gridMax)), w=Math.floor(src.w/ds), h=Math.floor(src.h/ds), lum=new Float32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ let a=0; for(let yy=0;yy<ds;yy++)for(let xx=0;xx<ds;xx++)a+=src.luma[(y*ds+yy)*src.w+(x*ds+xx)]; lum[y*w+x]=a/(ds*ds); }
  let pct=null; if(cfg.adapt>0){ const hist=new Float64Array(256); for(let i=0;i<w*h;i++){ const v=cfg.invert?1-lum[i]:lum[i]; hist[Math.max(0,Math.min(255,v*255|0))]++; } let cum=0; const cdf=new Float64Array(256); for(let i=0;i<256;i++){cum+=hist[i];cdf[i]=cum/(w*h);} pct=u=>{ let i=0; while(i<255&&cdf[i]<u)i++; return (i+0.5)/256; }; }
  const {W,H}=plate, L=Math.max(2,Math.min(8,cfg.levels|0)), s=Math.min(W/w,H/h), ox=(W-w*s)/2, oy=(H-h*s)/2, minA=(cfg.minArea/100)*W*H/(s*s);
  const valAt=(x,y)=>{ const cx=Math.max(0,Math.min(w-1,x)), cy=Math.max(0,Math.min(h-1,y)); const v=lum[cy*w+cx]; return cfg.invert?1-v:v; };
  const bands=[];
  for(let r=0;r<L-1;r++){ const u=(r+1)/L, iso=pct?u*(1-cfg.adapt)+pct(u)*cfg.adapt:u; const inside=(x,y)=>(x<0||y<0||x>=w||y>=h)?0:(valAt(x,y)<iso?1:0);
    const loops=traceMask(inside,w,h,valAt,iso,useSubpixel).map(lp=>({lp,a:Math.abs(area(lp))})).filter(o=>o.a>=minA).sort((a,b)=>b.a-a.a);
    const epsGrid=cfg.eps*(Math.max(w,h)/800);
    bands.push(loops.map(o=>{ let lp=o.lp; if(epsGrid>0)lp=dp(lp.concat([lp[0]]),epsGrid).slice(0,-1); return {pts:lp.map(q=>[ox+(q[0]+0.5)*s,oy+(q[1]+0.5)*s]),a:o.a*s*s,rank:r}; })); }
  let total=bands.reduce((n,b)=>n+b.length,0); // cap: drop the smallest forms first
  if(total>maxForms){ const all=bands.flat().sort((a,b)=>a.a-b.a); const drop=new Set(all.slice(0,total-maxForms)); bands.forEach((b,i)=>bands[i]=b.filter(f=>!drop.has(f))); }
  const toAtom=f=>{ const nPts=Math.min(384,Math.max(M,f.pts.length)); const pts=resample(f.pts,nPts); const c=centroidOf([{pts}]); const R=Math.max(1,c.r); return {id:uid(),kind:'atom',shape:'poly',pts:pts.map(q=>[(q[0]-c.x)/R,(q[1]-c.y)/R]),t:{x:c.x,y:c.y,s:1,r:0},size:R,rank:f.rank,children:[]}; };
  const children=cfg.nest?bands.filter(b=>b.length).map(b=>Object.assign(makeOp('group',b.map(toAtom)),{label:'band '+b[0].rank})):bands.flat().map(toAtom);
  return children;
}

// ── k-space of the whole plate (on demand) ───────────────────────────────
export function plateSpectrum(shapes,pal,N=256){
  const cv=document.createElement('canvas'); cv.width=cv.height=N; const x=cv.getContext('2d'); const {W,H}=plate, sc=N/Math.max(W,H);
  x.fillStyle=pal.ground; x.fillRect(0,0,N,N); const m=pal.ramp.length; x.translate((N-W*sc)/2,(N-H*sc)/2); // letter-box so β/D compare across formats
  for(const s of shapes){ const veil=!!s.mode&&s.mode!=='solid'; x.globalAlpha=veil?(s.alpha||0.5):1; x.globalCompositeOperation=veil&&s.blend&&s.blend!=='normal'?s.blend:'source-over'; x.fillStyle=pal.ramp[((s.rank%m)+m)%m]; x.beginPath(); s.pts.forEach((p,i)=>x[i?'lineTo':'moveTo'](p[0]*sc,p[1]*sc)); x.closePath(); x.fill(); }
  x.globalAlpha=1; x.globalCompositeOperation='source-over';
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
export function invertGround(pal){ const lum=h=>{ const n=parseInt(h.slice(1),16); return (0.2126*(n>>16)+0.7152*((n>>8)&255)+0.0722*(n&255))/255; }; const dark=lum(pal.ground)<0.5; const cand=pal.ramp.slice().sort((a,b)=>lum(a)-lum(b)); const g=dark?cand[cand.length-1]:cand[0]; return {...pal, label:pal.label+(dark?' · light':' · dark'), ground:g, ramp:pal.ramp.filter(c=>c!==g).concat([pal.ground])}; }
// ── the composition file (.orpheum.json): tree + frame + palette + sources, and the SVG as a courtesy copy ──
export function serialize(root,{format,palKey,imgPals}={}){
  const tree=JSON.parse(JSON.stringify(root,(k,v)=>k[0]==='_'?undefined:v));
  const seen=new Map(), pals=[]; let pk=palKey;
  (imgPals||[]).forEach((p,idx)=>{ if(!p||!p.ramp)return; const sig=`${p.ground}|${p.ink}|${p.ramp.join(',')}`; let ti=seen.get(sig); if(ti==null){ ti=pals.length; pals.push(p); seen.set(sig,ti); } if(palKey==='img:'+idx)pk='img:'+ti; });
  return JSON.stringify({kind:'orpheum', version:3, saved:new Date().toISOString(), plate:{W:plate.W,H:plate.H}, format, palKey:pk, imgPals:pals, root:tree},null,0);
}
// restores the tree; re-derives Ingest sources from the data URL kept on each node (node.img)
export async function deserialize(json,maxSide=2048){
  let raw=json;
  if(typeof raw==='string'&&raw.length>5*1024*1024&&raw.includes('"svg":"<svg'))raw=raw.replace(/,\s*"svg"\s*:\s*"<svg[\s\S]*?<\/svg>"\s*(?=\})\s*$/,'');
  const d=typeof raw==='string'?JSON.parse(raw):raw; if(!d||d.kind!=='orpheum'||!d.root)throw new Error('not an Orpheum composition');
  delete d.svg;
  if(d.plate)setPlate(d.plate.W,d.plate.H);
  const jobs=[]; walk(d.root,n=>{ if(n.kind==='op'&&n.op==='ingest'&&n.img)jobs.push(loadImageLuma(n.img,maxSide).then(src=>{n._src=src;}).catch(()=>{})); });
  await Promise.all(jobs);
  // ids must stay unique against anything already on the plate
  walk(d.root,n=>{ if(n.id!=='root')n.id=uid(); });
  return d;
}
export function thumbDataURL(url,max=640){ return new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>{ const s=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)); const c=document.createElement('canvas'); c.width=Math.max(2,Math.round(im.naturalWidth*s)); c.height=Math.max(2,Math.round(im.naturalHeight*s)); c.getContext('2d').drawImage(im,0,0,c.width,c.height); res(c.toDataURL('image/jpeg',0.86)); }; im.onerror=()=>rej(new Error('image load failed')); im.src=url; }); }
// ── streaming print PNG: memory bounded to one strip (longPx × 256 px) instead of the whole image ──
function crc32(b){ let c,t=crc32.t; if(!t){ t=crc32.t=new Uint32Array(256); for(let n=0;n<256;n++){ c=n; for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1; t[n]=c>>>0; } } c=0xffffffff; for(let i=0;i<b.length;i++)c=t[(c^b[i])&255]^(c>>>8); return (c^0xffffffff)>>>0; }
function chunk(type,data){ const out=new Uint8Array(12+data.length), dv=new DataView(out.buffer); dv.setUint32(0,data.length); for(let i=0;i<4;i++)out[4+i]=type.charCodeAt(i); out.set(data,8); const crcBuf=new Uint8Array(4+data.length); crcBuf.set(out.subarray(4,8)); crcBuf.set(data,4); dv.setUint32(8+data.length,crc32(crcBuf)); return out; }
function loadSVGImg(svg){ return new Promise((res,rej)=>{ const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})); const im=new Image(); im.onload=()=>res({im,url}); im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('SVG raster failed'));}; im.src=url; }); }
export async function renderPrintPNGStream(svgStr,W,H,longPx,dpi,onProgress){
  if(typeof CompressionStream==='undefined')return renderPrintPNG(svgStr,W,H,longPx,dpi,onProgress);
  const m=svgStr.match(/^[\s\S]*?<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/); const body=m?m[1]:svgStr;
  const s=longPx/Math.max(W,H), tw=Math.round(W*s), th=Math.round(H*s), STRIP=256, TILE=2048, strips=Math.ceil(th/STRIP);
  const cv=document.createElement('canvas'); cv.width=tw; cv.height=STRIP; const x=cv.getContext('2d',{willReadFrequently:true}); x.imageSmoothingEnabled=false;
  const cs=new CompressionStream('deflate'); const wr=cs.writable.getWriter(); const parts=[]; const reader=cs.readable.getReader(); const pump=(async()=>{ for(;;){ const {value,done}=await reader.read(); if(done)break; parts.push(value); } })();
  const row=new Uint8Array(1+tw*4);
  for(let sIdx=0;sIdx<strips;sIdx++){ const y0=sIdx*STRIP, h=Math.min(STRIP,th-y0); x.clearRect(0,0,tw,STRIP);
    for(let cx=0;cx<tw;cx+=TILE){ const w=Math.min(TILE,tw-cx); const tile=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${cx} ${y0} ${w} ${h}"><g transform="scale(${s})">${body}</g></svg>`; const {im,url}=await loadSVGImg(tile); x.drawImage(im,cx,0,w,h); URL.revokeObjectURL(url); }
    const d=x.getImageData(0,0,tw,h).data;
    for(let yy=0;yy<h;yy++){ row[0]=0; row.set(d.subarray(yy*tw*4,(yy+1)*tw*4),1); await wr.write(row.slice()); }
    if(onProgress)onProgress(sIdx+1,strips); await new Promise(z=>setTimeout(z,0)); }
  await wr.close(); await pump; cv.width=cv.height=0;
  const ihdr=new Uint8Array(13), dv=new DataView(ihdr.buffer); dv.setUint32(0,tw); dv.setUint32(4,th); ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  const ppm=Math.round(dpi/0.0254), phys=new Uint8Array(9), pv=new DataView(phys.buffer); pv.setUint32(0,ppm); pv.setUint32(4,ppm); phys[8]=1;
  let zlen=0; for(const p of parts)zlen+=p.length; const z=new Uint8Array(zlen); let o=0; for(const p of parts){ z.set(p,o); o+=p.length; }
  return new Blob([new Uint8Array([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('pHYs',phys),chunk('IDAT',z),chunk('IEND',new Uint8Array(0))],{type:'image/png'});
}
export function download(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
