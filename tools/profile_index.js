// Regenerates profile/portfolio-index.md from the live site data:  node tools/profile_index.js > profile/portfolio-index.md
(async()=>{
const C=await import('../js/content.js'); const P=(await import('../js/papers.js')).PAPERS; const B=(await import('../js/blog.js')).BLOG; const A=(await import('../js/articles.js')).ARTICLES;
const S=C.SECTIONS; const out=[];
out.push('# What is on the site (generated summary; regenerate with `node tools/profile_index.js > profile/portfolio-index.md`)\n');
out.push('## MedTech projects (laptop console, `SECTIONS.laptop.projects`)\n');
for(const p of S.laptop.projects) out.push(`- **${p.name||p.title}** (${p.id||''}): ${(p.tagline||p.summary||p.blurb||'').toString().slice(0,300)}`);
out.push('\n## Surgical logbook (book, `SECTIONS.book.logbook`)\n');
for(const c of S.book.logbook.cases) out.push(`- ${c.procedure||c.title||JSON.stringify(c)} · ${c.surgeon||c.consultant||''} · ${c.where||c.hospital||'hospital to add'} · ${c.when||c.date||'date to add'} · role: ${c.role||''}`);
out.push('\nOngoing projects:'); for(const p of S.book.logbook.projects) out.push(`- ${p.title||p.name}: ${(p.desc||p.summary||'')}`);
const dna=S.skull.dna.sections;
out.push('\n## Research (skull → DNA → Research, `js/papers.js`)\n');
for(const p of P) out.push(`- **${p.title}**${p.subtitle?': '+p.subtitle:''} (${p.kind}, ${p.year}${p.medtech?', shown under PneumoVision in MedTech':''}). ${p.summary}`);
out.push('\n## Clinical development (the placements road)\n'); for(const p of dna[1].roadmap.placements) out.push(`- ${p.title}${p.sub?' ('+p.sub+')':''}, ${p.site}, ${p.from} to ${p.to}`);
out.push('\n## Certificates and courses (`groups`)\n'); for(const g of dna[2].groups){ out.push(`### ${g.title}`); for(const it of g.items) out.push(`- ${it.title} · ${it.issuer} · ${it.date}`);} 
out.push('\n## Medical blog (`js/blog.js`)\n'); for(const b of B) out.push(`- **${b.title}**${b.subtitle?': '+b.subtitle:''} (${b.tag}). ${b.summary}`);
out.push('\n## The Second Opinion, philosophy paper (`js/articles.js`)\n'); for(const a of A) out.push(`- **${a.title}**${a.deck?': '+a.deck:''}${a.kicker?' ['+a.kicker+']':''}`);
out.push('\n## About page\n'); out.push(C.ABOUT.intro||''); for(const p of (C.ABOUT.paragraphs||[])) out.push('\n'+p);
console.log(out.join('\n'));
})();
