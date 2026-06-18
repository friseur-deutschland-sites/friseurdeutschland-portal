const SECRET = process.env.PORTAL_SESSION_SECRET || "fd-dev-secret-change-me";
const SESSION_COOKIE = "fd_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payloadB64) {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return base64url(sig);
}

export async function createSessionToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadB64 = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifySessionToken(token) {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = await sign(payloadB64);
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
