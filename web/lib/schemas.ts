import { z } from "zod";

// ---------- Shared enums ----------
export const DetailLevel = z.enum(["full", "key_points"]);
export const WordingStyle = z.enum(["original", "plain_language"]);

// ---------- 1. GENERATIVE LAYER SCHEMA ----------
const MeaningUnitSchema = z.object({
  id: z.string().describe("Short stable id, e.g. 'stmt-1'"),
  statement: z.string().describe("The core fact, restated neutrally in one sentence"),
  actor: z.string().nullable().describe("Who this concerns (person/role/group). Null if the statement is purely informational"),
  action: z.string().nullable().describe("What must be done, or what happens. Null for informational statements"),
  dates: z.array(z.string()).describe("Every date/deadline/time tied to this statement, copied verbatim from the source"),
  conditions: z.array(z.string()).describe("Prerequisites that must hold for this statement to apply"),
  exceptions: z.array(z.string()).describe("'Unless'/'except'/'only if' clauses that override or limit the statement"),
  isMandatory: z.boolean().describe("True if this is an obligation/requirement, false if optional/informational"),
  isNegation: z.boolean().describe("True if this statement forbids or negates something"),
  sourceQuote: z.string().describe("Exact verbatim substring copied from the ORIGINAL text that supports this unit. Must be a real quote, never paraphrased"),
});

export const GenerativeOutputSchema = z.object({
  meaningMap: z.array(MeaningUnitSchema)
    .min(1)
    .describe("All statements extracted from the original text, each traceable to a verbatim sourceQuote"),
  adaptedText: z.string()
    .describe(
      "The rewritten text for the recipient, built ONLY from meaningMap. " +
      "detailLevel='key_points' may drop supporting elaboration but MUST keep every " +
      "mandatory action, date, condition, and exception. wordingStyle='plain_language' " +
      "may simplify vocabulary/sentence structure but must not change who an instruction " +
      "concerns, whether it is mandatory, or when an exception applies."
    ),
  detailLevel: DetailLevel,
  wordingStyle: WordingStyle,
});
export type GenerativeOutput = z.infer<typeof GenerativeOutputSchema>;

// ---------- 2. VERIFICATION LAYER SCHEMA ----------
const VerificationIssueSchema = z.object({
  type: z.enum([
    "missing_date",
    "missing_condition",
    "missing_exception",
    "changed_relationship",   // e.g. date/actor pairing swapped ("setup team" vs "other volunteers")
    "changed_value",           // a number/date/name was altered
    "unsupported_addition",   // adaptedText states something with no source support
    "semantic_contradiction",  // flagged by the auxiliary cross-encoder/nli-deberta-v3-base check (route.ts)
  ]),
  severity: z.enum(["critical", "minor"]),
  description: z.string().describe("One plain-language sentence a non-technical recipient could read, e.g. 'The written-approval requirement for late confirmations is missing.'"),
  originalSnippet: z.string().describe("Exact verbatim quote from the ORIGINAL text relevant to this issue"),
  adaptedSnippet: z.string().nullable().describe("The corresponding (wrong/incomplete) text in adaptedText, or null if it was fully omitted"),
});

export const VerificationOutputSchema = z.object({
  status: z.enum(["ok", "warning"]).describe("'warning' if ANY issue has severity 'critical', otherwise 'ok'"),
  issues: z.array(VerificationIssueSchema),
  summary: z.string().describe(
    "One short user-facing sentence. Use language like the doc's examples: " +
    "'No issue found in these checks.' or 'This version may have changed the deadline.' " +
    "Never output a bare accuracy percentage or a guarantee of correctness."
  ),
});
export type VerificationOutput = z.infer<typeof VerificationOutputSchema>;

// ---------- Request contract for /api/adapt ----------
export const AdaptRequestSchema = z.object({
  originalText: z.string().min(1).max(6000),
  preferences: z.object({
    detailLevel: DetailLevel,
    wordingStyle: WordingStyle,
  }),
});
export type AdaptRequest = z.infer<typeof AdaptRequestSchema>;