"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

interface ImageLensProps {
  src: string;
  zoomFactor?: number;
  lensSize?: number;
  children: ReactNode;
}

// Hover-to-zoom, adapted from MagicUI's Lens but with a plain CSS radial-
// gradient mask instead of framer-motion — the fade it wraps is a single
// opacity toggle, not worth a whole animation runtime dependency. Desktop
// (hover) only: there's no persistent hover on touch, so mobile just shows
// the real <Image> passed in as children, untouched.
export function ImageLens({ src, zoomFactor = 2, lensSize = 160, children }: ImageLensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={handleMove}
    >
      {children}

      {hovering && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden sm:block"
          style={{
            maskImage: `radial-gradient(circle ${lensSize / 2}px at ${pos.x}px ${pos.y}px, black 100%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${lensSize / 2}px at ${pos.x}px ${pos.y}px, black 100%, transparent 100%)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative zoom preview, not next/image's job here */}
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
            style={{ transform: `scale(${zoomFactor})`, transformOrigin: `${pos.x}px ${pos.y}px` }}
          />
        </div>
      )}
    </div>
  );
}
