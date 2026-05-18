/** How new CMS administrator accounts can be created. */

export type AdminRegistrationStatus = {
  /** At least one admin exists in the database. */
  hasAdmins: boolean;
  /** No admins yet — first signup needs no setup code. */
  isFirstAdmin: boolean;
  /** `CMS_ALLOW_ADMIN_REGISTRATION=true` — anyone can create an account. */
  openRegistration: boolean;
  /** Additional admins must enter `ADMIN_REGISTRATION_SECRET` (setup code). */
  requiresSetupCode: boolean;
};

function setupCodeConfigured(): boolean {
  return Boolean(process.env.ADMIN_REGISTRATION_SECRET?.trim());
}

export function getAdminRegistrationStatus(adminCount: number): AdminRegistrationStatus {
  const isFirstAdmin = adminCount === 0;
  const openRegistration = process.env.CMS_ALLOW_ADMIN_REGISTRATION === "true";

  return {
    hasAdmins: adminCount > 0,
    isFirstAdmin,
    openRegistration,
    requiresSetupCode: !isFirstAdmin && !openRegistration && setupCodeConfigured(),
  };
}

export function canRegisterAdmin(params: {
  adminCount: number;
  registrationSecret?: string;
}): { allowed: true } | { allowed: false; error: string } {
  const status = getAdminRegistrationStatus(params.adminCount);

  if (status.isFirstAdmin) {
    return { allowed: true };
  }

  if (status.openRegistration) {
    return { allowed: true };
  }

  const expected = process.env.ADMIN_REGISTRATION_SECRET?.trim();
  if (!expected) {
    return {
      allowed: false,
      error:
        "New admin accounts are not enabled on this site yet. Ask whoever manages the website to turn on registration or send you a setup code.",
    };
  }

  const provided = params.registrationSecret?.trim();
  if (provided && provided === expected) {
    return { allowed: true };
  }

  return {
    allowed: false,
    error: "That setup code is not correct. Check the code from your site administrator and try again.",
  };
}
