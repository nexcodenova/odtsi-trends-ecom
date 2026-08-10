# ODTSI

Trending lifestyle products, delivered fast across the UK, US, EU, Australia and Canada.

## Architecture

ODTSI's storefront has no database or backend of its own. Every product, category,
and order read/write goes through ExiusCart's public API directly:

```
apps/website  →  api.exiuscart.com/api/v1/public/store/{shop_slug}/...
```

`packages/exiuscart-client` is the only place in this repo that calls that API —
everything else consumes it through that package.

## Structure

```
apps/
  website/            Public storefront (Next.js)
packages/
  ui/                 Shared component library
  exiuscart-client/   Typed client for ExiusCart's public API
  utils/              Formatters and shared helpers
  config/             Shared TypeScript config + Tailwind design tokens
```

## Getting started

```
pnpm install
cp apps/website/.env.example apps/website/.env.local
pnpm dev
```
