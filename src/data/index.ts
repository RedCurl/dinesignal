import type { Restaurant, MenuItem, PriceSnapshot, PricingComparison, CompetitorCard, MarketStats, MenuCategory } from '@/lib/types';

export { restaurants } from './restaurants';
export { menuItems } from './menuItems';
export { priceSnapshots } from './priceSnapshots';

// Re-import for use in helpers
import { restaurants } from './restaurants';
import { menuItems } from './menuItems';
import { priceSnapshots as _priceSnapshots } from './priceSnapshots';

// Suppress unused import lint — these re-exports + type imports are intentional
void (_priceSnapshots as PriceSnapshot[]);

// ──────────────────────────────────────────────
// Weekly volume estimates by category
// ──────────────────────────────────────────────
const WEEKLY_VOLUME: Record<MenuCategory, number> = {
  appetizer: 60,
  entree: 80,
  side: 50,
  drink: 100,
  dessert: 40,
};

// ──────────────────────────────────────────────
// Haversine distance in miles
// ──────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ──────────────────────────────────────────────
// Cuisine similarity — groups cuisines that compete directly
// ──────────────────────────────────────────────
const CUISINE_GROUPS: Record<string, string> = {
  'Italian': 'european',
  'Mediterranean': 'european',
  'American': 'american',
  'Burger': 'american',
  'Mexican': 'latin',
  'Latin American': 'latin',
  'Japanese': 'asian',
  'Chinese': 'asian',
  'Korean': 'asian',
  'Thai': 'asian',
  'Vietnamese': 'asian',
  'Burmese': 'asian',
  'Indian': 'indian',
  'Pizza': 'pizza',
};

function cuisineGroup(cuisine: string): string {
  return CUISINE_GROUPS[cuisine] ?? cuisine.toLowerCase();
}

// ──────────────────────────────────────────────
// Core lookup helpers
// ──────────────────────────────────────────────
export function getRestaurantById(id: string): Restaurant {
  const r = restaurants.find((r) => r.id === id);
  if (!r) throw new Error(`Restaurant not found: ${id}`);
  return r;
}

export function getMenuItemsByRestaurant(restaurantId: string): MenuItem[] {
  return menuItems.filter((mi) => mi.restaurant_id === restaurantId);
}

// ──────────────────────────────────────────────
// getCompetitors — nearby restaurants of similar cuisine
// ──────────────────────────────────────────────
export function getCompetitors(restaurantId: string, radius = 5): CompetitorCard[] {
  const target = getRestaurantById(restaurantId);
  const group = cuisineGroup(target.cuisine_type);

  return restaurants
    .filter((r) => r.id !== restaurantId && cuisineGroup(r.cuisine_type) === group)
    .map((r) => {
      const dist = haversine(target.latitude, target.longitude, r.latitude, r.longitude);
      const items = getMenuItemsByRestaurant(r.id);
      const entrees = items.filter((i) => i.category === 'entree');
      const avgEntree = entrees.length > 0
        ? entrees.reduce((sum, i) => sum + i.price, 0) / entrees.length
        : 0;
      return {
        id: r.id,
        name: r.name,
        cuisine_type: r.cuisine_type,
        distance: Math.round(dist * 10) / 10,
        avg_entree_price: Math.round(avgEntree * 100) / 100,
        rating: r.rating,
        review_count: r.review_count,
        price_tier: r.price_tier,
      } satisfies CompetitorCard;
    })
    .filter((c) => c.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

// ──────────────────────────────────────────────
// getPricingComparison — per-item competitive analysis
// ──────────────────────────────────────────────
export function getPricingComparison(restaurantId: string): PricingComparison[] {
  const target = getRestaurantById(restaurantId);
  const myItems = getMenuItemsByRestaurant(restaurantId);
  const group = cuisineGroup(target.cuisine_type);

  // Collect all items from competitors in same cuisine group within 5 miles
  const competitorIds = new Set(
    restaurants
      .filter(
        (r) =>
          r.id !== restaurantId &&
          cuisineGroup(r.cuisine_type) === group &&
          haversine(target.latitude, target.longitude, r.latitude, r.longitude) <= 5,
      )
      .map((r) => r.id),
  );

  const competitorItems = menuItems.filter((mi) => competitorIds.has(mi.restaurant_id));

  return myItems.map((item) => {
    // Find similar items: same category and overlapping subcategory keywords
    const similar = competitorItems.filter(
      (ci) => ci.category === item.category && ci.subcategory === item.subcategory,
    );

    // If no exact subcategory match, broaden to same category
    const comparables = similar.length >= 2 ? similar : competitorItems.filter((ci) => ci.category === item.category);

    const prices = comparables.map((c) => c.price);
    const marketAvg = prices.length > 0
      ? prices.reduce((s, p) => s + p, 0) / prices.length
      : item.price;

    const delta = Math.round((item.price - marketAvg) * 100) / 100;

    // Percentile: what % of comparable prices is this item above
    const below = prices.filter((p) => p < item.price).length;
    const percentile = prices.length > 0
      ? Math.round((below / prices.length) * 100)
      : 50;

    const weeklyVol = WEEKLY_VOLUME[item.category];
    const annualImpact = Math.round(delta * weeklyVol * 52);

    return {
      item_name: item.name,
      category: item.category,
      your_price: item.price,
      market_avg: Math.round(marketAvg * 100) / 100,
      delta,
      percentile,
      weekly_volume: weeklyVol,
      annual_impact: annualImpact,
    } satisfies PricingComparison;
  });
}

// ──────────────────────────────────────────────
// getMarketStats — aggregate market overview
// ──────────────────────────────────────────────
export function getMarketStats(): MarketStats {
  const entrees = menuItems.filter((mi) => mi.category === 'entree');
  const avgEntreePrice = entrees.length > 0
    ? Math.round((entrees.reduce((s, mi) => s + mi.price, 0) / entrees.length) * 100) / 100
    : 0;

  return {
    total_restaurants: restaurants.length,
    total_menu_items: menuItems.length,
    avg_entree_price: avgEntreePrice,
    last_updated: '2025-03-13',
  };
}

// ──────────────────────────────────────────────
// getRestaurantOpportunity — total revenue opportunity
// across all underpriced items
// ──────────────────────────────────────────────
export function getRestaurantOpportunity(restaurantId: string): { monthly: number; yearly: number } {
  const comparisons = getPricingComparison(restaurantId);

  // Sum up negative deltas (items priced below market) as opportunity
  const weeklyOpp = comparisons
    .filter((c) => c.delta < 0)
    .reduce((sum, c) => sum + Math.abs(c.delta) * c.weekly_volume, 0);

  const yearly = Math.round(weeklyOpp * 52);
  const monthly = Math.round(yearly / 12);

  return { monthly, yearly };
}

// ──────────────────────────────────────────────
// searchRestaurants — simple text search
// ──────────────────────────────────────────────
export function searchRestaurants(query: string): Restaurant[] {
  const q = query.toLowerCase().trim();
  if (!q) return restaurants;
  return restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q) ||
      r.cuisine_type.toLowerCase().includes(q),
  );
}
