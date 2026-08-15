import Image from "next/image";
import Link from "next/link";
import { BlurFadeIn } from "@/components/shared/blur-fade-in";

interface EditTile {
  label: string;
  href: string;
  imageUrl: string;
  // Real pixel dimensions — next/image needs these to reserve the right
  // aspect ratio per tile so the masonry columns settle without jumping
  // once each image loads.
  width: number;
  height: number;
}

// Masonry gallery, same spirit as MagicUI's BlurFade demo — each tile
// keeps its own real aspect ratio (kids.png is portrait, the rest are
// landscape) instead of being cropped into a fixed mosaic grid.
const TILES: EditTile[] = [
  { label: "Smart Gadgets", href: "/category/smart-gadgets", imageUrl: "/weekly-edit/smart-gadgets.png", width: 1672, height: 941 },
  { label: "Kids", href: "/category/baby-kids", imageUrl: "/weekly-edit/kids.png", width: 1024, height: 1536 },
  { label: "Daily Life", href: "/category/home-kitchen", imageUrl: "/weekly-edit/daily-life.png", width: 1672, height: 941 },
  { label: "Beauty", href: "/category/beauty-tools", imageUrl: "/weekly-edit/beauty.png", width: 1672, height: 941 },
  { label: "Travel", href: "/category/travel", imageUrl: "/weekly-edit/travel.png", width: 1672, height: 941 },
];

// CSS's `columns` property "balances" height by guessing — with only 5
// tiles at very different aspect ratios (one portrait among four
// landscape) it guessed badly and left a whole column nearly empty. This
// greedily drops each tile into whichever column is currently shortest
// (by real aspect ratio, not item count), same idea real masonry libraries
// use, so no column ever ends up empty.
function distributeIntoColumns(tiles: EditTile[], columnCount: number): EditTile[][] {
  const columns: EditTile[][] = Array.from({ length: columnCount }, () => []);
  const heights = new Array(columnCount).fill(0);

  for (const tile of tiles) {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest]!.push(tile);
    heights[shortest] += tile.height / tile.width;
  }

  return columns;
}

function Tile({ tile, delay }: { tile: EditTile; delay: number }) {
  return (
    <BlurFadeIn delay={delay} className="mb-4">
      <Link href={tile.href} className="group relative block w-full overflow-hidden rounded-2xl bg-[#F6F5F3]">
        <Image
          src={tile.imageUrl}
          alt={tile.label}
          width={tile.width}
          height={tile.height}
          className="h-auto w-full rounded-2xl object-cover transition group-hover:scale-105"
        />
      </Link>
    </BlurFadeIn>
  );
}

function MasonryColumns({
  tiles,
  columnCount,
  className,
  offsetSideColumns = false,
}: {
  tiles: EditTile[];
  columnCount: number;
  className: string;
  // Drops every column except the middle one down a quarter-turn, so the
  // tall center tile reads as the anchor and the two side columns feel
  // staggered around it instead of all three lining up flush at the top.
  offsetSideColumns?: boolean;
}) {
  const columns = distributeIntoColumns(tiles, columnCount);
  const middleIndex = Math.floor((columnCount - 1) / 2);
  const delayOf = (tile: EditTile) => tiles.indexOf(tile) * 80;

  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
      {columns.map((column, i) => (
        <div
          key={i}
          className="flex flex-col"
          style={offsetSideColumns && i !== middleIndex ? { marginTop: "10%" } : undefined}
        >
          {column.map((tile) => (
            <Tile key={tile.label} tile={tile} delay={delayOf(tile)} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function WeeklyEdit() {
  return (
    <section className="px-4 py-10 sm:px-5 sm:py-14">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-[#DEDCD5]" />
        <h2 className="shrink-0 text-3xl font-extrabold text-[#16161A] sm:text-4xl">
          This Week&apos;s Edit
        </h2>
        <span className="h-px flex-1 bg-[#DEDCD5]" />
      </div>

      <MasonryColumns tiles={TILES} columnCount={2} className="mt-8 sm:hidden" />
      <MasonryColumns tiles={TILES} columnCount={3} className="mt-8 hidden sm:grid" offsetSideColumns />
    </section>
  );
}
