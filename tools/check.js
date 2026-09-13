#!/usr/bin/env node
// Pre-deploy checks. Run from the site folder:  node tools/check.js   (the Pages workflow runs it before publishing)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
let problems = [];
for (const f of fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js'))) {
  try { execFileSync('node', ['--check', path.join('js', f)], { cwd: root, stdio: 'pipe' }); } catch (e) { problems.push(`js/${f}: syntax error`); }
}
for (const f of ['js/content.js', 'js/blog.js', 'js/articles.js', 'js/papers-extra.js', 'index.html', 'privacy.html', 'terms.html', '404.html']) {
  const t = fs.readFileSync(path.join(root, f), 'utf8');
  if (t.includes('—')) problems.push(`${f}: contains an em dash`);
  if (/goes here|lorem ipsum|placeholder/i.test(t)) problems.push(`${f}: placeholder text`);
}
// every assets/… path mentioned in the content must exist
const refs = new Set();
for (const f of ['js/content.js', 'js/blog.js', 'js/articles.js', 'js/papers.js', 'js/papers-extra.js', 'index.html']) {
  const t = fs.readFileSync(path.join(root, f), 'utf8');
  for (const m of t.matchAll(/assets\/[A-Za-z0-9_\-./]+\.[a-z0-9]{2,5}/g)) refs.add(m[0]);
}
for (const r of refs) if (!fs.existsSync(path.join(root, r))) problems.push(`missing asset: ${r}`);
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest', 'assets/favicon.svg', 'assets/share.jpg']) if (!fs.existsSync(path.join(root, f))) problems.push(`missing: ${f}`);
if (problems.length) { console.error('Checks failed:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log(`Checks passed: ${refs.size} asset references, all scripts parse, no em dashes or placeholders.`);
