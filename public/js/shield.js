/**
 * Innovexa Shield - Client-Side Protection
 * Blocks right-click, dev tools shortcuts, and copy-pasting.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Disable Right-Click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Disable specific keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
    // Ctrl+Shift+I (Windows) / Cmd+Opt+I (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
    }
    // Ctrl+Shift+J (Windows) / Cmd+Opt+J (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
    }
    // Ctrl+Shift+C (Windows) / Cmd+Opt+C (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
    }
    // Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
    }
    // Ctrl+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
    }
  });

  // Disable Copy-Pasting on body
  document.addEventListener('copy', (e) => {
    e.preventDefault();
  });
  
  // Disable Cut
  document.addEventListener('cut', (e) => {
    e.preventDefault();
  });
});
