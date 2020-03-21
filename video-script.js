const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

// video.addEventListener('play',async  () => {
//   let image
//   let canvas 
//   if (image) image.remove()
//   if (canvas) canvas.remove()
//   canvas = faceapi.createCanvasFromMedia(video)
//   document.body.append(canvas)
//   const labeledFaceDescriptors = await loadLabeledImages()
//   const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
//   document.body.append('Loaded')
//   const displaySize = { width: video.width, height: video.height }
// //  faceapi.matchDimensions(canvas, displaySize)

//  // console.log(displaySize)
//   setInterval(async () => {
   
//     const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
//     console.log(detections.length)   
//     const resizedDetections = faceapi.resizeResults(detections, displaySize)
//     const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
//     canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
//    // faceapi.draw.drawDetections(canvas, resizedDetections)
//    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
//   //  faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
//     results.forEach((result, i) => {
//       const box = resizedDetections[i].detection.box
//       const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
//       drawBox.draw(canvas)
//     })
//   }, 100)
// })

video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
  const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
  const resizedDetections = faceapi.resizeResults(detections, displaySize)
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  if(resizedDetections.length>0){ // check if there is any detection..if there is then...length is >0 
  const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
  results.forEach((result, i) => {
  const box = resizedDetections[i].detection.box
  const drawBox = new faceapi.draw.DrawBox(box, { label: result.label.toString() })
  drawBox.draw(canvas)
  })
  }
  
  // faceapi.draw.drawDetections(canvas, resizedDetections)
  // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
  })


function loadLabeledImages() 
{
  const labels = ['Min','Phyu','Khant','Kaung']
  return Promise.all(
    labels.map(async label=> {
      const descriptions  = []
      for ( let i = 1 ; i < 2 ; i++)
      {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/phyu007/face-recog/master/labeled_images/${label}/${i}.PNG`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)

      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

