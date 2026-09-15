/**
 * Public navigation and homepage copy.
 *
 * Keep words here and layout in the Astro templates. This gives editors and
 * coding agents one obvious place to change the homepage without touching the
 * page structure, analytics attributes or dynamic Beehiiv/course data.
 */

export const siteNavigation = [
  { label: "Home", href: "/" },
  { label: "Insights", href: "/insights" },
  { label: "Learn", href: "/learning" },
  { label: "About", href: "/about" },
] as const;

export const editionEmptyState = {
  heading: "No editions yet.",
  body: "Subscribe to get the first edition in your inbox.",
} as const;

/**
 * Founder photograph for the About page. Leave `null` until an approved image
 * is in `public/brand/`; the layout renders the figure only when this is set.
 */
export const founderImage: { src: string; alt: string } | null = null;

/** End matter for every edition page. */
export const articleEndCopy = {
  goDeeperEyebrow: "Go deeper",
  goDeeperHeading: "Build something with it.",
  goDeeperBody:
    "Coding Bootcamp in a Box takes you from an empty machine to a deployed portfolio, taught locally by Codex or Claude Code.",
  goDeeperCta: "Explore the course",
  previousLabel: "Previous edition",
  nextLabel: "Next edition",
  firstNote: "This is the first edition.",
  latestNote: "This is the latest edition.",
  allLabel: "All editions →",
} as const;

export const homepageCopy = {
  seo: {
    title: "Learn and build the AI-native way",
    description:
      "The practical newsletter for people evolving with AI and entering the industry. Understand change, develop useful skills and build something real.",
  },
  hero: {
    heading: ["Learn and build the", "AI-native way."],
    intro: "The practical newsletter for people evolving with AI and entering the industry.",
    lede:
      "Understand what is changing, develop useful skills and build something real. One edition at a time.",
    joinLabel: "Join Future of Dev",
    note: "Free · one useful edition each week · unsubscribe any time.",
    latestLabel: "Read the latest edition →",
  },
  /**
   * The edition beat. Four blocks in the same order every week, which is most
   * of what a reader needs to recognise. Go deeper extends an edition that
   * comes with a course; it is not part of the weekly promise.
   */
  edition: {
    eyebrow: "What you get",
    heading: ["Every edition follows", "the same four beats."],
    lede:
      "Same order, same names, every week. By the third edition you know where the exercise is without reading anything else.",
    beats: [
      {
        number: "01",
        icon: "issue-01-the-shift",
        title: "The Shift",
        body: "One change in tools, work or expectations, in plain terms with the reasoning shown.",
        label: null,
      },
      {
        number: "02",
        icon: "issue-02-why-it-matters",
        title: "Why it matters",
        body: "What the change does to your work, your role or your route in — and what it does not.",
        label: null,
      },
      {
        number: "03",
        icon: "issue-03-learn",
        title: "Learn",
        body: "One method, framework or decision you can apply, separated from the tool it happens to use.",
        label: null,
      },
      {
        number: "04",
        icon: "lifecycle-build",
        title: "Build",
        body: "A focused 15 to 30 minute exercise that ends in something you can point at.",
        label: "This is the part that matters",
      },
    ],
    extensionsLabel: "Sometimes",
    extensionsNote:
      "One optional block, on the editions that come with a course. Most weeks are the four above.",
    extensions: [
      {
        number: "05",
        icon: "issue-06-go-deeper",
        title: "Go deeper",
        body: "Where the edition opens into a course, for when one exercise is not enough.",
      },
    ],
  },
  latest: {
    eyebrow: "Latest edition",
    previousLabel: "More editions",
    readLabel: "Read the edition",
    browseLabel: "Browse all insights →",
  },
  featuredLearning: {
    eyebrow: "Featured learning",
    heading: ["Coding Bootcamp", "in a Box."],
    lede:
      "Start with no development environment. Finish with a portfolio you built and deployed, taught locally through Codex or Claude Code.",
    ctaLabel: "Explore the course",
  },
  audience: {
    eyebrow: "Who it is for",
    heading: ["Whether you are three years in", "or three weeks in."],
    lede: "Different starting points, same question: what should I learn and practise next?",
    groups: [
      {
        stage: "evolve",
        title: "You are already in the work",
        body: "For people whose digital work is changing and who want a practical way to adapt.",
      },
      {
        stage: "enter",
        title: "You are trying to get in",
        body: "For students, graduates and career changers building evidence for roles whose expectations keep moving.",
      },
      {
        stage: "lead",
        title: "You are responsible for others",
        body: "For leaders and educators setting standards and building capability before the answers are settled.",
      },
    ],
  },
  founder: {
    eyebrow: "Who writes it",
    heading: ["Written from practice,", "not from the sidelines."],
    paragraphs: [
      "Future of Dev was founded by Luke Hennerley, a product and technology practitioner who has worked across software engineering, product development and digital delivery.",
      "The publication turns fast-moving change into useful practice people can apply and demonstrate.",
    ],
    ctaLabel: "About Future of Dev →",
  },
  mission: {
    eyebrow: "Mission",
    heading:
      "Help people understand what AI changes, practise useful skills and build work they can demonstrate.",
    lede: "Make the next useful thing obvious, small enough to start and real enough to show someone.",
  },
  finalSignup: {
    heading: ["One useful edition each week.", "Understand, learn, build."],
    buttonLabel: "Join Future of Dev",
    note: "No spam. Unsubscribe in one click. Your email is never sold or shared.",
  },
} as const;
