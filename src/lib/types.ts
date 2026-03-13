export interface Restaurant {
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
  image_url?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  subcategory: string;
  source: string;
}

export type MenuCategory = 'appetizer' | 'entree' | 'side' | 'drink' | 'dessert';

export interface PriceSnapshot {
  id: string;
  menu_item_id: string;
  price: number;
  captured_at: string;
}

export interface PricingComparison {
  item_name: string;
  category: MenuCategory;
  your_price: number;
  market_avg: number;
  delta: number;
  percentile: number;
  weekly_volume: number;
  annual_impact: number;
}

export interface RestaurantWithMenu extends Restaurant {
  menu_items: MenuItem[];
}

export interface CompetitorCard {
  id: string;
  name: string;
  cuisine_type: string;
  distance: number;
  avg_entree_price: number;
  rating: number;
  review_count: number;
  price_tier: number;
}

export interface MarketStats {
  total_restaurants: number;
  total_menu_items: number;
  avg_entree_price: number;
  last_updated: string;
}
