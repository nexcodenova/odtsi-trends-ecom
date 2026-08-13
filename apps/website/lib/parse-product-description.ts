import DOMPurify from "isomorphic-dompurify";

export interface ParsedDescription {
  textHtml: string;
  images: { src: string; alt: string }[];
}

// Real supplier HTML (images, formatting, occasional links) — sanitized
// right here. DOMPurify's defaults strip <script>/<iframe>/event handlers/
// javascript: URLs while keeping <img>, <p>, lists, etc. intact. Images are
// pulled out of the flowing text so the page can lay them out on its own
// instead of depending on however the supplier's markup wrapped them.
export function parseProductDescription(html: string): ParsedDescription {
  const clean = DOMPurify.sanitize(html);

  const images: { src: string; alt: string }[] = [];
  const textHtml = clean.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    if (srcMatch?.[1]) images.push({ src: srcMatch[1], alt: altMatch?.[1] ?? "" });
    return "";
  });

  return { textHtml, images };
}
