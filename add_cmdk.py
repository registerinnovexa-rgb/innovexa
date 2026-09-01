import re

with open('index.html', 'r') as f:
    content = f.read()

# Add Cmd+K button to navbar
old_nav_cta = '<div class="nav-cta">'
new_nav_cta = """<div class="nav-cta" style="display: flex; align-items: center; gap: 16px;">
      <button onclick="openCmd()" style="background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; padding: 6px 12px; display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text3); transition: all 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.1)';" onmouseout="this.style.background='rgba(0,0,0,0.05)';">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span style="font-family: system-ui; font-size: 12px; font-weight: 500;">Search...</span>
        <div style="display: flex; gap: 2px;">
          <span style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: system-ui; font-size: 10px; font-weight: bold;">⌘</span>
          <span style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: system-ui; font-size: 10px; font-weight: bold;">K</span>
        </div>
      </button>"""
content = content.replace(old_nav_cta, new_nav_cta)


# Add Cmd+K Palette HTML before </body>
cmd_palette_html = """
<!-- ══ COMMAND PALETTE ══════════════════════════════════════════════════════ -->
<div id="cmd-palette-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(250,249,246,0.6); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 10000; display: none; justify-content: center; align-items: flex-start; padding-top: 15vh; opacity: 0; transition: opacity 0.2s;">
  
  <div id="cmd-palette" style="background: #111; border: 1px solid #333; border-radius: 12px; width: 90%; max-width: 600px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow: hidden; transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
    
    <div style="display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid #222;">
      <span style="color: #10b981; font-family: 'Courier New', monospace; font-size: 16px; margin-right: 12px;">></span>
      <input type="text" id="cmd-input" placeholder="Type a command or search..." style="background: transparent; border: none; outline: none; color: #fff; font-size: 16px; width: 100%; font-family: system-ui, -apple-system, sans-serif;">
      <div style="background: #222; border: 1px solid #333; border-radius: 4px; padding: 4px 8px; color: #888; font-size: 10px; font-weight: bold; font-family: system-ui;">ESC</div>
    </div>
    
    <div style="padding: 12px 0; max-height: 350px; overflow-y: auto;">
      <div style="padding: 8px 24px; font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px;">Navigation</div>
      
      <a href="register.html" class="cmd-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; text-decoration: none; color: #ccc; transition: background 0.1s;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #888;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span style="font-size: 14px;">Initialize Membership</span>
        </div>
        <span style="color: #555; font-size: 12px; font-family: monospace;">G R</span>
      </a>
      
      <a href="status.html" class="cmd-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; text-decoration: none; color: #ccc; transition: background 0.1s;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #888;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style="font-size: 14px;">Check Server Status</span>
        </div>
      </a>

      <a href="atlas.html" class="cmd-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; text-decoration: none; color: #ccc; transition: background 0.1s;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #888;"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span style="font-size: 14px;">Access Atlas Repository</span>
        </div>
      </a>
      
      <div style="padding: 16px 24px 8px; font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px;">Actions</div>
      
      <a href="javascript:void(0)" onclick="window.scrollTo({top:0, behavior:'smooth'}); closeCmd();" class="cmd-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; text-decoration: none; color: #ccc; transition: background 0.1s;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #888;"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          <span style="font-size: 14px;">Scroll to Top</span>
        </div>
      </a>
      
      <a href="javascript:void(0)" onclick="window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'}); closeCmd();" class="cmd-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; text-decoration: none; color: #ccc; transition: background 0.1s;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #888;"><path d="M5 12h14M12 5v14M12 19l7-7M12 19l-7-7"/></svg>
          <span style="font-size: 14px;">Scroll to Bottom</span>
        </div>
      </a>

    </div>
  </div>
</div>

<style>
  .cmd-item:hover {
    background: #1a1a1a;
  }
  .cmd-item:hover svg {
    color: #10b981 !important;
  }
  .cmd-item:hover span {
    color: #fff !important;
  }
</style>

<script>
  const overlay = document.getElementById('cmd-palette-overlay');
  const palette = document.getElementById('cmd-palette');
  const cmdInput = document.getElementById('cmd-input');
  
  function openCmd() {
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.style.opacity = '1';
      palette.style.transform = 'scale(1)';
      cmdInput.focus();
    }, 10);
  }
  
  function closeCmd() {
    overlay.style.opacity = '0';
    palette.style.transform = 'scale(0.95)';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 200);
  }

  document.addEventListener('keydown', (e) => {
    // Toggle on Cmd+K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay.style.display === 'flex') {
        closeCmd();
      } else {
        openCmd();
      }
    }
    // Close on Escape
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      closeCmd();
    }
  });

  // Close when clicking outside
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closeCmd();
  });
</script>

</body>"""
content = content.replace('</body>', cmd_palette_html)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
