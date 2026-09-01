with open('index.html', 'r') as f:
    content = f.read()

if 'gsap.min.js' not in content:
    # Add GSAP before the closing head tag or before closing body tag
    # Let's add it before </head>
    content = content.replace('</head>', '  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>\n</head>')
    
    with open('index.html', 'w') as f:
        f.write(content)
        print("GSAP CDN injected into index.html")
else:
    print("GSAP CDN already present")
