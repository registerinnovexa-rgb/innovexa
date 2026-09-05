const fs = require('fs');
const html = fs.readFileSync('atlas.html', 'utf8');
const scriptMatch = html.match(/<script>(.*?)<\/script>/s);
if (scriptMatch) {
    const code = scriptMatch[1];
    // We can't eval easily because it depends on DOM (document, localStorage)
    console.log("Script length:", code.length);
}
