export interface ParsedDescription {
  textHtml: string;
  images: { src: string; alt: string }[];
}

// Real supplier HTML (images, formatting, occasional links) — sanitized
// right here with plain regexes instead of DOMPurify/jsdom: jsdom reads its
// own internal asset files at runtime, which webpack bundling breaks and
// serverless file-tracing (Vercel) doesn't reliably capture either — it
// worked locally but 500'd in production. Supplier content isn't arbitrary
// hostile user input, so stripping the genuinely dangerous bits (script/
// style/iframe/object/embed tags, inline event handlers, javascript: URLs)
// covers what actually matters without a fragile native dependency.
function sanitize(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2');
}

// Images are pulled out of the flowing text so the page can lay them out on
// its own instead of depending on however the supplier's markup wrapped them.
export function parseProductDescription(html: string): ParsedDescription {
  const clean = sanitize(html);

  const images: { src: string; alt: string }[] = [];
  const textHtml = clean.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    if (srcMatch?.[1]) images.push({ src: srcMatch[1], alt: altMatch?.[1] ?? "" });
    return "";
  });

  return { textHtml, images };
}
