"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-black/10 text-sm font-bold text-[#4A4844] transition hover:border-black/20"
    >
      <LogOut size={16} />
      Sign Out
    </button>
  );
}
