export function DescriptionText({ html }: { html: string }) {
  if (!html) return null;

  return (
    <div
      className="text-sm leading-relaxed text-[#4A4844] [&_a]:text-primary [&_a]:underline [&_b]:font-bold [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-bold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
