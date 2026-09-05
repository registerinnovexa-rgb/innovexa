import os
import glob

# Search across all html and js files
files = glob.glob('*.html') + glob.glob('js/*.js')
files.append('patch_auth_otp.py')
files.append('fix_api_calls.py')
files.append('patch_register_otp.py')
files.append('make_register.py')
files.append('patch3.py')
files.append('fix_proxy.py')

OLD_URL = "'https://innovexa-backend-x57p.onrender.com/api/backend"
NEW_URL = "'/api/backend"
OLD_URL2 = "`https://innovexa-backend-x57p.onrender.com/api/backend"
NEW_URL2 = "`/api/backend"

updated_count = 0

for file_path in glob.glob('*.html') + glob.glob('js/*.js'):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if OLD_URL in content or OLD_URL2 in content:
        content = content.replace(OLD_URL, NEW_URL)
        content = content.replace(OLD_URL2, NEW_URL2)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        updated_count += 1
        print(f"Reverted {file_path}")

print(f"Total files reverted: {updated_count}")
