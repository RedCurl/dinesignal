/**
 * import-to-app.ts
 *
 * Converts scraped/generated data into drop-in replacement files for
 * src/data/restaurants.ts and src/data/menuItems.ts.
 *
 * Usage:
 *   npx tsx scripts/import-to-app.ts
 *
 * Reads:
 *   scripts/output/restaurants.json
 *   scripts/output/menu_items.json
 *
 * Outputs (overwrites):
 *   src/data/restaurants.ts
 *   src/data/menuItems.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ─── Types ───────────────────────────────────────────────────

interface RestaurantInput {
  place_id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  user_ratings_total?: number;
  review_count?: number;
  price_level?: number;
  price_tier?: number;
  types?: string[];
  cuisine_type?: string;
  metro_area?: string;
  estimated_monthly_revenue_low?: number;
  estimated_monthly_revenue_high?: number;
}

interface MenuItemInput {
  restaurant_id: string;
  restaurant_name: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  source: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function detectCuisineType(restaurant: RestaurantInput): string {
  if (restaurant.cuisine_type) return restaurant.cuisine_type;
  const name = restaurant.name.toLowerCase();
  const types = (restaurant.types ?? []).join(' ').toLowerCase();
  const checks: Array<[string, string[]]> = [
    ['Italian', ['italian', 'trattoria', 'pizzeria']],
    ['Mexican', ['mexican', 'taqueria', 'taco']],
    ['Japanese', ['japanese', 'sushi', 'ramen']],
    ['Chinese', ['chinese', 'dim sum']],
    ['Thai', ['thai', 'siam']],
    ['Indian', ['indian', 'curry']],
    ['Vietnamese', ['vietnamese', 'pho']],
    ['Korean', ['korean']],
    ['Mediterranean', ['mediterranean', 'greek', 'hummus']],
    ['Pizza', ['pizza']],
    ['Burger', ['burger']],
  ];
  for (const [cuisine, keywords] of checks) {
    if (keywords.some((k) => name.includes(k) || types.includes(k))) return cuisine;
  }
  return 'American';
}

function detectMetroArea(restaurant: RestaurantInput): string {
  if (restaurant.metro_area) return restaurant.metro_area;
  const addr = restaurant.address.toLowerCase();
  if (addr.includes('palo alto')) return 'Palo Alto';
  return 'Bay Area';
}

function estimateRevenue(priceLevel: number, rating: number, reviewCount: number): [number, number] {
  const baseLow: Record<number, number> = { 1: 40000, 2: 60000, 3: 110000, 4: 160000 };
  const baseHigh: Record<number, number> = { 1: 70000, 2: 100000, 3: 180000, 4: 280000 };
  const ratingFactor = rating / 4.0;
  const popularityFactor = Math.min(reviewCount / 500, 2.0);
  const factor = (ratingFactor + popularityFactor) / 2;
  const low = Math.round((baseLow[priceLevel] ?? 60000) * factor / 5000) * 5000;
  const high = Math.round((baseHigh[priceLevel] ?? 100000) * factor / 5000) * 5000;
  return [low, high];
}

function esc(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// ─── Main ────────────────────────────────────────────────────

function main() {
  const scriptDir = import.meta.dirname ?? __dirname;
  const outDir = resolve(scriptDir, 'output');
  const srcDataDir = resolve(scriptDir, '..', 'src', 'data');

  // Load data
  const restaurantsPath = resolve(outDir, 'restaurants.json');
  const menuItemsPath = resolve(outDir, 'menu_items.json');

  if (!existsSync(restaurantsPath)) {
    console.error(`Missing: ${restaurantsPath}`);
    console.error('Run fetch-restaurants.ts or generate-realistic-menus.ts --from-app first');
    process.exit(1);
  }
  if (!existsSync(menuItemsPath)) {
    console.error(`Missing: ${menuItemsPath}`);
    console.error('Run generate-realistic-menus.ts first');
    process.exit(1);
  }

  const rawRestaurants: RestaurantInput[] = JSON.parse(readFileSync(restaurantsPath, 'utf-8'));
  const rawMenuItems: MenuItemInput[] = JSON.parse(readFileSync(menuItemsPath, 'utf-8'));

  console.log(`\nLoaded ${rawRestaurants.length} restaurants, ${rawMenuItems.length} menu items\n`);

  // ── Build normalized restaurant records ──

  const restaurants = rawRestaurants.map((r, i) => {
    const id = r.place_id ?? `rest-${i + 1}`;
    const priceTier = r.price_tier ?? r.price_level ?? 2;
    const reviewCount = r.review_count ?? r.user_ratings_total ?? 0;
    const [revLow, revHigh] = r.estimated_monthly_revenue_low
      ? [r.estimated_monthly_revenue_low, r.estimated_monthly_revenue_high ?? Math.round(r.estimated_monthly_revenue_low * 1.5)]
      : estimateRevenue(priceTier, r.rating, reviewCount);

    return {
      id,
      name: r.name,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      cuisine_type: detectCuisineType(r),
      price_tier: Math.min(4, Math.max(1, priceTier)),
      rating: Math.round(r.rating * 10) / 10,
      review_count: reviewCount,
      estimated_monthly_revenue_low: revLow,
      estimated_monthly_revenue_high: revHigh,
      metro_area: detectMetroArea(r),
    };
  });

  // ── Generate src/data/restaurants.ts ──

  const restLines: string[] = [
    "import type { Restaurant } from '@/lib/types';",
    '',
    'export const restaurants: Restaurant[] = [',
  ];

  // Group by metro area
  const byMetro = new Map<string, typeof restaurants>();
  for (const r of restaurants) {
    const list = byMetro.get(r.metro_area) ?? [];
    list.push(r);
    byMetro.set(r.metro_area, list);
  }

  for (const [metro, group] of byMetro) {
    restLines.push(`  // --- ${metro} ---`);
    for (const r of group) {
      restLines.push('  {');
      restLines.push(`    id: '${r.id}',`);
      restLines.push(`    name: '${esc(r.name)}',`);
      restLines.push(`    address: '${esc(r.address)}',`);
      restLines.push(`    latitude: ${r.latitude},`);
      restLines.push(`    longitude: ${r.longitude},`);
      restLines.push(`    cuisine_type: '${r.cuisine_type}',`);
      restLines.push(`    price_tier: ${r.price_tier},`);
      restLines.push(`    rating: ${r.rating},`);
      restLines.push(`    review_count: ${r.review_count},`);
      restLines.push(`    estimated_monthly_revenue_low: ${r.estimated_monthly_revenue_low},`);
      restLines.push(`    estimated_monthly_revenue_high: ${r.estimated_monthly_revenue_high},`);
      restLines.push(`    metro_area: '${r.metro_area}',`);
      restLines.push('  },');
    }
  }

  restLines.push('];');
  restLines.push('');

  const restPath = resolve(srcDataDir, 'restaurants.ts');
  writeFileSync(restPath, restLines.join('\n'));
  console.log(`Written: ${restPath}`);

  // ── Generate src/data/menuItems.ts ──

  const miLines: string[] = [
    "import type { MenuItem } from '@/lib/types';",
    '',
    'let _id = 0;',
    'const mi = (',
    '  restaurant_id: string,',
    '  name: string,',
    '  description: string,',
    '  price: number,',
    "  category: MenuItem['category'],",
    '  subcategory: string,',
    "  source: 'doordash' | 'ubereats' | 'website' = 'website',",
    '): MenuItem => ({',
    '  id: `mi-${++_id}`,',
    '  restaurant_id,',
    '  name,',
    '  description,',
    '  price,',
    '  category,',
    '  subcategory,',
    '  source,',
    '});',
    '',
    'export const menuItems: MenuItem[] = [',
  ];

  // Group by restaurant
  const byRestaurant = new Map<string, MenuItemInput[]>();
  for (const mi of rawMenuItems) {
    const list = byRestaurant.get(mi.restaurant_id) ?? [];
    list.push(mi);
    byRestaurant.set(mi.restaurant_id, list);
  }

  for (const [restId, items] of byRestaurant) {
    const rest = restaurants.find((r) => r.id === restId);
    const label = rest
      ? `${rest.name} (${rest.cuisine_type}, ${'$'.repeat(rest.price_tier)})`
      : restId;
    miLines.push(`  // ─── ${restId}: ${label} ───`);
    for (const item of items) {
      miLines.push(
        `  mi('${restId}', '${esc(item.name)}', '${esc(item.description)}', ${item.price}, '${item.category}', '${esc(item.subcategory)}', '${item.source}'),`,
      );
    }
  }

  miLines.push('];');
  miLines.push('');

  const miPath = resolve(srcDataDir, 'menuItems.ts');
  writeFileSync(miPath, miLines.join('\n'));
  console.log(`Written: ${miPath}`);

  console.log(`\nDone! Updated src/data/ with ${restaurants.length} restaurants and ${rawMenuItems.length} menu items.`);
  console.log('\nIMPORTANT: The priceSnapshots.ts file was NOT modified.');
  console.log('If menu item IDs changed, you may need to update priceSnapshots.ts manually.');
}

main();
