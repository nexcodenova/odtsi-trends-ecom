import DOMPurify from "isomorphic-dompurify";

// Real supplier HTML (images, formatting, occasional links) — sanitized
// right here, right before the one place it's rendered. DOMPurify's
// defaults already strip <script>/<iframe>/event handlers/javascript: URLs
// while keeping <img>, <p>, lists, etc. intact.
export function ProductDescription({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html);

  return (
    <div
      className="max-w-[68ch] text-sm leading-relaxed text-[#4A4844] [&_a]:text-primary [&_a]:underline [&_b]:font-bold [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-xl [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-bold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
