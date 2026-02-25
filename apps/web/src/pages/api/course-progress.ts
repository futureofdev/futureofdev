import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

const MAX_PHASE = 20;
const MAX_LESSON = 100;
const MAX_STRING_LENGTH = 200;

interface ProgressPayload {
  anonymous_id?: string;
  phase: number;
  lesson: number;
  phase_name: string;
  lesson_title: string;
}

function isValidPayload(body: unknown): body is ProgressPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.phase === "number" &&
    Number.isInteger(b.phase) &&
    b.phase >= 1 &&
    b.phase <= MAX_PHASE &&
    typeof b.lesson === "number" &&
    Number.isInteger(b.lesson) &&
    b.lesson >= 1 &&
    b.lesson <= MAX_LESSON &&
    typeof b.phase_name === "string" &&
    b.phase_name.length > 0 &&
    b.phase_name.length <= MAX_STRING_LENGTH &&
    typeof b.lesson_title === "string" &&
    b.lesson_title.length > 0 &&
    b.lesson_title.length <= MAX_STRING_LENGTH
  );
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    if (!isValidPayload(body)) {
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime;
    const supabaseUrl =
      runtime?.env?.SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
    const supabaseKey =
      runtime?.env?.SUPABASE_PUBLISHABLE_KEY ??
      import.meta.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Analytics service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const anonymous_id =
      body.anonymous_id && body.anonymous_id.length > 0
        ? body.anonymous_id
        : crypto.randomUUID();

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("lesson_completions").insert({
      anonymous_id,
      phase: body.phase,
      lesson: body.lesson,
      phase_name: body.phase_name,
      lesson_title: body.lesson_title,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to record progress" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, anonymous_id }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to record progress" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
