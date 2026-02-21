import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function buildWelcomeEmail(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;border:1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #e2e8f0;">
              <span style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:#1e293b;">Future of Dev</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0f172a;">Welcome aboard!</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
                You're now subscribed to Future of Dev. We'll send you the most impactful news, insights, and free courses on agentic development — straight to your inbox.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                No spam, no fluff. Just the stuff that matters for your career in the AI era.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1e293b;border-radius:6px;">
                    <a href="https://futureofdev.com/claude-academy" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#f8fafc;text-decoration:none;font-family:'Inter',system-ui,sans-serif;">
                      Explore Claude Academy — It's Free
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                You're receiving this because ${email} signed up at futureofdev.com.<br/>
                <a href="https://futureofdev.com" style="color:#64748b;text-decoration:underline;">futureofdev.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const runtime = (locals as any).runtime;
    const apiKey = runtime?.env?.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Newsletter service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const audienceId = runtime?.env?.RESEND_AUDIENCE_ID ?? import.meta.env.RESEND_AUDIENCE_ID ?? "";
    const resend = new Resend(apiKey);

    await resend.contacts.create({
      email,
      audienceId,
    });

    // Send branded welcome email
    await resend.emails.send({
      from: "Future of Dev <hello@newsletter.futureofdev.com>",
      to: email,
      subject: "Welcome to Future of Dev!",
      html: buildWelcomeEmail(email),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
