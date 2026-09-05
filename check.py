with open("atlas.html") as f:
    for i, line in enumerate(f):
        if '"title":' in line and "'" in line:
            print(i, line.strip())
