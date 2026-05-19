/** Compare membership emails regardless of casing or surrounding spaces. */
export function emailsMatch(stored: string, input: string): boolean {
  return stored.trim().toLowerCase() === input.trim().toLowerCase();
}

export function normalizeMembershipEmail(email: string): string {
  return email.trim().toLowerCase();
}
