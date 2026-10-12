import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getDownload, type DownloadInfo } from "@odtsi/exiuscart-client";
import { DownloadGate } from "@/components/download/download-gate";

// Landing page for the link in a digital product's delivery email. The
// file itself is only revealed once the emailed access code checks out.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Download | ODTSI",
  robots: { index: false, follow: false },
};

export default async function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let info: DownloadInfo | null = null;
  let error = "";
  try {
    info = await getDownload(token);
  } catch (err) {
    error = err instanceof Error ? err.message : "This download link doesn't exist.";
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-14 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <Download size={28} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">
        {info?.productName ?? "Your Download"}
      </h1>
      {info ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-[#716D67]">
            Enter the access code from your delivery email to unlock your file.
          </p>
          <div className="mt-6 w-full">
            <DownloadGate token={token} />
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-[#716D67]">
          {error} Check the link in your delivery email, or contact us with your order number.
        </p>
      )}
    </div>
  );
}
