
// Simple FaceMesh wrapper using MediaPipe globals
// Exports: initFaceMesh(videoEl, onResults), setFacingMode(mode)

let camera = null;
let faceMesh = null;
let facingMode = 'user'; // 'user' or 'environment'

export function setFacingMode(m){ facingMode = m; }

export async function initFaceMesh(videoEl, onResults){
  const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  if(!hasMedia){ alert('カメラが使えません'); return; }

  // Set constraints
  const constraints = { audio:false, video: { facingMode, width: {ideal: 1280}, height: {ideal: 720} } };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoEl.srcObject = stream;
  await videoEl.play();

  faceMesh = new FaceMesh.FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  faceMesh.onResults(onResults);

  // Camera frame loop
  if(camera){ camera.stop(); camera = null; }
  camera = new Camera(videoEl, {
    onFrame: async () => { await faceMesh.send({image: videoEl}); },
    width: 1280, height: 720
  });
  camera.start();
}

