"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsRow } from "./settings-row";
import { VerifyCodeForm } from "./verify-code-form";
import { FormStatusMessage, readError, type FormStatus } from "./form-status";
import { BirthdayInput, completeBirthday } from "./birthday-input";

export function EditProfileForm({
  name: initialName,
  email: initialEmail,
  phone: initialPhone,
  birthday: initialBirthday,
  pendingEmail: initialPendingEmail,
}: {
  name: string;
  email: string;
  phone: string | null;
  birthday: string | null;
  // A new email that's waiting on its 6-digit code — the old one stays
  // the login until it's confirmed.
  pendingEmail: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [birthday, setBirthday] = useState(initialBirthday ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState(initialPendingEmail);
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const emailChanged = email.trim().toLowerCase() !== initialEmail.toLowerCase();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        // Sent only when changed: "" erases it on ExiusCart, and the profile
        // may not return a saved birthday, so an untouched blank must not
        // wipe one set at signup.
        birthday: completeBirthday(birthday) !== (initialBirthday ?? "") ? completeBirthday(birthday) : undefined,
        currentPassword: emailChanged ? currentPassword : undefined,
      }),
    });
    if (!res.ok) {
      setStatus({ kind: "error", message: await readError(res) });
      return;
    }
    const body: { emailChange: { sentTo: string } | null } = await res.json();
    setCurrentPassword("");
    if (body.emailChange) {
      setPendingEmail(body.emailChange.sentTo);
      setEmail(initialEmail);
      setStatus({ kind: "success", message: "Saved. Confirm your new email with the code we sent." });
    } else {
      setStatus({ kind: "success", message: "Profile updated." });
    }
    // Re-render the server page so the name/email above pick up the new cookie.
    router.refresh();
  }

  return (
    <SettingsRow icon={Pencil} label="Edit Profile" hint={pendingEmail ? "Email change pending" : undefined}>
      <div className="flex flex-col gap-4">
        {pendingEmail && (
          <VerifyCodeForm
            endpoint="/api/account/email/verify"
            sentTo={pendingEmail}
            onVerified={() => {
              setPendingEmail(null);
              setStatus({ kind: "success", message: "Email changed." });
              router.refresh();
            }}
          />
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input id="profile-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-birthday">Birthday</Label>
            <BirthdayInput
              id="profile-birthday"
              value={birthday}
              onChange={setBirthday}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          {emailChanged && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-current-password">Current Password</Label>
              <Input
                id="profile-current-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <p className="text-xs text-[#8B8880]">Needed to change your email. We&apos;ll send a code to the new address.</p>
            </div>
          )}
          <FormStatusMessage status={status} />
          <Button type="submit" disabled={status.kind === "loading"}>
            {status.kind === "loading" ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </SettingsRow>
  );
}
