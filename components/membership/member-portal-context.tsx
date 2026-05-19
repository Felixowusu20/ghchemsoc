"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { MemberPortalPublic } from "@/lib/member-portal";
import {
  isMemberPortfolioUnlocked,
  loadMemberProfile,
  saveMemberAuthSession,
  saveMemberProfile,
  type MemberProfile,
} from "@/lib/member-profile";

type MemberPortalContextValue = {
  hydrated: boolean;
  profile: MemberProfile | null;
  unlocked: boolean;
  serverSession: boolean;
  portal: MemberPortalPublic | null;
  refresh: () => Promise<void>;
};

const MemberPortalContext = createContext<MemberPortalContextValue | null>(null);

export function MemberPortalProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [serverSession, setServerSession] = useState(false);
  const [portal, setPortal] = useState<MemberPortalPublic | null>(null);

  const refresh = useCallback(async () => {
    try {
      const meRes = await fetch("/api/member/me", { credentials: "include" });
      if (meRes.ok) {
        const data = (await meRes.json()) as { profile: MemberProfile };
        setProfile(data.profile);
        saveMemberProfile(data.profile);
        saveMemberAuthSession(data.profile);
        setUnlocked(true);
        setServerSession(true);
        return;
      }
    } catch {
      /* fall through to local */
    }

    setServerSession(false);
    const local = loadMemberProfile();
    setProfile(local);
    setUnlocked(isMemberPortfolioUnlocked());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refresh();
      if (cancelled) return;
      try {
        const portalRes = await fetch("/api/public/member-portal");
        if (portalRes.ok) {
          const data = (await portalRes.json()) as MemberPortalPublic;
          if (!cancelled) setPortal(data);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ hydrated, profile, unlocked, serverSession, portal, refresh }),
    [hydrated, profile, unlocked, serverSession, portal, refresh]
  );

  return <MemberPortalContext.Provider value={value}>{children}</MemberPortalContext.Provider>;
}

export function useMemberPortal() {
  const ctx = useContext(MemberPortalContext);
  if (!ctx) throw new Error("useMemberPortal must be used within MemberPortalProvider");
  return ctx;
}
