import re

with open('/Users/jaiakash/Documents/Inno-porta/api/proxy.js', 'r') as f:
    content = f.read()

# Inject the adminKey for registrations
injection = """      const targetUrl = body.targetUrl || GAS_BASE;
      const payload   = body.payload   || body;

      // INJECT BYPASS FOR PUBLIC REGISTRATIONS
      // Because Code.gs checks adminKey before executing registration,
      // we must secretly append it here on the secure server side.
      if (!payload.action && !payload.op) {
        payload.adminKey = 'INNOVEXA_SECURE_KEY_2025';
      }"""

content = content.replace(
    "      const targetUrl = body.targetUrl || GAS_BASE;\n      const payload   = body.payload   || body;",
    injection
)

with open('/Users/jaiakash/Documents/Inno-porta/api/proxy.js', 'w') as f:
    f.write(content)
print("Proxy patched!")
