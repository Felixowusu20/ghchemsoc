export function jwtCookieMaxAgeSec(): number {
  return 60 * 60 * 24 * 7;
}

export function jwtCookieSetOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true as const,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: jwtCookieMaxAgeSec(),
  };
}

export function jwtCookieClearOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true as const,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
