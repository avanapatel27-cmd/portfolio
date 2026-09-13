import fitz, re, json
S='/private/tmp/claude-501/-Users-avanapatel-Applications/b2f25383-bb2b-48a7-9045-d1c0683ba64c/scratchpad'
OUT='/Users/avanapatel/Applications/portfolio-site/assets/research/fig/'
docs={'diss':'/Users/avanapatel/Desktop/MED/Avana Patel SSC4 Dissertation_Outcomes of VSP_final.pdf',
 'bb':'/Users/avanapatel/Desktop/MED/1st yr Med/Essays/BB/Avana Framroz Patel_18427907_assignsubmission_file__BB Title 5 essay.pdf',
 'met':'/Users/avanapatel/Desktop/MED/1st yr Med/Essays/MET/MET Essay Title 4 Alcohol dependency.pdf'}
SKIP={'diss':{0,1,2,3},'bb':{0,1},'met':{0}}
def area(r): return max(0,r.width)*max(0,r.height)
result={}
for k,f in docs.items():
    d=fitz.open(f); figs={}; tables={}
    for i,pg in enumerate(d):
        if i in SKIP[k]: continue
        W,H=pg.rect.width,pg.rect.height
        caps=[]
        for b in pg.get_text('blocks'):
            m=re.match(r'\s*(Figure|Table)\s*(\d+)\s*(?::|[-–]|\s(?=[A-Z]))', b[4])
            if m and not re.search(r'\b(highlights|categorises|shows|Each hormone)\b', b[4][:60]):
                caps.append({'kind':m.group(1),'n':int(m.group(2)),'y0':b[1],'y1':b[3],'text':' '.join(b[4].split())})
        caps.sort(key=lambda c:c['y0'])
        gfx=[fitz.Rect(im['bbox']) for im in pg.get_image_info() if fitz.Rect(im['bbox']).width>40 and fitz.Rect(im['bbox']).height>40]
        drs=[dr['rect'] for dr in pg.get_drawings() if dr['rect'].width<W*0.92 and dr['rect'].height<H*0.6 and (dr['rect'].width>3 or dr['rect'].height>3)]
        try: tbls=[{'bbox':fitz.Rect(t.bbox)} for t in pg.find_tables().tables]
        except Exception: tbls=[]
        used=[]
        for ci,c in enumerate(caps):
            top = caps[ci-1]['y1']+2 if ci>0 else 40
            bot = caps[ci+1]['y0']-2 if ci+1<len(caps) else H-40
            above=fitz.Rect(40, top, W-40, c['y0']-2); below=fitz.Rect(40, c['y1']+2, W-40, bot)
            def score(r):
                if any(area(r & u) > 0.5*area(r) for u in used): return -1
                a=0
                for g in gfx+drs+[t['bbox'] for t in tbls]:
                    a+=area(g & r)
                return a
            sa, sb = score(above), score(below)
            reg = above if sa>sb else below
            used.append(fitz.Rect(reg))
            cy = c['y0'] if reg is above else c['y1']
            def union_of(lst):
                items=[g & reg for g in lst]; items=[r for r in items if area(r)>=50 and r.width>20 and r.height>8]
                if not items: return None
                # grow a cluster outward from the rect nearest the caption, so distant rules/footnotes are left out
                items.sort(key=lambda r: min(abs(r.y0-cy), abs(r.y1-cy)))
                u=fitz.Rect(items[0]); changed=True
                while changed:
                    changed=False
                    for r in items:
                        near=fitz.Rect(u.x0-40,u.y0-24,u.x1+40,u.y1+24)
                        if area(r & near)>0 and area(r & u)<area(r): u=u|r; changed=True
                return u
            from_images=False
            if c['kind']=='Table':
                u=union_of([t['bbox'] for t in tbls]) or union_of(drs) or union_of(gfx)
                if u is not None: u=fitz.Rect(u.x0-6, u.y0-16, u.x1+6, u.y1+6)   # header rows sometimes sit inside the caption block
            else:
                from_images = union_of(gfx) is not None
                u=union_of(gfx) or union_of(drs) or union_of([t['bbox'] for t in tbls])
                if u is not None: u=fitz.Rect(u.x0-6, max(reg.y0,u.y0-6), u.x1+6, min(reg.y1,u.y1+6))
            if u is None or u.width<60 or u.height<40: u=fitz.Rect(reg)
            u.x0=max(30,u.x0); u.y0=max(30,u.y0); u.x1=min(W-30,u.x1); u.y1=min(H-30,u.y1)
            # trim body-text blocks that poke into the top or bottom of the crop (not for tables)
            if c['kind']!='Table' and from_images:
                for b in pg.get_text('blocks'):
                    br=fitz.Rect(b[:4]); txt=b[4].strip()
                    if not txt or re.match(r'(Figure|Table)\s*\d', txt) or area(br & u)<=0: continue
                    if br.width < 0.6*u.width: continue          # side text next to a wrapped figure: leave it
                    if br.y0 > u.y0 + 0.6*u.height: u.y1=min(u.y1, br.y0-2)
                    elif br.y1 < u.y0 + 0.4*u.height: u.y0=max(u.y0, br.y1+2)
            pix=pg.get_pixmap(clip=u, dpi=170)
            if c['kind']=='Table':
                fn=f'{k}-t{c["n"]}.png'; pix.save(OUT+fn)
                tables.setdefault(c['n'],{'caption':c['text'],'files':[],'pages':[]}); tables[c['n']]['files'].append(fn); tables[c['n']]['pages'].append(i)
            else:
                fn=f'{k}-f{c["n"]}.png'; pix.save(OUT+fn)
                figs[c['n']]={'file':fn,'caption':c['text'],'page':i,'w':pix.width,'h':pix.height}
    # continuation pages: a table without a caption directly after a captioned table page
    for i,pg in enumerate(d):
        if i in SKIP[k]: continue
        if any(re.match(r'\s*(Figure|Table)\s*\d', b[4]) for b in pg.get_text('blocks')): continue
        try: tl=pg.find_tables().tables
        except Exception: tl=[]
        if tl and tables:
            prev=[n for n in tables if i-1 in tables[n]['pages']]
            if not prev: continue
            last=max(prev); W=pg.rect.width
            clip=fitz.Rect(tl[0].bbox); clip.x0=max(30,clip.x0-6); clip.x1=min(W-30,clip.x1+6); clip.y0-=4; clip.y1+=4
            pix=pg.get_pixmap(clip=clip, dpi=170); fn=f'{k}-t{last}b.png'; pix.save(OUT+fn)
            tables[last]['files'].append(fn); tables[last]['pages'].append(i)
    result[k]={'figs':figs,'tables':tables}
    print('==',k,'figs',sorted(figs),'tables',{n:t['files'] for n,t in tables.items()})
json.dump(result, open(S+'/figs.json','w'), ensure_ascii=False, indent=1)
