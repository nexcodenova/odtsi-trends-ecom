"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import type { ProductTestimonial, ProductVideo } from "@odtsi/exiuscart-client";

interface Props {
  videos: ProductVideo[];
  testimonials: ProductTestimonial[];
}

interface Tile {
  key: string;
  href: string;
  embedHtml: string | null;
  thumbnailUrl: string | null;
  alt: string;
  label?: string;
  // TikTok's real shape is a 9:16 portrait player, not YouTube's 16:9
  // landscape — forcing both into the same box either crops TikTok's
  // frame or leaves it tiny and letterboxed. Testimonials have no
  // platform field, so they fall back to the landscape shape.
  portrait: boolean;
}

function isPortrait(platform: string): boolean {
  return platform === "tiktok";
}

// Nested glow-circle play button, same shape as MagicUI's HeroVideoDialog —
// a soft blurred backdrop ring behind a solid gradient circle so it reads
// clearly over any thumbnail, light or dark.
function PlayButton() {
  return (
    <span className="absolute inset-0 flex scale-90 items-center justify-center transition-transform duration-200 ease-out group-hover:scale-100">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-action/80 to-action shadow-md transition-transform duration-200 ease-out group-hover:scale-110">
          <Play size={22} className="ml-0.5 fill-white text-white drop-shadow" />
        </span>
      </span>
    </span>
  );
}

function VideoThumb({ tile, onOpen }: { tile: Tile; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={() => (tile.embedHtml ? onOpen() : window.open(tile.href, "_blank", "noopener,noreferrer"))}
      className={`group relative block w-full overflow-hidden rounded-2xl bg-[#F6F5F3] text-left ${
        tile.portrait ? "aspect-[9/16] max-w-[280px]" : "aspect-[16/9]"
      }`}
    >
      {tile.thumbnailUrl && (
        <Image
          src={tile.thumbnailUrl}
          alt={tile.alt}
          fill
          className="object-cover transition duration-200 ease-out group-hover:brightness-75"
        />
      )}
      <PlayButton />
      {tile.label && (
        <span className="absolute bottom-3 left-3 right-3 truncate text-xs font-bold text-white drop-shadow">
          {tile.label}
        </span>
      )}
    </button>
  );
}

// Fullscreen animated lightbox, adapted from MagicUI's HeroVideoDialog but
// with plain CSS transitions instead of framer-motion — one less runtime
// dependency to go wrong in production. Mounts hidden, then flips visible a
// tick later so the transition classes actually animate in instead of
// snapping straight to the open state.
function VideoDialog({ embedHtml, portrait, onClose }: { embedHtml: string; portrait: boolean; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative mx-4 w-full transition-all duration-200 ease-out sm:mx-0 ${
          portrait ? "aspect-[9/16] max-w-sm" : "aspect-video max-w-4xl"
        } ${visible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close video"
          className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
        >
          <X size={18} />
        </button>
        {/* Real supplier embed_html — playing it here means the view count
            lands on YouTube/TikTok's own platform, same as any other embed
            of their content, not something ODTSI tracks or fakes itself. */}
        <div
          className="relative isolate z-[1] h-full w-full overflow-hidden rounded-2xl border-2 border-white/90 bg-black [&>iframe]:h-full [&>iframe]:w-full"
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      </div>
    </div>
  );
}

// Real product videos and real customer testimonials only — no placeholder
// tiles. Call site (page.tsx) skips rendering this entirely when there's
// nothing real yet.
export function ProductVideos({ videos, testimonials }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const tiles: Tile[] = [
    ...videos.map((video, i) => ({
      key: `video-${i}`,
      href: video.url,
      embedHtml: video.embedHtml,
      thumbnailUrl: video.thumbnailUrl,
      alt: video.title ?? "Product video",
      label: video.title ?? undefined,
      portrait: isPortrait(video.platform),
    })),
    ...testimonials.map((t) => ({
      key: t.id,
      href: t.videoUrl,
      embedHtml: null,
      thumbnailUrl: t.thumbnailUrl,
      alt: t.customerName,
      label: t.customerName,
      portrait: false,
    })),
  ];

  const openTile = tiles.find((tile) => tile.key === openKey) ?? null;

  return (
    <>
      <div className="flex flex-wrap items-start gap-5">
        {tiles.map((tile) => (
          <div key={tile.key} className={tile.portrait ? "w-[45%] min-w-[160px] sm:w-[220px]" : "w-full sm:w-[calc(50%-10px)]"}>
            <VideoThumb tile={tile} onOpen={() => setOpenKey(tile.key)} />
          </div>
        ))}
      </div>

      {openTile?.embedHtml && (
        <VideoDialog embedHtml={openTile.embedHtml} portrait={openTile.portrait} onClose={() => setOpenKey(null)} />
      )}
    </>
  );
}
