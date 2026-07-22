with open('/Users/jaiakash/Documents/Inno-porta/api/proxy.js', 'r') as f:
    content = f.read()

# Replace global Cache-Control with conditional one for GET
old_headers = r"""  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');"""

new_headers = r"""  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Default to no-cache, override later for GET
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');"""

content = content.replace(old_headers, new_headers)

old_get_start = r"""    if (req.method === 'GET') {
      // Build GAS URL — forward all query params except 'url' wrapper"""

new_get_start = r"""    if (req.method === 'GET') {
      // Vercel Edge Cache: Cache successful GET requests for 60 seconds
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
      res.removeHeader('Pragma');
      res.removeHeader('Expires');
      
      // Build GAS URL — forward all query params except 'url' wrapper"""

content = content.replace(old_get_start, new_get_start)

with open('/Users/jaiakash/Documents/Inno-porta/api/proxy.js', 'w') as f:
    f.write(content)

print("proxy.js patched!")
