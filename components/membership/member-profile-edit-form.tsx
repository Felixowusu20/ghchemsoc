"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Building2, FlaskConical, Loader2, Mail, Save, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberAnnualStatusBadge } from "@/components/membership/member-annual-status-badge";
import { MemberPortalPageHeader, MemberPortalPanel } from "@/components/membership/member-portal-ui";
import { useMemberPortal } from "@/components/membership/member-portal-context";
import { formatDeclarationDate, memberDisplayName, saveMemberAuthSession, saveMemberProfile } from "@/lib/member-profile";
import { gooeyToast } from "@/lib/toast";

export function MemberProfileEditForm() {
  const { profile, refresh, serverSession } = useMemberPortal();
  const [saving, setSaving] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const photo = photoRef.current?.files?.[0];
    if (photo?.size) fd.set("photo", photo);

    try {
      const res = await fetch("/api/member/profile", {
        method: "PATCH",
        credentials: "include",
        body: fd,
      });
      const data = (await res.json()) as { profile?: typeof profile; error?: string };
      if (!res.ok || !data.profile) {
        gooeyToast.error("Could not save profile", {
          description: data.error ?? "Try again or contact the secretariat.",
          preset: "smooth",
          spring: false,
        });
        return;
      }
      saveMemberProfile(data.profile);
      saveMemberAuthSession(data.profile);
      await refresh();
      gooeyToast.success("Profile updated", { preset: "smooth", spring: false });
      if (photoRef.current) photoRef.current.value = "";
    } catch {
      gooeyToast.error("Could not save profile", { description: "Network error.", preset: "smooth", spring: false });
    } finally {
      setSaving(false);
    }
  }

  const lockedRows = [
    { label: "Full name", value: memberDisplayName(profile), Icon: FlaskConical },
    { label: "Email", value: profile.email, Icon: Mail },
    {
      label: "Declaration",
      value: profile.declarationLegalName
        ? `${profile.declarationLegalName} · ${formatDeclarationDate(profile.declarationDate)}`
        : "—",
      Icon: Shield,
    },
  ];

  return (
    <div className="space-y-7 sm:space-y-9">
      <MemberPortalPageHeader
        icon={User}
        title="My profile"
        description={`Update contact details and your photo. Your member ID and legal name are managed by the secretariat.${
          serverSession
            ? " Changes sync across devices when you are signed in."
            : " Sign in with email and member ID to sync across devices."
        }`}
      />

      <MemberAnnualStatusBadge profile={profile} variant="card" className="w-full max-w-lg" />

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleSubmit}
        className="space-y-6 sm:space-y-8"
      >
        <MemberPortalPanel>
          <h3 className="text-base font-semibold text-gcs-foreground">Editable details</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">
                Institution
              </span>
              <Input name="institution" defaultValue={profile.institution} required className="h-11 w-full rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">
                Job title
              </span>
              <Input name="jobTitle" defaultValue={profile.jobTitle} className="h-11 w-full rounded-xl" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">Phone</span>
              <Input name="phone" type="tel" defaultValue={profile.phone} className="h-11 w-full rounded-xl" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">
                Profile photo
              </span>
              <input
                ref={photoRef}
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full max-w-full text-sm text-gcs-muted-text file:mr-3 file:rounded-full file:border-0 file:bg-gcs-primary/10 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-gcs-primary"
              />
              <p className="mt-2 text-xs text-gcs-muted-text">JPEG, PNG, or WebP up to 2 MB.</p>
            </label>
          </div>
          <Button
            type="submit"
            disabled={saving || !serverSession}
            className="mt-6 h-11 w-full rounded-full bg-gcs-primary px-8 text-white hover:bg-gcs-primary-hover sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </>
            )}
          </Button>
          {!serverSession ? (
            <p className="mt-3 text-sm leading-relaxed text-amber-800">
              Sign in with your email and member ID to save profile changes to your account.
            </p>
          ) : null}
        </MemberPortalPanel>

        <MemberPortalPanel className="bg-slate-50/50">
          <h3 className="text-sm font-semibold text-gcs-foreground">On file (read-only)</h3>
          <ul className="mt-4 divide-y divide-gcs-border/50 rounded-xl border border-gcs-border/50 bg-white">
            {lockedRows.map(({ label, value, Icon }) => (
              <li key={label} className="flex gap-3 px-4 py-3.5 text-sm first:rounded-t-xl last:rounded-b-xl">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gcs-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gcs-muted-text">{label}</p>
                  <p className="mt-0.5 break-words font-medium text-gcs-foreground">{value}</p>
                </div>
              </li>
            ))}
            <li className="flex gap-3 px-4 py-3.5 text-sm">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gcs-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gcs-muted-text">Member ID</p>
                <p className="mt-0.5 break-all font-mono text-sm font-medium text-gcs-foreground">{profile.memberId}</p>
              </div>
            </li>
          </ul>
        </MemberPortalPanel>
      </motion.form>
    </div>
  );
}
