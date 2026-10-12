"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsRow } from "./settings-row";
import { FormStatusMessage, readError, type FormStatus } from "./form-status";

export function EditProfileForm({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) {
      setStatus({ kind: "error", message: await readError(res) });
      return;
    }
    setStatus({ kind: "success", message: "Profile updated." });
    // Re-render the server page so the name/email above pick up the new cookie.
    router.refresh();
  }

  return (
    <SettingsRow icon={Pencil} label="Edit Profile">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input id="profile-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <FormStatusMessage status={status} />
        <Button type="submit" disabled={status.kind === "loading"}>
          {status.kind === "loading" ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </SettingsRow>
  );
}
