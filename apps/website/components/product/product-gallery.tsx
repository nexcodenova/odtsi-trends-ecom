"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { ProductVideo } from "@odtsi/exiuscart-client";

interface ProductGalleryProps {
  images: string[];
  videos: ProductVideo[];
  productName: string;
  badge?: string;
}

// How many thumbnails the side rail holds before it'd run taller than the
// main image and look unbalanced — anything past this spills into a row
// below the main image instead of stretching the rail further down.
const MAX_RAIL_THUMBS = 6;

type ThumbItem = { kind: "video"; index: number; video: ProductVideo } | { kind: "image"; index: number; src: string };

function Thumb({
  active,
  onClick,
  label,
  posterSrc,
  isVideo,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  posterSrc?: string;
  isVideo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-primary-light transition ${
        active ? "border-action" : "border-transparent"
      }`}
    >
      {posterSrc && <Image src={posterSrc} alt="" fill className="object-cover" />}
      {isVideo && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/35">
          <Play size={16} className="fill-white text-white" />
        </span>
      )}
    </button>
  );
}

export function ProductGallery({ images, videos, productName, badge }: ProductGalleryProps) {
  const hasImages = images.length > 0;

  const [active, setActive] = useState<ThumbItem>(
    videos.length > 0
      ? { kind: "video", index: 0, video: videos[0] }
      : { kind: "image", index: 0, src: images[0] ?? "" },
  );

  const allThumbs: ThumbItem[] = [
    ...videos.map((video, i) => ({ kind: "video" as const, index: i, video })),
    ...images.map((src, i) => ({ kind: "image" as const, index: i, src })),
  ];
  const railThumbs = allThumbs.slice(0, MAX_RAIL_THUMBS);
  const overflowThumbs = allThumbs.slice(MAX_RAIL_THUMBS);
  const thumbCount = allThumbs.length;

  function isActive(t: ThumbItem) {
    return t.kind === active.kind && t.index === active.index;
  }

  function renderThumb(thumb: ThumbItem) {
    return (
      <Thumb
        key={`${thumb.kind}-${thumb.index}`}
        active={isActive(thumb)}
        onClick={() => setActive(thumb)}
        label={
          thumb.kind === "video" ? thumb.video.title ?? `Watch video ${thumb.index + 1}` : `View image ${thumb.index + 1}`
        }
        posterSrc={thumb.kind === "video" ? thumb.video.thumbnailUrl ?? images[0] : thumb.src}
        isVideo={thumb.kind === "video"}
      />
    );
  }

  const activeVideo = active.kind === "video" ? active.video : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: thumbCount > 1 ? "78px 1fr" : "1fr", gap: 14 }}>
        {thumbCount > 1 && (
          <div className="flex h-full flex-col justify-between gap-2.5">{railThumbs.map(renderThumb)}</div>
        )}

        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#232323] to-[#060606]">
          {activeVideo ? (
            activeVideo.embedHtml ? (
              <div
                className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full"
                // Real oEmbed <iframe> snippet resolved server-side by
                // ExiusCart via YouTube/TikTok's own oEmbed API — not
                // arbitrary user input, trusted the same as any other field.
                dangerouslySetInnerHTML={{ __html: activeVideo.embedHtml }}
              />
            ) : (
              <a href={activeVideo.url} target="_blank" rel="noopener noreferrer" className="group absolute inset-0 block">
                {(activeVideo.thumbnailUrl ?? images[0]) && (
                  <Image src={activeVideo.thumbnailUrl ?? images[0]} alt={productName} fill className="object-cover opacity-70" />
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-action shadow-[0_10px_24px_-6px_rgba(0,0,0,0.6)] transition group-hover:scale-105">
                    <Play size={26} className="fill-[#16161A] text-[#16161A]" />
                  </span>
                </span>
              </a>
            )
          ) : active.kind === "image" && hasImages ? (
            <Image src={active.src} alt={productName} fill priority className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-wide text-white/25">
              ◇ photo goes here
            </span>
          )}
          {badge && (
            <span className="absolute left-3.5 top-3.5 rounded-full bg-action px-3 py-1.5 text-[11px] font-extrabold text-[#16161A]">
              {badge}
            </span>
          )}
        </div>
      </div>

      {overflowThumbs.length > 0 && (
        <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-1">{overflowThumbs.map(renderThumb)}</div>
      )}
    </div>
  );
}
