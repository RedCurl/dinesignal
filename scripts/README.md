# DineSignal Data Pipeline Scripts

Scripts for scraping and generating restaurant pricing data for DineSignal.

## Prerequisites

- Node.js 18+ (for built-in `fetch`)
- `npx tsx` (TypeScript execution — included in devDependencies)

## API Keys

| Key | Required For | How to Get |
|-----|-------------|------------|
| `GOOGLE_PLACES_API_KEY` | `fetch-restaurants.ts` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — enable Places API |
| `SUPABASE_URL` | `seed-supabase.ts` (optional) | Your Supabase project settings |
| `SUPABASE_SERVICE_KEY` | `seed-supabase.ts` (optional) | Your Supabase project settings |

Set via environment variables or pass with `--key` flag where supported.

## Data Flow

```
1. fetch-restaurants.ts
   Google Places API --> scripts/output/restaurants.json

2. generate-realistic-menus.ts
   scripts/output/restaurants.json --> scripts/output/menu_items.json

3. seed-supabase.ts
   restaurants.json + menu_items.json --> scripts/output/seed.sql
                                      --> scripts/output/seed-data.ts

4. import-to-app.ts
   restaurants.json + menu_items.json --> src/data/restaurants.ts
                                      --> src/data/menuItems.ts
```

## Quick Start (Hackathon Path)

If you don't have a Google Places API key, skip step 1 and use the existing `src/data/restaurants.ts` data:

```bash
# Option A: Full pipeline with Google Places API
export GOOGLE_PLACES_API_KEY="your-key-here"
npx tsx scripts/fetch-restaurants.ts --lat 37.4419 --lng -122.1430 --radius 3000
npx tsx scripts/generate-realistic-menus.ts
npx tsx scripts/seed-supabase.ts
npx tsx scripts/import-to-app.ts

# Option B: Generate menus from existing app data (no API key needed)
npx tsx scripts/generate-realistic-menus.ts --from-app
npx tsx scripts/seed-supabase.ts
npx tsx scripts/import-to-app.ts
```

## Script Details

### fetch-restaurants.ts

Discovers restaurants near a location using Google Places API.

```bash
npx tsx scripts/fetch-restaurants.ts --lat 37.4419 --lng -122.1430 --radius 3000
npx tsx scripts/fetch-restaurants.ts --lat 37.4419 --lng -122.1430 --radius 3000 --key YOUR_API_KEY
```

Output: `scripts/output/restaurants.json`

### scrape-doordash.ts

Attempts to scrape menu data from DoorDash public store pages. Note: DoorDash actively blocks scraping, so this is best-effort. Use `generate-realistic-menus.ts` as a reliable fallback.

```bash
npx tsx scripts/scrape-doordash.ts --name "Evvia Estiatorio" --city "Palo Alto"
```

Output: `scripts/output/menus/{restaurant-slug}.json`

### generate-realistic-menus.ts

Generates highly realistic menu data based on restaurant info. This is the recommended approach for hackathon demos.

```bash
npx tsx scripts/generate-realistic-menus.ts           # reads from scripts/output/restaurants.json
npx tsx scripts/generate-realistic-menus.ts --from-app # reads from src/data/restaurants.ts
```

Output: `scripts/output/menu_items.json`

### seed-supabase.ts

Converts generated data into SQL and TypeScript seed files.

```bash
npx tsx scripts/seed-supabase.ts
```

Output:
- `scripts/output/seed.sql` — SQL INSERT statements for Supabase
- `scripts/output/seed-data.ts` — TypeScript module for `src/data/`

### import-to-app.ts

Creates drop-in replacement files for `src/data/`.

```bash
npx tsx scripts/import-to-app.ts
```

Output: Overwrites `src/data/restaurants.ts` and `src/data/menuItems.ts`

## Output Directory

All intermediate data lives in `scripts/output/`. This directory is created automatically and should be gitignored.
