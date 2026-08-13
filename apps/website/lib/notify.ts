// Fires a real "just added" event with the actual item that was added —
// the global toast (components/shared/added-notification.tsx) listens for
// this and shows real product info, never a generic/fake confirmation.

export interface AddedDetail {
  type: "cart" | "wishlist";
  name: string;
  imageUrl: string;
  price: number;
}

const NOTIFY_EVENT = "odtsi-item-added";

export function notifyAdded(detail: AddedDetail) {
  window.dispatchEvent(new CustomEvent(NOTIFY_EVENT, { detail }));
}

export { NOTIFY_EVENT };
