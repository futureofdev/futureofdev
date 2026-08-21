export const COURSE_VERSION = "1.1.0";
export const COURSE_OFFER = "coding-bootcamp-in-a-box";
export const COURSE_DOWNLOAD_TTL_SECONDS = 15 * 60;

const encoder = new TextEncoder();

function toBase64Url(input: Uint8Array): string {
  let binary = "";
  for (const byte of input) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array {
  const padding = (4 - (input.length % 4)) % 4;
  const padded = input.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat(padding);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(secret: string, value: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index]! ^ right[index]!;
  }
  return difference === 0;
}

export async function createCourseDownloadToken(
  secret: string,
  now = Date.now(),
): Promise<string> {
  const payload = JSON.stringify({
    version: COURSE_VERSION,
    expires: Math.floor(now / 1000) + COURSE_DOWNLOAD_TTL_SECONDS,
    nonce: crypto.randomUUID(),
  });
  const encoded = toBase64Url(encoder.encode(payload));
  const signature = toBase64Url(await hmac(secret, encoded));
  return `${encoded}.${signature}`;
}

export async function verifyCourseDownloadToken(
  token: string,
  secret: string,
  now = Date.now(),
): Promise<boolean> {
  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra) return false;

  let payload: { version?: unknown; expires?: unknown };
  let signature: Uint8Array;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as typeof payload;
    signature = fromBase64Url(suppliedSignature);
  } catch {
    return false;
  }

  const expected = await hmac(secret, encoded);
  return (
    constantTimeEqual(signature, expected) &&
    payload.version === COURSE_VERSION &&
    typeof payload.expires === "number" &&
    payload.expires >= Math.floor(now / 1000)
  );
}
