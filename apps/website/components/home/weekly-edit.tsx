import Image from "next/image";
import Link from "next/link";

interface EditTile {
  label: string;
  href: string;
  imageUrl?: string;
}

// Left column: 2 stacked tiles. Middle: 1 tile spanning both rows (tall).
// Right column: 2 stacked tiles. Matches the reference mosaic exactly, and
// runs full-width like the rest of the page (no boxed-in max-w column).
const TILES: EditTile[] = [
  { label: "Smart Gadgets", href: "/category/smart-gadgets", imageUrl: "/weekly-edit/smart-gadgets.png" },
  { label: "Beauty", href: "/category/beauty-tools", imageUrl: "/weekly-edit/beauty.png" },
  { label: "Kids", href: "/category/baby-kids", imageUrl: "/weekly-edit/kids.png" },
  { label: "Daily Life", href: "/category/home-kitchen", imageUrl: "/weekly-edit/daily-life.png" },
  { label: "Travel", href: "/category/travel", imageUrl: "/weekly-edit/travel.png" },
];

const POSITIONS = [
  "col-start-1 row-start-1",
  "col-start-1 row-start-2",
  "col-start-2 row-start-1 row-span-2",
  "col-start-3 row-start-1",
  "col-start-3 row-start-2",
];

function Tile({ tile }: { tile: EditTile }) {
  return (
    <Link
      href={tile.href}
      className="group relative block h-full w-full overflow-hidden rounded-2xl bg-[#F6F5F3]"
    >
      {tile.imageUrl ? (
        <Image
          src={tile.imageUrl}
          alt={tile.label}
          fill
          className="object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#B9B6AE]">
          <span className="text-xs font-semibold tracking-wide">◇ photo goes here</span>
          <span className="text-[11px]">{tile.label}</span>
        </div>
      )}
    </Link>
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

      {/* Mobile: plain vertical stack, one full-width tile per row — the
          desktop mosaic (tall middle tile spanning both rows) turns into a
          near-empty sliver once 3 columns get squeezed into a phone width,
          so it only kicks in from sm: up. */}
      <div className="mt-8 flex flex-col gap-3 sm:grid sm:aspect-[16/6] sm:grid-cols-3 sm:grid-rows-2">
        {TILES.map((tile, i) => (
          <div key={tile.label} className={`aspect-[4/3] w-full sm:aspect-auto ${POSITIONS[i]}`}>
            <Tile tile={tile} />
          </div>
        ))}
      </div>
    </section>
  );
}
