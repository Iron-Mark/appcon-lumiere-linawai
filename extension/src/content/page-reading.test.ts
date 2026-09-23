/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_READING_COMFORT } from "../reading-comfort/defaults";
import { findMainContentRoot } from "./extractor";
import {
  applyPageReading,
  clearPageReading,
  holdOffPageReading,
  isPageReadingActive,
  pageFocusBlocks,
  releasePageReadingHold,
  setPageFocus,
  shouldReplacePageWords,
  showClarifiedText,
  syncPageReading,
} from "./page-reading";

const ARTICLE_TEXT =
  "Members meet on Thursday at 5:00 PM with 2 mentors and must bring a signed form to the hall.";

function mountArticle(): HTMLElement {
  document.body.innerHTML = `
    <nav><p>Skip Thursday at 9:00 AM in the navigation block that is long enough to score.</p></nav>
    <article>
      <p>${ARTICLE_TEXT}</p>
      <p>Other members arrive later and wait in the lobby until the doors open.</p>
    </article>
  `;
  const article = document.querySelector("article");
  if (!article) throw new Error("missing article");
  return article;
}

beforeEach(() => {
  releasePageReadingHold();
  clearPageReading();
  document.body.innerHTML = "";
  document.getElementById("linaw-page-reading-style")?.remove();
});

describe("findMainContentRoot", () => {
  it("prefers the article and skips the document body", () => {
    mountArticle();
    const root = findMainContentRoot(document);
    expect(root?.tagName).toBe("ARTICLE");
  });
});

describe("applyPageReading", () => {
  it("marks deadlines without changing the article text, then restores the nodes", () => {
    const article = mountArticle();
    const before = article.textContent;

    applyPageReading(
      article,
      { ...DEFAULT_READING_COMFORT, typeSize: "larger" },
      undefined,
    );

    expect(article.getAttribute("data-linaw-page-reading")).toBe("");
    expect(article.style.getPropertyValue("--linaw-type-size")).toBe("1.25em");
    expect(article.querySelectorAll("mark.linaw-page-deadline").length).toBeGreaterThan(0);
    expect(article.textContent).toBe(before);
    expect(document.querySelector("nav mark.linaw-page-deadline")).toBeNull();

    clearPageReading();

    expect(article.querySelector("mark")).toBeNull();
    expect(article.hasAttribute("data-linaw-page-reading")).toBe(false);
    expect(article.textContent).toBe(before);
    expect(document.getElementById("linaw-page-reading-style")).toBeNull();
    expect(isPageReadingActive()).toBe(false);
  });

  it("does not nest marks when applied twice", () => {
    const article = mountArticle();
    const comfort = { ...DEFAULT_READING_COMFORT, face: "clear" as const };
    applyPageReading(article, comfort, "fonts/Lexend.woff2");
    applyPageReading(article, comfort, "fonts/Lexend.woff2");
    expect(article.querySelector("mark mark")).toBeNull();
    expect(document.getElementById("linaw-page-reading-style")?.textContent).toContain(
      "fonts/Lexend.woff2",
    );
  });

  it("moves the focus line across article blocks", () => {
    const article = mountArticle();
    applyPageReading(article, { ...DEFAULT_READING_COMFORT, focusLine: true });
    const blocks = pageFocusBlocks(article);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.classList.contains("linaw-page-focus")).toBe(true);
    setPageFocus(1);
    expect(blocks[1]?.classList.contains("linaw-page-focus")).toBe(true);
    expect(blocks[0]?.classList.contains("linaw-page-focus")).toBe(false);
  });
});

describe("syncPageReading", () => {
  it("leaves a default page untouched until forced, and hold-off blocks a later apply", () => {
    mountArticle();
    syncPageReading(DEFAULT_READING_COMFORT);
    expect(isPageReadingActive()).toBe(false);

    syncPageReading(DEFAULT_READING_COMFORT, { force: true });
    expect(isPageReadingActive()).toBe(true);

    holdOffPageReading();
    expect(isPageReadingActive()).toBe(false);
    syncPageReading({ ...DEFAULT_READING_COMFORT, typeSize: "larger" });
    expect(isPageReadingActive()).toBe(false);

    syncPageReading({ ...DEFAULT_READING_COMFORT, typeSize: "larger" }, { force: true });
    expect(document.querySelector("article")?.hasAttribute("data-linaw-page-reading")).toBe(
      true,
    );
  });
});

describe("showClarifiedText", () => {
  it("replaces the article with a model answer and restores the original words", () => {
    const article = mountArticle();
    const before = article.textContent ?? "";

    showClarifiedText(
      article,
      "Confirm your seat by Thursday at 5 PM.\n- Mentors arrive at 8:30 AM\n- Others arrive at 9:00 AM",
    );

    expect(article.querySelector("script")).toBeNull();
    expect(article.querySelectorAll("p")).toHaveLength(1);
    expect(article.querySelectorAll("li")).toHaveLength(2);
    expect(article.textContent).toContain("Confirm your seat");
    expect(article.textContent).not.toBe(before);

    showClarifiedText(article, "A second model answer.");
    expect(article.textContent).toContain("A second model answer.");

    holdOffPageReading();
    expect(article.textContent).toBe(before);
  });

  it("does not change the article for a fixture answer", () => {
    const article = mountArticle();
    const before = article.textContent;

    expect(shouldReplacePageWords("fixture", true)).toBe(false);
    expect(shouldReplacePageWords(undefined, true)).toBe(false);
    expect(shouldReplacePageWords("model", false)).toBe(false);
    expect(shouldReplacePageWords("model", true)).toBe(true);
    expect(article.textContent).toBe(before);
  });
});
