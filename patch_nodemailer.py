with open("api/backend.js", "r") as f:
    content = f.read()

target = "const transporter = createTransporter();"
replacement = """const transporter = createTransporter();

// Global interceptor to prevent emails from going to spam
const originalSendMail = transporter.sendMail.bind(transporter);
transporter.sendMail = async (options) => {
  if (!options.text && options.html) {
    // Generate a simple text fallback by stripping HTML tags
    options.text = options.html.replace(/<[^>]*>?/gm, ' ').replace(/\\s+/g, ' ').trim();
  }
  // Set reply-to to help with deliverability
  if (!options.replyTo) {
    options.replyTo = `"Innovexa Hub Support" <${process.env.EMAIL_USER}>`;
  }
  return originalSendMail(options);
};"""

if target in content and "originalSendMail" not in content:
    content = content.replace(target, replacement)
    with open("api/backend.js", "w") as f:
        f.write(content)
    print("Patched transporter in backend.js")
else:
    print("Already patched or could not find target.")
