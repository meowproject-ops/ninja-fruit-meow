const videoElement = document.getElementById('input_video');
const faceElement = document.querySelector('.face');
const pupils = document.querySelectorAll('.pupil');

let curX = 0, curY = 0;

function onResults(results) {
  if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) return;

  const landmarks = results.multiFaceLandmarks[0];
  const nose = landmarks[4]; // Nose tip for tracking
  
  // 1. SMOOTH TRACKING
  // Calculate target position based on where you are in the camera
  const targetX = (0.5 - nose.x) * 100;
  const targetY = (nose.y - 0.5) * 100;
  
  // Smoothly move the pupils (LERP)
  curX += (targetX - curX) * 0.1;
  curY += (targetY - curY) * 0.1;
  
  pupils.forEach(p => {
    p.style.transform = `translate(${curX}px, ${curY}px)`;
  });

  // 2. AUTOMATIC EMOTIONS
  const topLip = landmarks[13].y;
  const bottomLip = landmarks[14].y;
  const mouthWidth = Math.abs(landmarks[61].x - landmarks[291].x);

  // Clear previous emotion
  faceElement.className = "face";

  if (mouthWidth > 0.18) {
    faceElement.classList.add("happy"); // You Smile = Robot Happy
  } else if (topLip - landmarks[10].y < 0.05) {
    faceElement.classList.add("angry"); // Brows down = Robot Mad
  }
}

// Setup MediaPipe
const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => { await faceMesh.send({image: videoElement}); },
  width: 640, height: 480
});
camera.start();

// Simple Auto-Blink Logic
setInterval(() => {
  document.querySelectorAll('.eyelid.upper').forEach(e => e.style.top = "0%");
  setTimeout(() => {
    document.querySelectorAll('.eyelid.upper').forEach(e => e.style.top = "-100%");
  }, 150);
}, 4000);
