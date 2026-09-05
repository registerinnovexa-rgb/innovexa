with open("api/backend.js", "r") as f:
    content = f.read()

# ── Fix 1: admin_grant_forge_access - bug when email is undefined ────────────
OLD_FORGE_BUG = """      if (operativeId && !email) {
        member = await Member.findOne({ operativeId: String(operativeId).trim().toUpperCase() });
        // rowIndex might be a numeric row — fall back to finding by position if not found by ID
        if (!member) member = await Member.findOne({ email: email });
      } else {"""

NEW_FORGE_FIX = """      if (operativeId && !email) {
        member = await Member.findOne({ operativeId: String(operativeId).trim().toUpperCase() });
      } else {"""

count1 = content.count(OLD_FORGE_BUG)
if count1:
    content = content.replace(OLD_FORGE_BUG, NEW_FORGE_FIX)
    print(f"✅ Fixed forge access null-email bug ({count1} occurrence)")
else:
    print("❌ Could not find forge access bug")

# ── Fix 2: Update all email links from old Vercel URL to new Cloudflare URL ──
old_url1 = "https://innovexareg.vercel.app"
old_url2 = "https://innovexa-portal.vercel.app"
new_url  = "https://innovexa.register-innovexa.workers.dev"

c1 = content.count(old_url1)
c2 = content.count(old_url2)
content = content.replace(old_url1, new_url)
content = content.replace(old_url2, new_url)
print(f"✅ Updated {c1 + c2} old Vercel URLs → Cloudflare URL")

with open("api/backend.js", "w") as f:
    f.write(content)

print("Done.")
