
import { listPresets, getPreset, getDefaultPreset, applyTextOverride, exportCurrentAsJson } from './params.js';

let onPresetChangeCb = ()=>{};
let currentPresetName = null;
let currentParams = {};

export function initUI(){
  const sel = document.getElementById('presetSelect');
  sel.innerHTML = '';
  for(const name of listPresets()){
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    sel.appendChild(opt);
  }
  currentPresetName = getDefaultPreset();
  sel.value = currentPresetName;
  currentParams = getPreset(currentPresetName);
  onPresetChangeCb(currentPresetName, currentParams);

  sel.addEventListener('change', ()=>{
    currentPresetName = sel.value;
    currentParams = getPreset(currentPresetName);
    onPresetChangeCb(currentPresetName, currentParams);
    localStorage.setItem('lastPreset', currentPresetName);
  });

  document.getElementById('randBtn').addEventListener('click', ()=>{
    const names = listPresets();
    const rnd = names[Math.floor(Math.random()*names.length)];
    currentPresetName = rnd; sel.value = rnd;
    currentParams = getPreset(rnd);
    onPresetChangeCb(currentPresetName, currentParams);
    localStorage.setItem('lastPreset', currentPresetName);
  });

  document.getElementById('applyTextBtn').addEventListener('click', ()=>{
    const txt = document.getElementById('paramText').value;
    const merged = applyTextOverride(getPreset(currentPresetName), txt);
    currentParams = merged;
    onPresetChangeCb(currentPresetName, currentParams);
  });

  document.getElementById('exportParamsBtn').addEventListener('click', ()=>{
    exportCurrentAsJson(currentPresetName, currentParams);
  });
}

export function onPresetChange(cb){ onPresetChangeCb = cb; }

export function getCurrentPreset(){ return { name: currentPresetName, params: currentParams }; }

export function setParamsDirect(p){ currentParams = p; onPresetChangeCb(currentPresetName, currentParams); }
