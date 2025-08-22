
// Draw makeup based on a subset of FaceMesh landmarks
import { hexToRgba, drawPath } from './utils.js';

// Landmark shortcuts by index (subset)
const IDS = {
  leftEye:    { left:33, right:133, top:159, bottom:145 },
  rightEye:   { left:362, right:263, top:386, bottom:374 },
  mouth:      { left:61, right:291, top:13, bottom:14 },
  nose:       1
};

export function drawMakeup(ctx, lm, vw, vh, params){
  if(!lm || lm.length < 400) return;

  // Compute key points (pixel space)
  const p = (i) => ({ x: lm[i].x * vw, y: lm[i].y * vh });

  const LE = {
    L: p(IDS.leftEye.left), R: p(IDS.leftEye.right),
    T: p(IDS.leftEye.top),  B: p(IDS.leftEye.bottom)
  };
  const RE = {
    L: p(IDS.rightEye.left), R: p(IDS.rightEye.right),
    T: p(IDS.rightEye.top),  B: p(IDS.rightEye.bottom)
  };
  const mouth = {
    L: p(IDS.mouth.left), R: p(IDS.mouth.right),
    T: p(IDS.mouth.top),  B: p(IDS.mouth.bottom)
  };

  // Eyebrows (simple quads above each eye)
  drawEyebrow(ctx, LE, params, true);
  drawEyebrow(ctx, RE, params, false);

  // Eyeshadow
  drawEyeshadow(ctx, LE, params);
  drawEyeshadow(ctx, RE, params);

  // Blush (cheeks at side of mouth/eyes)
  drawBlush(ctx, LE, RE, params);

  // Lips (ellipse-ish using mouth center)
  drawLips(ctx, mouth, params);
}

function drawEyebrow(ctx, eye, params, isLeft){
  const w = (eye.R.x - eye.L.x);
  const h = (eye.B.y - eye.T.y);
  const thickness = params.brow_thickness ?? 0.8; // 0-1
  const angle = (params.brow_angle ?? 10) * Math.PI/180;

  // Base position above eye
  const cx = (eye.L.x + eye.R.x)/2;
  const cy = eye.T.y - h*1.2;

  const len = w * 1.4;
  const t = Math.max(4, h * (0.8 + 1.2*thickness));
  const dx = Math.cos(angle) * (len/2) * (isLeft ? 1 : -1);
  const dy = Math.sin(angle) * (len/2);

  const p1 = {x: cx - dx, y: cy - dy};
  const p2 = {x: cx + dx, y: cy + dy};

  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(20,20,20,0.98)';
  ctx.lineWidth = t;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.restore();
}

function drawEyeshadow(ctx, eye, params){
  const w = (eye.R.x - eye.L.x);
  const h = (eye.B.y - eye.T.y);
  const cx = (eye.L.x + eye.R.x)/2;
  const cy = (eye.T.y + eye.B.y)/2;
  const intensity = params.eyeshadow_intensity ?? 0.8;
  const color = params.eyeshadow_color || '#4a78ff';

  ctx.save();
  ctx.filter = `blur(${Math.max(2,h*0.7)}px)`;
  ctx.fillStyle = hexToRgba(color, 0.35 * intensity);
  ctx.beginPath();
  ctx.ellipse(cx, cy - h*0.6, w*0.9, h*0.9, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawBlush(ctx, LE, RE, params){
  const intensity = params.blush_intensity ?? 1.0;
  if(intensity <= 0) return;
  const leftCx = LE.L.x - (LE.R.x-LE.L.x)*0.3;
  const rightCx = RE.R.x + (RE.R.x-RE.L.x)*0.3;
  const cy = (LE.B.y + RE.B.y)/2 + (LE.B.y-LE.T.y)*0.8;
  const r = (LE.R.x-LE.L.x) * 0.9;

  ctx.save();
  ctx.filter = 'blur(16px)';
  ctx.fillStyle = 'rgba(255,60,60,' + (0.18*intensity) + ')';
  ctx.beginPath(); ctx.ellipse(leftCx, cy, r, r*0.8, 0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(rightCx, cy, r, r*0.8, 0,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawLips(ctx, mouth, params){
  const cx = (mouth.L.x + mouth.R.x)/2;
  const cy = (mouth.T.y + mouth.B.y)/2;
  const w = (mouth.R.x - mouth.L.x);
  const h = (mouth.B.y - mouth.T.y);
  const over = params.lip_overdraw_px ?? 10;
  const color = params.lip_color || '#c4002b';

  ctx.save();
  ctx.filter = 'blur(2px)';
  ctx.fillStyle = hexToRgba(color, 0.9);
  ctx.beginPath();
  ctx.ellipse(cx, cy, w*0.55 + over, h*0.9 + over*0.3, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}
