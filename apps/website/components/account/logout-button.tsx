"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { forgetShopper } from "@odtsi/exiuscart-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    forgetShopper();
    router.push("/");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleLogout}>
      <LogOut size={16} />
      Sign Out
    </Button>
  );
}
