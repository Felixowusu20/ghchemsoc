export const GCS_MEMBER_STORAGE_KEY = "gcs-member-profile-v1";
export const GCS_MEMBER_AUTH_KEY = "gcs-member-auth-v1";

export type MemberPayment = {
    id: string;
    date: string;
    description: string;
    amountGhs: number | null;
    status: "completed" | "pending" | "failed";
    reference?: string;
};

export type MemberProfile = {
    memberId: string;
    fullName: string;
    email: string;
    phone: string;
    institution: string;
    jobTitle: string;
    highestDegree: string;
    declarationLegalName: string;
    declarationDate: string;
    registeredAt: string;
    /** Cloudinary URL when photo hosting is configured */
    photoUrl?: string;
    photoPublicId?: string;
    /** Local data URL fallback when Cloudinary is not configured */
    avatarDataUrl?: string;
    payments: MemberPayment[];
    /** Present when loaded from the server after sign-in. */
    annualMembershipStatus?: "active" | "inactive";
    annualMembershipValidUntil?: string;
};

/** Stored profiles from older form versions */
type LegacyMemberProfile = MemberProfile & {
    firstName?: string;
    lastName?: string;
    role?: string;
    department?: string;
    city?: string;
    region?: string;
    membershipType?: string;
    fieldOfStudy?: string;
    motivation?: string;
    avatarDataUrl?: string;
};

export function memberDisplayName(profile: LegacyMemberProfile): string {
    if (profile.fullName?.trim()) return profile.fullName.trim();
    const legacy = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    return legacy || "Member";
}

export function memberInitials(profile: LegacyMemberProfile): string {
    const name = memberDisplayName(profile);
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "G";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function memberJobTitle(profile: LegacyMemberProfile): string {
    return profile.jobTitle?.trim() || profile.role?.trim() || "";
}

export function memberPhotoSrc(profile: LegacyMemberProfile): string | null {
    if (profile.photoUrl?.trim()) return profile.photoUrl.trim();
    if (profile.avatarDataUrl?.trim()) return profile.avatarDataUrl.trim();
    return null;
}

export function formatDeclarationDate(isoDate: string): string {
    if (!isoDate) return "—";
    try {
        return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(isoDate));
    } catch {
        return isoDate;
    }
}

export function loadMemberProfile(): MemberProfile | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(GCS_MEMBER_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as LegacyMemberProfile;
        if (!parsed?.memberId || !parsed?.email) return null;
        return parsed as MemberProfile;
    } catch {
        return null;
    }
}

export function saveMemberProfile(profile: MemberProfile) {
    if (typeof window === "undefined") return;
    clearMemberAuthSession();
    window.localStorage.setItem(GCS_MEMBER_STORAGE_KEY, JSON.stringify(profile));
}

export type MemberAuthSession = {
    memberId: string;
    emailLower: string;
    verifiedAt: string;
};

/** Canonical form `GCS-YY-SUFFIX` (two-digit year). Accepts legacy `GCS-YYYY-SUFFIX` for comparison. */
export function normalizeMemberId(raw: string): string {
    const s = raw.trim().replace(/\s+/g, "").toUpperCase();
    const m = /^GCS-(\d{2}|\d{4})-([A-F0-9]+)$/.exec(s);
    if (!m) return s;
    const yPart = m[1];
    const suffix = m[2];
    const yy =
        yPart.length === 4
            ? String(parseInt(yPart, 10) % 100).padStart(2, "0")
            : yPart.padStart(2, "0");
    return `GCS-${yy}-${suffix}`;
}

export function loadMemberAuthSession(): MemberAuthSession | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(GCS_MEMBER_AUTH_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as MemberAuthSession;
        if (!parsed?.memberId || !parsed?.emailLower) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function saveMemberAuthSession(profile: MemberProfile) {
    if (typeof window === "undefined") return;
    const session: MemberAuthSession = {
        memberId: normalizeMemberId(profile.memberId),
        emailLower: profile.email.trim().toLowerCase(),
        verifiedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(GCS_MEMBER_AUTH_KEY, JSON.stringify(session));
}

export function clearMemberAuthSession() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(GCS_MEMBER_AUTH_KEY);
}

/** Portfolio UI is shown only after member login with matching email + member ID on this device. */
export function isMemberPortfolioUnlocked(): boolean {
    const profile = loadMemberProfile();
    const auth = loadMemberAuthSession();
    if (!profile || !auth) return false;
    return (
        normalizeMemberId(profile.memberId) === normalizeMemberId(auth.memberId) &&
        profile.email.trim().toLowerCase() === auth.emailLower
    );
}

export function verifyMemberCredentials(email: string, memberIdInput: string): { ok: true } | { ok: false; message: string } {
    const profile = loadMemberProfile();
    if (!profile) {
        return {
            ok: false,
            message:
                "No membership record found in this browser. Apply on this device first, or sign in where you originally registered.",
        };
    }
    const emailOk = profile.email.trim().toLowerCase() === email.trim().toLowerCase();
    const idOk = normalizeMemberId(profile.memberId) === normalizeMemberId(memberIdInput);
    if (!emailOk || !idOk) {
        return {
            ok: false,
            message: "That email and member ID do not match our record on this device. Check the confirmation screen or your email.",
        };
    }
    return { ok: true };
}

export function clearMemberProfile() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(GCS_MEMBER_STORAGE_KEY);
    clearMemberAuthSession();
}
