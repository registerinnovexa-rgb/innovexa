import re

with open('index.html', 'r') as f:
    content = f.read()

old_block = """    <!-- Partner Logos -->
    <div style="margin-top: 48px; display: flex; align-items: center; justify-content: center; gap: 40px; opacity: 0; animation: fadeUp 1s forwards 1.4s;">
      
      <!-- Yenepoya -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <span style="font-family: system-ui, -apple-system, sans-serif; font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 1.5px;">At</span>
        <img src="assets/yenepoya-logo.svg" alt="Yenepoya University" style="height: 48px; opacity: 1;">
        <span style="font-family: system-ui, -apple-system, sans-serif; font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 1.5px;">Bangalore</span>
      </div>

      <div style="width: 1px; height: 50px; background: rgba(0,0,0,0.1);"></div>

      <!-- Kalvium -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <span style="font-family: system-ui, -apple-system, sans-serif; font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 1.5px;">Industrial Partner</span>
        <div style="height: 48px; display: flex; align-items: center;">
          <img src="assets/kalvium-logo.png" alt="Kalvium" style="height: 24px; opacity: 1;">
        </div>
        <span style="font-family: system-ui, -apple-system, sans-serif; font-size: 9px; color: transparent; user-select: none;">Spacer</span> <!-- alignment spacer -->
      </div>
      
    </div>"""

new_block = """    <!-- Partner Logos -->
    <div style="margin-top: 50px; display: flex; align-items: stretch; justify-content: center; gap: 40px; opacity: 0; animation: fadeUp 1s forwards 1.4s;">
      
      <!-- Yenepoya -->
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
        <span style="font-family: system-ui, -apple-system, sans-serif; font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">At Yenepoya University, Bangalore</span>
        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <img src="assets/yenepoya-logo.svg" alt="Yenepoya University" style="height: 40px; object-fit: contain;">
        </div>
      </div>

      <!-- Divider -->
      <div style="width: 1px; background: rgba(0,0,0,0.1);"></div>

      <!-- Kalvium -->
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
        <span style="font-family: system-ui, -apple-system, sans-serif; font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">Industrial Partner</span>
        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <img src="assets/kalvium-logo.png" alt="Kalvium" style="height: 24px; object-fit: contain;">
        </div>
      </div>

    </div>"""

content = content.replace(old_block, new_block)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
