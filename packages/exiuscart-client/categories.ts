import { storeUrl } from "./config";
import type { Category } from "./types";

// ExiusCart's actual response shape — snake_case, different field name for
// the image than what ODTSI's UI expects. Same translation-layer pattern as
// mapProduct() in products.ts: this is the one place that converts between
// the two, so nothing else in the app needs to know ExiusCart's raw shape.
interface RawCategory {
  id: number;
  name: string;
  slug: string;
  icon_url: string | null;
  parent_id: number | null;
}

function mapCategory(raw: RawCategory): Category {
  return {
    id: String(raw.id),
    slug: raw.slug,
    name: raw.name,
    imageUrl: raw.icon_url,
    parentId: raw.parent_id !== null ? String(raw.parent_id) : null,
  };
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(storeUrl("/categories"), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to load categories: ${res.status}`);
  const raw: RawCategory[] = await res.json();
  return raw.map(mapCategory);
}
