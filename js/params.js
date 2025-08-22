
import { clamp } from './utils.js';

let store = {
  version: 1, presets: {}, default_preset: 'tiktok_mischief'
};

export async function loadParams(urlOrFile='params.json'){
  try{
    if(typeof urlOrFile === 'string'){
      const res = await fetch(urlOrFile,{cache:'no-store'});
      store = await res.json();
    }else{
      const text = await urlOrFile.text();
      store = JSON.parse(text);
    }
    validate();
    return store;
  }catch(e){
    console.error('params.json 読込エラー', e);
    return store;
  }
}

export function listPresets(){
  return Object.keys(store.presets||{});
}

export function getPreset(name){
  return structuredClone(store.presets?.[name] || {});
}

export function getDefaultPreset(){
  const q = new URLSearchParams(location.search);
  const byQ = q.get('preset');
  if(byQ && store.presets?.[byQ]) return byQ;
  return store.default_preset || listPresets()[0];
}

export function applyTextOverride(base, text){
  if(!text?.trim()) return base;
  let overrides = {};
  try{
    if(text.trim().startsWith('{')){
      overrides = JSON.parse(text);
    }else{
      text.split(';').forEach(kv=>{
        kv = kv.trim(); if(!kv) return;
        const [k, v] = kv.split('=');
        if(!k) return;
        let val = v;
        if(!isNaN(parseFloat(v))) val = parseFloat(v);
        overrides[k.trim()] = val;
      });
    }
  }catch(e){ console.warn('上書きテキスト解析に失敗', e); }
  return Object.assign({}, base, overrides);
}

function validate(){
  for(const [name, p] of Object.entries(store.presets||{})){
    p.brow_thickness = clamp(p.brow_thickness ?? 0.8, 0, 1);
    p.brow_angle = clamp(p.brow_angle ?? 10, -30, 30);
    p.lip_overdraw_px = clamp(p.lip_overdraw_px ?? 10, 0, 30);
    p.eyeshadow_intensity = clamp(p.eyeshadow_intensity ?? 0.8, 0, 1);
    p.blush_intensity = clamp(p.blush_intensity ?? 1.0, 0, 2);
    p.noise_level = clamp(p.noise_level ?? 0.2, 0, 1);
    p.overlay_opacity = clamp(p.overlay_opacity ?? 0.3, 0, 1);
    p.overlay_blur = clamp(p.overlay_blur ?? 12, 0, 40);
  }
}

export function exportCurrentAsJson(name, params){
  const out = { version: 1, presets: { [name]: params }, default_preset: name };
  const blob = new Blob([JSON.stringify(out, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: `${name}.json`});
  a.click();
  URL.revokeObjectURL(url);
}

