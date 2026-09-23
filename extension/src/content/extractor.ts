/**
 * Small deterministic main-content extractor for Auto-Clarify.
 * Prefer article/main landmarks; fall back to the densest paragraph cluster.
 * No network calls; does not send text — callers decide when to adapt().
 */

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "SVG",
  "NAV",
  "FOOTER",
  "HEADER",
  "ASIDE",
  "FORM",
  "BUTTON",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "IFRAME",
]);

function visibleText(el: Element): string {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return "";
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

function collectParagraphs(root: Element): string[] {
  const blocks: string[] = [];
  const nodes = root.querySelectorAll("p, li, h1, h2, h3, h4, blockquote, pre");
  for (const node of nodes) {
    if (SKIP_TAGS.has(node.tagName)) continue;
    if (node.closest("nav, footer, header, aside, [role='navigation']")) continue;
    const text = visibleText(node);
    if (text.length >= 40) blocks.push(text);
  }
  return blocks;
}

function scoreRoot(el: Element): number {
  const text = visibleText(el);
  if (text.length < 80) return 0;
  const linkText = Array.from(el.querySelectorAll("a"))
    .map((a) => visibleText(a))
    .join("").length;
  const linkDensity = linkText / Math.max(text.length, 1);
  const paragraphs = collectParagraphs(el).length;
  return text.length * (1 - Math.min(linkDensity, 0.9)) + paragraphs * 120;
}

/**
 * Extract the main readable text from the current document.
 * Returns empty string when nothing useful is found.
 */
export function extractMainReadableText(doc: Document = document): string {
  const candidates: Element[] = [];

  const article = doc.querySelector("article");
  if (article) candidates.push(article);

  const main = doc.querySelector("main, [role='main']");
  if (main) candidates.push(main);

  for (const el of doc.querySelectorAll(
    ".post, .entry-content, .article-body, #content, .content",
  )) {
    candidates.push(el);
  }

  let best: Element | null = null;
  let bestScore = 0;
  for (const el of candidates) {
    const score = scoreRoot(el);
    if (score > bestScore) {
      bestScore = score;
      best = el;
    }
  }

  if (best) {
    const parts = collectParagraphs(best);
    if (parts.length > 0) return parts.join("\n\n");
    const fallback = visibleText(best);
    if (fallback.length >= 80) return fallback;
  }

  // Page-wide paragraph cluster fallback
  const bodyParts = collectParagraphs(doc.body);
  if (bodyParts.length === 0) return "";
  // Keep a bounded slice so Auto-Clarify stays light
  return bodyParts.slice(0, 40).join("\n\n");
}

export function getCurrentSelectionText(): string {
  const sel = window.getSelection();
  if (!sel) return "";
  return sel.toString().replace(/\s+/g, " ").trim();
}
