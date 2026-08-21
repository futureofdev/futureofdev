import type { APIRoute } from "astro";
import {
  getBeehiivConfig,
  getRuntimeEnv,
  updateSubscriptionByEmail,
} from "../../lib/beehiiv";

export const prerender = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const COOKIE_NAME = "fod_legacy_unsubscribe";
const COOKIE_TTL_SECONDS = 10 * 60;
const ALLOWED_HOSTS = new Set(["futureofdev.com", "www.futureofdev.com", "localhost", "127.0.0.1"]);
const encoder = new TextEncoder();

function redirect(
  status: "confirm" | "success" | "invalid" | "error",
  headers: HeadersInit = {},
): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/unsubscribe?status=${status}`,
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function decodeLegacyToken(token: string): string | null {
  try {
    const email = atob(token).trim().toLowerCase();
    return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
  } catch {
    return null;
  }
}

function toBase64Url(input: Uint8Array): string {
  let binary = "";
  for (const byte of input) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): ArrayBuffer {
  const padding = (4 - (input.length % 4)) % 4;
  const binary = atob(input.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat(padding));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function importSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signToken(token: string, secret: string): Promise<string> {
  const key = await importSigningKey(secret);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(token)));
  return `${encodeURIComponent(token)}.${toBase64Url(signature)}`;
}

async function verifySignedToken(value: string, secret: string): Promise<string | null> {
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const encodedToken = value.slice(0, separator);
  const suppliedSignature = value.slice(separator + 1);
  let token: string;
  try {
    token = decodeURIComponent(encodedToken);
  } catch {
    return null;
  }
  try {
    const key = await importSigningKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(suppliedSignature),
      encoder.encode(token),
    );
    return valid ? token : null;
  } catch {
    return null;
  }
}

function cookieValue(request: Request): string | null {
  const cookies = request.headers.get("Cookie") ?? "";
  for (const part of cookies.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === COOKIE_NAME) return value.join("=") || null;
  }
  return null;
}

function clearCookie(secure: boolean): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}

// Old Resend emails linked directly to this GET endpoint. Redirecting to a
// confirmation page prevents mail-security scanners from unsubscribing people.
export const GET: APIRoute = async ({ url, locals }) => {
  const token = url.searchParams.get("e");
  if (!token || !decodeLegacyToken(token)) return redirect("invalid");
  const env = getRuntimeEnv(locals);
  const secret = env.ANALYTICS_ID_SECRET ?? import.meta.env.ANALYTICS_ID_SECRET;
  if (!secret) return redirect("error");
  const sealed = await signToken(token, secret);
  const secure = url.protocol === "https:";
  return redirect("confirm", {
    "Set-Cookie": `${COOKIE_NAME}=${sealed}; Path=/; Max-Age=${COOKIE_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`,
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (!ALLOWED_HOSTS.has(new URL(origin).hostname)) return redirect("invalid");
    } catch {
      return redirect("invalid");
    }
  }

  const form = await request.formData();
  const formToken = form.get("token");
  const env = getRuntimeEnv(locals);
  const secret = env.ANALYTICS_ID_SECRET ?? import.meta.env.ANALYTICS_ID_SECRET;
  const cookieToken = secret && cookieValue(request)
    ? await verifySignedToken(cookieValue(request)!, secret)
    : null;
  const token = typeof formToken === "string" && formToken ? formToken : cookieToken;
  const secure = new URL(request.url).protocol === "https:";
  const cookieHeader = { "Set-Cookie": clearCookie(secure) };
  if (!token || token.length > 500) return redirect("invalid", cookieHeader);
  const email = decodeLegacyToken(token);
  if (!email) return redirect("invalid", cookieHeader);

  const config = getBeehiivConfig(locals);
  if (!config) return redirect("error", cookieHeader);
  try {
    await updateSubscriptionByEmail(config, email, { unsubscribe: true });
    return redirect("success", cookieHeader);
  } catch {
    console.error("Legacy unsubscribe failed");
    return redirect("error", cookieHeader);
  }
};
