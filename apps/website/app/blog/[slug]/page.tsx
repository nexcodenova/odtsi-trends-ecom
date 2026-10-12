import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, type BlogPost } from "@odtsi/exiuscart-client";
import { sanitizeHtml } from "@/lib/parse-product-description";

const loadPost = cache(async (slug: string): Promise<BlogPost | null> => {
  try {
    return await getBlogPost(slug);
  } catch (err) {
    console.error("[blog-post]", err);
    return null;
  }
});

// The dashboard editor may save HTML or plain text — plain text is split
// into paragraphs on blank lines so it doesn't render as one block.
function toHtml(content: string): string {
  if (/<[a-z][\s\S]*>/i.test(content)) return sanitizeHtml(content);
  return content
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | ODTSI Blog`,
    description: post.excerpt ?? undefined,
    openGraph: { title: post.title, description: post.excerpt ?? undefined, images: post.coverImageUrl ? [post.coverImageUrl] : undefined },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Link href="/blog" className="text-xs font-bold text-[#8B8880] hover:text-primary">
        ← Blog
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#16161A] sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-[#8B8880]">
        {[post.authorName, post.publishedAt && new Date(post.publishedAt).toLocaleDateString()].filter(Boolean).join(" · ")}
      </p>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt="" className="mt-6 w-full rounded-2xl object-cover" />
      )}

      {post.content && (
        <div
          className="mt-8 text-[15px] leading-relaxed text-[#4A4844] [&_a]:text-primary [&_a]:underline [&_b]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-[#16161A] [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#16161A] [&_img]:my-6 [&_img]:rounded-xl [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_strong]:font-bold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: toHtml(post.content) }}
        />
      )}

      {post.ctaUrl && (
        <a
          href={post.ctaUrl}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-8 text-sm font-extrabold text-white transition hover:bg-primary-hover"
        >
          {post.ctaText || "Shop Now"}
        </a>
      )}

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-black/5 pt-6">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-[#F6F5F3] px-3 py-1 text-xs font-bold text-[#4A4844] hover:bg-primary-light hover:text-primary"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
