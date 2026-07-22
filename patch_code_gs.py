import re

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    content = f.read()

# We need to move the registration block to be BEFORE the "Verify Admin Key" block.
reg_block_match = re.search(r'    if \(!action && !op\) \{.*?catch \(_\) \{\}\n    \}', content, re.DOTALL)
if reg_block_match:
    reg_block = reg_block_match.group(0)
    # Remove it from its current position
    content = content.replace(reg_block, '')
    
    # Insert it before "Verify Admin Key"
    admin_check_idx = content.find('    // Verify Admin Key')
    content = content[:admin_check_idx] + reg_block + '\n\n' + content[admin_check_idx:]

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
    f.write(content)
print("Code.gs patched locally!")
