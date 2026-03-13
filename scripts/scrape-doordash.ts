/**
 * scrape-doordash.ts
 *
 * Attempts to scrape menu data from DoorDash public store pages.
 *
 * NOTE: DoorDash uses client-side rendering and actively blocks scraping.
 * This script does its best with the static HTML, looking for JSON-LD and
 * __NEXT_DATA__ payloads. For reliable menu data, use generate-realistic-menus.ts.
 *
 * Usage:
 *   npx tsx scripts/scrape-doordash.ts --name "Evvia Estiatorio" --city "Palo Alto"
 *   npx tsx scripts/scrape-doordash.ts --url "https://www.doordash.com/store/evvia-estiatorio-palo-alto-12345/"
 */

import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// ─── CLI Args ────────────────────────────────────────────────

function parseArgs(): { name?: string; city?: string; url?: string } {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const name = get('--name');
  const city = get('--city');
  const url = get('--url');

  if (!url && (!name || !city)) {
    console.error('Usage:');
    console.error('  npx tsx scripts/scrape-doordash.ts --name "Restaurant Name" --city "City"');
    console.error('  npx tsx scripts/scrape-doordash.ts --url "https://www.doordash.com/store/..."');
    process.exit(1);
  }

  return { name, city, url };
}

// ─── Types ───────────────────────────────────────────────────

interface MenuItemRaw {
  name: string;
  description: string;
  price: number;
  category: string;
}

interface ScrapedMenu {
  restaurant_name: string;
  source_url: string;
  scraped_at: string;
  items: MenuItemRaw[];
  warning?: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, retries = 2): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.text();
    } catch (err) {
      if (i < retries) {
        console.log(`  Retry ${i + 1}/${retries} after error: ${(err as Error).message}`);
        await sleep(2000);
      } else {
        throw err;
      }
    }
  }
  throw new Error('Unreachable');
}

// ─── Extract menu from __NEXT_DATA__ ────────────────────────

function extractFromNextData(html: string): MenuItemRaw[] {
  const items: MenuItemRaw[] = [];

  // Look for __NEXT_DATA__ script tag
  const nextDataMatch = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!nextDataMatch) return items;

  try {
    const data = JSON.parse(nextDataMatch[1]);

    // DoorDash stores menu data deeply nested — try common paths
    const storePageData =
      data?.props?.pageProps?.initialState?.storeMenu?.menuBook ??
      data?.props?.pageProps?.storeMenu?.menuBook ??
      data?.props?.initialState?.storeMenu?.menuBook;

    if (!storePageData) return items;

    // Walk through menu categories
    const categories = storePageData.categories ?? storePageData.menuCategories ?? [];
    for (const cat of categories) {
      const categoryName = cat.name ?? cat.title ?? 'Uncategorized';
      const menuItems = cat.items ?? cat.menuItems ?? [];
      for (const item of menuItems) {
        const price = item.price ?? item.displayPrice ?? item.unitPrice ?? 0;
        items.push({
          name: item.name ?? item.title ?? '',
          description: item.description ?? '',
          price: typeof price === 'number' ? price / 100 : parseFloat(price) || 0,
          category: categoryName,
        });
      }
    }
  } catch {
    // JSON parse failed — not unexpected
  }

  return items;
}

// ─── Extract menu from JSON-LD ───────────────────────────────

function extractFromJsonLd(html: string): MenuItemRaw[] {
  const items: MenuItemRaw[] = [];

  const ldMatches = html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  for (const match of ldMatches) {
    try {
      const ld = JSON.parse(match[1]);

      // Check for Menu or Restaurant schema
      if (ld['@type'] === 'Restaurant' && ld.hasMenu) {
        const menu = ld.hasMenu;
        const sections = menu.hasMenuSection ?? [];
        for (const section of sections) {
          const sectionName = section.name ?? 'Menu';
          const menuItems = section.hasMenuItem ?? [];
          for (const item of menuItems) {
            items.push({
              name: item.name ?? '',
              description: item.description ?? '',
              price: parseFloat(item.offers?.price ?? item.price ?? '0'),
              category: sectionName,
            });
          }
        }
      }
    } catch {
      // Ignore malformed JSON-LD
    }
  }

  return items;
}

// ─── Extract prices from raw HTML patterns ───────────────────

function extractFromHtmlPatterns(html: string): MenuItemRaw[] {
  const items: MenuItemRaw[] = [];

  // Look for common price patterns like "$12.99" near item names
  // This is a heuristic fallback
  const pricePattern = /data-anchor-id="MenuItem"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?\$(\d+\.?\d{0,2})/g;
  let match;
  while ((match = pricePattern.exec(html)) !== null) {
    items.push({
      name: match[1].trim(),
      description: '',
      price: parseFloat(match[2]),
      category: 'Menu',
    });
  }

  return items;
}

// ─── Build DoorDash search URL ───────────────────────────────

function buildSearchUrl(name: string, city: string): string {
  const slug = slugify(name);
  const citySlug = slugify(city);
  // DoorDash search URL pattern
  return `https://www.doordash.com/search/store/${encodeURIComponent(name)}/?pickup=false`;
}

function buildStoreUrl(name: string, city: string): string {
  const slug = slugify(name);
  const citySlug = slugify(city);
  return `https://www.doordash.com/store/${slug}-${citySlug}/`;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const { name, city, url } = parseArgs();

  const restaurantName = name ?? 'Unknown Restaurant';
  const storeUrl = url ?? buildStoreUrl(name!, city!);

  console.log(`\nScraping DoorDash menu for: ${restaurantName}`);
  console.log(`URL: ${storeUrl}\n`);

  let html: string;
  try {
    html = await fetchWithRetry(storeUrl);
    console.log(`  Fetched ${html.length} bytes of HTML`);
  } catch (err) {
    console.error(`Failed to fetch page: ${(err as Error).message}`);
    console.log('\nDoorDash blocks most scraping attempts. Suggestions:');
    console.log('  1. Use generate-realistic-menus.ts instead (recommended for hackathon)');
    console.log('  2. Try a different URL format');
    console.log('  3. Use a headless browser (Puppeteer/Playwright) for JS rendering');
    process.exit(1);
  }

  // Try multiple extraction strategies
  console.log('  Trying __NEXT_DATA__ extraction...');
  let items = extractFromNextData(html);

  if (items.length === 0) {
    console.log('  Trying JSON-LD extraction...');
    items = extractFromJsonLd(html);
  }

  if (items.length === 0) {
    console.log('  Trying HTML pattern extraction...');
    items = extractFromHtmlPatterns(html);
  }

  // Build output
  const result: ScrapedMenu = {
    restaurant_name: restaurantName,
    source_url: storeUrl,
    scraped_at: new Date().toISOString(),
    items,
  };

  if (items.length === 0) {
    result.warning =
      'No menu items extracted. DoorDash likely requires JavaScript rendering. ' +
      'Use generate-realistic-menus.ts for reliable menu data.';
    console.log('\n  WARNING: No menu items found in static HTML.');
    console.log('  DoorDash requires JavaScript rendering for menu data.');
    console.log('  Use generate-realistic-menus.ts instead.\n');
  } else {
    console.log(`\n  Extracted ${items.length} menu items!\n`);
  }

  // Write output
  const slug = slugify(restaurantName);
  const outDir = resolve(import.meta.dirname ?? __dirname, 'output', 'menus');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, `${slug}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`Written to: ${outPath}`);

  // Preview
  if (items.length > 0) {
    console.log('\nSample items:');
    for (const item of items.slice(0, 5)) {
      console.log(`  ${item.name} — $${item.price.toFixed(2)} (${item.category})`);
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
