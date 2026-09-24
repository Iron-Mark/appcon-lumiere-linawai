import { splitDeadlineMarks } from "../reading-comfort/deadline-marks";
import {
  isDisplayComfortDefault,
  readingTextStyleVars,
  type ReadingComfort,
} from "../reading-comfort/defaults";
import { clampFocusLine } from "../reading-comfort/focus-line";
import { findMainContentRoot } from "./extractor";

const STYLE_ID = "linaw-page-reading-style";
const ROOT_ATTR = "data-linaw-page-reading";
const MARK_CLASS = "linaw-page-deadline";
const FOCUS_CLASS = "linaw-page-focus";
const BLOCK_SELECTOR = "p, li, h1, h2, h3, h4, blockquote";
const SKIP_ANCESTOR = "nav, footer, header, aside, form, [data-linaw]";

let activeRoot: Element | null = null;
let boundRoot: Element | null = null;
let wordSnapshot: { root: Element; nodes: ChildNode[] } | null = null;
let holdOff = false;
let focusIndex = 0;
let focusEnabled = false;
let focusListener: ((index: number) => void) | null = null;
let clickHandler: ((event: Event) => void) | null = null;

export function isPageReadingActive(): boolean {
  return Boolean(activeRoot?.isConnected && activeRoot.hasAttribute(ROOT_ATTR));
}

export function onPageFocusIndex(listener: (index: number) => void): () => void {
  focusListener = listener;
  return () => {
    if (focusListener === listener) focusListener = null;
  };
}

export function pageFocusBlocks(root: Element | null = activeRoot): HTMLElement[] {
  if (!root) return [];
  const nodes = Array.from(root.querySelectorAll(BLOCK_SELECTOR));
  return nodes.filter((el): el is HTMLElement => {
    if (!(el instanceof HTMLElement)) return false;
    if (el.closest(SKIP_ANCESTOR)) return false;
    if (el.querySelector(BLOCK_SELECTOR)) return false;
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    return text.length > 0;
  });
}

function fontFaceCss(fontUrl: string | undefined): string {
  if (!fontUrl) return "";
  return `
@font-face {
  font-family: "Lexend";
  src: url("${fontUrl}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
`;
}

function pageCss(fontUrl: string | undefined): string {
  return `${fontFaceCss(fontUrl)}
[${ROOT_ATTR}] {
  color: var(--linaw-reading-ink) !important;
  background-color: var(--linaw-reading-bg) !important;
}
[${ROOT_ATTR}] :is(${BLOCK_SELECTOR}) {
  font-family: var(--linaw-reading-face) !important;
  line-height: var(--linaw-line-height) !important;
  letter-spacing: var(--linaw-letter-spacing) !important;
  word-spacing: var(--linaw-word-spacing) !important;
  color: var(--linaw-reading-ink) !important;
}
[${ROOT_ATTR}] :is(p, li, blockquote) {
  font-size: var(--linaw-type-size) !important;
}
[${ROOT_ATTR}] :is(nav, header, footer, aside, form) :is(${BLOCK_SELECTOR}) {
  font: revert !important;
  letter-spacing: revert !important;
  word-spacing: revert !important;
  color: revert !important;
  background: revert !important;
}
[${ROOT_ATTR}] mark.${MARK_CLASS} {
  background-color: #e4ecd4;
  color: #4f5d2f;
  font-weight: 600;
  border-radius: 2px;
  padding: 0 2px;
}
[${ROOT_ATTR}] .${FOCUS_CLASS} {
  background-color: #e4ecd4;
  box-shadow: inset 3px 0 0 #4f5d2f;
  border-radius: 4px;
  transition: background-color 150ms ease, box-shadow 150ms ease;
  cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  [${ROOT_ATTR}] .${FOCUS_CLASS} {
    transition: none;
  }
}
`;
}

function lexendUrl(): string | undefined {
  try {
    if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
      return chrome.runtime.getURL("fonts/Lexend.woff2");
    }
  } catch {
    // Tests and non-extension pages keep the system face.
  }
  return undefined;
}

function ensureStyle(doc: Document, fontUrl: string | undefined): void {
  const parent = doc.head ?? doc.documentElement;
  let style = doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement("style");
    style.id = STYLE_ID;
    parent.appendChild(style);
  }
  const css = pageCss(fontUrl);
  if (style.textContent !== css) style.textContent = css;
}

function unwrapMarks(root: Element): void {
  const marks = Array.from(root.querySelectorAll(`mark.${MARK_CLASS}`));
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  }
  root.normalize();
}

function shouldSkipText(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.closest(SKIP_ANCESTOR)) return true;
  if (parent.closest(`mark.${MARK_CLASS}`)) return true;
  if (parent.closest("script, style, textarea, noscript")) return true;
  return false;
}

function wrapMarks(root: Element): void {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!(node instanceof Text) || shouldSkipText(node)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const texts: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    if (current instanceof Text) texts.push(current);
    current = walker.nextNode();
  }

  for (const textNode of texts) {
    const value = textNode.nodeValue ?? "";
    const segments = splitDeadlineMarks(value);
    if (!segments.some((segment) => segment.marked)) continue;
    const parent = textNode.parentNode;
    if (!parent) continue;
    const fragment = doc.createDocumentFragment();
    for (const segment of segments) {
      if (!segment.text) continue;
      if (segment.marked) {
        const mark = doc.createElement("mark");
        mark.className = MARK_CLASS;
        mark.textContent = segment.text;
        fragment.appendChild(mark);
      } else {
        fragment.appendChild(doc.createTextNode(segment.text));
      }
    }
    parent.replaceChild(fragment, textNode);
  }
}

function paintFocus(root: Element, enabled: boolean): void {
  for (const el of root.querySelectorAll(`.${FOCUS_CLASS}`)) {
    el.classList.remove(FOCUS_CLASS);
  }
  if (!enabled) return;
  const blocks = pageFocusBlocks(root);
  if (blocks.length === 0) return;
  focusIndex = clampFocusLine(focusIndex, blocks.length);
  blocks[focusIndex]?.classList.add(FOCUS_CLASS);
}

function bindClick(root: Element): void {
  if (clickHandler && boundRoot) {
    boundRoot.removeEventListener("click", clickHandler);
  }
  clickHandler = (event: Event) => {
    if (!focusEnabled || !activeRoot?.isConnected) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-linaw]")) return;
    const blocks = pageFocusBlocks(activeRoot);
    const hit = target.closest(BLOCK_SELECTOR);
    if (!(hit instanceof HTMLElement)) return;
    const index = blocks.indexOf(hit);
    if (index < 0) return;
    focusIndex = index;
    paintFocus(activeRoot, true);
    focusListener?.(focusIndex);
  };
  root.addEventListener("click", clickHandler);
  boundRoot = root;
}

function strip(root: Element): void {
  if (!(root instanceof HTMLElement)) return;
  if (clickHandler && boundRoot) {
    boundRoot.removeEventListener("click", clickHandler);
    boundRoot = null;
  }
  unwrapMarks(root);
  for (const el of root.querySelectorAll(`.${FOCUS_CLASS}`)) {
    el.classList.remove(FOCUS_CLASS);
  }
  root.removeAttribute(ROOT_ATTR);
  for (const key of [
    "--linaw-type-size",
    "--linaw-line-height",
    "--linaw-letter-spacing",
    "--linaw-word-spacing",
    "--linaw-reading-face",
    "--linaw-reading-ink",
    "--linaw-reading-bg",
  ]) {
    root.style.removeProperty(key);
  }
}

function removeStyle(doc: Document): void {
  doc.getElementById(STYLE_ID)?.remove();
}

/** Apply display comfort to one article root. Does not replace the article's words. */
export function applyPageReading(
  root: Element,
  comfort: ReadingComfort,
  fontUrl: string | undefined = lexendUrl(),
): void {
  if (!(root instanceof HTMLElement)) return;
  if (activeRoot && activeRoot !== root) strip(activeRoot);
  activeRoot = root;
  const doc = root.ownerDocument;
  ensureStyle(doc, fontUrl);
  const vars = readingTextStyleVars(comfort);
  vars["--linaw-type-size"] =
    comfort.typeSize === "smaller"
      ? "0.9em"
      : comfort.typeSize === "larger"
        ? "1.25em"
        : "1em";
  if (comfort.lineSpacing === "default") vars["--linaw-line-height"] = "inherit";
  if (comfort.letterSpacing === "default") vars["--linaw-letter-spacing"] = "inherit";
  if (comfort.wordSpacing === "default") vars["--linaw-word-spacing"] = "inherit";
  if (comfort.face === "default") vars["--linaw-reading-face"] = "inherit";
  root.setAttribute(ROOT_ATTR, "");
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
  unwrapMarks(root);
  wrapMarks(root);
  focusEnabled = comfort.focusLine;
  bindClick(root);
  paintFocus(root, comfort.focusLine);
}

export function setPageFocus(index: number): number {
  const blocks = pageFocusBlocks();
  focusIndex = clampFocusLine(index, blocks.length);
  if (activeRoot) paintFocus(activeRoot, true);
  return focusIndex;
}

/** True only for a model answer that should land on the article root. */
export function shouldReplacePageWords(
  adapter: string | undefined,
  insideArticle: boolean,
): boolean {
  return adapter === "model" && insideArticle;
}

/** Selection or anchor is inside the main article, not the chrome around it. */
export function selectionInsideArticle(
  root: Element | null,
  node: Node | null,
): boolean {
  if (!root || !node) return false;
  const el =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  return Boolean(el && root.contains(el));
}

function clarifiedFragment(doc: Document, adaptedText: string): DocumentFragment {
  const fragment = doc.createDocumentFragment();
  const lines = adaptedText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length === 0) return;
    const list = doc.createElement("ul");
    for (const item of bullets) {
      const li = doc.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    }
    fragment.appendChild(list);
    bullets.length = 0;
  };

  for (const line of lines) {
    const bullet = /^[-•]\s+([\s\S]*)$/.exec(line);
    if (bullet) {
      bullets.push(bullet[1] ?? "");
      continue;
    }
    flushBullets();
    const paragraph = doc.createElement("p");
    paragraph.textContent = line;
    fragment.appendChild(paragraph);
  }
  flushBullets();
  return fragment;
}

/**
 * Replace the article's words with a model clarification.
 * The first snapshot is kept, so a second answer still restores the site original.
 */
export function showClarifiedText(root: Element, adaptedText: string): void {
  if (!adaptedText.trim()) return;
  if (!wordSnapshot || wordSnapshot.root !== root) {
    wordSnapshot = { root, nodes: Array.from(root.childNodes) };
  }
  while (root.firstChild) root.removeChild(root.firstChild);
  root.appendChild(clarifiedFragment(root.ownerDocument, adaptedText));
}

/** Restore the site's original words, keeping any page styling. Explicit user action only. */
export function restorePageWords(): void {
  if (!wordSnapshot) return;
  const { root, nodes } = wordSnapshot;
  wordSnapshot = null;
  if (!root.isConnected) return;
  while (root.firstChild) root.removeChild(root.firstChild);
  for (const node of nodes) root.appendChild(node);
}

function clearPageStyles(): void {
  if (activeRoot) strip(activeRoot);
  if (activeRoot?.ownerDocument) removeStyle(activeRoot.ownerDocument);
  else if (typeof document !== "undefined") removeStyle(document);
  activeRoot = null;
  clickHandler = null;
  focusIndex = 0;
  focusEnabled = false;
}

/** Clear display styling/marks/focus but keep a clarified replacement intact. */
export function clearPageDisplay(): void {
  clearPageStyles();
}

export function clearPageReading(): void {
  restorePageWords();
  clearPageStyles();
}

/**
 * Apply saved comfort to the main article, or clear it.
 * `force` is the "On this page" opt-in when every display choice is still default.
 * `holdOff` (Page as it was) wins until the reader changes a display choice or opts in again.
 */
export function syncPageReading(
  comfort: ReadingComfort,
  options?: { disabled?: boolean; force?: boolean },
): void {
  if (options?.force) holdOff = false;
  if (options?.disabled || holdOff) {
    clearPageReading();
    return;
  }
  if (!options?.force && isDisplayComfortDefault(comfort)) {
    clearPageStyles();
    return;
  }
  const doc = activeRoot?.ownerDocument ?? document;
  // Prefer the already-styled root when it is still connected: after a
  // clarified replacement the extractor can score the short new text as 0
  // and return null/a different parent, which must not wipe the words.
  const root =
    activeRoot && activeRoot.isConnected
      ? activeRoot
      : findMainContentRoot(doc);
  if (!root) {
    clearPageDisplay();
    return;
  }
  applyPageReading(root, comfort);
}

/** Remove page styling until the reader opts in again or changes a display choice. */
export function holdOffPageReading(): void {
  holdOff = true;
  clearPageReading();
}

export function releasePageReadingHold(): void {
  holdOff = false;
}
