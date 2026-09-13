import re, json, zipfile, html, sys
S='/private/tmp/claude-501/-Users-avanapatel-Applications/b2f25383-bb2b-48a7-9045-d1c0683ba64c/scratchpad'
sys.path.insert(0, '/private/tmp/claude-501/-Users-avanapatel-Applications/b2f25383-bb2b-48a7-9045-d1c0683ba64c/scratchpad/py')
from pypdf import PdfReader

FIX = [(r'(\w) -(\w)', r'\1-\2'), (r'\s+([,.;:)])', r'\1'), (r'\(\s+', '('), (r'  +', ' ')]
WORDFIX = {'clinic al':'clinical','int egration':'integration','rev iew':'review','quantitive':'quantitative','offer s':'offers','expan ding':'expanding','exper ience':'experience','iatrogenical ly':'iatrogenically','Ope rating':'Operating','rev isions':'revisions','so urce':'source','efficienc y':'efficiency','2 020':'2020','desixgn':'design','stimulation':'simulation','Mos t':'Most','diffe rence':'difference','re duction':'reduction','ex tended':'extended','fro m':'from','malign ant':'malignant','gu ides':'guides','reaso ns':'reasons','comp ared':'compared','it ’s':'its','did n ot':'did not','s ubjective':'subjective','1 y ear':'1 year','l ong-term':'long-term','th e':'the','u nregulated':'unregulated','gluc agon':'glucagon','h ormones':'hormones','re gular':'regular','a n individual':'an individual','accumula ting':'accumulating','proce ss of t he':'process of the','su ppressed':'suppressed','t here':'there','biologi cal':'biological','cytoki nes':'cytokines','comm on':'common','pattens':'patterns','Ar ticle Navigation ':'','Ma tschinsky':'Matschinsky','Em manuel':'Emmanuel','assi st':'assist','resul t':'result','w ith':'with','amoun t':'amount','contri bute':'contribute','an d':'and','excit ers':'exciters','In or der':'In order','re ceptors':'receptors','th at that':'that that','dosages':'doses','hippocmapus':'hippocampus','administeration':'administration','heal th':'health','Sarawagi, et al.':'Sarawagi et al.','considering':'considering'}

def fix(t):
    for a,b in WORDFIX.items(): t=t.replace(a,b)
    for a,b in FIX: t=re.sub(a,b,t)
    return t.strip()

def caps_heading(line):
    # spaced caps like "A B ST R AC T" → "Abstract"
    s=re.sub(r'\s+','',line)
    if len(s)>=4 and s.isupper() and re.fullmatch(r'[A-Z&:,/]+', s.replace(' ','')):
        return True
    return False

def norm_caps(line):
    s=re.sub(r'\s+',' ',line).strip()
    # collapse letter-spaced words: if most tokens are 1-3 chars, join them
    toks=s.split(' ')
    if len(toks)>=4 and sum(len(t) for t in toks)/len(toks) <= 2.2:
        s=''.join(toks)
        s=re.sub(r'&',' & ',s)
        # re-split known words
        for w in ['PRACTICE','POLICY','RESEARCH','FUTURE','RECOMMENDATIONS','DATA','SYNTHESIS','RESULTS']:
            s=s.replace(w, ' '+w+' ')
        s=re.sub(r'\s+',' ',s).strip()
    t=s.title()
    for a,b in [('Of ','of '),('And ','and '),('The ','the '),('In ','in '),('To ','to '),('Reccomendations','Recommendations'),('Vsp','VSP'),('Hpa','HPA'),('Nhs','NHS'),('Rcts','RCTs'),('Rct','RCT'),('Prisma','PRISMA'),('Limitatons','Limitations')]:
        t=t.replace(a,b)
    return t[0].upper()+t[1:]

def pdf_blocks(path, skip_pages, drop_patterns, headings, drop_first_lines_on=None, refs_heading=('References','Bibliography')):
    r=PdfReader(path)
    lines=[]
    for i,pg in enumerate(r.pages):
        if i in skip_pages: continue
        t=pg.extract_text() or ''
        pl=t.split('\n')
        if drop_first_lines_on and i==drop_first_lines_on[0]: pl=pl[drop_first_lines_on[1]:]
        for ln in pl:
            l=ln.rstrip()
            if any(re.search(p,l) for p in drop_patterns): continue
            lines.append(l)
        lines.append('')   # page boundary acts as soft break
    blocks=[]; para=[]; mode='body'; ref_cur=None; skip_table=False
    def flush():
        nonlocal para
        if para:
            txt=fix(' '.join(x.strip() for x in para))
            if txt: blocks.append({'t':'p','x':txt})
        para=[]
    hset={h.rstrip(':') for h in headings}
    MAIN={'abstract','introduction','background','methodology','data synthesis & results','future recommendations: practice, policy & research','endnote','references','bibliography','conclusion','introduction and background information','opportunities','challenges'}
    def is_na(x): return re.fullmatch(r'(NA\s*)+', x.strip()) is not None
    for idx,l in enumerate(lines):
        s=l.strip()
        if not s:
            if mode=='refs' and ref_cur: blocks.append({'t':'ref','x':fix(ref_cur)}); ref_cur=None
            flush(); continue
        key=s.rstrip(':').strip()
        is_head = (key in hset) or (caps_heading(s) and len(s)<70 and not is_na(s) and (not skip_table or (len(s)>=12 and not re.search(r'\d', s))))
        if is_head:
            flush(); skip_table=False
            name = key if key in hset else norm_caps(s)
            if name.isupper(): name=norm_caps(name)
            name=name.rstrip(':').strip()
            if name.lower() in [x.lower() for x in refs_heading]:
                mode='refs'; blocks.append({'t':'h2','x':'References'}); continue
            mode='body'
            level = 'h2' if name.lower() in MAIN else 'h3'
            blocks.append({'t':level,'x':name}); continue
        if mode=='refs':
            new_entry = re.match(r'^(\d+\.\s+)?[A-Z][A-Za-z\-’\'\. ]+,\s*[A-Z]', s) or re.match(r'^[A-Za-z][^()]{2,60}\(\d{4}\)', s) or re.match(r'^(de |van )', s)
            if new_entry and ref_cur: blocks.append({'t':'ref','x':fix(ref_cur)}); ref_cur=re.sub(r'^\d+\.\s+','',s)
            elif ref_cur: ref_cur+=' '+s
            else: ref_cur=re.sub(r'^\d+\.\s+','',s)
            continue
        m=re.match(r'^(Figure|Table)\s*(\d+)\s*(?::|[-–]|\s+(?=[A-Z]))\s*(.*)$', s)
        if m and (':' in s[:16] or len(s)<110) and not re.search(r'\b(highlights|shows|demonstrates|illustrates|summarises)\b', s[:40]):
            flush()
            cap=m.group(3).strip()
            j=idx+1; extra=[]
            if m.group(1)=='Figure':
                while j<len(lines) and lines[j].strip() and len(extra)<3 and not re.match(r'^(Figure|Table)\s*\d', lines[j].strip()) and not (cap+' '.join(extra)).endswith('.'):
                    extra.append(lines[j].strip()); lines[j]=''; j+=1
            blocks.append({'t':'fig','k':m.group(1),'n':m.group(2),'x':fix(cap+' '+' '.join(extra))})
            skip_table = (m.group(1)=='Table')
            continue
        if skip_table:
            if len(s)>=80: skip_table=False
            else: continue
        if s.startswith('•') or s.startswith('- ') and len(s)>3:
            flush(); blocks.append({'t':'li','x':fix(s.lstrip('•- ').strip())}); mode='body'; continue
        mo=re.match(r'^(\d)\.\s+(.*)$', s)
        if mo and mode=='body' and not skip_table:
            flush(); blocks.append({'t':'oli','x':fix(mo.group(2))}); continue
        if blocks and blocks[-1]['t']=='oli' and not para and s and (s[0].islower() or s[0] in '(0123456789'):
            blocks[-1]['x']=fix(blocks[-1]['x']+' '+s); continue
        if blocks and blocks[-1]['t']=='li' and not para and s and s[0].islower():
            blocks[-1]['x']=fix(blocks[-1]['x']+' '+s); continue
        para.append(s)
        if len(s)<62 and re.search(r'[.!?]["’”)]?$', s): flush()
    flush()
    if ref_cur: blocks.append({'t':'ref','x':fix(ref_cur)})
    # merge li into ul
    out=[]
    for b in blocks:
        if b['t']=='oli':
            if out and out[-1]['t']=='ol': out[-1]['items'].append(b['x'])
            else: out.append({'t':'ol','items':[b['x']]})
        elif b['t']=='li':
            if out and out[-1]['t']=='ul': out[-1]['items'].append(b['x'])
            else: out.append({'t':'ul','items':[b['x']]})
        elif b['t']=='ref':
            if out and out[-1]['t']=='refs': out[-1]['items'].append(b['x'])
            else: out.append({'t':'refs','items':[b['x']]})
        else: out.append(b)
    return out

def docx_blocks(path, headings, skip_first=2):
    z=zipfile.ZipFile(path); xml=z.read('word/document.xml').decode('utf8')
    body=re.search(r'<w:body>(.*)</w:body>', xml, flags=re.S).group(1)
    # iterate top-level paragraphs and tables in order
    items=re.findall(r'(<w:tbl>.*?</w:tbl>|<w:p[ >].*?</w:p>)', body, flags=re.S)
    def ptext(p): return html.unescape(''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p))).strip()
    blocks=[]; seen_abstract=0; count=0; last=None
    hset={h.lower() for h in headings}
    for it in items:
        if it.startswith('<w:tbl>'):
            rows=[]
            for tr in re.findall(r'<w:tr[ >].*?</w:tr>', it, flags=re.S):
                cells=[ptext(tc) for tc in re.findall(r'<w:tc>.*?</w:tc>', tr, flags=re.S)]
                if any(cells): rows.append(cells)
            if rows: blocks.append({'t':'table','rows':rows})
            continue
        t=ptext(it)
        if not t: continue
        count+=1
        if count<=skip_first:   # title + authors handled separately
            continue
        style=re.search(r'<w:pStyle w:val="([^"]+)"', it); style=style.group(1) if style else 'p'
        if t==last: continue      # duplicated abstract lines
        if style in ('Heading1','Heading2','Heading3'):
            name=re.sub(r'^\s*\d+(\.\d+)*\s+', '', t).strip()
            blocks.append({'t': 'h2' if style=='Heading1' else 'h3', 'x': name}); last=t; continue
        if t.isupper() and len(t)<60 and style=='p':
            blocks.append({'t':'p','x':t,'lead':None}); last=t; continue
        last=t
        if t.lower()=='abstract':
            seen_abstract+=1
            if seen_abstract>1: continue
            blocks.append({'t':'h2','x':'Abstract'}); continue
        m=re.match(r'^(Figure|Table)\s*(\d+)\s*[:\-–]?\s*(.*)$', t)
        if m: blocks.append({'t':('cap' if m.group(1)=='Table' else 'fig'),'k':m.group(1),'n':m.group(2),'x':m.group(3)}); continue
        if style=='ListParagraph':
            if blocks and blocks[-1]['t']=='ul': blocks[-1]['items'].append(t)
            else: blocks.append({'t':'ul','items':[t]})
            continue
        low=t.lower().rstrip(':')
        if low in hset: blocks.append({'t':'h2','x':t.rstrip(':')}); continue
        if len(t)<70 and not re.search(r'[.:;,]$', t) and ':' not in t and not re.match(r'^(Background|Case presentation|Conclusion|Keywords|OR |Seizure)', t) and len(t.split())<=8 and t[0].isupper() and not re.search(r'\d{4}\)', t) and not re.match(r'^[①-⑩]', t):
            blocks.append({'t':'h3','x':t}); continue
        mm=re.match(r'^(Background|Case presentation|Conclusion|Keywords):\s*(.*)$', t)
        if mm: blocks.append({'t':'p','x':t,'lead':mm.group(1)}); continue
        blocks.append({'t':'p','x':t})
    # references: paragraphs under Bibliography heading become refs
    out=[]; mode='body'
    for b in blocks:
        if b['t']=='h2' and b['x'].lower() in ('bibliography','references'): mode='refs'; out.append({'t':'h2','x':'References'}); continue
        if b['t']=='h2' and b['x'].lower().startswith('abbreviation'): mode='body'
        if mode=='refs' and b['t'] in ('p','h3'):
            if out and out[-1]['t']=='refs': out[-1]['items'].append(b['x'])
            else: out.append({'t':'refs','items':[b['x']]})
            continue
        if mode=='refs' and b['t']=='table': mode='body'; out.append({'t':'h2','x':'Abbreviations'})
        out.append(b)
    return out

FIGS=json.load(open(S+'/figs.json')); DFIGS=json.load(open(S+'/docx_figs.json'))
import os
def docx_images(path, key):
    z=zipfile.ZipFile(path); rels=z.read('word/_rels/document.xml.rels').decode('utf8')
    rid2t={m.group(1):m.group(2) for m in re.finditer(r'Id="([^"]+)"[^>]*Target="([^"]+)"', rels)}
    xml=z.read('word/document.xml').decode('utf8'); body=re.search(r'<w:body>(.*)</w:body>', xml, flags=re.S).group(1)
    items=re.findall(r'(<w:tbl>.*?</w:tbl>|<w:p[ >].*?</w:p>)', body, flags=re.S)
    def ptext(p): return html.unescape(''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p))).strip()
    pending=[]; figs={}; OUT='/Users/avanapatel/Applications/portfolio-site/assets/research/fig/'
    for it in items:
        if it.startswith('<w:tbl>'): continue
        embeds=re.findall(r'r:embed="([^"]+)"', it); t=ptext(it)
        m=re.match(r'^(Figure)\s*(\d+)\s*[:\-–.]?\s*(.*)$', t)
        if embeds: pending+=embeds
        if m:
            n=int(m.group(2)); files=[]
            for rid in pending:
                tgt=rid2t.get(rid)
                if not tgt: continue
                data=z.read('word/'+tgt); ext=os.path.splitext(tgt)[1].lower()
                fn=f'{key}-f{n}{"" if not files else chr(97+len(files))}{ext}'; open(OUT+fn,'wb').write(data); files.append(fn)
            figs[str(n)]={'caption':m.group(3),'files':files}; pending=[]
    return figs
DFIGS['rep1']=docx_images('/Users/avanapatel/Desktop/medtech projects videos/pneumonia vision report 1 .docx','rep1')
DFIGS['rep2']=docx_images('/Users/avanapatel/Desktop/medtech projects videos/pneumotrace report 2.docx','rep2')
WITHHELD=('Photograph','Histopathology','Patient MRIs','Post operative cyst change')
def attach_pdf(blocks, key):
    f=FIGS[key]
    for b in blocks:
        if b['t']!='fig': continue
        if b['k']=='Figure' and str(b['n']) in f['figs']: b['src']='assets/research/fig/'+f['figs'][str(b['n'])]['file']
        if b['k']=='Table' and str(b['n']) in f['tables']: b['srcs']=['assets/research/fig/'+x for x in f['tables'][str(b['n'])]['files']]
    return blocks
def attach_docx(blocks, key):
    f=DFIGS[key]
    for b in blocks:
        if b['t']!='fig' or b['k']!='Figure': continue
        info=f.get(str(b['n']))
        if any(w.lower() in b['x'].lower() for w in WITHHELD):
            b['withheld']=True; continue
        if info and info['files']: b['srcs']=['assets/research/fig/'+x for x in info['files']]
    return blocks
DISS='/Users/avanapatel/Desktop/MED/Avana Patel SSC4 Dissertation_Outcomes of VSP_final.pdf'
BB='/Users/avanapatel/Desktop/MED/1st yr Med/Essays/BB/Avana Framroz Patel_18427907_assignsubmission_file__BB Title 5 essay.pdf'
MET='/Users/avanapatel/Desktop/MED/1st yr Med/Essays/MET/MET Essay Title 4 Alcohol dependency.pdf'
NHS='/Users/avanapatel/Desktop/MED/2nd yr med/Essays yr2/nhs mini review.pdf'
GBM='/Users/avanapatel/Desktop/Passion projects/CASE/GBM case writeup (case 01) RAL.docx'
OLI='/Users/avanapatel/Desktop/Passion projects/CASE/CASE 2/Olgo case writeup.docx'

common_drop=[r'^Page \d+ of \d+', r'Candidate [Nn]o', r'^\s*-?\s*\d{1,2}\s*-?\s*$', r'^BB/HD1', r'^CR/MET/LOCO', r'^Mini-Review Essay', r'Powered by Bing', r'© Australian Bureau', r'^\d+%$', r'^Sum of Number', r'^1 418$']
diss_heads=['Abstract','Introduction','Background','Justification of the scoping review','Key terms','Contextual overview of VSP','Emergence of VSP','Current drawbacks in Traditional planning','Benefits of VSP','Accuracy:','Efficiency:','Predictability:','Personalisation:','Themes in the available literature','Current challenges and gaps in the literature','Lack of homogeneity','Human error','Critique on Cost','Public health implications:','Methodology','Search strategy','Data selection','Eligibility criteria','Inclusion Criteria','Exclusion Criteria','PRISMA flow diagram','Data items','Outline and justification','Risk of bias & quality assessment','Data extraction','Data synthesis & results','Functional outcomes','Surgical accuracy','Surgical time','Complications & post-operative outcomes','Cost','Aesthetic outcomes','Photographic comparisons & symmetry indices','Aesthetic satisfaction','Findings of the randomised controlled trials','Findings of the case studies','Limitatons & personal risk of bias','Future recommendations: practice, policy & research','Optimise accuracy','Techniques to reduce operative time','Maximising cost efficiency','Standardising aesthetic outcome assessment','Endnote','Supplemental material','Disclosures','Funding','Ethics','Acknowledgement','References']
diss=pdf_blocks(DISS, {0,2,3}, common_drop, diss_heads, drop_first_lines_on=(1,7))
bb=pdf_blocks(BB, {0,1}, common_drop, ['Introduction','Neurohormones, the Hypothalamus and the Pituitary Gland','Physiology of the HPA Axis','Overview of Cortisol','Immediate Effects of Stress','Effects of Chronic Stress','Conclusion','References'])
met=pdf_blocks(MET, {0}, common_drop, ['Introduction and Background Information','Normal Glucose Homeostasis','Impact of Alcohol Dependence on Glucose Homeostasis','Alcohol Metabolism:','Reduction of Blood glucose:','Glucose uptake in the brain:','Effect on lipolysis:','Increase in blood glucose:','Symptoms of Alcohol Dependence','Conclusion','Bibliography'])
nhs=pdf_blocks(NHS, {0,1}, common_drop, ['Introduction','Opportunities','Challenges','Conclusion','Bibliography'])
case_heads=['Background & Literature Review','Case Presentation','Discussion','Bibliography','Abbreviation','Investigations','Treatment Regiment','Outcome','Recurrence & Re-treatment','Neurological Outcomes & Functional Status','Clinical Examination of Patient','Timeline','History']
gbm=docx_blocks(GBM, case_heads)
oli=docx_blocks(OLI, case_heads)

def tidy(blocks):
    out=[]
    for b in blocks:
        if b['t']=='h3' and b['x']=='Optimise Accuracy' and not any(o['t']=='h2' and o['x'].startswith('Future Recommendations') for o in out):
            out.append({'t':'h2','x':'Future Recommendations: Practice, Policy & Research'})
        if b['t']=='p' and len(b['x'])<3: continue
        if b['t'] in('h2','h3'): b['x']=re.sub(r'\s+',' ',b['x']).strip()
        out.append(b)
    return out

papers=[
 dict(id='vsp-dissertation', kind='Dissertation', year='2025', title='The functional and aesthetic outcomes of virtual surgical planning in craniofacial surgery', subtitle='A systematic review and meta-analysis', tag='Craniofacial surgery',
      summary='Systematic review of 25 studies (7 RCTs, 13 cohorts, 5 case reports) with two meta-analyses. Virtual surgical planning cut operative time in mandibular surgery by 89 minutes on average, but showed no significant difference in U1 cephalometric accuracy; it is safe, most valuable with 3D-printed cutting guides, and its cost-effectiveness varies by setting. Ends with practical recommendations and a standardised reporting sheet.',
      affiliation='qmul', pdf='assets/research/vsp-craniofacial-dissertation.pdf', grade='Awarded A+ (96%)', blocks=attach_pdf(tidy(diss),'diss')),
 dict(id='gbm-case', kind='Case report', year='2026', title='Treatment approaches and long-term functional outcomes in glioblastoma', subtitle='Examined through an extreme >13-year survivor', tag='Neuro-oncology', authors='Aadil S. Chagla, Avana F. Patel',
      summary='A man diagnosed with glioblastoma at 45, treated with subtotal resection and radiotherapy alone, who remains independent and cognitively intact more than 13 years later. Recurrence at 12 years was visible only on perfusion and spectroscopy. The case argues that the tumour was probably an unrecognised IDH-mutant astrocytoma and makes the case for retrospective molecular and germline testing.',
      affiliation=None, confidential='Histopathology slides and images are withheld and must be requested from the author; confidential until publication.', blocks=attach_docx(tidy(gbm),'gbm')),
 dict(id='oligo-case', kind='Case report', year='2026', title='Recurrent pseudo-recurrences successfully treated with steroids in an IDH-mutant oligodendroglioma', subtitle='With a proposed serial-MRI score (SMART-RADS)', tag='Neuro-oncology', authors='Aadil S. Chagla, Avana F. Patel',
      summary='A woman with a 1p/19q-codeleted oligodendroglioma who, over ten years, had three seizure-cluster episodes that looked like recurrence on MRI but resolved each time on a dexamethasone taper without re-operation, re-irradiation or chemotherapy. The report separates pseudoprogression, radiation necrosis, SMART syndrome and peri-ictal change, and proposes SMART-RADS, a serial-MRI score built around trajectory rather than any single scan.',
      affiliation=None, confidential='Histopathology slides and images are withheld and must be requested from the author; confidential until publication.', blocks=attach_docx(tidy(oli),'oli')),
 dict(id='hpa-essay', kind='Essay', year='2022', title='Neurohormone release, the HPA axis and the acute and chronic effects of stress on the brain', tag='Neuroendocrinology',
      summary='How hypothalamic neurohormones reach the anterior pituitary, how the hypothalamus–pituitary–adrenal axis drives the acute stress response through CRH, ACTH and cortisol, and what chronic cortisol exposure does to the prefrontal cortex, amygdala and hippocampus, including links to depression and Alzheimer’s disease.',
      affiliation='qmul', pdf='assets/research/hpa-axis-stress-essay.pdf', blocks=attach_pdf(tidy(bb),'bb')),
 dict(id='alcohol-essay', kind='Essay', year='2022', title='Alcohol dependency and the metabolism of glucose', tag='Metabolism',
      summary='Normal glucose homeostasis through insulin, glucagon and somatostatin, and how chronic ethanol metabolism disrupts it: NADH excess, inhibition of phosphofructokinase, pyruvate carboxylase and malate dehydrogenase, altered lipolysis and insulin resistance, leading to alcoholic ketoacidosis, fatty liver and inflammatory complications.',
      affiliation='qmul', pdf='assets/research/alcohol-glucose-metabolism-essay.pdf', blocks=attach_pdf(tidy(met),'met')),
 dict(id='davinci-review', kind='Mini-review', year='2023', title='The da Vinci Surgical System in cardiac surgery: addressing NHS bed shortages and long-term cost', tag='Health policy',
      summary='A short review of robotic cardiac surgery in the NHS: shorter hospital stays and less post-surgical pain against a £1–2.5 million system cost and a steep training curve, and where the technology is most worth deploying.',
      affiliation='qmul', pdf='assets/research/davinci-cardiac-nhs-review.pdf', blocks=tidy(nhs)),
]
REP1='/Users/avanapatel/Desktop/medtech projects videos/pneumonia vision report 1 .docx'
REP2='/Users/avanapatel/Desktop/medtech projects videos/pneumotrace report 2.docx'
rep_heads=['Abstract','Data and code availability','Transparency statement','Conflicts of interest','Introduction','Background','Methods','Methodology','Results','Discussion','Limitations','Conclusion','Conclusions','References','Bibliography','Appendix','Experiment log','Data','Model','Training','Evaluation']
def report(path, id, title, subtitle, summary, year, tag):
    blocks=docx_blocks(path, rep_heads, skip_first=0)
    # drop the running header / title lines that duplicate the card
    drop=0
    while blocks and blocks[0]['t'] in ('p','h3') and drop<6 and not blocks[0]['x'].lower().startswith('abstract'):
        blocks.pop(0); drop+=1
    if blocks and blocks[0]['t']=='p' and blocks[0]['x'].strip().lower()=='abstract': blocks[0]={'t':'h2','x':'Abstract'}
    key='rep1' if 'report 1' in path else 'rep2'
    return dict(id=id, kind='Report', year=year, title=title, subtitle=subtitle, tag=tag, summary=summary, affiliation=None, blocks=attach_docx(tidy(blocks), key), medtech=True)
papers.append(report(REP1,'pneumovision-report-1','Does transfer learning improve pneumonia detection on low-resolution chest radiographs?','A controlled comparison of a simple convolutional network against established pretrained architectures','Report I of the PneumoVision project: a small CNN trained from scratch on paediatric chest X-rays against pretrained networks, with a first look at what the accuracy score was hiding.','2026','Machine learning'))
papers.append(report(REP2,'pneumovision-report-2','Internal gains, external collapse: fifteen stages of optimising a pneumonia classifier','Training improvements raised internal ROC-AUC from 0.93 to 0.99 and specificity from 56% to 92%. Almost none of it transferred to an independent dataset.','Report II: the 27-experiment optimisation log, from class imbalance and clinically sensible augmentation to a frozen-model test on NIH ChestX-ray14, where AUC fell from 0.99 to 0.69.','2026','Machine learning'))
out='// Generated from the source documents by build_papers.py — cleaned reading copies (title pages and candidate details removed).\nexport const PAPERS = '+json.dumps(papers, ensure_ascii=False, indent=1)+';\n'
open('/Users/avanapatel/Applications/portfolio-site/js/papers.js','w').write(out)
for p in papers:
    kinds={}
    for b in p['blocks']: kinds[b['t']]=kinds.get(b['t'],0)+1
    print(p['id'], kinds)
