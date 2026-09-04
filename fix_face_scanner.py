with open('admin.html', 'r') as f:
    html = f.read()

# Replace detection line
old_det = "const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();"
new_det = "const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.2 })).withFaceLandmarks().withFaceDescriptors();"
html = html.replace(old_det, new_det)

# Replace interval dimension update
old_resize = "const resizedDetections = faceapi.resizeResults(detections, displaySize);"
new_resize = """const ds = { width: video.videoWidth || video.clientWidth || 320, height: video.videoHeight || video.clientHeight || 240 };
          faceapi.matchDimensions(canvas, ds);
          const resizedDetections = faceapi.resizeResults(detections, ds);"""
html = html.replace(old_resize, new_resize)

with open('admin.html', 'w') as f:
    f.write(html)
