const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


function pauseVid()
{
  video.pause();
  console.log("end of detecting!")

}



video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
  const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withAgeAndGender().withFaceExpressions().withFaceDescriptors();
  const resizedDetections = faceapi.resizeResults(detections, displaySize)
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  if(resizedDetections.length>0){ // check if there is any detection..if there is then...length is >0 
  const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
  results.forEach((result, i) => {
  const box = resizedDetections[i].detection.box
  const age =  Math.round(resizedDetections[i].age)
  const gender = resizedDetections[i].gender
  const express = resizedDetections[i].expressions[i]
  const drawBox = new faceapi.draw.DrawBox(box, { label: result.label.toString() +  age + " year old " + gender  })
  drawBox.draw(canvas)
  faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  

  
  console.log(result.label.toString())
  })
  }
  
  }, 100)

  


  })


// video.addEventListener('play', async () => {
//     const canvas = faceapi.createCanvasFromMedia(video)
//     document.body.append(canvas)
//     const labeledFaceDescriptors = await loadLabeledImages()
//     const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
//     const displaySize = { width: video.width, height: video.height }
//     faceapi.matchDimensions(canvas, displaySize)
    

//     const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withAgeAndGender().withFaceExpressions().withFaceDescriptors();
//     const resizedDetections = faceapi.resizeResults(detections, displaySize)
//     canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
//     if(resizedDetections.length>0){ // check if there is any detection..if there is then...length is >0 
//     const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
//     results.forEach((result, i) => {
//     const box = resizedDetections[i].detection.box
//     const age =  Math.round(resizedDetections[i].age)
//     const gender = resizedDetections[i].gender
//     const express = resizedDetections[i].expressions[i]
//     const drawBox = new faceapi.draw.DrawBox(box, { label: result.label.toString() +  age + " year old " + gender  })
//     drawBox.draw(canvas)
//     faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    
//     auth = result.label.toString()
    
//     console.log(result.label.toString())
//     })
//     }


    
//    if (auth != undefined)
//    {
//      alert('Not authorized!')
//    }
//    else
//    {
//      alert('Welcome!')
//    }

   
  
    
  
  
//     })


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

