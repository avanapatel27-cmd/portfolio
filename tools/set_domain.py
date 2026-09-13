#!/usr/bin/env python3
"""Set the site's public address everywhere it appears (canonical tags, Open Graph, structured data,
sitemap, robots, llms.txt) and write the CNAME file GitHub Pages uses for a custom domain.

Run once when the custom domain is connected:

    python3 tools/set_domain.py https://www.example.co.uk

Run it again with a new address if the domain ever changes."""
import re, sys, pathlib

if len(sys.argv) != 2 or not sys.argv[1].startswith('http'):
    sys.exit(__doc__)
new = sys.argv[1].rstrip('/')
root = pathlib.Path(__file__).resolve().parent.parent
files = ['index.html', 'privacy.html', 'terms.html', '404.html', 'sitemap.xml', 'robots.txt', 'llms.txt']
own = re.compile(r'https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?::\d+)?')
foreign = re.compile(r'linkedin|gmc-uk|google|gstatic|jsdelivr|schema\.org|sitemaps\.org|w3\.org|anthropic|github\.com')
for name in files:
    f = root / name
    if not f.exists():
        continue
    text = f.read_text()
    out = text.replace('https://your-domain.example', new)
    for host in set(own.findall(text)):
        if host != new and 'your-domain' not in host and not foreign.search(host):
            out = out.replace(host, new)
    if out != text:
        f.write_text(out)
        print('updated', name)
host = new.split('//', 1)[1].split('/', 1)[0]
(root / 'CNAME').write_text(host + '\n')
print('CNAME ->', host)
print('Done. Commit and publish; GitHub Pages reads CNAME for the custom domain.')
