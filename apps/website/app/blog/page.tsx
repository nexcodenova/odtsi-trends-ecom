import Link from "next/link";
import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getBlogPosts, type BlogPost } from "@odtsi/exiuscart-client";

export const metadata: Metadata = {
  title: "Blog | ODTSI",
  description: "Guides, product picks, and updates from ODTSI.",
};

async function loadPosts(tag?: string): Promise<BlogPost[]> {
  try {
    return await getBlogPosts({ tag });
  } catch (err) {
    console.error("[blog]", err);
    return [];
  }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  const posts = await loadPosts(tag);

  if (posts.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-14 text-center sm:py-20">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Newspaper size={28} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#16161A] sm:text-3xl">Blog</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#716D67] sm:text-base">
          {tag
            ? `Nothing tagged "${tag}" yet.`
            : "We haven't published anything yet — check back soon for guides, product picks, and updates from ODTSI."}
        </p>
        {tag && (
          <Link href="/blog" className="mt-5 text-sm font-bold text-primary hover:underline">
            See all posts
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14 lg:px-8">
      <h1 className="text-3xl font-extrabold text-[#16161A] sm:text-4xl">Blog</h1>
      {tag && (
        <p className="mt-2 text-sm text-[#716D67]">
          Tagged <span className="font-bold text-[#16161A]">{tag}</span> ·{" "}
          <Link href="/blog" className="font-bold text-primary hover:underline">
            See all
          </Link>
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:shadow-md"
          >
            {post.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center bg-primary-light text-primary">
                <Newspaper size={32} />
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-extrabold leading-snug text-[#16161A] group-hover:text-primary">{post.title}</h2>
              {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#716D67]">{post.excerpt}</p>}
              <p className="mt-auto pt-4 text-xs text-[#8B8880]">
                {[post.authorName, post.publishedAt && new Date(post.publishedAt).toLocaleDateString()]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
