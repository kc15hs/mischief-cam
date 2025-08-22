
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b-a)*t;
export const dist = (p, q) => Math.hypot(p.x-q.x, p.y-q.y);

export function hexToRgba(hex, a=1){
  if(!hex) return `rgba(255,0,0,${a})`;
  let h = hex.replace('#','');
  if(h.length===3){h = h.split('').map(c=>c+c).join('')}
  const n = parseInt(h,16);
  const r = (n>>16)&255, g=(n>>8)&255, b=n&255;
  return `rgba(${r},${g},${b},${a})`;
}

export function drawPath(ctx, pts, close=true){
  if(!pts?.length) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y);
  if(close) ctx.closePath();
}
