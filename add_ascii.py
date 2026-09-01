import re

with open('index.html', 'r') as f:
    content = f.read()

ascii_section = """
<!-- ══ ASCII BADGE GENERATOR ══════════════════════════════════════════════════════ -->
<section class="fade-up" style="padding: 100px 24px; background: #faf9f6; display: flex; flex-direction: column; align-items: center;">
  <div style="max-width: 800px; width: 100%;">
    <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 24px;">
      <h3 style="font-family: var(--font-d); font-size: 32px; letter-spacing: -0.02em; margin-bottom: 8px;">Generate ID Signature</h3>
      <p style="color: var(--text3); font-size: 15px;">Enter your operative alias to compile your cryptographic ASCII signature.</p>
    </div>
    
    <div style="width: 100%; background: #0a0a0a; border-radius: 8px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid #222; overflow: hidden; position: relative;">
      
      <!-- Terminal Input -->
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #333; padding-bottom: 12px;">
        <span style="color: #10b981; font-family: 'Courier New', monospace; font-size: 14px; font-weight: bold;">[INPUT]</span>
        <input type="text" id="alias-input" placeholder="ENTER_ALIAS" maxlength="12" style="background: transparent; border: none; outline: none; color: #fff; font-family: 'Courier New', monospace; font-size: 16px; width: 100%; text-transform: uppercase;">
      </div>
      
      <!-- Terminal Output -->
      <div style="position: relative;">
        <pre id="ascii-output" style="color: #10b981; font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.1; overflow-x: auto; min-height: 120px; text-shadow: 0 0 5px rgba(16,185,129,0.5);"></pre>
      </div>
      
      <!-- Copy Button -->
      <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <button id="copy-ascii-btn" style="background: transparent; border: 1px solid #333; color: #888; padding: 8px 16px; font-family: 'Courier New', monospace; font-size: 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#10b981'; this.style.borderColor='#10b981';" onmouseout="this.style.color='#888'; this.style.borderColor='#333';">[ COPY TO CLIPBOARD ]</button>
      </div>
    </div>
  </div>
</section>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    const font = {
      'A': ["  A  ", " A A ", "AAAAA", "A   A", "A   A"],
      'B': ["BBBB ", "B   B", "BBBB ", "B   B", "BBBB "],
      'C': [" CCC ", "C    ", "C    ", "C    ", " CCC "],
      'D': ["DDDD ", "D   D", "D   D", "D   D", "DDDD "],
      'E': ["EEEEE", "E    ", "EEEE ", "E    ", "EEEEE"],
      'F': ["FFFFF", "F    ", "FFFF ", "F    ", "F    "],
      'G': [" GGG ", "G    ", "G GGG", "G   G", " GGG "],
      'H': ["H   H", "H   H", "HHHHH", "H   H", "H   H"],
      'I': [" III ", "  I  ", "  I  ", "  I  ", " III "],
      'J': ["    J", "    J", "    J", "J   J", " JJJ "],
      'K': ["K   K", "K  K ", "KKK  ", "K  K ", "K   K"],
      'L': ["L    ", "L    ", "L    ", "L    ", "LLLLL"],
      'M': ["M   M", "MM MM", "M M M", "M   M", "M   M"],
      'N': ["N   N", "NN  N", "N N N", "N  NN", "N   N"],
      'O': [" OOO ", "O   O", "O   O", "O   O", " OOO "],
      'P': ["PPPP ", "P   P", "PPPP ", "P    ", "P    "],
      'Q': [" QQQ ", "Q   Q", "Q   Q", "Q  QQ", " QQQQ"],
      'R': ["RRRR ", "R   R", "RRRR ", "R  R ", "R   R"],
      'S': [" SSSS", "S    ", " SSS ", "    S", "SSSS "],
      'T': ["TTTTT", "  T  ", "  T  ", "  T  ", "  T  "],
      'U': ["U   U", "U   U", "U   U", "U   U", " UUU "],
      'V': ["V   V", "V   V", "V   V", " V V ", "  V  "],
      'W': ["W   W", "W   W", "W W W", "WW WW", "W   W"],
      'X': ["X   X", " X X ", "  X  ", " X X ", "X   X"],
      'Y': ["Y   Y", " Y Y ", "  Y  ", "  Y  ", "  Y  "],
      'Z': ["ZZZZZ", "   Z ", "  Z  ", " Z   ", "ZZZZZ"],
      '0': [" 000 ", "0  00", "0 0 0", "00  0", " 000 "],
      '1': [" 11  ", "1 1  ", "  1  ", "  1  ", "11111"],
      '2': [" 222 ", "2   2", "   2 ", "  2  ", "22222"],
      '3': [" 333 ", "    3", "  33 ", "    3", " 333 "],
      '4': ["   4 ", "  44 ", " 4 4 ", "44444", "   4 "],
      '5': ["55555", "5    ", "5555 ", "    5", "5555 "],
      '6': [" 666 ", "6    ", "6666 ", "6   6", " 666 "],
      '7': ["77777", "   7 ", "  7  ", " 7   ", "7    "],
      '8': [" 888 ", "8   8", " 888 ", "8   8", " 888 "],
      '9': [" 999 ", "9   9", " 9999", "    9", " 999 "],
      ' ': ["     ", "     ", "     ", "     ", "     "],
      '_': ["     ", "     ", "     ", "     ", "_____"]
    };

    const input = document.getElementById('alias-input');
    const output = document.getElementById('ascii-output');
    const copyBtn = document.getElementById('copy-ascii-btn');

    function generateAscii(text) {
      if (!text) {
        return "\\n\\n  [ AWAITING INPUT ]\\n";
      }
      text = text.toUpperCase();
      let lines = ["", "", "", "", ""];
      for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (!font[char]) char = ' '; // fallback
        for (let l = 0; l < 5; l++) {
          lines[l] += font[char][l] + "  ";
        }
      }
      return lines.join("\\n");
    }

    input.addEventListener('input', (e) => {
      // Filter out non-alphanumeric except space and underscore
      e.target.value = e.target.value.replace(/[^A-Za-z0-9 _]/g, '');
      output.innerText = generateAscii(e.target.value);
    });

    // Initialize with empty state
    output.innerText = generateAscii("");

    copyBtn.addEventListener('click', () => {
      const textToCopy = output.innerText;
      if (textToCopy.trim() === "[ AWAITING INPUT ]") return;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "[ SIGNATURE COPIED ]";
        copyBtn.style.color = "#10b981";
        setTimeout(() => {
          copyBtn.innerText = originalText;
          copyBtn.style.color = "#888";
        }, 2000);
      });
    });
  });
</script>

"""

target_comment = "<!-- ══ CTA (CLASSIFIED TERMINAL) ══════════════════════════════════════════════════════ -->"
content = content.replace(target_comment, ascii_section + target_comment)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
