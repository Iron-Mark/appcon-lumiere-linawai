import {
  AdaptRequestSchema,
  AdaptResponseSchema,
} from "@/lib/domain";
import { adapt as runLocalAdapt } from "@/lib/adapt/fixture";

/**
 * Local adapt POST handler. Runs the same offline pipeline as the fixture
 * (including fidelity). No model calls. Do not log source text.
 */

function plainError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return plainError("The request body was not valid JSON.", 400);
  }

  const parsed = AdaptRequestSchema.safeParse(body);
  if (!parsed.success) {
    return plainError("The request did not match the expected shape.", 400);
  }

  const result = await runLocalAdapt(parsed.data);
  const response = AdaptResponseSchema.parse(result);
  return Response.json(response);
}
