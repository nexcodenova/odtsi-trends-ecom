"use client";

import { useState } from "react";
import { DescriptionText } from "@/components/product/description-text";

interface DescriptionImage {
  src: string;
  alt: string;
}

interface Props {
  blocks: string[];
  images: DescriptionImage[];
}

// Text and images collapse together as one block, behind a single View
// More — the images are as much "the description" as the text is, so
// hiding one without the other would just hide half the story.
const COLLAPSED_HEIGHT = 340;

type Slot = { type: "text"; html: string } | { type: "image"; image: DescriptionImage };

// Real images spread evenly through the real text blocks — e.g. 6 blocks
// and 2 images places one after block 2 and one after block 4 — instead of
// two rigid side-by-side columns, which left a blank gap in whichever side
// was shorter (or ran the other side on with nothing to balance it).
function interleave(blocks: string[], images: DescriptionImage[]): Slot[] {
  if (images.length === 0) return blocks.map((html) => ({ type: "text", html }));

  const slots: Slot[] = [];
  const blocksPerImage = Math.max(1, Math.ceil(blocks.length / (images.length + 1)));
  let imageIndex = 0;

  blocks.forEach((html, i) => {
    slots.push({ type: "text", html });
    const isBoundary = (i + 1) % blocksPerImage === 0;
    if (isBoundary && imageIndex < images.length) {
      slots.push({ type: "image", image: images[imageIndex]! });
      imageIndex++;
    }
  });

  // Any images left over (more images than natural gaps) just go at the end.
  while (imageIndex < images.length) {
    slots.push({ type: "image", image: images[imageIndex]! });
    imageIndex++;
  }

  return slots;
}

export function DescriptionSection({ blocks, images }: Props) {
  const [expanded, setExpanded] = useState(false);
  const slots = interleave(blocks, images);

  return (
    <div>
      <div className="relative overflow-hidden" style={expanded ? undefined : { maxHeight: COLLAPSED_HEIGHT }}>
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {slots.map((slot, i) =>
            slot.type === "text" ? (
              <DescriptionText key={i} html={slot.html} />
            ) : (
              <div key={i} className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F6F5F3]">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary supplier CDN, not in next.config's allowlist */}
                <img src={slot.image.src} alt={slot.image.alt} className="h-full w-full object-contain" />
              </div>
            ),
          )}
        </div>
        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-sm font-bold text-primary transition hover:text-primary-hover"
      >
        {expanded ? "View Less" : "View More"}
      </button>
    </div>
  );
}
