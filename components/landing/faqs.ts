export type FaqItem = {
  q: string;
  a: string;
  /** Flat one-line scan chips — never nested cards. */
  checks?: readonly string[];
};

export const FAQS: readonly FaqItem[] = [
  {
    q: "How does Linaw know something important was lost?",
    a: "Before adapting, Linaw lists the load-bearing parts of the source. Anything missing or changed is flagged with the original phrase.",
    checks: ["Conditions", "Quantities", "Deadlines", "Negations", "Who-does-what"],
  },
  {
    q: "Do I have to tell anyone I need help reading?",
    a: "No. There is no diagnosis, no special mode, and no profile question—anyone can use Linaw for tired eyes, a second language, or a long memo.",
  },
  {
    q: "What does Taglish-aware mean?",
    a: "Plain Language can be English, Tagalog, or the everyday mix most Filipinos use, while keeping terms like “written approval” intact.",
  },
  {
    q: "Does it work on school or office computers?",
    a: "Yes. If extensions are blocked, the web app still gives the same views and verification—set preferences in onboarding, then read in the workspace.",
  },
  {
    q: "How do I install the Chrome companion?",
    a: "Open Load companion under Get started.",
  },
  {
    q: "Is Linaw free?",
    a: "The companion and web app are free during the beta. Core reading features will always have a free tier.",
  },
];
