import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const encoded = url.searchParams.get("e");
  if (!encoded) {
    return new Response(null, { status: 302, headers: { Location: "/unsubscribe?status=invalid" } });
  }

  let email: string;
  try {
    email = atob(encoded);
  } catch {
    return new Response(null, { status: 302, headers: { Location: "/unsubscribe?status=invalid" } });
  }

  const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime;
  const apiKey = runtime?.env?.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
  const audienceId = runtime?.env?.RESEND_AUDIENCE_ID ?? import.meta.env.RESEND_AUDIENCE_ID ?? "";

  if (!apiKey || !audienceId) {
    return new Response(null, { status: 302, headers: { Location: "/unsubscribe?status=error" } });
  }

  try {
    const resend = new Resend(apiKey);
    const { data } = await resend.contacts.list({ audienceId });
    const contact = data?.data?.find((c: { email: string }) => c.email === email);

    if (contact) {
      await resend.contacts.update({
        id: contact.id,
        audienceId,
        unsubscribed: true,
      });
    }

    return new Response(null, { status: 302, headers: { Location: "/unsubscribe?status=success" } });
  } catch {
    return new Response(null, { status: 302, headers: { Location: "/unsubscribe?status=error" } });
  }
};
