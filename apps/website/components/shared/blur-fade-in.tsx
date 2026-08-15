"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface BlurFadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

// Same effect as MagicUI's BlurFade — blurred + shifted down, then sharpens
// and settles into place the first time it scrolls into view — but built on
// IntersectionObserver + a CSS transition instead of framer-motion. That's
// one less animation runtime to bundle for an effect this simple.
export function BlurFadeIn({ children, delay = 0, className = "" }: BlurFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-50px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100 blur-0" : "translate-y-2 opacity-0 blur-md"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
