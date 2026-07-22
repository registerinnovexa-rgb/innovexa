import re

# 1. Update register.html
with open('/Users/jaiakash/Documents/Inno-porta/register.html', 'r') as f:
    reg_content = f.read()

# Add file size validation
old_process_file = r"""    function processFile(file) {
      if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
      textEl.textContent = 'Compressing...';"""

new_process_file = r"""    function processFile(file) {
      if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
      if (file.size > 5 * 1024 * 1024) {
          alert('File is too large! Maximum size is 5MB.');
          input.value = '';
          textEl.textContent = 'Upload Failed (File > 5MB)';
          textEl.style.color = '#ef4444';
          return;
      }
      textEl.textContent = 'Compressing...';"""

reg_content = reg_content.replace(old_process_file, new_process_file)

with open('/Users/jaiakash/Documents/Inno-porta/register.html', 'w') as f:
    f.write(reg_content)

# 2. Update status.html
with open('/Users/jaiakash/Documents/Inno-porta/status.html', 'r') as f:
    stat_content = f.read()

stat_content = stat_content.replace("btn.textContent = 'Fetching...';", "btn.textContent = 'Scanning Database...';")

with open('/Users/jaiakash/Documents/Inno-porta/status.html', 'w') as f:
    f.write(stat_content)

print("UX patches applied!")
