"use client";

import { useState } from "react";
import { DescriptionText } from "@/components/product/description-text";
import { DescriptionImages } from "@/components/product/description-images";

interface Props {
  textHtml: string;
  images: { src: string; alt: string }[];
}

// Text and images collapse together as one block, behind a single View
// More — the images are as much "the description" as the text is, so
// hiding one without the other would just hide half the story.
const COLLAPSED_HEIGHT = 340;

export function DescriptionSection({ textHtml, images }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="relative overflow-hidden" style={expanded ? undefined : { maxHeight: COLLAPSED_HEIGHT }}>
        <div className={`grid grid-cols-1 gap-10 ${images.length > 0 ? "lg:grid-cols-2" : ""}`}>
          <DescriptionText html={textHtml} />
          {images.length > 0 && <DescriptionImages images={images} />}
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
