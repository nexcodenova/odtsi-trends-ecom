interface Props {
  images: { src: string; alt: string }[];
}

// Stacked vertically, one per row — sits in a narrower side column next to
// the description text, not spread across the full page width.
export function DescriptionImages({ images }: Props) {
  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {images.map((img, i) => (
        <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F6F5F3]">
          {/* Plain <img>, not next/image — these come from whatever
              arbitrary CDN domain the supplier used, not a fixed set of
              hosts next.config.ts can allowlist ahead of time. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={img.alt} className="h-full w-full object-contain" />
        </div>
      ))}
    </div>
  );
}
