"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BlurFadeIn } from "@/components/shared/blur-fade-in";
import type { Category } from "@odtsi/exiuscart-client";

interface EditTile {
  label: string;
  href: string;
  imageUrl: string;
}

// Curated photography (image1.png...image5.png, generically named — see
// the git history for why) paired with 5 real categories by slug. Labels
// used to be hardcoded editorial text ("Kids", "Daily Life"...) that could
// drift from the category's actual name — now the label is always the
// real category.name, so this section can't show a different name for a
// category than the live category grid does.
const SLOTS: { slug: string; imageUrl: string }[] = [
  { slug: "baby-kids", imageUrl: "/weekly-edit/image1.png" },
  { slug: "smart-gadgets", imageUrl: "/weekly-edit/image2.png" },
  { slug: "home-kitchen", imageUrl: "/weekly-edit/image3.png" },
  { slug: "beauty-tools", imageUrl: "/weekly-edit/image4.png" },
  { slug: "travel", imageUrl: "/weekly-edit/image5.png" },
];

function buildTiles(categories: Category[]): EditTile[] {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  return SLOTS.flatMap(({ slug, imageUrl }) => {
    const category = bySlug.get(slug);
    // A slot whose real category doesn't exist (renamed/deleted on
    // ExiusCart's side) is dropped rather than shown with a fabricated
    // name — same honest-empty rule the category grid follows.
    if (!category) return [];
    return [{ label: category.name, href: `/category/${category.slug}`, imageUrl }];
  });
}

// The zoom button is a real, separate control from the tile's own Link —
// clicking the tile navigates to that real category (the actual point of
// this section); clicking the zoom icon previews the image instead,
// without leaving the page. Two real actions on one tile, not one
// pretending to be the other.
function Tile({ tile, big, onPreview }: { tile: EditTile; big?: boolean; onPreview: () => void }) {
  return (
    <Link
      href={tile.href}
      className={`group relative overflow-hidden rounded-2xl bg-[#F6F5F3] ${big ? "col-span-2 row-span-1 sm:row-span-2" : ""}`}
    >
      <Image
        src={tile.imageUrl}
        alt={tile.label}
        fill
        sizes={big ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4">
        <span className={`font-extrabold text-white ${big ? "text-lg sm:text-2xl" : "text-sm sm:text-base"}`}>
          {tile.label}
        </span>
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPreview();
        }}
        aria-label={`Preview ${tile.label}`}
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#16161A] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:h-9 sm:w-9"
      >
        <ZoomIn size={15} />
      </button>
    </Link>
  );
}

export function WeeklyEdit({ categories }: { categories: Category[] }) {
  const [active, setActive] = React.useState<EditTile | null>(null);
  const tiles = buildTiles(categories);
  // Honest-empty: no real categories matched any slot, so there's nothing
  // real to curate — same rule the category grid and product rows follow.
  if (tiles.length === 0) return null;
  const [big, ...rest] = tiles;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-5 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Badge variant="action">Fresh Picks</Badge>
          <h2 className="mt-3 text-3xl font-extrabold text-[#16161A] sm:text-4xl">This Week&apos;s Edit</h2>
        </div>
        <span className="hidden text-sm text-[#8B8880] sm:block">{tiles.length} Collections</span>
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <BlurFadeIn delay={0}>
          {/* Mobile: 2 cols / 3 rows — big tile is a full-width strip on
              top (row-span-1, not 2, so the other 4 tiles keep their own
              full 2x2 below it instead of getting squeezed off-screen).
              Desktop: 4 cols / 2 rows, big tile spans a real 2x2, and the
              whole grid is short enough to read as one section, not a
              second scroll. */}
          <div className="mt-8 grid aspect-[4/5] grid-cols-2 grid-rows-3 gap-2.5 sm:aspect-[3/1] sm:grid-cols-4 sm:grid-rows-2">
            {big && <Tile tile={big} big onPreview={() => setActive(big)} />}
            {rest.map((tile) => (
              <Tile key={tile.label} tile={tile} onPreview={() => setActive(tile)} />
            ))}
          </div>
        </BlurFadeIn>

        <DialogContent className="p-0 sm:max-w-2xl">
          {active && (
            <>
              <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-[#F6F5F3]">
                <Image src={active.imageUrl} alt={active.label} fill className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-4 p-5 pt-1">
                <div>
                  <DialogTitle>{active.label}</DialogTitle>
                  <DialogDescription>Shop the real {active.label} collection.</DialogDescription>
                </div>
                <Link
                  href={active.href}
                  onClick={() => setActive(null)}
                  className="shrink-0 rounded-xl bg-action px-4 py-2.5 text-sm font-extrabold text-action-ink transition hover:brightness-95"
                >
                  Shop Now
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
