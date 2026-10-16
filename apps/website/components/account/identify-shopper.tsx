"use client";

import { useEffect } from "react";
import { identifyShopper } from "@odtsi/exiuscart-client";

// Signed-in pages render this so a shopper who logged in before
// identification existed still gets linked to ExiusCart's visitor ID.
export function IdentifyShopper({ email, name }: { email: string; name?: string }) {
  useEffect(() => {
    identifyShopper({ email, name });
  }, [email, name]);

  return null;
}
