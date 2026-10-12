import { storeUrl } from "./config";
import type { BlogPost } from "./types";

// Field names follow ExiusCart's own BlogPostIn schema (what the seller
// writes in the dashboard). No real post exists yet to confirm the read
// shape, so every field is optional here and the date falls back across
// the names ExiusCart uses elsewhere.
interface RawBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image_url?: string | null;
  author_name?: string | null;
  // The dashboard takes tags as a comma-separated string; the read side
  // may send either that or an array.
  tags?: string[] | string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
}

function mapTags(raw: RawBlogPost["tags"]): string[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : raw.split(",");
  return list.map((t) => t.trim()).filter(Boolean);
}

function mapBlogPost(raw: RawBlogPost): BlogPost {
  return {
    id: String(raw.id),
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt ?? null,
    content: raw.content ?? null,
    coverImageUrl: raw.cover_image_url ?? null,
    authorName: raw.author_name ?? null,
    tags: mapTags(raw.tags),
    ctaText: raw.cta_text ?? null,
    ctaUrl: raw.cta_url ?? null,
    publishedAt: raw.published_at ?? raw.created_at ?? null,
  };
}

export async function getBlogPosts(params?: { tag?: string }): Promise<BlogPost[]> {
  const qs = params?.tag ? `?${new URLSearchParams({ tag: params.tag }).toString()}` : "";
  const res = await fetch(storeUrl(`/blog${qs}`), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to load blog posts: ${res.status}`);
  const raw: RawBlogPost[] = await res.json();
  return raw.map(mapBlogPost);
}

// Returns null for a real 404 so the page can notFound() instead of erroring.
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(storeUrl(`/blog/${encodeURIComponent(slug)}`), { next: { revalidate: 300 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load blog post "${slug}": ${res.status}`);
  return mapBlogPost(await res.json());
}
