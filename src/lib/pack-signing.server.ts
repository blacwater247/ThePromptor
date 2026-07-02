// HMAC signing for short-lived pack download URLs. Server-only.
const enc = new TextEncoder();

function getSecret(): string {
  const s = process.env.PACK_DOWNLOAD_SIGNING_SECRET;
  if (!s) throw new Error("PACK_DOWNLOAD_SIGNING_SECRET is not configured");
  return s;
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(new Uint8Array(sig));
}

export async function signPackDownload(
  packSlug: string,
  userId: string,
  ttlSeconds = 300,
): Promise<{ token: string; exp: number }> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${packSlug}.${userId}.${exp}`;
  const sig = await hmac(payload);
  return { token: `${exp}.${sig}`, exp };
}

export async function verifyPackDownload(
  packSlug: string,
  userId: string,
  token: string,
): Promise<boolean> {
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(`${packSlug}.${userId}.${exp}`);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
