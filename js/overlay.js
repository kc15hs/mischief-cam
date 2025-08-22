
// Overlay images (ghost hand, haze, shadow)
export const overlays = {};

export async function preloadOverlay(src){
  if(overlays[src]) return overlays[src];
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  await img.decode().catch(()=>{});
  overlays[src] = img;
  return img;
}

export async function drawOverlays(ctx, vw, vh, params){
  const list = params.overlay_images || [];
  const alpha = params.overlay_opacity ?? 0.3;
  const blur = params.overlay_blur ?? 12;

  ctx.save();
  for(const src of list){
    const img = await preloadOverlay(src);
    if(!img || !img.width) continue;
    // place as background-sized cover with small offset
    const scale = Math.max(vw / img.width, vh / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (vw - w) * 0.5;
    const y = (vh - h) * 0.5;

    ctx.globalAlpha = alpha;
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(img, x, y, w, h);
  }
  ctx.restore();
}
