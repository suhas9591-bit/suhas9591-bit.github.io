// Seed data for Prep Tracker — 35-day UI/UX interview prep plan.
// Loaded once into localStorage on first run.

const RES = {
  heuristics: { label: "NNG — 10 Usability Heuristics", url: "https://www.nngroup.com/articles/ten-usability-heuristics/", type: "article" },
  heuristicsVideo: { label: "NNG — Heuristic Evaluation (video)", url: "https://www.nngroup.com/videos/heuristic-evaluation/", type: "video" },
  contrast: { label: "WebAIM Contrast Checker", url: "https://webaim.org/resources/contrastchecker/", type: "article" },
  autoLayout: { label: "Figma — Guide to Auto Layout", url: "https://help.figma.com/hc/en-us/articles/5731482952599-Guide-to-auto-layout", type: "article" },
  responsive: { label: "NNG — Responsive vs Adaptive Design", url: "https://www.nngroup.com/articles/mobile-adaptive-design/", type: "article" },
  emptyStates: { label: "NNG — Empty States", url: "https://www.nngroup.com/articles/empty-state-interface-design/", type: "article" },
  star: { label: "Indeed — STAR Method Guide", url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique", type: "article" },
  amadeus: { label: "Amadeus — How We Hire", url: "https://amadeus.com/en/careers/how-we-hire", type: "article" },
  critiques: { label: "NNG — Design Critiques", url: "https://www.nngroup.com/articles/design-critiques/", type: "article" },
};

function day(id, week, phase, title, tasks, resources = [], isMockTest = false) {
  return { id, week, phase, title, tasks, resources, isMockTest, completed: false, note: "" };
}

const SEED_DAYS = [
  // Week 1 — Basics
  day(1, 1, "Basics", "Usability heuristics refresh", [
    "Read through Nielsen's 10 usability heuristics",
    "Find one real example of each heuristic (good or bad) in an app you use",
    "Jot down a one-line summary of each heuristic in your own words",
  ], [RES.heuristics, RES.heuristicsVideo]),

  day(2, 1, "Basics", "Accessibility & contrast", [
    "Review WCAG contrast requirements (AA vs AAA)",
    "Run 3 of your own past designs through a contrast checker",
    "Fix any failing text/background combos you find",
  ], [RES.contrast]),

  day(3, 1, "Basics", "UI vs UX language + resume rewrite", [
    "Clarify the distinction between UI and UX in your own words",
    "Audit your resume for vague bullet points",
    "Rewrite 3 bullets using outcome-focused language (impact, not just tasks)",
  ]),

  day(4, 1, "Basics", "Components & design systems", [
    "Review how atomic design / component libraries are structured",
    "Study Figma auto layout so you can talk fluently about component behavior",
    "Sketch a tiny 3-component system (button, input, card) with variants",
  ], [RES.autoLayout]),

  day(5, 1, "Basics", "Responsive vs adaptive", [
    "Read up on responsive vs adaptive design differences",
    "Pick one of your projects and note where it would break on mobile",
    "Write a short talking point on how you'd defend a responsive-first approach",
  ], [RES.responsive]),

  day(6, 1, "Basics", "LinkedIn + company research", [
    "Update your LinkedIn headline and About section",
    "Shortlist 3-5 target companies",
    "Note each company's product, design maturity, and one recent design decision you admire or question",
  ]),

  day(7, 1, "Basics", "Review day", [
    "Skim back over everything from Days 1-6",
    "Write down the 3 concepts you're least confident on",
    "Do one 20-minute deep dive on your weakest topic",
  ]),

  // Week 2 — Intermediate
  day(8, 2, "Intermediate", "Case study narrative — Project 1", [
    "Outline your first personal project as a story: problem, constraints, process, outcome",
    "Write the full narrative in a doc — aim for something you could say out loud in 3-4 minutes",
  ]),

  day(9, 2, "Intermediate", "Case study narrative — Project 2", [
    "Repeat yesterday's exercise for your second personal project",
    "Make sure the two stories highlight different skills (e.g. one research-heavy, one execution-heavy)",
  ]),

  day(10, 2, "Intermediate", "Fixing a real design gap", [
    "Find a real product with a usability gap (yours or a public app)",
    "Redesign one screen or flow to fix it",
    "Write a short rationale explaining your decisions",
  ]),

  day(11, 2, "Intermediate", "Recorded walkthrough — Project 1", [
    "Record yourself walking through Project 1's case study, out loud, timed",
    "Watch it back once, noting filler words and pacing",
  ]),

  day(12, 2, "Intermediate", "Recorded walkthrough — Project 2", [
    "Repeat the recorded walkthrough for Project 2",
    "Compare pacing and clarity against yesterday's recording",
  ]),

  day(13, 2, "Intermediate", "Self-critique", [
    "Re-watch both recordings back to back",
    "List 3 concrete things to improve (clarity, structure, confidence, etc.)",
    "Revise your narrative docs based on what you noticed",
  ]),

  day(14, 2, "Intermediate", "Mock Test 1 — Portfolio walkthrough", [
    "Book a free portfolio walkthrough mock on Exponent (peer or AI) and run through both case studies",
    "Consider a paid igotanoffer session instead if you want expert feedback before a higher-stakes round",
    "Log the outcome in the Mock Test tab, including specific feedback to act on",
  ], [], true),

  // Week 3 — Behavioral
  day(15, 3, "Behavioral", "STAR story writing — Part 1", [
    "Read the STAR method guide",
    "Draft 3 STAR stories covering conflict, failure, and leadership/initiative",
  ], [RES.star]),

  day(16, 3, "Behavioral", "STAR story writing — Part 2", [
    "Draft 3 more STAR stories covering ambiguity, tight deadlines, and feedback/criticism",
    "Make sure every story has a clear, honest outcome — not just a happy ending",
  ], [RES.star]),

  day(17, 3, "Behavioral", "Mock Test 2 — Behavioral", [
    "Run a free behavioral mock interview on Exponent using your STAR stories",
    "Consider igotanoffer for a paid expert session if you want deeper, more critical feedback",
    "Log which stories landed well and which need tightening",
  ], [], true),

  day(18, 3, "Behavioral", "Design critique practice", [
    "Read the NNG guide on giving and receiving design critiques",
    "Critique one screen from an app you didn't design, out loud, using structured language",
  ], [RES.critiques]),

  day(19, 3, "Behavioral", "Live design exercise", [
    "Pick a timed prompt (e.g. \"redesign a checkout flow\") and give yourself 30-45 minutes",
    "Sketch or wireframe live, narrating your reasoning as you go",
  ]),

  day(20, 3, "Behavioral", "Full timed run-through", [
    "Simulate a full round: portfolio walkthrough + one behavioral question + one quick design exercise",
    "Time yourself strictly and note where you ran long",
  ]),

  day(21, 3, "Behavioral", "Review day", [
    "Revisit STAR stories and tighten any that felt weak in the mock",
    "Re-read your case study narratives and update based on interview feedback so far",
  ]),

  // Week 4 — Advanced
  day(22, 4, "Advanced", "Target company deep-dive", [
    "Pick your top target company and go deep: product, competitors, recent redesigns, design team blog/posts",
    "Read how their hiring process actually works if published",
  ], [RES.amadeus]),

  day(23, 4, "Advanced", "Researching 2 more companies", [
    "Repeat a lighter version of yesterday's research for 2 more target companies",
    "Note one thoughtful question you could ask each interviewer",
  ]),

  day(24, 4, "Advanced", "Questions to ask interviewers", [
    "Draft 5-8 sharp questions to ask interviewers across different rounds (team, process, product direction)",
    "Avoid questions answerable by a 2-minute Google search",
  ]),

  day(25, 4, "Advanced", "Accessibility & touch-target audit", [
    "Pick one of your case study screens and audit it for accessibility (contrast, tap target size, focus order)",
    "Fix at least 2 real issues and note them as a talking point",
  ], [RES.contrast]),

  day(26, 4, "Advanced", "Harder live design exercise", [
    "Give yourself a tougher, more ambiguous prompt with a hard 30-minute limit",
    "Practice asking clarifying questions out loud before diving in",
  ]),

  day(27, 4, "Advanced", "Tightening answers from feedback", [
    "Go back through every mock test note so far",
    "Rewrite the 3 weakest answers (behavioral or case study) using what you've learned",
  ]),

  day(28, 4, "Advanced", "Mock Test 3 — Full mixed mock", [
    "Book a full mixed mock (portfolio + behavioral + design exercise) on Exponent",
    "This is a good point to consider a paid igotanoffer session if the real interview is close",
    "Log detailed notes — this is your last full rehearsal before applications ramp up",
  ], [], true),

  // Week 5 — Applications
  day(29, 5, "Applications", "Job alerts + first application", [
    "Set up job alerts on LinkedIn and 1-2 other boards for your target roles",
    "Submit your first polished application, tailoring resume bullets to the JD",
  ]),

  day(30, 5, "Applications", "Second application + networking", [
    "Submit a second tailored application",
    "Reach out to 2-3 people (alumni, past colleagues, designers at target companies) for a quick chat or referral",
  ]),

  day(31, 5, "Applications", "Third application + polish", [
    "Submit a third application",
    "Do a final polish pass on your portfolio site or PDF — check for typos, broken links, load speed",
  ]),

  day(32, 5, "Applications", "Mock Test 4 — Final full mock", [
    "Run one last full mock on Exponent to sharpen timing and delivery",
    "If you have a real interview coming up soon, this is the moment for a paid igotanoffer session for expert-level feedback",
    "Log final notes — focus only on last-mile fixes, not new material",
  ], [], true),

  day(33, 5, "Applications", "Rest day", [
    "Take the day mostly off — light review only if it feels good",
    "Reread your STAR stories once, casually, no pressure",
  ]),

  day(34, 5, "Applications", "Final review", [
    "Skim all case study narratives and STAR stories one last time",
    "Reread your notes from every mock test for common feedback themes",
  ]),

  day(35, 5, "Applications", "Interview-ready logistics check", [
    "Confirm resume, portfolio link, and LinkedIn are all consistent and current",
    "Prep your interview setup: quiet space, good lighting, charged devices, water",
    "Get a good night's sleep — you've done the work",
  ]),
];

const SEED_MATERIALS = [
  {
    id: 1,
    title: "Figma Official",
    url: "https://www.youtube.com/@Figma",
    type: "video",
    tags: ["figma"],
    dateAdded: "2026-07-03",
  },
  {
    id: 2,
    title: "AJ&Smart",
    url: "https://www.youtube.com/@AJSmart",
    type: "video",
    tags: ["ux-process"],
    dateAdded: "2026-07-03",
  },
  {
    id: 3,
    title: "Nielsen Norman Group",
    url: "https://www.youtube.com/@NNgroup",
    type: "video",
    tags: ["usability"],
    dateAdded: "2026-07-03",
  },
  {
    id: 4,
    title: "Exponent (UX/Product Design mock interviews, free peer + AI)",
    url: "https://www.tryexponent.com/ux-designer",
    type: "other",
    tags: ["mock-interview"],
    dateAdded: "2026-07-03",
  },
  {
    id: 5,
    title: "igotanoffer (paid, real UX design interview expert, live feedback)",
    url: "https://igotanoffer.com/en/mock-interviews/ux-design",
    type: "other",
    tags: ["mock-interview"],
    dateAdded: "2026-07-03",
  },
  {
    id: 6,
    title: "Yoodli (free AI speech/delivery coaching, not UX-specific)",
    url: "https://www.yoodli.ai",
    type: "other",
    tags: ["mock-interview"],
    dateAdded: "2026-07-03",
  },
];

const SEED_MOCK_TESTS = [];
