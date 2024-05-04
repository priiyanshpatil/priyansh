const video = document.getElementById("video");

// Password check function
function checkPassword() {
  const password = prompt("Enter password:");
  return password === "123";
}

// Check password before starting the webcam
if (checkPassword()) {
  Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  ]).then(startWebcam);
} else {
  alert("Incorrect password. Camera not accessible.");
}

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

function getLabeledFaceDescriptions() {
  const labels = ["lakxhit", "ronaldo", "travis"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.png`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    });

    
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvas);

      // Display welcome message or unknown user message
      const label = result.toString();
      if (label.includes("unknown")) {
        showAlert("USER DOESN'T EXIST");
      } else {
        const recognizedUser = label.split(" ")[0];
        showAlert(`WELCOME ${recognizedUser}`);
        setTimeout(() => {
        window.location.href = "nextpage.html"; 
        }, 3000);      }
    });
  }, 100);
});

  
function setCookie(name, value, days) {
  let expires = '';
  if (days) {
      let d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${d.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}

function showAlert(message) {
  alert(message);
}