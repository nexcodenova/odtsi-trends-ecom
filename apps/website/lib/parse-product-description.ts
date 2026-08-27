export interface ParsedDescription {
  // The text, split into block-level chunks (one per paragraph/list/heading)
  // instead of one flat string — needed so real description images can be
  // interleaved between blocks instead of dumped in a separate side column.
  blocks: string[];
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

// Splits after every top-level block-level closing tag so each chunk is a
// self-contained, still-valid piece of HTML — good enough for real supplier
// markup, which is almost always just a flat run of <p>/<ul>/<ol>/<h*> tags,
// not deeply nested structure.
function splitIntoBlocks(html: string): string[] {
  return html
    .split(/(?<=<\/(?:p|ul|ol|h[1-6]|blockquote)>)/gi)
    .map((block) => block.trim())
    .filter(Boolean);
}

// Images are pulled out of the flowing text so the page can place them
// between text blocks itself instead of depending on however the supplier's
// markup wrapped them.
export function parseProductDescription(html: string): ParsedDescription {
  const clean = sanitize(html);

  const images: { src: string; alt: string }[] = [];
  const withoutImages = clean.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    if (srcMatch?.[1]) images.push({ src: srcMatch[1], alt: altMatch?.[1] ?? "" });
    return "";
  });

  return { blocks: splitIntoBlocks(withoutImages), images };
}
