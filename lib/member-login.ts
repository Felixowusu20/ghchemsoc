/** Public member sign-in (not CMS admin, not new registration). */
export const MEMBER_LOGIN_PATH = "/login";

const BECOME_MEMBER = /become\s+a\s+member/i;

export function isBecomeMemberLabel(label: string | null | undefined): boolean {
  return Boolean(label && BECOME_MEMBER.test(label.trim()));
}

/** Use login for “Become a member”; otherwise keep the provided href. */
export function hrefForMemberCta(label: string | null | undefined, href: string): string {
  return isBecomeMemberLabel(label) ? MEMBER_LOGIN_PATH : href;
}
