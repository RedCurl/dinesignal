/**
 * seed-supabase.ts
 *
 * Converts generated restaurant + menu data into SQL INSERT statements
 * and a TypeScript seed-data module.
 *
 * Usage:
 *   npx tsx scripts/seed-supabase.ts
 *
 * Reads:
 *   scripts/output/restaurants.json
 *   scripts/output/menu_items.json
 *
 * Outputs:
 *   scripts/output/seed.sql
 *   scripts/output/seed-data.ts
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
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

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

function detectCuisineType(restaurant: RestaurantInput): string {
  if (restaurant.cuisine_type) return restaurant.cuisine_type;

  const name = restaurant.name.toLowerCase();
  const types = (restaurant.types ?? []).join(' ').toLowerCase();

  const checks: Array<[string, string[]]> = [
    ['Italian', ['italian', 'trattoria', 'pizzeria']],
    ['Mexican', ['mexican', 'taqueria', 'taco']],
    ['Japanese', ['japanese', 'sushi', 'ramen']],
    ['Chinese', ['chinese', 'dim sum', 'szechuan']],
    ['Thai', ['thai', 'siam']],
    ['Indian', ['indian', 'curry', 'tandoori']],
    ['Vietnamese', ['vietnamese', 'pho']],
    ['Korean', ['korean', 'bbq']],
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
  if (addr.includes('mountain view')) return 'Bay Area';
  if (addr.includes('menlo park')) return 'Bay Area';
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

// ─── Main ────────────────────────────────────────────────────

function main() {
  const scriptDir = import.meta.dirname ?? __dirname;
  const outDir = resolve(scriptDir, 'output');

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

  // ── Build restaurant records ──

  interface RestaurantRecord {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    cuisine_type: string;
    price_tier: number;
    rating: number;
    review_count: number;
    estimated_monthly_revenue_low: number;
    estimated_monthly_revenue_high: number;
    metro_area: string;
  }

  const restaurants: RestaurantRecord[] = rawRestaurants.map((r, i) => {
    const id = r.place_id ?? `rest-${i + 1}`;
    const priceTier = r.price_tier ?? r.price_level ?? 2;
    const reviewCount = r.review_count ?? r.user_ratings_total ?? 0;
    const [revLow, revHigh] = r.estimated_monthly_revenue_low
      ? [r.estimated_monthly_revenue_low, r.estimated_monthly_revenue_high ?? r.estimated_monthly_revenue_low * 1.5]
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

  // ── Build menu item records ──

  interface MenuItemRecord {
    id: string;
    restaurant_id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory: string;
    source: string;
  }

  const menuItems: MenuItemRecord[] = rawMenuItems.map((mi, i) => ({
    id: `mi-${i + 1}`,
    restaurant_id: mi.restaurant_id,
    name: mi.name,
    description: mi.description,
    price: mi.price,
    category: mi.category,
    subcategory: mi.subcategory,
    source: mi.source,
  }));

  // ── Generate SQL ──

  const sqlLines: string[] = [
    '-- ============================================================',
    '-- DineSignal Seed Data',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Restaurants: ${restaurants.length} | Menu Items: ${menuItems.length}`,
    '-- ============================================================',
    '',
    '-- Clear existing data (order matters for foreign keys)',
    'DELETE FROM price_snapshots;',
    'DELETE FROM menu_items;',
    'DELETE FROM restaurants;',
    '',
    '-- ── Restaurants ──',
    '',
  ];

  for (const r of restaurants) {
    sqlLines.push(
      `INSERT INTO restaurants (id, name, address, latitude, longitude, cuisine_type, price_tier, rating, review_count, estimated_monthly_revenue_low, estimated_monthly_revenue_high, metro_area) VALUES (` +
      `'${escapeSQL(r.id)}', '${escapeSQL(r.name)}', '${escapeSQL(r.address)}', ${r.latitude}, ${r.longitude}, ` +
      `'${escapeSQL(r.cuisine_type)}', ${r.price_tier}, ${r.rating}, ${r.review_count}, ` +
      `${r.estimated_monthly_revenue_low}, ${r.estimated_monthly_revenue_high}, '${escapeSQL(r.metro_area)}');`,
    );
  }

  sqlLines.push('', '-- ── Menu Items ──', '');

  for (const mi of menuItems) {
    sqlLines.push(
      `INSERT INTO menu_items (id, restaurant_id, name, description, price, category, subcategory, source) VALUES (` +
      `'${escapeSQL(mi.id)}', '${escapeSQL(mi.restaurant_id)}', '${escapeSQL(mi.name)}', '${escapeSQL(mi.description)}', ` +
      `${mi.price}, '${mi.category}', '${escapeSQL(mi.subcategory)}', '${mi.source}');`,
    );
  }

  sqlLines.push('');

  const sqlPath = resolve(outDir, 'seed.sql');
  writeFileSync(sqlPath, sqlLines.join('\n'));
  console.log(`SQL seed file: ${sqlPath}`);

  // ── Generate TypeScript seed-data.ts ──

  const tsLines: string[] = [
    '/**',
    ' * Auto-generated seed data for DineSignal',
    ` * Generated: ${new Date().toISOString()}`,
    ` * Restaurants: ${restaurants.length} | Menu Items: ${menuItems.length}`,
    ' *',
    ' * Copy this file to src/data/ to replace hardcoded seed data.',
    ' */',
    '',
    "import type { Restaurant, MenuItem } from '@/lib/types';",
    '',
    'export const restaurants: Restaurant[] = [',
  ];

  for (const r of restaurants) {
    tsLines.push('  {');
    tsLines.push(`    id: '${r.id}',`);
    tsLines.push(`    name: '${r.name.replace(/'/g, "\\'")}',`);
    tsLines.push(`    address: '${r.address.replace(/'/g, "\\'")}',`);
    tsLines.push(`    latitude: ${r.latitude},`);
    tsLines.push(`    longitude: ${r.longitude},`);
    tsLines.push(`    cuisine_type: '${r.cuisine_type}',`);
    tsLines.push(`    price_tier: ${r.price_tier},`);
    tsLines.push(`    rating: ${r.rating},`);
    tsLines.push(`    review_count: ${r.review_count},`);
    tsLines.push(`    estimated_monthly_revenue_low: ${r.estimated_monthly_revenue_low},`);
    tsLines.push(`    estimated_monthly_revenue_high: ${r.estimated_monthly_revenue_high},`);
    tsLines.push(`    metro_area: '${r.metro_area}',`);
    tsLines.push('  },');
  }

  tsLines.push('];');
  tsLines.push('');
  tsLines.push('let _id = 0;');
  tsLines.push('const mi = (');
  tsLines.push("  restaurant_id: string,");
  tsLines.push("  name: string,");
  tsLines.push("  description: string,");
  tsLines.push("  price: number,");
  tsLines.push("  category: MenuItem['category'],");
  tsLines.push("  subcategory: string,");
  tsLines.push("  source: 'doordash' | 'ubereats' | 'website' = 'website',");
  tsLines.push('): MenuItem => ({');
  tsLines.push('  id: `mi-${++_id}`,');
  tsLines.push('  restaurant_id,');
  tsLines.push('  name,');
  tsLines.push('  description,');
  tsLines.push('  price,');
  tsLines.push('  category,');
  tsLines.push('  subcategory,');
  tsLines.push('  source,');
  tsLines.push('});');
  tsLines.push('');
  tsLines.push('export const menuItems: MenuItem[] = [');

  // Group by restaurant for readability
  const byRestaurant = new Map<string, MenuItemRecord[]>();
  for (const mi of menuItems) {
    const list = byRestaurant.get(mi.restaurant_id) ?? [];
    list.push(mi);
    byRestaurant.set(mi.restaurant_id, list);
  }

  for (const [restId, items] of byRestaurant) {
    const rest = restaurants.find((r) => r.id === restId);
    const label = rest ? `${rest.name} (${rest.cuisine_type}, ${'$'.repeat(rest.price_tier)})` : restId;
    tsLines.push(`  // ─── ${label} ───`);
    for (const mi of items) {
      const name = mi.name.replace(/'/g, "\\'");
      const desc = mi.description.replace(/'/g, "\\'");
      tsLines.push(
        `  mi('${mi.restaurant_id}', '${name}', '${desc}', ${mi.price}, '${mi.category}', '${mi.subcategory}', '${mi.source}'),`,
      );
    }
  }

  tsLines.push('];');
  tsLines.push('');

  const tsPath = resolve(outDir, 'seed-data.ts');
  writeFileSync(tsPath, tsLines.join('\n'));
  console.log(`TypeScript seed file: ${tsPath}`);

  console.log(`\nDone! ${restaurants.length} restaurants, ${menuItems.length} menu items`);
  console.log('\nNext steps:');
  console.log('  1. Import SQL into Supabase: paste seed.sql into Supabase SQL Editor');
  console.log('  2. Or copy seed-data.ts to src/data/ for local use');
  console.log('  3. Or run: npx tsx scripts/import-to-app.ts');
}

main();
