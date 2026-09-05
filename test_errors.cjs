const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('atlas.html', 'utf8');
const virtualConsole = new (require('jsdom')).VirtualConsole();
virtualConsole.on("jsdomError", (error) => {
  console.error("JSDOM Error:", error);
});
virtualConsole.on("error", (error) => {
  console.error("JS Error:", error);
});

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole });
console.log("DOM execution complete.");
