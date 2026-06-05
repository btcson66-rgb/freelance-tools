const fs = require('fs');
const path = require('path');

const root = process.cwd();

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue;
      }
      files = files.concat(walk(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walk(root);
let bad = 0;
let blocks = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match;
  while ((match = re.exec(content))) {
    blocks += 1;
    try {
      JSON.parse(match[1]);
    } catch (error) {
      bad += 1;
      console.log('BAD: ' + path.relative(root, file) + ' - ' + error.message.slice(0, 60));
    }
  }
}

console.log('HTML files: ' + files.length + ' | JSON-LD blocks: ' + blocks + ' | invalid: ' + bad);
