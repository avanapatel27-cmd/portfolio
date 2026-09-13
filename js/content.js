// ─────────────────────────────────────────────────────────────────────────────
// Edit this file to change the objects on the desk and what each one opens.
//   x / y  → position of the hotspot as a % of the desk image (2048×1152)
//   image  → the close-up render shown when you zoom in
//   items  → cards for the side panel (unused when a section has its own page)
// ─────────────────────────────────────────────────────────────────────────────

import { ARTICLES } from './articles.js?v=1';

export const SECTIONS = {
  laptop: {
    x: 23.5, y: 63,
    eyebrow: '01 · The laptop',
    title: 'AI & MedTech',
    label: 'AI & MedTech',
    sub: 'The laptop',
    image: 'assets/laptop.jpg',
    video: 'assets/intro.mp4',      // Kling dolly render used as the zoom
    sound: 'tech',                   // soft digital ambience while the laptop comes up
    videoRate: 1.45,                // playback speed
    videoFade: 0.35,
    landing: true,                  // freeze on the clip's last frame, no side panel
    enter: { x: 50.3, y: 54.5, w: 10.5, h: 6 },  // ENTER button position in the last frame (%)
    dive: { x: 50, y: 47 },         // where the camera dives when ENTER is clicked (screen centre)
    page: true,                     // ENTER opens a full page
    blurb: 'Where machine learning meets the operating room. Tools, models and products built to make clinical work faster, safer and more human.',
    // ── The four modules shown on the AI & MedTech console. Each opens its own project page.
    //    media: a demo video (with optional poster) or an image. links: file (viewer), href (new tab) or paper (reader).
    projects: [
      {
        id: 'voxelview', code: '01', title: 'VoxelView', kicker: 'DICOM viewer for CT & MRI',
        tagline: 'Some of the most important tools in healthcare aren’t new drugs or surgical techniques; they’re the software clinicians rely on every day.',
        tags: ['Radiology', 'DICOM', 'Desktop app', '3D rendering'],
        media: { video: 'assets/medtech/voxelview-demo.mp4', poster: 'assets/medtech/voxelview-poster.jpg' },
        body: [
          'Over the past few months I’ve been building a standalone desktop application for viewing and analysing medical imaging. Designed around DICOM CT and MRI scans, it brings together many of the core tools found in clinical radiology viewers into a modern, intuitive interface that runs entirely locally on your own computer.',
          'One thing I wanted to prioritise from the start was usability. Medical imaging software can often feel overwhelming, especially for students or clinicians who only use it occasionally. My goal was to build something powerful enough for advanced users while remaining approachable for anyone learning to interpret imaging.',
          'One aspect I particularly enjoyed building was the annotation and segmentation workflow. Being able to outline structures slice by slice, calculate tumour volumes and visualise them in 3D makes imaging far more interactive than simply scrolling through slices.',
          'Building VoxelView taught me just how much thoughtful UI and workflow design matters in healthcare software. The technology behind medical imaging is already incredible, but making those tools faster, cleaner and more intuitive can have just as much impact on the people using them every day.',
        ],
        features: [
          'CT & MRI DICOM support',
          'Axial, coronal and sagittal viewing with multiplanar reconstruction (MPR)',
          'Windowing, contrast and brightness, zoom and pan',
          'Measurement and annotation tools',
          'ROI and tumour segmentation with automated area and volume calculations',
          'Side-by-side study comparison with linked navigation',
          '3D volume rendering',
          'Fully local project saving: scans reviewed offline, patient data kept on-device',
        ],
        links: [ { label: 'Watch the demo', video: true } ],
      },
      {
        id: 'qtrace', code: '02', title: 'QTrace', kicker: 'Local ECG analysis & 3D morphology',
        tagline: 'The innovation is in how we analyse it; the next leap in cardiology will come from software, not hardware.',
        tags: ['Cardiology', 'Signal processing', 'EPR integration', '3D visualisation'],
        media: { video: 'assets/medtech/qtrace-demo.mp4', poster: 'assets/medtech/qtrace-poster.jpg' },
        body: [
          'A project that started as curiosity has turned into a real clinical tool. QTrace is a fully local ECG analysis system that handles everything from raw digital ECG files to photos, scans and continuous live capture.',
          'One of the most exciting parts has been creating a 3D visualisation engine that lets you explore ECG morphology in a completely new way. Alongside that, QTrace can digitise ECGs from images: correcting distortions, detecting grids and turning a simple photo into a measurable, analysable waveform.',
          'Building this taught me far more than ECGs. It pushed me into real software engineering: designing a backend that integrates with hospital electronic patient records, building multi-format import pipelines, and creating a workflow that supports both clinicians and ECG technicians.',
          'It has been a rewarding mix of medicine, engineering and clinical workflow design. The more I build, the more I see how these tools could fit into a wider, unified patient ecosystem, one that bridges clinical practice and health informatics.',
        ],
        features: [
          'Raw digital ECG files, photos, scans and continuous live capture',
          'Image digitisation: distortion correction, grid detection, waveform extraction',
          '3D visualisation engine for ECG morphology',
          'Backend integration with hospital electronic patient records',
          'Multi-format import pipelines',
          'Workflows for clinicians and ECG technicians',
        ],
        links: [ { label: 'Watch the demo', video: true } ],
      },
      {
        id: 'zplasty', code: '03', title: 'Z-plasty Simulator', kicker: 'Reconstructive planning tool & surgical guide',
        tagline: 'A reconstructive concept turned into a visual planning tool.',
        tags: ['Plastic surgery', 'Simulation', 'Digital twins', 'Teaching'],
        media: { video: 'assets/medtech/zplasty-simulator.mp4', poster: 'assets/medtech/zplasty-poster.jpg' },
        body: [
          'I recently completed a Z-plasty course in reconstructive surgery and created my own surgical guide to bring together the main concepts behind flap design, scar reorientation, contracture release, technique and complications. I developed all of the drawings, so it also became a good anatomy revision exercise and a way to make the teaching feel more intuitive.',
          'At the same time I began an AI in Medicine course through RCSI, where I was introduced to concepts such as digital twins and AI-driven modelling and simulation to optimise clinical workflows.',
          'That led to a small side project: I decided to combine the two. Using AI-assisted coding, I built a Z-plasty simulation model despite having no formal coding experience. The model allows interactive exploration of angle selection, limb length and predicted geometric outcomes, translating a reconstructive concept into a visual planning tool that could help surgeons or surgical trainees think through design choices more clearly.',
        ],
        features: [
          'Interactive angle selection and limb length',
          'Predicted geometric outcomes of the transposed flaps',
          '3D visualisation of the flap design',
          'Companion guide: flap design, scar reorientation, contracture release, technique and complications',
        ],
        links: [
          { label: 'Open the simulator', href: 'assets/tools/zplasty/index.html' },
          { label: 'Read the surgical guide', file: 'assets/medtech/zplasty-guide.pdf', title: 'Z-plasty reconstructive surgery guide' },
          { label: 'Watch the demo', video: true },
        ],
      },
      {
        id: 'pneumovision', code: '04', title: 'PneumoVision', kicker: 'Pneumonia detection & the limits of accuracy',
        tagline: 'An AI model can be 99% accurate and still be wrong about what you think it learned.',
        tags: ['Deep learning', 'Chest X-ray', 'PyTorch', 'External validation'],
        media: { image: 'assets/medtech/pneumovision-model.jpg' },
        body: [
          'I started with a simple idea: train a CNN to detect pneumonia from chest X-rays, get a good score, build an interface and move on. My first model got around 83% accuracy. Sounds pretty good, until I looked underneath the number. It had 99.5% sensitivity but only 56% specificity: it was finding almost every pneumonia case, but also labelling far too many normal X-rays as pneumonia.',
          'So I went down a rabbit hole. I ran 27 logged experiments testing class imbalance, augmentation, image resolution and data leakage. Some changes helped significantly, others barely made a difference. One of the biggest improvements came from addressing class imbalance. I also learned that medical images need clinically sensible augmentation: a horizontal flip might be harmless for a cat photo, but a flipped chest X-ray changes the anatomy. Eventually the model reached an AUC of around 0.99 on its original dataset.',
          'That still wasn’t enough. I froze the model and tested it on NIH ChestX-ray14, a completely different dataset with a different population, setting and labelling process. The AUC dropped from 0.9923 to 0.6867. That result was more interesting to me than the 0.99.',
          'The biggest lesson wasn’t about CNNs or which architecture performed best. It was about questioning your own model. A high score is exciting, but understanding why you got it, what the model is actually learning and how it performs on completely new data matters much more. I built PneumoVision as a doctor learning machine learning rather than someone from a computer-science background, and it taught me more about evaluating AI critically than I expected.',
        ],
        features: [
          '27 logged experiments: class imbalance, augmentation, resolution, data leakage',
          'Internal ROC-AUC 0.93 → 0.99; specificity 56% → 92%',
          'Frozen-model external validation on NIH ChestX-ray14: AUC 0.99 → 0.69',
          'Two written reports with the full experiment log',
        ],
        links: [
          { label: 'Report I: transfer learning on low-resolution radiographs', paper: 'pneumovision-report-1' },
          { label: 'Report II: internal gains, external collapse', paper: 'pneumovision-report-2' },
        ],
      },
    ],
    items: [
      { tag: 'Radiology', title: 'VoxelView: DICOM viewer for CT and MRI', desc: 'An education-first radiology viewer, designed and built independently, with cross-plane annotation.' },
      { tag: 'Surgical simulation', title: 'Z-plasty Surgical Simulator', desc: 'A virtual simulator of Z-plasty flap design, built on a validated mathematical model.' },
      { tag: 'Cardiology', title: 'ECG Viewer', desc: 'An ECG display and interpretation-teaching tool.' },
      { tag: 'Research', title: 'Virtual surgical planning in craniofacial surgery', desc: 'Systematic review and meta-analysis of functional and aesthetic outcomes; the question that started the medtech work.' },
    ],
  },

  book: {
    x: 41, y: 70,
    eyebrow: '02 · The logbook',
    title: 'Logbook',
    label: 'Logbook',
    sub: 'The logbook',
    image: 'assets/desk.jpg',
    video: 'assets/book.mp4',        // dolly render used as the zoom onto the book (original in assets/originals/)
    sound: 'pages',                  // pages flicking while the book opens
    videoFade: 0.6,                  // first frame differs slightly from the desk: crossfade in
    landing: true,                   // freeze on the clip's last frame, then open the logbook page
    autoOpen: 500,
    page: 'logbook',
    // ── Surgical logbook. Leave a field as '' if you don't have it yet.
    logbook: {
      intro: 'Cases I have scrubbed in on, and the work that is still open.',
      cases: [
        { procedure: 'Ball-and-socket joint insertion', specialty: 'Orthopaedics', role: 'Scrubbed in', surgeon: 'Mr Skodacek', where: '', when: '9 Feb 2025' },
        { procedure: 'Mandibular reconstruction', specialty: 'Plastic & reconstructive surgery', role: 'Scrubbed in, assisted', surgeon: 'Dr Amresh Baliarsing', where: 'P. D. Hinduja Hospital, Mumbai', when: '2024' },
        { procedure: 'Tendon repair', specialty: 'Plastic & hand surgery', role: 'Scrubbed in, assisted', surgeon: 'Dr Amresh Baliarsing', where: 'P. D. Hinduja Hospital, Mumbai', when: '2024' },
        { procedure: 'Glioblastoma resection', specialty: 'Neurosurgery', role: 'Scrubbed in', surgeon: 'Dr Adil Chagla', where: 'K. E. M. Hospital, Mumbai', when: '2020' },
      ],
      projects: [
        { title: 'Cardiology outpatient clinic: making the pathway more efficient', kind: 'Audit, with QIP to follow', status: 'In progress', where: 'Northwick Park Hospital', when: '2026',
          desc: 'Auditing how patients move through the cardiology outpatient clinic, where time is lost, and which steps can be redesigned. The audit cycle first, then a quality-improvement project on the changes it points to.' },
      ],
    },
    blurb: 'A running record of the theatre cases I have scrubbed in on, and the projects still open.',
    items: [
      { tag: 'Paper', title: 'Publication one', desc: 'Journal · Year · Authors.' },
      { tag: 'Poster', title: 'Publication two', desc: 'Conference · Year.' },
      { tag: 'Ongoing', title: 'Current study', desc: 'What I am working on right now.' },
    ],
  },

  skull: {
    x: 52, y: 66,
    eyebrow: '03 · The skull',
    title: 'Medicine & Surgery',
    label: 'Medicine & Surgery',
    sub: 'The skull',
    image: 'assets/skull.jpg',
    video: 'assets/skull.mp4',       // "zoom to eye" render used as the zoom
    videoRate: 1.15,
    videoFade: 0.5,
    freezeAt: 5.02,                  // deep in the black of the eye, just before the clip ends
    landing: true,                   // freeze there, no side panel
    autoOpen: 250,                   // then fade to black and let the helix form
    page: 'dna',                     // the medical portfolio: a 3D DNA helix with four markers
    dna: {
      eyebrow: 'The medical portfolio',
      title: 'Medicine & Surgery',
      blurb: '',
      sections: [
        {
          label: 'Research', hint: 'dissertation · case reports · essays',
          eyebrow: '01 · Research', title: 'Research',
          blurb: '',
          // ── `paper` opens the cleaned reading copy from js/papers.js; `file` opens a document in the viewer.
          items: [
            { tag: 'Dissertation', paper: 'vsp-dissertation' },
            { tag: 'Case report', paper: 'gbm-case' },
            { tag: 'Case report', paper: 'oligo-case' },
            { tag: 'Essay', paper: 'hpa-essay' },
            { tag: 'Essay', paper: 'alcohol-essay' },
            { tag: 'Mini-review', paper: 'davinci-review' },
          ],
        },
        {
          label: 'Clinical Development', hint: 'placements · the road through training',
          eyebrow: '02 · Clinical development', title: 'The <em>road</em> through training',
          blurb: '',
          // ── the roadmap. Dates are YYYY-MM-DD; `hue` colours the slab; add `notes` to a placement once it has a story.
          roadmap: {
            programme: 'Specialised Foundation Programme · August 2026 to August 2028',
            years: [
              { label: 'Foundation Year 1', trust: 'London North West University Healthcare NHS Trust · Northwick Park Hospital', from: '2026-08-05', to: '2027-08-03' },
              { label: 'Foundation Year 2', trust: 'Imperial College Healthcare NHS Trust', from: '2027-08-05', to: '2028-08-03' },
            ],
            placements: [
              { title: 'Cardiology', site: 'Northwick Park Hospital', trust: 'London North West University Healthcare NHS Trust', from: '2026-08-05', to: '2026-12-02', hue: 6 },
              { title: 'Rheumatology', site: 'Northwick Park Hospital', trust: 'London North West University Healthcare NHS Trust', from: '2026-12-02', to: '2027-04-06', hue: 285 },
              { title: 'General Surgery', site: 'Northwick Park Hospital', trust: 'London North West University Healthcare NHS Trust', from: '2027-04-07', to: '2027-08-03', hue: 168 },
              { title: 'Intensive Care', site: 'Imperial College Healthcare NHS Trust', from: '2027-08-05', to: '2027-12-02', hue: 205 },
              { title: 'Academic block', sub: 'Research · anaesthesia and critical care', site: 'Imperial College Healthcare NHS Trust', from: '2027-12-02', to: '2028-04-06', hue: 42 },
              { title: 'Emergency Medicine', site: 'Imperial College Healthcare NHS Trust', from: '2028-04-07', to: '2028-08-03', hue: 24 },
            ],
          },
        },
        {
          label: 'Certificates & Courses', hint: 'training · qualifications',
          eyebrow: '03 · Certificates & courses', title: 'Certificates & Courses',
          blurb: '',
          // ── groups of certificates. `file` is opened in the viewer when clicked (PDF, PNG or JPG).
          // Each group is an expandable drop-down; `open: true` starts it expanded.
          groups: [
            {
              title: 'Surgical skills',
              open: true,
              items: [
                { tag: 'Microsurgery', title: 'Microvascular Anastomosis', issuer: 'Department of Neurosurgery, Nair Hospital, Mumbai · Shaukat C. Chagla Memorial Trust', date: '', file: 'assets/certs/microvascular-anastomosis-nair-hospital.png' },
                { tag: 'Hand surgery', title: 'Tendon Repair workshop, delivered and taught', issuer: 'QMUL Plastics & Dermatology Society · Modified Kessler, Adelaide & cruciate repair', date: '29 Nov 2025', file: 'assets/certs/tendon-repair-workshop-2025.png' },
                { tag: 'Plastic surgery', title: 'Z-Plasty', issuer: 'Amosmile with UNITAR · Wg Cdr Ankur Pandya, Portsmouth Hospitals NHS', date: '31 Mar 2026', file: 'assets/certs/z-plasty-amosmile-2026.pdf' },
              ],
            },
            {
              title: 'Conferences & prizes',
              items: [
                { tag: 'Prize', title: 'APRAS Prize 2025: poster shortlisted', issuer: 'Royal Society of Medicine, Plastic Surgery Section · virtual surgical planning in craniofacial surgery: a systematic review and meta-analysis', date: '15 Nov 2025', file: 'assets/certs/apras-2025-poster-shortlist-rsm.pdf' },
                { tag: 'Conference', title: 'Aspiring Plastic, Reconstructive & Aesthetic Surgeons (APRAS) 2025', issuer: 'Royal Society of Medicine · certificate of attendance', date: '15 Nov 2025', file: 'assets/certs/apras-2025-attendance-rsm.pdf' },
              ],
            },
            {
              title: 'Leadership & teaching',
              items: [
                { tag: 'Society', title: 'Founder & President', issuer: 'QMUL Plastics & Dermatology Society · exemplary service and contribution', date: '2024 / 25', file: 'assets/certs/pds-founder-president-2024-25.png' },
                { tag: 'Seminar', title: 'Pathway application routes for Plastic Surgery & Dermatology', issuer: 'QMUL Plastics & Dermatology Society · seminar delivered', date: '13 Nov 2024', file: 'assets/certs/pds-seminar-pathways-2024.png' },
                { tag: 'Leadership', title: 'MEDPRO: Leadership in Medicine', issuer: 'Delivered by H.E. George Vella, President of Malta', date: '22 Mar 2022', file: 'assets/certs/medpro-leadership-in-medicine-2022.pdf' },
              ],
            },
            {
              title: 'Life support',
              items: [
                { tag: 'Life support', title: 'Immediate Life Support (ILS) Provider', issuer: 'European Resuscitation Council · Victoria, Malta', date: '13 Oct 2025', file: 'assets/certs/ils-provider-erc-2025.pdf' },
              ],
            },
            {
              title: 'Digital medicine & technology',
              items: [
                { tag: 'Clinical safety', title: 'Essentials of Digital Clinical Safety', issuer: 'NHS Digital Clinical Safety training (CSF) · passed', date: '20 Aug 2026', file: 'assets/certs/digital-clinical-safety-essentials-2026.pdf' },
                { tag: 'Clinical safety', title: 'Digital Clinical Safety: Intermediate', issuer: 'NHS Digital Clinical Safety training (CSF) · passed', date: '20 Aug 2026', file: 'assets/certs/digital-clinical-safety-intermediate-2026.pdf' },
                { tag: 'AI', title: 'AI for Student Learning and Research 2025/26', issuer: 'Queen Mary University of London, Faculty of Medicine & Dentistry', date: '5 Nov 2025', file: 'assets/certs/ai-for-student-learning-and-research-2025.pdf' },
              ],
            },
            {
              title: 'NHS statutory & mandatory training',
              items: [
                { tag: 'Safeguarding', title: 'Safeguarding Children Level 2', issuer: 'London North West University Healthcare NHS Trust', date: '18 Jul 2026', file: 'assets/certs/nhs-safeguarding-children-level2-2026.pdf' },
                { tag: 'Safeguarding', title: 'Safeguarding Adults Level 2', issuer: 'London North West University Healthcare NHS Trust', date: '18 Jul 2026', file: 'assets/certs/nhs-safeguarding-adults-level2-2026.pdf' },
                { tag: 'Patient safety', title: 'PSIRF Training Level 1A', issuer: 'Patient Safety Incident Response Framework · London North West University Healthcare NHS Trust', date: '18 Jul 2026', file: 'assets/certs/nhs-psirf-level-1a-2026.pdf' },
                { tag: 'Infection control', title: 'Infection Control (Clinical)', issuer: 'London North West University Healthcare NHS Trust', date: '18 Jul 2026', file: 'assets/certs/nhs-infection-control-clinical-2026.pdf' },
                { tag: 'Learning disability', title: 'Oliver McGowan Part A: Mandatory Training on Learning Disability and Autism', issuer: 'London North West University Healthcare NHS Trust', date: '18 Jul 2026', file: 'assets/certs/nhs-oliver-mcgowan-part-a-2026.pdf' },
                { tag: 'Equality', title: 'Equality, Diversity and Human Rights', issuer: 'London North West University Healthcare NHS Trust', date: '18 Jul 2026', file: 'assets/certs/nhs-equality-diversity-human-rights-2026.pdf' },
                { tag: 'Safety', title: 'Conflict Resolution', issuer: 'London North West University Healthcare NHS Trust', date: '18 Jul 2026', file: 'assets/certs/nhs-conflict-resolution-2026.pdf' },
                { tag: 'Safety', title: 'Fire Safety (All Staff)', issuer: 'London North West University Healthcare NHS Trust', date: '29 Aug 2026', file: 'assets/certs/nhs-fire-safety-2026.pdf' },
                { tag: 'Mental capacity', title: 'Mental Capacity Act (MCA)', issuer: 'London North West University Healthcare NHS Trust', date: '29 Aug 2026', file: 'assets/certs/nhs-mental-capacity-act-2026.pdf' },
                { tag: 'Mental capacity', title: 'Deprivation of Liberty Safeguards (DoLS)', issuer: 'London North West University Healthcare NHS Trust', date: '29 Aug 2026', file: 'assets/certs/nhs-dols-2026.pdf' },
                { tag: 'Falls', title: 'Falls Awareness', issuer: 'London North West University Healthcare NHS Trust', date: '29 Aug 2026', file: 'assets/certs/nhs-falls-awareness-2026.pdf' },
                { tag: 'Paediatrics', title: 'Asthma in Children and Young People 0–18 years', issuer: 'London North West University Healthcare NHS Trust', date: '29 Aug 2026', file: 'assets/certs/nhs-asthma-children-young-people-2026.pdf' },
                { tag: 'Quality improvement', title: 'Level 1: Improvement for All', issuer: 'London North West University Healthcare NHS Trust', date: '29 Aug 2026', file: 'assets/certs/nhs-improvement-for-all-level1-2026.pdf' },
              ],
            },
            {
              title: 'Online courses',
              items: [
                { tag: 'Public health', title: 'Introducing Health Inequalities in Primary Care', issuer: 'Fairhealth', date: '12 Feb 2024', file: 'assets/certs/health-inequalities-primary-care-fairhealth-2024.pdf' },
                { tag: 'Epidemiology', title: 'COVID-19 Contact Tracing', issuer: 'Johns Hopkins University via Coursera', date: '27 May 2020', file: 'assets/certs/covid-19-contact-tracing-johns-hopkins-2020.pdf' },
                { tag: 'Work experience', title: 'BSMS Virtual Work Experience', issuer: 'Brighton and Sussex Medical School', date: '22 Dec 2020', file: 'assets/certs/bsms-virtual-work-experience-2020.pdf' },
              ],
            },
            {
              title: 'Clinical & communication skills',
              items: [
                { tag: 'Communication', title: 'Breaking Bad News', issuer: 'Queen Mary University of London, Malta · Clinical Communication Skills', date: '3 Sep 2025', file: 'assets/certs/breaking-bad-news-qmul-2025.pdf' },
                { tag: 'Nutrition', title: 'Online Nutrition Workshop', issuer: 'Queen Mary University of London · MUST screening, refeeding risk', date: '14 Feb 2024', file: 'assets/certs/nutrition-workshop-qmul-2024.pdf' },
              ],
            },
          ],
        },
        {
          label: 'Medical Blog', hint: 'notes · reflections',
          eyebrow: '04 · Medical blog', title: 'Medical Blog',
          blurb: 'Evidence reviews, protocols and practical pieces. Each opens with a one-page summary poster, then the full article.',
          // ── `paper` ids here point at posts in js/blog.js (same reader as the research papers)
          items: [
            { tag: 'Plastic surgery', paper: 'glp1-plastics' },
            { tag: 'Trial design', paper: 'figure-of-eight' },
            { tag: 'Rhinoplasty', paper: 'supratip' },
            { tag: 'Audit', paper: 'cied-audit' },
          ],
        },
      ],
    },
    blurb: 'Anatomy, the operating theatre and the craft of reconstruction. Clinical training, surgical planning and the cases that shaped me.',
    items: [],
  },

  orrery: {
    x: 62, y: 60,
    eyebrow: '04 · The orrery',
    title: 'Philosophy & Culture',
    label: 'Philosophy & Culture',
    sub: 'The orrery',
    image: 'assets/orrery.jpg',
    video: 'assets/orrery.mp4',      // Hailuo dolly render used as the zoom
    videoRate: 1.15,
    videoFade: 0.6,                  // first frame differs from the desk: crossfade in
    landing: true,                   // freeze on the clip's last frame, no side panel
    autoOpen: 1000,                  // ms to hold the frozen frame before the page fades in
    sound: 'gears',                  // clockwork ticks while the orrery spins, until the paper opens
    page: 'newspaper',               // the blog, laid out like an old broadsheet
    paper: {
      name: 'The Second Opinion',
      volume: 'Vol. I, No. 1',
      motto: 'Philosophy · Medicine · Ideas',
      est: 'Est. MMXXVI',
      byline: 'Dr. Avana Framroz Patel',
      price: 'Price: one idle hour',
    },
    // ── Articles live in js/articles.js. The first one is the leading article on the front page.
    articles: ARTICLES,
    blurb: 'The bigger orbit. Essays, ideas and the cultures and thinkers that keep the rest of this desk in perspective.',
    items: [],
  },
};

export const ORDER = ['laptop', 'book', 'skull', 'orrery'];

// ─────────────────────────────────────────────────────────────────────────────
// About me: opened from the little photo / info button beside the name.
// Put a square-ish photo at assets/avana.jpg (a monogram is shown until then).
// ─────────────────────────────────────────────────────────────────────────────
export const ABOUT = {
  photo: 'assets/avana.jpg',            // small round avatar in the header
  hero: {
    photo: 'assets/about-photo.jpg',     // the portrait (tan background, face on the right)
    xray: 'assets/about-xray.jpg',       // the CT / X-ray render revealed by the cursor
    align: { k: 0.85, tx: 0.178, ty: 0.014 },  // scale + offset of the X-ray so the skull sits under the face
  },
  name: 'Dr. Avana Framroz Patel',
  role: 'Resident doctor · Specialised Foundation Programme · London',
  where: 'London',
  intro: 'I’m Avana, a doctor who works where surgery, research, and technology meet.',
  paragraphs: [
    'I’m Avana, a resident doctor in London on the Specialised Foundation Programme, working across Northwick Park and Imperial. I’m interested in the space where plastic and reconstructive surgery, biomedical engineering, and digital health overlap, particularly virtual surgical planning, imaging, and AI‑supported clinical tools.',
    'Clinically, I’m drawn to fields where anatomy, reconstruction, and precision meet. I want to contribute to a future where surgical planning is more personalised, more predictable, and increasingly digital.',
    'Away from the hospital I read philosophy, write, and collect ideas from the cultures I grew up between: Mumbai, where I was born and schooled, and England, where I finished school and trained. The orrery on my desk is a reminder that the interesting questions sit in a bigger orbit than any one specialty.',
    'This site is my desk. Everything on it is something I care about; click around.',
  ],
  // (the facts grid that used to sit under the About text was removed at Avana's request)
  cv: 'assets/certs/avana-patel-cv.pdf',
};

// ─────────────────────────────────────────────────────────────────────────────
// Contact: shown at the foot of the About page (and via the Contact link).
// ─────────────────────────────────────────────────────────────────────────────
export const CONTACT = {
  blurb: 'For clinical, research or collaboration enquiries, the NHS address is best. Everything else, the personal one.',
  rows: [
    { k: 'Work email', v: 'avana.framrozpatel@nhs.net', href: 'mailto:avana.framrozpatel@nhs.net' },
    { k: 'Personal email', v: 'avanapatel27@gmail.com', href: 'mailto:avanapatel27@gmail.com' },
    { k: 'GMC', v: '8147963 · view on the GMC register ↗', href: 'https://www.gmc-uk.org/registrants/8147963' },
    { k: 'Current trust', v: 'London North West University Healthcare NHS Trust · Northwick Park Hospital' },
    { k: 'LinkedIn', v: 'Dr Avana Framroz Patel ↗', href: 'https://www.linkedin.com/in/dr-avana-framroz-patel-029274203/' },
  ],
};
