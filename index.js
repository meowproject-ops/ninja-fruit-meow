const videoElement = document.getElementById('webcam');
const pupils = document.querySelectorAll('.pupil');

function onResults(results) {
  if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
    const face = results.multiFaceLandmarks[0];
    
    // Landmark 4 is the nose tip
    const nose = face[4];
    
    // Convert nose position to pupil movement
    // nose.x is 0 to 1. We want to move pupil -40px to 40px
    const xMove = (0.5 - nose.x) * 100;
    const yMove = (nose.y - 0.5) * 100;

    pupils.forEach(pupil => {
      pupil.style.transform = `translate(${xMove}px, ${yMove}px)`;
    });

    // Detect Smile (Distance between lip corners)
    const mouthLeft = face[61];
    const mouthRight = face[291];
    const smileWidth = Math.abs(mouthLeft.x - mouthRight.x);
    
    if (smileWidth > 0.15) {
       document.documentElement.style.setProperty('--eye-color', '#ff00ff'); // Happy pink!
    }
  }
}

const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => { await faceMesh.send({image: videoElement}); },
  width: 640, height: 480
});
camera.start();
