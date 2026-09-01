with open('index.html', 'r') as f:
    content = f.read()

st_script = '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>'
if st_script not in content:
    content = content.replace('gsap.min.js"></script>', 'gsap.min.js"></script>\n  ' + st_script)
    with open('index.html', 'w') as f:
        f.write(content)
    print("Injected ScrollTrigger")
