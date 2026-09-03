with open('api/index.js', 'r') as f:
    content = f.read()

# Add logging
logger = """
app.use((req, res, next) => {
  console.log("Request URL:", req.url);
  next();
});
app.use(express.static(path.join(__dirname, '../')));
"""
content = content.replace("app.use(express.static(path.join(__dirname, '../'), { index: false }));", logger)

with open('api/index.js', 'w') as f:
    f.write(content)
