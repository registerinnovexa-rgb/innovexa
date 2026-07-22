import re
import subprocess

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
for i, script in enumerate(scripts):
    with open(f'/tmp/script_{i}.js', 'w') as f:
        f.write(script)
    print(f"Checking script {i}...")
    result = subprocess.run(['node', '-c', f'/tmp/script_{i}.js'], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error in script {i}:")
        print(result.stderr)
    else:
        print(f"Script {i} OK.")
