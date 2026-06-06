// Generates /blog/feed.xml (RSS 2.0) + /llms.txt from the live site files.
// RSS  -> content discovery + freshness signal for feed-aware crawlers/aggregators.
// llms.txt -> emerging standard that helps AI search engines (ChatGPT/Perplexity/etc.)
//             find and cite the most useful pages. Both deploy via git push, no account.
// Run: node .ai/gen_feed_llms.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://btcson66-rgb.github.io/freelance-tools';
const BLOG = path.join(ROOT, 'blog');

function readMeta(file) {
  const html = fs.readFileSync(file, 'utf8');
  const title = (html.match(/<title>(.*?)<\/title>/s) || [, ''])[1]
    .replace(/&amp;/g, '&').replace(/\s*[—|].*$/, '').trim();
  const desc = (html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/s) || [, ''])[1]
    .replace(/&amp;/g, '&').trim();
  return { title, desc };
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- RSS from blog posts ----
const slugs = fs.readdirSync(BLOG, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const items = slugs.map(slug => {
  const f = path.join(BLOG, slug, 'index.html');
  if (!fs.existsSync(f)) return null;
  const { title, desc } = readMeta(f);
  const stat = fs.statSync(f);
  return { slug, title, desc, date: stat.mtime };
}).filter(Boolean).sort((a, b) => b.date - a.date);

const now = new Date().toUTCString();
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Freelance Tips &amp; Guides</title>
    <link>${BASE}/blog/</link>
    <description>Practical, no-fluff guides on freelance invoicing, contracts, time tracking, pricing and taxes — from the makers of free offline freelance tools.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items.map(it => `    <item>
      <title>${esc(it.title)}</title>
      <link>${BASE}/blog/${it.slug}/</link>
      <guid isPermaLink="true">${BASE}/blog/${it.slug}/</guid>
      <pubDate>${it.date.toUTCString()}</pubDate>
      <description>${esc(it.desc)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(BLOG, 'feed.xml'), rss, 'utf8');
console.log(`feed.xml written with ${items.length} items`);

// ---- llms.txt ----
const tools = [
  ['Free Invoice Generator', 'free-invoice-generator', 'Offline single-file invoice & quote maker'],
  ['Free Time Tracker', 'free-time-tracker', 'Billable-hours timesheet, runs in your browser'],
  ['Free Freelance CRM', 'free-freelance-crm', 'Lead & client sales-pipeline tracker'],
  ['Free Expense Tracker', 'free-expense-tracker', 'Income, expenses & tax set-aside tracker'],
  ['Free Freelance Contract', 'free-freelance-contract', 'Proposal & service-contract maker'],
];
const calcs = [
  ['Freelance Rate Calculator', 'freelance-rate-calculator', 'Find/check your hourly rate from an income goal'],
  ['Invoice Late-Fee Calculator', 'invoice-late-fee-calculator', 'Compute overdue fees + reminder text'],
  ['Hourly to Salary Calculator', 'hourly-to-salary-calculator', 'Convert hourly <-> annual both ways'],
  ['Project Quote Builder', 'project-quote-builder', 'Line-item quote with discount/tax, print to PDF'],
  ['Invoice Due-Date Calculator', 'invoice-due-date-calculator', 'Net 7/15/30 due dates + early-pay discount'],
  ['Freelance Tax Estimator', 'freelance-tax-estimator', 'Quarterly/monthly set-aside estimate'],
  ['Invoice Number Generator', 'invoice-number-generator', 'Auto-incrementing invoice numbers'],
  ['Freelance Project Checklist', 'freelance-project-checklist', 'Pre-built 16-item project checklist'],
];
const llms = `# Freelance Tools — Free Offline Tools & Guides for Freelancers

> Free, single-file, offline-first tools for freelancers: invoicing, time tracking, CRM,
> expenses, contracts and quotes. No login, no subscription, your data stays in your browser.
> Paid Pro versions are one-time purchases on Gumroad. Site: ${BASE}/

## Free tools (run in the browser, nothing to install)
${tools.map(([n, s, d]) => `- [${n}](${BASE}/${s}/): ${d}`).join('\n')}

## Free calculators & utilities
${calcs.map(([n, s, d]) => `- [${n}](${BASE}/${s}/): ${d}`).join('\n')}

## Guides
${items.map(it => `- [${it.title}](${BASE}/blog/${it.slug}/): ${it.desc}`).join('\n')}

## About
All tools are single HTML files that work offline with localStorage — no servers, no tracking.
Built for freelancers who want to own their data. Pro upgrades add unlimited records, CSV
export and a tool bundle. Full list & comparisons: ${BASE}/best-free-freelance-tools/
`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms, 'utf8');
console.log('llms.txt written');
