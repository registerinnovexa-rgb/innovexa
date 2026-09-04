with open('admin.html', 'r') as f:
    html = f.read()

# Make the photo and signature logic ultra-robust
old_logic = """      // Handle Photo & Signature
      const photoImg = document.getElementById('detailPhoto');
      const photoPlace = document.getElementById('detailPhotoPlaceholder');
      if (prof.photoUrl) {
        photoImg.src = prof.photoUrl;
        photoImg.style.display = 'block';
        photoPlace.style.display = 'none';
      } else {
        photoImg.style.display = 'none';
        photoPlace.style.display = 'block';
      }

      const sigImg = document.getElementById('detailSignature');
      const sigPlace = document.getElementById('detailSigPlaceholder');
      if (prof.signature) {
        sigImg.src = prof.signature;
        sigImg.style.display = 'block';
        sigPlace.style.display = 'none';
      } else {
        sigImg.style.display = 'none';
        sigPlace.style.display = 'block';
      }"""

new_logic = """      // Handle Photo & Signature Robustly
      const photoImg = document.getElementById('detailPhoto');
      const photoPlace = document.getElementById('detailPhotoPlaceholder');
      const pUrl = prof.photoUrl || prof.photo;
      if (pUrl && pUrl.length > 50) {
        photoImg.setAttribute('src', pUrl);
        photoImg.style.display = 'block';
        photoPlace.style.display = 'none';
      } else {
        photoImg.style.display = 'none';
        photoPlace.style.display = 'block';
        photoImg.setAttribute('src', '');
      }

      const sigImg = document.getElementById('detailSignature');
      const sigPlace = document.getElementById('detailSigPlaceholder');
      const sUrl = prof.signature;
      if (sUrl && sUrl.length > 50) {
        sigImg.setAttribute('src', sUrl);
        sigImg.style.display = 'block';
        sigPlace.style.display = 'none';
      } else {
        sigImg.style.display = 'none';
        sigPlace.style.display = 'block';
        sigImg.setAttribute('src', '');
      }"""

html = html.replace(old_logic, new_logic)

with open('admin.html', 'w') as f:
    f.write(html)
