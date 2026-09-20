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
  heading: "The first edition is on its way.",
  body: "Subscribe to receive it when it launches.",
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
    title: "Practical AI Skills Newsletter",
    description:
      "Learn practical AI skills for digital work. Get clear explanations, useful methods and exercises to help you build with AI and check the results.",
  },
  hero: {
    heading: ["Learn and build the", "AI-native way."],
    intro: "A practical AI newsletter for people in digital work.",
    lede:
      "Learn a method you can use in your next project. Each edition explains a change, shows how it affects your work and gives you an exercise to try.",
    joinLabel: "Join the newsletter",
    note: "Free to subscribe. Get the first edition when it launches. Unsubscribe any time.",
    latestLabel: "Read the latest edition →",
  },
  /**
   * The edition beat. Four blocks in the same order every week, which is most
   * of what a reader needs to recognise. Go deeper extends an edition that
   * comes with a course; it is not part of the weekly promise.
   */
  edition: {
    eyebrow: "What you get",
    heading: ["A useful idea.", "A way to put it into practice."],
    lede:
      "Work through one change and leave with something you can use in your day-to-day.",
    beats: [
      {
        number: "01",
        icon: "issue-01-the-shift",
        title: "The Shift",
        body: "One change in AI tools or ways of working, with the reasoning explained.",
        label: null,
      },
      {
        number: "02",
        icon: "issue-02-why-it-matters",
        title: "Why it matters",
        body: "Where that change affects your work and what you need to consider.",
        label: null,
      },
      {
        number: "03",
        icon: "issue-03-learn",
        title: "Learn",
        body: "A method you can apply, with an example that shows how it works.",
        label: null,
      },
      {
        number: "04",
        icon: "lifecycle-build",
        title: "Build",
        body: "A focused 15 to 30 minute exercise. Try the method and check what you produce.",
        label: "This is the part that matters",
      },
    ],
    extensionsLabel: "Sometimes",
    extensionsNote:
      "On editions that connect to a course, take the work further.",
    extensions: [
      {
        number: "05",
        icon: "issue-06-go-deeper",
        title: "Go deeper",
        body: "A relevant course for taking the work further.",
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
    eyebrow: "Learn to code",
    heading: ["Coding Bootcamp", "in a Box."],
    lede:
      "Learn web development from your first terminal command to a portfolio you can deploy. Follow a self-paced course with an AI tutor and check your understanding through the work you build.",
    ctaLabel: "Explore the course",
  },
  audience: {
    eyebrow: "Who it is for",
    heading: ["Use AI with better judgement", "wherever you are starting."],
    lede: "Develop skills through work you can try, inspect and explain.",
    groups: [
      {
        stage: "evolve",
        title: "Improve how you work",
        body: "You already work in software, product or digital delivery and want to use AI without lowering your standards.",
      },
      {
        stage: "enter",
        title: "Build your foundations",
        body: "You are starting out or changing careers and need practical skills plus work you can show.",
      },
      {
        stage: "lead",
        title: "Set better standards",
        body: "You guide a team or learning programme and need clear ways to judge how AI is being used.",
      },
    ],
  },
  founder: {
    eyebrow: "Who writes it",
    heading: ["Written by", "Luke Hennerley."],
    paragraphs: [
      "Luke Hennerley writes Future of Dev alongside his role as VP of AI Operations at Sidetrade.",
      "His background spans software engineering, product development and digital delivery. He turns lessons from that work into methods readers can try, check and adapt.",
    ],
    ctaLabel: "About Luke and Future of Dev →",
  },
  mission: {
    eyebrow: "The approach",
    heading:
      "What does AI-native mean here?",
    lede: "Use AI as part of how you explore an idea, develop a skill and produce useful work. Learn how to guide it, check its output and decide what to change. The result might be a research process, a project brief, a repeatable workflow or even a working project.",
  },
  finalSignup: {
    heading: ["Put your next useful AI skill", "into practice."],
    buttonLabel: "Join the newsletter",
    note: "Free to subscribe. Unsubscribe any time.",
  },
} as const;
