from PIL import Image

img = Image.open('assets/logo.png')
width, height = img.size
cropped = img.crop((0, 0, height, height))
cropped.save('assets/icon.png')
print("Cropped new favicon.")
