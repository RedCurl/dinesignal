-- ============================================================
-- DineSignal — Supabase Schema
-- "Palantir for restaurants" pricing intelligence platform
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- RESTAURANTS
-- ──────────────────────────────────────────────
create table restaurants (
  id            text primary key,
  name          text not null,
  address       text not null,
  latitude      double precision not null,
  longitude     double precision not null,
  cuisine_type  text not null,
  price_tier    smallint not null check (price_tier between 1 and 4),
  rating        numeric(2,1) not null check (rating between 1.0 and 5.0),
  review_count  integer not null default 0,
  estimated_monthly_revenue_low  integer not null default 0,
  estimated_monthly_revenue_high integer not null default 0,
  metro_area    text not null default 'Bay Area',
  image_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_restaurants_cuisine on restaurants (cuisine_type);
create index idx_restaurants_metro on restaurants (metro_area);
create index idx_restaurants_location on restaurants (latitude, longitude);

-- ──────────────────────────────────────────────
-- MENU ITEMS
-- ──────────────────────────────────────────────
create type menu_category as enum ('appetizer', 'entree', 'side', 'drink', 'dessert');

create table menu_items (
  id             text primary key,
  restaurant_id  text not null references restaurants(id) on delete cascade,
  name           text not null,
  description    text not null default '',
  price          numeric(8,2) not null check (price >= 0),
  category       menu_category not null,
  subcategory    text not null default '',
  source         text not null default 'website',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_menu_items_restaurant on menu_items (restaurant_id);
create index idx_menu_items_category on menu_items (category);
create index idx_menu_items_subcategory on menu_items (subcategory);

-- ──────────────────────────────────────────────
-- PRICE SNAPSHOTS
-- ──────────────────────────────────────────────
create table price_snapshots (
  id            text primary key,
  menu_item_id  text not null references menu_items(id) on delete cascade,
  price         numeric(8,2) not null check (price >= 0),
  captured_at   timestamptz not null default now()
);

create index idx_price_snapshots_item on price_snapshots (menu_item_id);
create index idx_price_snapshots_date on price_snapshots (captured_at desc);

-- ──────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ──────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_restaurants_updated
  before update on restaurants
  for each row execute function update_updated_at();

create trigger trg_menu_items_updated
  before update on menu_items
  for each row execute function update_updated_at();

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY — public read access
-- ──────────────────────────────────────────────
alter table restaurants enable row level security;
alter table menu_items enable row level security;
alter table price_snapshots enable row level security;

-- Allow anyone to read
create policy "Public read restaurants"
  on restaurants for select
  using (true);

create policy "Public read menu_items"
  on menu_items for select
  using (true);

create policy "Public read price_snapshots"
  on price_snapshots for select
  using (true);

-- Allow authenticated users to insert/update
create policy "Authenticated insert restaurants"
  on restaurants for insert
  to authenticated
  with check (true);

create policy "Authenticated update restaurants"
  on restaurants for update
  to authenticated
  using (true);

create policy "Authenticated insert menu_items"
  on menu_items for insert
  to authenticated
  with check (true);

create policy "Authenticated update menu_items"
  on menu_items for update
  to authenticated
  using (true);

create policy "Authenticated insert price_snapshots"
  on price_snapshots for insert
  to authenticated
  with check (true);
