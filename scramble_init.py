with open('index.html', 'r') as f:
    content = f.read()

# Replace innerText with scrambled version initially so it matches the description
import re
import random
letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"

def sc(match):
    name = match.group(1)
    scrambled = "".join(random.choice(letters) if c != " " else " " for c in name)
    # The regex captured the whole tag, we reconstruct it
    return match.group(0).replace(f'>{name}<', f'>{scrambled}<')

content = re.sub(r'(<h3 class="arsenal-title decrypt-target" data-value="([^"]+)".*?>)[^<]+(</h3>)', lambda m: m.group(1) + "".join(random.choice(letters) if c != " " else " " for c in m.group(2)) + m.group(3), content)

with open('index.html', 'w') as f:
    f.write(content)
