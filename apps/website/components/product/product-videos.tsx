"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { ProductTestimonial, ProductVideo } from "@odtsi/exiuscart-client";

interface Props {
  videos: ProductVideo[];
  testimonials: ProductTestimonial[];
}

function VideoTile({
  href,
  embedHtml,
  thumbnailUrl,
  alt,
  label,
}: {
  href: string;
  embedHtml: string | null;
  thumbnailUrl: string | null;
  alt: string;
  label?: string;
}) {
  const [playing, setPlaying] = useState(false);

  // Playing the real YouTube/TikTok iframe here means the view counts on
  // their platform, same as any other embed of their content — not
  // something ODTSI tracks or fakes itself.
  if (playing && embedHtml) {
    return (
      <div
        className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-black [&>iframe]:h-full [&>iframe]:w-full"
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => (embedHtml ? setPlaying(true) : window.open(href, "_blank", "noopener,noreferrer"))}
      className="group relative block aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#F6F5F3] text-left"
    >
      {thumbnailUrl && <Image src={thumbnailUrl} alt={alt} fill className="object-cover" />}
      <span className="absolute inset-0 bg-black/15 transition group-hover:bg-black/25" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary">
          <Play size={20} className="ml-0.5 fill-primary" />
        </span>
      </span>
      {label && (
        <span className="absolute bottom-3 left-3 right-3 truncate text-xs font-bold text-white drop-shadow">
          {label}
        </span>
      )}
    </button>
  );
}

// Real product videos and real customer testimonials only — no placeholder
// tiles. Call site (page.tsx) skips rendering this entirely when there's
// nothing real yet.
export function ProductVideos({ videos, testimonials }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {videos.map((video, i) => (
        <VideoTile
          key={`video-${i}`}
          href={video.url}
          embedHtml={video.embedHtml}
          thumbnailUrl={video.thumbnailUrl}
          alt={video.title ?? "Product video"}
          label={video.title ?? undefined}
        />
      ))}

      {testimonials.map((t) => (
        <VideoTile
          key={t.id}
          href={t.videoUrl}
          embedHtml={null}
          thumbnailUrl={t.thumbnailUrl}
          alt={t.customerName}
          label={t.customerName}
        />
      ))}
    </div>
  );
}
