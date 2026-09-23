import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import {
  AdaptRequestSchema,
  GenerativeOutputSchema,
  VerificationOutputSchema,
} from "@/lib/schemas";
import {
  buildGenerativePrompt,
  buildVerificationPrompt,
  buildRepairPrompt,
  GENERATIVE_SYSTEM_PROMPT,
  VERIFICATION_SYSTEM_PROMPT,
} from "@/lib/prompts";

export const maxDuration = 60; 

const model = google("gemini-2.5-flash");
const TIMEOUT_MS = 15_000;

export async function POST(req: NextRequest) {
  // --- 0. Parse + validate input ---
  const json = await req.json().catch(() => null);
  const parsed = AdaptRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { originalText, preferences } = parsed.data;

  try {
    // --- 1. GENERATIVE LAYER (call #1) ---
    const generative = await withTimeout(
      generateObject({
        model,
        schema: GenerativeOutputSchema,
        system: GENERATIVE_SYSTEM_PROMPT,
        prompt: buildGenerativePrompt(originalText, preferences),
      }),
      TIMEOUT_MS
    );

    // --- 2. VERIFICATION LAYER (call #2) ---
    const verification = await withTimeout(
      generateObject({
        model,
        schema: VerificationOutputSchema,
        system: VERIFICATION_SYSTEM_PROMPT,
        prompt: buildVerificationPrompt(originalText, generative.object.adaptedText),
      }),
      TIMEOUT_MS
    );

    // --- 3. Bounded repair (ONE attempt) ---
    let finalText = generative.object.adaptedText;
    let finalMeaningMap = generative.object.meaningMap;
    let repaired = false;
    const hasCritical = verification.object.issues.some((i) => i.severity === "critical");

    if (verification.object.status === "warning" && hasCritical) {
      const repair = await withTimeout(
        generateObject({
          model,
          schema: GenerativeOutputSchema,
          system: GENERATIVE_SYSTEM_PROMPT,
          prompt: buildRepairPrompt(originalText, preferences, verification.object.issues),
        }),
        TIMEOUT_MS
      );
      finalText = repair.object.adaptedText;
      finalMeaningMap = repair.object.meaningMap; // Fixed Bug A: preserve synchronized repaired map
      repaired = true;
    }

    // --- 4. Respond ---
    return NextResponse.json({
      meaningMap: finalMeaningMap,
      adaptedText: finalText,
      repaired,
      verification: verification.object,
      verifiedAgainstFinalText: !repaired, // Fixed Bug B: honest status tracking
    });
  } catch (err) {
    console.error("[/api/adapt] pipeline error:", err);
    return NextResponse.json(
      { error: "adaptation_failed", fallback: originalText },
      { status: 502 }
    );
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("llm_timeout")), ms);
  });
  return Promise.race([p, timeoutPromise]).finally(() => clearTimeout(timer));
}