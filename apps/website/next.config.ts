import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@odtsi/ui", "@odtsi/utils", "@odtsi/exiuscart-client"],
  // jsdom (used server-side by isomorphic-dompurify) reads its own internal
  // asset files at runtime — webpack bundling them breaks that. Keeping
  // this package external makes Node require it natively instead.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.exiuscart.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "**.cjdropshipping.com" },
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },
};

export default nextConfig;
