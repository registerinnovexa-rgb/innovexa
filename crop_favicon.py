from PIL import Image
import os

img = Image.open('assets/logo.png')
# Crop a square from the left (left, upper, right, lower)
# The image height is 177. Let's crop 177x177.
width, height = img.size
cropped = img.crop((0, 0, height, height))
cropped.save('assets/favicon.png')
print("Cropped successfully to assets/favicon.png")
