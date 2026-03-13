/**
 * fetch-restaurants.ts
 *
 * Discovers restaurants near a location using Google Places API.
 *
 * Usage:
 *   npx tsx scripts/fetch-restaurants.ts --lat 37.4419 --lng -122.1430 --radius 3000
 *   npx tsx scripts/fetch-restaurants.ts --lat 37.4419 --lng -122.1430 --radius 3000 --key YOUR_KEY
 */

import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';

// ─── CLI Args ────────────────────────────────────────────────

function parseArgs(): { lat: number; lng: number; radius: number; apiKey: string } {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const lat = parseFloat(get('--lat') ?? '');
  const lng = parseFloat(get('--lng') ?? '');
  const radius = parseInt(get('--radius') ?? '3000', 10);
  const apiKey = get('--key') ?? process.env.GOOGLE_PLACES_API_KEY ?? '';

  if (isNaN(lat) || isNaN(lng)) {
    console.error('Usage: npx tsx scripts/fetch-restaurants.ts --lat <lat> --lng <lng> [--radius <m>] [--key <API_KEY>]');
    process.exit(1);
  }
  if (!apiKey) {
    console.error('Error: No API key. Set GOOGLE_PLACES_API_KEY env var or pass --key <key>');
    process.exit(1);
  }

  return { lat, lng, radius, apiKey };
}

// ─── Types ───────────────────────────────────────────────────

interface PlaceResult {
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  place_id: string;
  types?: string[];
}

interface PlacesResponse {
  results: PlaceResult[];
  next_page_token?: string;
  status: string;
  error_message?: string;
}

interface RestaurantRecord {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  user_ratings_total: number;
  price_level: number;
  types: string[];
}

// ─── Fetch helpers ───────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(
  lat: number,
  lng: number,
  radius: number,
  apiKey: string,
  pageToken?: string,
): Promise<PlacesResponse> {
  const base = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(radius),
    type: 'restaurant',
    key: apiKey,
  });
  if (pageToken) {
    params.set('pagetoken', pageToken);
  }

  const url = `${base}?${params}`;
  console.log(`  Fetching: ${url.replace(apiKey, '***')}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return (await res.json()) as PlacesResponse;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const { lat, lng, radius, apiKey } = parseArgs();

  console.log(`\nSearching for restaurants near (${lat}, ${lng}) within ${radius}m...\n`);

  const allResults: PlaceResult[] = [];
  let pageToken: string | undefined;
  let page = 1;

  while (true) {
    console.log(`Page ${page}...`);
    const data = await fetchPage(lat, lng, radius, apiKey, pageToken);

    if (data.status === 'INVALID_REQUEST' && pageToken) {
      // Google sometimes needs more time for pagination tokens
      console.log('  Token not ready, waiting 3s...');
      await sleep(3000);
      const retry = await fetchPage(lat, lng, radius, apiKey, pageToken);
      if (retry.status !== 'OK') {
        console.error(`  API error: ${retry.status} — ${retry.error_message ?? ''}`);
        break;
      }
      allResults.push(...retry.results);
      pageToken = retry.next_page_token;
    } else if (data.status === 'OK') {
      allResults.push(...data.results);
      pageToken = data.next_page_token;
    } else if (data.status === 'ZERO_RESULTS') {
      console.log('  No results found.');
      break;
    } else {
      console.error(`  API error: ${data.status} — ${data.error_message ?? ''}`);
      break;
    }

    console.log(`  Got ${data.results?.length ?? 0} results (total: ${allResults.length})`);

    if (!pageToken) break;

    // Google requires ~2s between pagination requests
    console.log('  Waiting 2s for next page...');
    await sleep(2000);
    page++;
  }

  // Deduplicate by place_id
  const seen = new Set<string>();
  const restaurants: RestaurantRecord[] = [];

  for (const place of allResults) {
    if (seen.has(place.place_id)) continue;
    seen.add(place.place_id);

    restaurants.push({
      place_id: place.place_id,
      name: place.name,
      address: place.vicinity ?? '',
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating ?? 0,
      user_ratings_total: place.user_ratings_total ?? 0,
      price_level: place.price_level ?? 2,
      types: place.types ?? [],
    });
  }

  // Write output
  const outDir = resolve(import.meta.dirname ?? __dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'restaurants.json');
  writeFileSync(outPath, JSON.stringify(restaurants, null, 2));

  console.log(`\nFound ${restaurants.length} restaurants`);
  console.log(`Written to: ${outPath}\n`);

  // Summary table
  const byPrice: Record<number, number> = {};
  for (const r of restaurants) {
    byPrice[r.price_level] = (byPrice[r.price_level] ?? 0) + 1;
  }
  console.log('Price level distribution:');
  for (const [level, count] of Object.entries(byPrice).sort()) {
    console.log(`  ${'$'.repeat(Number(level))}: ${count} restaurants`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
