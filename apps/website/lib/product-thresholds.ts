// Shared real-data thresholds — one place so "what counts as popular" stays
// consistent everywhere it's used (Most Viewed section, Best Seller badge),
// instead of each spot picking its own number.

// Real view counts have genuine variance today; ratings/reviews don't
// (avg_rating is null, review_count is 0 on every real product so far).
// This is the bar a product's real view count has to clear before it's
// treated as "popular" anywhere on the site.
export const MIN_VIEWS_FOR_POPULAR = 50;
