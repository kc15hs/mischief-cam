
import { loadParams } from './params.js';
import { initUI, onPresetChange, getCurrentPreset, setParamsDirect } from './ui.js';
import { initFaceMesh, setFacingMode } from './face.js';
import { drawMakeup } from './filters.js';
import { drawOverlays } from './overlay.js';

const video = document.getElementById('videoIn');
const canvas = document.getElementById('canvasOut');
const ctx = canvas.getContext('2d');

const mirrorChk = document.getElementById('mirrorChk');
const captureBtn = document.getElementById('captureBtn');
const flipBtn = document.getElementById('flipBtn');
const reloadParamsBtn = document.getElementById('reloadParamsBtn');
const paramsFileInput = document.getElementById('paramsFile');

let lastLandmarks = null;
let vw = 0, vh = 0;

async function boot(){
  await loadParams();
  initUI();
  onPresetChange((_name, params)=>{ /* force redraw */ });

  mirrorChk.addEventListener('change',()=>{});

  // Load external params.json
  paramsFileInput.addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(file){
      await loadParams(file);
      initUI(); // repopulate presets
    }
  });

  reloadParamsBtn.addEventListener('click', async ()=>{
    await loadParams('params.json');
    initUI();
  });

  flipBtn.addEventListener('click', async ()=>{
    const mode = flipBtn.dataset.mode === 'user' ? 'environment' : 'user';
    flipBtn.dataset.mode = mode;
    setFacingMode(mode);
    await initFaceMesh(video, onResults);
  });

  captureBtn.addEventListener('click', ()=>{
    const link = document.createElement('a');
    const { name } = getCurrentPreset();
    const ts = new Date().toISOString().replace(/[:.]/g,'').replace('T','_').slice(0,15);
    link.download = `${ts}_${name}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  });

  await initFaceMesh(video, onResults);
  requestAnimationFrame(loop);
}

function onResults(res){
  lastLandmarks = res.multiFaceLandmarks?.[0] || null;
}

function loop(){
  if(video.videoWidth && video.videoHeight){
    const w = video.videoWidth, h = video.videoHeight;
    // Fit canvas to element box
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    vw = canvas.width; vh = canvas.height;

    // Draw camera frame (mirrored optionally)
    ctx.save();
    if(mirrorChk.checked) {
      ctx.translate(vw, 0); ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, vw, vh);
    ctx.restore();

    // Draw overlays background first (ghost haze etc)
    const { params } = getCurrentPreset();
    drawOverlays(ctx, vw, vh, params);

    // Makeup based on landmarks
    if(lastLandmarks){
      // scale landmarks to canvas size
      const lm = lastLandmarks.map(pt => ({
        x: mirrorChk.checked ? (1-pt.x) : pt.x,
        y: pt.y, z: pt.z
      }));
      drawMakeup(ctx, lm, vw, vh, params);
    }
  }
  requestAnimationFrame(loop);
}

// Start
boot();
