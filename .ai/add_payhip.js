// Adds Payhip buy-links alongside the existing Gumroad links across the site.
// Idempotent: safe to re-run (e.g. after gen_compare.js / gen_blog.js regenerate pages).
// Run: node D:\Claude\money\_github_site\.ai\add_payhip.js
const fs = require('fs');
const path = require('path');
const ROOT = 'D:\\Claude\\money\\_github_site';
const SUITE_PAY = 'https://payhip.com/b/jde6n';
// gumroad permalink -> payhip product id
const prodMap = {
  invoicepro: 'SmzLF',
  cashflow: '7rlYt',
  timetrack: 'fOGRP',
  leadtrack: 'UcLxN',
  proposalpro: 'oRQ6Y',
  filepilot: 'IhSms'
};

let changed = 0;
const SKIP_DIRS = new Set(['.ai', 'og', 'excel-cleaner-pro']);

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name));
    } else if (e.name.endsWith('.html')) {
      processFile(path.join(dir, e.name));
    }
  }
}

function processFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;

  // 1) Suite CTA: after any anchor that links to the Gumroad suite, append a Payhip suite link
  //    (only if a Payhip suite link does not already immediately follow).
  s = s.replace(
    /(<a [^>]*href="https:\/\/bitsonic1\.gumroad\.com\/l\/freelance-suite"[^>]*>[^<]*<\/a>)(?!\s*(?:&middot;|·|\s)*<a [^>]*payhip\.com\/b\/jde6n)/g,
    function (anchor) {
      return anchor + ' &middot; <a href="' + SUITE_PAY + '" target="_blank" rel="noopener">also on Payhip</a>';
    }
  );

  // 2) Homepage-style product cards: <a class="buy" href="...gumroad.../l/PRODUCT" ...>Get it</a>
  //    Add a sibling Payhip buy button (only if not already present right after).
  for (const perm of Object.keys(prodMap)) {
    const id = prodMap[perm];
    const re = new RegExp(
      '(<a class="buy" href="https:\\/\\/bitsonic1\\.gumroad\\.com\\/l\\/' + perm + '"[^>]*>Get it<\\/a>)(?!\\s*<a class="buy" href="https:\\/\\/payhip\\.com\\/b\\/' + id + '")',
      'g'
    );
    s = s.replace(re, '$1\n          <a class="buy" href="https://payhip.com/b/' + id + '" target="_blank" rel="noopener">Payhip</a>');
  }

  if (s !== orig) {
    fs.writeFileSync(file, s, 'utf8');
    changed++;
    console.log('updated ' + path.relative(ROOT, file));
  }
}

walk(ROOT);
console.log('Files changed: ' + changed);
