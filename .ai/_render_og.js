// Temp helper: extract the cover SVG and wrap it for a clean 1280x720 render.
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync('D:/Claude/money/ExcelCleanerPro/cover.html', 'utf8');
const start = src.indexOf('<svg');
const end = src.indexOf('</svg>') + '</svg>'.length;
if (start < 0 || end < 6) { console.error('SVG not found'); process.exit(1); }
const svg = src.slice(start, end);
const html = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#0b1f3a}svg{display:block;width:1280px;height:720px}</style></head><body>' + svg + '</body></html>';
fs.writeFileSync('D:/Claude/money/_github_site/.ai/_og_render.html', html, 'utf8');
console.log('Wrote _og_render.html, svg length =', svg.length);
