// Fires a real "just added" event with the actual item that was added —
// the global toast (components/shared/added-notification.tsx) listens for
// this and shows real product info, never a generic/fake confirmation.

export interface AddedDetail {
  type: "cart" | "wishlist";
  name: string;
  imageUrl: string;
  price: number;
  currency: string;
}

const NOTIFY_EVENT = "odtsi-item-added";

export function notifyAdded(detail: AddedDetail) {
  window.dispatchEvent(new CustomEvent(NOTIFY_EVENT, { detail }));
}

export { NOTIFY_EVENT };

// Fired when a shopper picks a color/size so the gallery's main image can
// follow the selection — the picker and the gallery are siblings on the
// product page, not parent/child, so an event is the simplest way to
// connect them without lifting a big chunk of state up into a Server
// Component page that can't hold it.
export interface VariantImageDetail {
  imageUrl: string;
}

const VARIANT_IMAGE_EVENT = "odtsi-variant-image";

export function notifyVariantImage(detail: VariantImageDetail) {
  window.dispatchEvent(new CustomEvent(VARIANT_IMAGE_EVENT, { detail }));
}

export { VARIANT_IMAGE_EVENT };

// The other direction: the shopper tapped a gallery photo. When that photo
// belongs to a color, the picker selects that color so the two never
// disagree about what is being bought.
const GALLERY_IMAGE_EVENT = "odtsi-gallery-image";

export function notifyGalleryImage(detail: VariantImageDetail) {
  window.dispatchEvent(new CustomEvent(GALLERY_IMAGE_EVENT, { detail }));
}

export { GALLERY_IMAGE_EVENT };
