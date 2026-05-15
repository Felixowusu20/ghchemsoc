import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set in .env and be at least 32 characters for HS256.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAccessToken(payload: { sub: string; email: string }): Promise<string> {
  const key = getSecretKey();
  const expires = process.env.JWT_EXPIRES_IN ?? "7d";
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);
}

export type JwtPayload = { sub: string; email: string };

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const key = getSecretKey();
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
  const sub = payload.sub;
  const email = payload.email;
  if (typeof sub !== "string" || typeof email !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub, email };
}
