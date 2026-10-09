import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { BlurFadeIn } from "@/components/shared/blur-fade-in";

// Pure display section — just the 5 curated photos in /public/weekly-edit/,
// not tied to categories or any API data. Static view only, nothing clickable.
const IMAGES = [
  "/weekly-edit/image1.png",
  "/weekly-edit/image2.png",
  "/weekly-edit/image3.png",
  "/weekly-edit/image4.png",
  "/weekly-edit/image5.png",
];

function Tile({ src, big }: { src: string; big?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#F6F5F3] ${big ? "col-span-2 row-span-1 sm:row-span-2" : ""}`}>
      <Image
        src={src}
        alt=""
        fill
        sizes={big ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
        className="object-cover"
      />
    </div>
  );
}

export function WeeklyEdit() {
  const [big, ...rest] = IMAGES;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-5 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Badge variant="action">Fresh Picks</Badge>
          <h2 className="mt-3 text-3xl font-extrabold text-[#16161A] sm:text-4xl">This Week&apos;s Edit</h2>
        </div>
      </div>

      <BlurFadeIn delay={0}>
        {/* Mobile: 2 cols / 3 rows — big tile is a full-width strip on
            top (row-span-1, not 2, so the other 4 tiles keep their own
            full 2x2 below it instead of getting squeezed off-screen).
            Desktop: 4 cols / 2 rows, big tile spans a real 2x2, and the
            whole grid is short enough to read as one section, not a
            second scroll. */}
        <div className="mt-8 grid aspect-[4/5] grid-cols-2 grid-rows-3 gap-2.5 sm:aspect-[3/1] sm:grid-cols-4 sm:grid-rows-2">
          {big && <Tile src={big} big />}
          {rest.map((src) => (
            <Tile key={src} src={src} />
          ))}
        </div>
      </BlurFadeIn>
    </section>
  );
}
