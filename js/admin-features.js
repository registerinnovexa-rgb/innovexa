// admin-features.js — Public Site Config Loader
// Fetches site-wide config (announcements, rank configs, gamification) from the backend
// and fires hook functions that individual pages define to apply them.
(async function() {
  try {
    const res = await fetch('/api/backend?action=get_site_config');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success) return;
    const cfg = data.data || {};

    // 1. Render announcements into #innx-announcements if it exists on the page
    const annContainer = document.getElementById('innx-announcements');
    if (annContainer && cfg.announcements && cfg.announcements.length > 0) {
      const published = cfg.announcements.filter(a => a.published);
      if (published.length > 0) {
        annContainer.innerHTML = published.map(a => `
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 24px;border-radius:12px;margin-bottom:12px;font-size:14px;line-height:1.5;">
            <strong>${a.title || ''}</strong>${a.body ? ' — ' + a.body : ''}
          </div>`).join('');
      }
    }

    // 2. Fire page-specific hooks if defined
    if (typeof window.applyRankConfig === 'function' && cfg.rankConfig) {
      window.applyRankConfig(cfg.rankConfig);
    }
    if (typeof window.applyGamificationConfig === 'function' && cfg.gamification) {
      window.applyGamificationConfig(cfg.gamification);
    }
    if (typeof window.onSiteConfigLoaded === 'function') {
      window.onSiteConfigLoaded(cfg);
    }

  } catch (e) {
    // Non-fatal: site config is enhancement only
    console.warn('admin-features: could not load site config', e);
  }
})();
