// ─────────────────────────────────────────────────────────────────────────────
// Second Opinion: the articles. The first entry is the leading article.
//   intro:    paragraphs shown on the front page and at the top of the full piece
//   sections: crossheads with their paragraphs
//   quotes:   pull quotes, keyed to the section index they follow
//   art:      an illustration drawn in js/paperart.js
//   bibliography: references printed at the end
// ─────────────────────────────────────────────────────────────────────────────

export const ARTICLES = [
  {
    kicker: 'Leading article',
    title: 'The Seams',
    deck: 'Can medicine understand a human being?',
    date: 'September 2026',
    art: { id: 'seams', caption: 'The stack. Each field stands on the one beneath, and the joins between them leak.' },
    intro: [
      'Aristotle wrote about physics, about the classification of animals, about the soul, about the proper arrangement of a city, and about what it means for an argument to be valid. We describe this as breadth. He would not have recognised the compliment. He wasn’t ranging across disciplines; there were no disciplines to range across. There was the world, and there was the attempt to give an account of it.',
      'The same is true of Galen dissecting animals in the second century, of Ibn Sina writing the Canon, of Descartes, who is remembered by doctors for a claim about the mind and body and by mathematicians for the coordinate plane. None of these people were philosophers who happened to dabble in science. The category error is ours.',
      'What happened between then and now is that the account of the world got long enough to split. And it split in a particular order, which we still teach in that order without often saying why.',
      'Physics describes matter. Chemistry describes what matter does when it combines. Biology describes the chemistry that maintains itself. Medicine describes that biology when it goes wrong in a body that can tell you about it. Each field stands on the one beneath. Each one is, in principle, a special case of the last.',
      'That’s the tidy version, and it’s wrong in an interesting way. You cannot derive a cell from the Schrödinger equation. Nobody has ever predicted a heart attack from quantum mechanics. The layers are real, but the joins between them leak, and it is in those joins, not at the bottom, that philosophy actually lives.',
    ],
    quotes: {
      0: 'The stack is real, but it is not a ladder.',
      1: 'What I need is not a troponin. What I need is a decision about a man.',
      5: 'We know more than we can tell.',
    },
    sections: [
      { h: 'The seams', p: [
        'The tidy version has a name. Reductionism, in its strongest form, says that each layer is nothing but the layer beneath it arranged differently: chemistry is applied physics, biology is applied chemistry, and a sufficiently large computer given the position of every particle in a patient could in principle tell you whether she will survive the night.',
        'In 1972 the physicist Philip Anderson wrote a short paper called More Is Different, arguing that this is false in a specific and interesting way. He accepted the first half: there is nothing in a cell that violates the laws of physics, no extra ingredient, no vital spark. But he denied the second. Knowing the rules that govern the parts does not let you derive the behaviour of the whole, because at each level of scale new regularities appear that simply are not present below. Temperature is meaningless for a single molecule. A single neuron does not have a mood.',
        'So the stack is real, but it is not a ladder. You can stand on a lower layer. You cannot climb down it and expect to find everything that was on the floor above still there.',
        'Which raises the question of what happens at the joins.',
        'Consider the one between chemistry and biology. On one side, reactions. On the other, an organism. Somewhere between them is the question of what distinguishes a living thing from a very complicated chemical system, and that question has never been settled by chemistry, because it is not a chemical question. It is a question about which concept we should be using. We have gone through vitalism, through a definition based on metabolism, through one based on reproduction, through one based on information, and we are currently unable to agree on whether a virus qualifies. Not because we lack data about viruses. We have enormous amounts of data about viruses. We lack agreement about what we are asking.',
        'The same structure appears at the seam between biology and mind. There is no missing neurotransmitter that will explain why the firing of cells is accompanied by the experience of seeing red. And it appears again, most awkwardly for us, at the top of the stack, where medicine sits: the seam between a body and a person.',
        'This is the claim I want to make. Philosophy is not the ground floor of the building, the thing everything else was built on top of and then outgrew. It is what is left in the gaps between the floors. It is the residue of questions that cannot be answered from either side of a join, and it accumulates at every join, and it never goes away, because the join is not a gap in our knowledge that more work will fill. It is a change in what kind of thing we are talking about.',
        'And medicine is built on the tallest stack we have. It inherits every unresolved seam beneath it. Then, unlike physics or chemistry, it has to reach a decision anyway, tonight, about a specific person, with incomplete information, and be accountable for it in the morning.',
      ]},
      { h: 'What the doctor is actually doing', p: [
        'Here is a version of a night I have had, and that every junior doctor has had.',
        'A man in his sixties has chest pain. I take a history, which is an account he gives me, in words, of an experience I cannot access. I perform an examination, which converts him into a set of observations. I order an ECG, which converts the electrical activity of his heart into a two-dimensional line on paper. I send a troponin, which converts a protein concentration into a number with a reference range attached. Each of these steps moves down the stack: experience becomes description, description becomes signal, signal becomes number.',
        'And then I have to move back up. Because what I need is not a troponin. What I need is a decision about a man.',
        'Every one of those conversions is lossy, and every one of them is a place where philosophy has already been doing work on my behalf, mostly invisibly. Why does this number license that belief? That is epistemology, and it has a formal answer in medicine (Bayes, likelihood ratios, pre-test probability) which is genuinely one of the great intellectual achievements of the last century and which almost no clinician consciously computes. What makes this cluster of findings one disease rather than two? That is a question about classification, and the fact that it has an answer in a manual rather than in nature is why psychiatric diagnosis is permanently contested and why the boundaries of hypertension move when a committee meets.',
        'Medicine does not, on the whole, ask these questions out loud. It doesn’t need to. The method works. A field stops interrogating its own foundations at almost exactly the moment those foundations become reliable enough to build on, and that is not a failure of curiosity, it is what progress looks like. You cannot run a ward round from first principles.',
        'But the questions do not disappear when we stop asking them. They wait at the seams. And they tend to reappear at exactly the moments medicine is under most pressure: at the edges of diagnosis, at the beginning and end of life, and, increasingly, at the point where we hand part of the reading over to a machine.',
      ]},
      { h: 'Body and person', p: [
        'Descartes made the body explicable by making it a machine, and put the mind somewhere else. Medicine has quietly kept the first half and abandoned the second, and it was the right trade: you cannot dissect, image, resect or transplant something you regard as inseparable from a soul. Almost everything medicine can do rests on treating the body as an object.',
        'But the seam is still there, and it shows up in the ordinary business of a ward. A hand is bone, tendon and vessel. A hand belonging to a pianist is also a career, and the reconstruction that restores grip strength and the reconstruction that restores her livelihood are not necessarily the same operation. Nothing in the anatomy tells you which one you are being asked for.',
      ]},
      { h: 'Disease and illness', p: [
        'Two patients, two identical scans, the same pathology to three decimal places. One is terrified, one is irritated at the parking charges, one of them will not take the medication and will not say why. Medically these are one case. Experientially they are not.',
        'Phenomenology is the attempt to describe illness from the inside, and its central observation is that a body in health is largely invisible to the person living in it. You do not notice your knee until it fails. Illness is partly the experience of your own body becoming an object to you, which is to say that the patient arrives at the same Cartesian split the doctor is trained into, except that for them it is not a method. It is what has gone wrong.',
      ]},
      { h: 'Patient and case', p: [
        'Foucault called the trained perception of the clinician the medical gaze, and the point is not that it is cruel. The point is that it is productive. It genuinely sees things that ordinary looking cannot see, and it does so by filtering a person into the features that are clinically actionable.',
        'I do this every time I present at handover. “Seventy-two-year-old man, background of COPD, day three post-op, febrile.” Everything true and nothing false, and no trace of the fact that he keeps asking whether his dog is being fed. The abstraction is the reason the system works at scale. The seam is that the abstraction is so useful it becomes the only thing anyone writes down, and what is never written down is eventually not noticed.',
      ]},
      { h: 'Knowing and doing', p: [
        'Aristotle separated epistēmē, knowledge of why things are as they are, from technē, the knowledge of how to make and do. Surgery is the second kind, and it has never sat comfortably in a discipline that certifies itself through the first.',
        'A registrar stops mid-dissection and says the tissue does not feel right, and cannot tell you how. A textbook can give you the angles for a Z-plasty and the reason a limb below thirty degrees risks necrosis, and it cannot give you the sense of when the skin has no more to give. Michael Polanyi’s formulation is that we know more than we can tell. This is not mysticism about surgical talent. It is a claim about where some knowledge is stored, which is in a trained body rather than in a sentence, and which means it can only be transmitted by doing, slowly, next to someone who already has it.',
      ]},
      { h: 'Pattern and understanding', p: [
        'A model reads ten million radiographs and returns a probability of malignancy better calibrated than mine. Ask whether it understands cancer and you get an argument that never resolves, which is the signature of a seam rather than an engineering problem.',
        'There is a sharper version of the question for anyone who builds these things. A model can be excellent by every internal measure and be reading something other than what you assume. Trained on one hospital’s images it may have learned that hospital’s scanner, its positioning conventions, the marks its radiographers make. Accuracy tells you it succeeded. It does not tell you at what. And a system that is right for reasons nobody can state is, epistemically, in the same position as the registrar who cannot say how the tissue felt, except that we extend trust to her because she can be questioned, held responsible, and asked to try again tomorrow.',
      ]},
      { h: 'Can medicine understand a human being?', p: [
        'We began with a question that has no disciplinary home, which is why it sounded like a philosophy question rather than a medical one.',
        'The answer is that medicine understands a human being extraordinarily well, in a particular sense of understanding: it can predict, intervene and repair with a power no previous century could imagine. That power came from cutting the world into layers and getting very good at one of them. It is not a compromise or a loss. It is the most successful thing our species has done.',
        'But the layers were always our arrangement rather than the world’s, and the joins between them leak. What leaks through is the set of questions that cannot be settled from either side: what makes a body a person, what makes a case a patient, what makes a pattern an understanding. Medicine does not answer these, and does not need to answer them to work. It only needs to remember that it is standing on them.',
        'The old natural philosophers were not being interdisciplinary. They simply had not yet agreed to stop asking one kind of question in order to get better at another. We made that trade, and it paid. It is worth occasionally going back to see what we left there.',
      ]},
    ],
  },

  {
    kicker: 'Essay',
    title: 'Is knowledge-based medical training obsolete in the modern world?',
    deck: 'Not obsolete. Incomplete, which is a different charge and a more accurate one.',
    date: 'April 2020',
    art: { id: 'balance', caption: 'Flexner and Osler: the foundation and the bedside, weighed against each other for a century.' },
    intro: [
      'Medical education has changed remarkably little in the last century. The syllabus has grown, but the underlying model, build a foundation of theory and then apply it at the bedside, has held. That stability has produced a disagreement worth taking seriously. One camp argues that knowledge-based training has been overtaken by the technology available to a modern clinician and is now obsolete. The other holds that nothing has happened to justify dismantling a model that works.',
      'I want to test the first claim against three things: the historical record, what medicine currently asks of its trainees, and whether the proposed alternatives can actually carry the weight.',
    ],
    quotes: {
      0: 'Treating cholera patients one at a time would never have produced the Broad Street pump.',
      2: 'What a case teaches is what that case contained.',
    },
    sections: [
      { h: 'The historical case', p: [
        'Formal knowledge-based medical training in its modern form dates largely from Abraham Flexner, whose reforms tied entry to medicine to scientific pre-medical study and made theory the foundation of the curriculum. The model spread widely and has proved durable; lecture and presentation formats still dominate teaching in a large share of medical schools worldwide (McLean 2016).',
        'Its record is difficult to argue with. The medical advances of the nineteenth and twentieth centuries were made by practitioners with almost none of the technology a student today takes for granted, and they were made by generalising rather than by accumulating cases. Smallpox vaccination, the deficiency diseases, and the identification of cholera’s transmission were all problems solved by reasoning from principle towards a general rule.',
        'John Snow is the clearest illustration. Treating cholera patients one at a time would never have produced the Broad Street pump. What produced it was a theory about how the disease moved, applied to a population rather than a person. Epidemiology did not exist to be learned from cases, because the cases on their own did not contain it. It had to be reasoned into being.',
        'Variolation offers a version of the same point from further back: the concept of deliberate exposure to prevent later disease reached Europe through transmitted written knowledge rather than through independent bedside discovery.',
        'Contemporary curricula reflect this. Cambridge’s medical course, among the most highly regarded anywhere, places clinical training after a substantial pre-clinical foundation rather than alongside it from the start (Cambridge University 2020). The sequencing encodes a claim: that the foundation is what makes the clinical years intelligible.',
        'There is a fair objection to all of this. Medicine in 1850 bears little resemblance to medicine now, and it is not obvious that the conditions which made theoretical training productive then still hold. Medical knowledge is not fixed; it is revised continually, and any curriculum has to be revised with it. But that is an argument for updating what is taught. It is not yet an argument for changing how.',
      ]},
      { h: 'What medicine now asks of its trainees', p: [
        'Two weeks ago I would have defended the existing model more confidently than I can now. A pandemic changes the shape of the question. What the last month has exposed is not a shortage of knowledge but a shortage of doctors, and a training pipeline slow and narrow enough that it cannot respond quickly to demand. A model that is heavily front-loaded with theory is expensive to scale, and expanding capacity to match a growing population is correspondingly difficult.',
        'There is a related problem of selection. Medicine is widely assumed to reward rote memorisation, and that assumption shapes who applies and who is admitted. It is not well supported: functional capability and communication skills weigh heavily in whether a trainee becomes a good doctor (Hurwitz 2013). A system that filters primarily on the ability to retain and reproduce information may be filtering on the wrong thing, and the intensity of that filtering has costs of its own in student stress and disengagement (Twenge 2009).',
        'The sharper objection concerns what knowledge-based teaching cannot reach at all. Patient interaction is a skill, not a body of facts. So is recognising that a patient’s cultural, religious and financial circumstances will shape what treatment is realistic for them, and adjusting accordingly. So is working in a team, and leading one: holding a decision while genuinely taking in the concerns of the people around you. None of this can be lectured into someone. It is learned by doing it badly under supervision until it is done well.',
        'Against this, it is worth remembering that medical training does not only produce clinicians. Research, medical statistics and pharmaceutical development are all routes out of the same degree, and all three depend far more on theoretical grounding than on clinical exposure. These are the fields that generate the treatments everyone else administers. For them, a knowledge-based foundation is not merely defensible; it is the whole point.',
      ]},
      { h: 'The alternatives', p: [
        'If knowledge-based training is outdated, what replaces it?',
        'The traditional counterposition to Flexner is William Osler’s insistence on teaching at the bedside, in which the case, rather than the principle, is the unit of instruction (Accad 2016). Simulation-based training is a modern relative: constructed situations in place of real ones.',
        'I think a curriculum built primarily on cases has a specific weakness. What a case teaches is what that case contained. Medicine’s difficulty is that presentations vary: two patients with the same pathology may present differently, and a sign absent in every patient a trainee has met is not thereby absent from the disease. A doctor who has learned the pattern without the principle underneath it can rule out a diagnosis for the wrong reason and never know. The theory is what tells you which features are incidental and which are not.',
        'The same limitation applies to novelty. Cases are drawn from the problems we currently have. A curriculum built entirely from them risks producing clinicians equipped for today’s medicine and unprepared for a disease nobody has written a case on yet, which, this spring, is not a hypothetical concern.',
        'I would separate all of this from experience, which is different in kind and which I think is the most valuable teacher of the three. But experience accrues over years. It cannot be the method by which a trainee first acquires a skill, only the thing that eventually deepens it.',
      ]},
      { h: 'Conclusion', p: [
        'Knowledge-based medical training is not obsolete. It is incomplete, which is a different charge and a more accurate one.',
        'The most useful comparison may be Switzerland, consistently ranked among the world’s leading innovators by the World Intellectual Property Organization, and unusual in giving skills-based and theoretical learning genuinely comparable weight in its medical curriculum (Perron 2018). The lesson there is not that one model has won. It is that the question was never properly a choice between them.',
        'Information has never been easier to retrieve. What has not become easier is knowing which information matters, at three in the morning, with an unwell patient in front of you and no time to read. That judgement is built on theoretical understanding and it cannot be looked up.',
        'So the balance should shift. More practice, earlier, with the interpersonal and collaborative skills that theory cannot deliver treated as core rather than incidental. But shifting the balance is not the same as removing the foundation. The most effective training is theory taught through practice, each one making the other legible.',
      ]},
    ],
    bibliography: [
      'Accad, Michel. Flexner versus Osler: Medical education suffers to this day. 26 April 2016. http://alertandoriented.com/flexner-versus-osler/ (accessed 29 April 2020).',
      'Cambridge University. Teaching & Learning Methods Environment. 1 January 2020. https://www.medschl.cam.ac.uk/education/courses/standard/teaching-learning-methods/ (accessed 29 April 2020).',
      'Hurwitz, Steven. “The desirable qualities of future doctors – A study of medical student perceptions.” Medical Teacher, 2013: 1332–1339.',
      'McLean, Susan F. “Case-Based Learning and its Application in Medical and Health-Care Fields: A Review of Worldwide Literature.” Journal of Medical Education and Curricular Development, April 2016.',
      'Perron, N. Junod. “How do Swiss medical schools prepare their students to become good communicators in their future professional careers: a questionnaire and interview study involving medical graduates, teachers and curriculum coordinators.” BMC Medical Education, 2018.',
      'Twenge, Jean M. “Generational changes and their impact in the classroom: teaching Generation Me.” Medical Education 48, no. 5 (2009).',
    ],
  },

  {
    kicker: 'Essay',
    title: 'Does the theory of evolution by natural selection tell us anything interesting about how we should live?',
    deck: 'Not how to live, but why certain ways of living feel so compelling.',
    date: 'April 2020',
    art: { id: 'selection', caption: 'Directional and stabilising selection. In the Dutch cohort, taller men and average-height women had the most children.' },
    intro: [
      'Evolution by natural selection is among the most heavily corroborated theories in science. It draws support from genetics, geology, palaeontology, anthropology and molecular biology, and those fields converge rather than conflict. Natural selection is the mechanism at its centre: where heritable variation affects survival and reproduction, the distribution of traits in a population shifts across generations.',
      'The question asks whether this tells us anything about how we should live. That phrasing conceals a difficulty worth naming at the outset, because the theory describes what happens and the question asks what we ought to do, and there is no obvious route from one to the other. I want to take the descriptive question seriously first (does selection still act on humans?) and then argue that the answer, whatever it turns out to be, does less prescriptive work than it first appears to.',
    ],
    quotes: {
      0: 'Selection does not require a harsh environment. It only requires that heritable variation correlates with reproductive output.',
      1: 'Natural selection is not a goal, an authority, or a standard of value.',
    },
    sections: [
      { h: 'Does selection still act on us?', p: [
        'One position holds that it largely does not. Humans have become unusually good at controlling their environment rather than adapting to it. Sanitation, antibiotics, obstetric care and vaccination have decoupled survival to reproductive age from most of the traits selection would otherwise act on. We have removed our predators by geography and technology rather than by becoming faster or stronger. Physical characteristics that would be decisive for a wild animal, size, strength, visual acuity, now have little bearing on whether someone lives long enough to have children. On this view, selection has not stopped, but it has been substantially buffered, and there is no particular pressure on how we live.',
        'This underestimates the theory. Selection operates on reproductive success, not survival, and the two came apart in humans some time ago. In a population where nearly everyone survives to adulthood, differences in how many children people have, and whether those children survive, become the entire story. Selection does not require a harsh environment. It only requires that heritable variation correlates with reproductive output.',
        'The empirical work bears this out. Stulp and colleagues examined 94,516 participants in the Dutch LifeLines cohort and found that across three decades, height was consistently related to reproductive output, favouring taller men and average-height women (Stulp et al. 2015). The Dutch have gained roughly 20 cm in average height over two centuries, a rate too fast to be explained by genetics alone and usually attributed to nutrition and living standards. The authors’ argument is that selection appears to have acted alongside those environmental improvements rather than instead of them.',
        'That is a genuine finding of contemporary human selection, and it is worth noticing what it actually says. It does not say taller is better. Women of average height did best; the pressure on them was stabilising, not directional. Selection is not pushing the population towards an optimum. It is responding to whatever currently correlates with having surviving children, and that correlation is itself a product of a particular society at a particular moment.',
        'Preferences beyond the physical show similar patterns. Todosijević and colleagues asked 127 Serbian respondents to rate the desirability of sixty traits in a potential partner, and found significant sex differences in the direction evolutionary accounts predict (Todosijević et al. 2003). It is worth being careful with a study of this kind: it measures stated preferences among a small, mostly student sample, not who anyone actually partnered with or had children by. Stated preference and realised choice diverge routinely.',
        'So the descriptive answer is yes. Selection continues to act on human populations, through fertility rather than mortality, and we have measured it.',
      ]},
      { h: 'What follows from that?', p: [
        'Almost nothing, and this is the interesting part.',
        'Suppose the finding is robust and taller men in the Netherlands have more children. The step from this trait is currently being selected for to I should try to have this trait requires a premise that evolution does not supply: that reproductive success is what I ought to be optimising. Nothing in the theory supports that premise. Natural selection is not a goal, an authority, or a standard of value. It is a description of what tends to happen to gene frequencies under certain conditions, and it is entirely indifferent to whether the resulting lives are good ones.',
        'This is the gap Hume identified in 1739, observing that writers move without explanation from statements about what is to statements about what ought to be (Hume 1739). Moore later gave a version of it a name, arguing that goodness cannot be defined in terms of any natural property, and that arguments which try are committing a fallacy rather than making a discovery (Moore 1903).',
        'The fallacy is easy to miss when the conclusion happens to be agreeable. An argument that runs selection favours fitness, therefore eat well and exercise sounds reasonable, but the reasoning is doing no work; the conclusion was already good advice on health grounds, and the evolutionary premise is decoration. The test is what happens when the two come apart. The same logic recommends having children as early and as often as possible, favouring kin over strangers, and withholding care from those least likely to reproduce. Nobody accepts those conclusions. If we reject them, we are not deriving our values from selection; we are applying values we already hold to filter its outputs. In which case selection was never the source.',
        'The historical record on this is not encouraging. Every serious attempt to derive a programme for living from evolutionary theory, social Darwinism and the eugenics movements of the early twentieth century among them, took the same false step, and the harm was not incidental to the reasoning. It followed from it.',
      ]},
      { h: 'What it does tell us', p: [
        'None of which makes the theory useless for thinking about how to live. It shifts what kind of help it offers.',
        'Evolution is an extraordinarily powerful account of why we want what we want. It explains why status feels urgent out of all proportion to its importance, why we discount future harms against present rewards, why our concern for others falls off so sharply with genetic and social distance, why disgust attaches to some things and not others. These are not arbitrary quirks. They are the residue of an environment that no longer exists.',
        'That is genuinely useful, and it is useful in the opposite direction to the one usually assumed. Knowing that an intuition has an evolutionary origin tells you nothing about whether the intuition is correct, but it does remove the intuition’s claim to self-evidence. A preference that feels obviously right because it is deeply felt now has a competing explanation for why it feels that way, one that has nothing to do with its being right. In-group loyalty is a clear case: it is well explained, near-universal, and no better justified for either.',
        'So the theory does not give us a set of instructions. It gives us a reason for suspicion about our own strongest instincts, and a reason to want an independent account of what makes a life good, since the one we were issued by default was optimised for something else entirely.',
        'That, I think, is the interesting answer. Not that evolution tells us how to live, but that it tells us why we find certain ways of living so compelling, and having understood that, we still have to decide.',
      ]},
    ],
    bibliography: [
      'Hume, David. A Treatise of Human Nature. 1739. Book III, Part I, Section I.',
      'Moore, G. E. Principia Ethica. Cambridge: Cambridge University Press, 1903.',
      'Stulp, Gert, Louise Barrett, Felix C. Tropf, and Melinda Mills. “Does natural selection favour taller stature among the tallest people on earth?” Proceedings of the Royal Society B 282, no. 1806 (2015): 20150211. https://doi.org/10.1098/rspb.2015.0211',
      'Todosijević, Bojan, Snežana Ljubinković, and Aleksandra Arančić. “Mate selection criteria: A trait desirability assessment study of sex differences in Serbia.” Evolutionary Psychology 1 (2003): 116–126.',
    ],
  },
];
