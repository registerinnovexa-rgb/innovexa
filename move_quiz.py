import re

with open('index.html', 'r') as f:
    content = f.read()

# Extract the quiz section
quiz_pattern = r'<!-- ══ LIVE SYSTEM CHALLENGE ══════════════════════════════════════════════════════ -->.*?</script>\n'
quiz_match = re.search(quiz_pattern, content, re.DOTALL)

if not quiz_match:
    print("Quiz not found!")
    exit(1)

quiz_content = quiz_match.group(0)

# Remove quiz from bottom
content = content.replace(quiz_content, "")

# Insert quiz after the directive section
directive_end = r'</section>\n\n\n\n\n<!-- ══ INNOVEXA FORGE \(TERMINAL\) ═══════════════════════════════════════ -->'

new_insertion = f"</section>\n\n\n{quiz_content}\n\n<!-- ══ INNOVEXA FORGE (TERMINAL) ═══════════════════════════════════════ -->"

content = re.sub(directive_end, new_insertion, content)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
