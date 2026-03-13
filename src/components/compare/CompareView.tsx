import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, GitCompareArrows, TrendingUp, TrendingDown } from 'lucide-react';
import { restaurants, getRestaurantById, getMenuItemsByRestaurant } from '@/data';
import type { Restaurant, MenuItem, MenuCategory } from '@/lib/types';

const CATEGORIES: MenuCategory[] = ['appetizer', 'entree', 'side', 'drink', 'dessert'];

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  appetizer: 'Appetizers',
  entree: 'Entrees',
  side: 'Sides',
  drink: 'Drinks',
  dessert: 'Desserts',
};

interface Props {
  restaurantAId?: string;
  restaurantBId?: string;
}

function RestaurantHeader({ restaurant, items }: { restaurant: Restaurant; items: MenuItem[] }) {
  const entrees = items.filter((i) => i.category === 'entree');
  const avgPrice = entrees.length > 0 ? entrees.reduce((s, i) => s + i.price, 0) / entrees.length : 0;

  return (
    <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-5">
      <h3 className="text-lg font-bold text-gray-50 mb-1">{restaurant.name}</h3>
      <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
        <span className="px-2 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-500/25 rounded text-xs">
          {restaurant.cuisine_type}
        </span>
        <span>{'$'.repeat(restaurant.price_tier)}</span>
        <span className="text-yellow-400">{restaurant.rating.toFixed(1)} ★</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-gray-500">Menu Items</span>
          <div className="text-gray-50 font-mono font-semibold">{items.length}</div>
        </div>
        <div>
          <span className="text-gray-500">Avg Entree</span>
          <div className="text-emerald-400 font-mono font-semibold">${avgPrice.toFixed(2)}</div>
        </div>
        <div>
          <span className="text-gray-500">Reviews</span>
          <div className="text-gray-50 font-mono font-semibold">{restaurant.review_count.toLocaleString()}</div>
        </div>
        <div>
          <span className="text-gray-500">Est. Revenue</span>
          <div className="text-emerald-400 font-mono font-semibold">
            ${((restaurant.estimated_monthly_revenue_low + restaurant.estimated_monthly_revenue_high) / 2 / 1000).toFixed(0)}K/mo
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantSelector({
  label,
  value,
  onChange,
  excludeId,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  excludeId?: string;
}) {
  return (
    <div className="flex-1">
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-900/70 border border-blue-500/20 rounded-xl px-4 py-3 text-gray-50 text-sm appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 transition-colors"
        >
          <option value="">Select a restaurant...</option>
          {restaurants
            .filter((r) => r.id !== excludeId)
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.cuisine_type} ({'$'.repeat(r.price_tier)})
              </option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

export default function CompareView({ restaurantAId, restaurantBId }: Props) {
  const navigate = useNavigate();
  const [selectA, setSelectA] = useState(restaurantAId || '');
  const [selectB, setSelectB] = useState(restaurantBId || '');

  const hasSelection = selectA && selectB;

  const restaurantA = useMemo(() => {
    const id = restaurantAId || selectA;
    if (!id) return null;
    try {
      return getRestaurantById(id);
    } catch {
      return null;
    }
  }, [restaurantAId, selectA]);

  const restaurantB = useMemo(() => {
    const id = restaurantBId || selectB;
    if (!id) return null;
    try {
      return getRestaurantById(id);
    } catch {
      return null;
    }
  }, [restaurantBId, selectB]);

  const itemsA = useMemo(() => (restaurantA ? getMenuItemsByRestaurant(restaurantA.id) : []), [restaurantA]);
  const itemsB = useMemo(() => (restaurantB ? getMenuItemsByRestaurant(restaurantB.id) : []), [restaurantB]);

  const avgA = useMemo(() => {
    if (itemsA.length === 0) return 0;
    return itemsA.reduce((s, i) => s + i.price, 0) / itemsA.length;
  }, [itemsA]);

  const avgB = useMemo(() => {
    if (itemsB.length === 0) return 0;
    return itemsB.reduce((s, i) => s + i.price, 0) / itemsB.length;
  }, [itemsB]);

  // If no restaurants selected, show selector
  if (!restaurantA || !restaurantB) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GitCompareArrows className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-gray-50">Compare Restaurants</h2>
          </div>
          <p className="text-gray-400">Select two restaurants for a side-by-side pricing analysis</p>
        </div>

        <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-8">
          <div className="flex items-end gap-4">
            <RestaurantSelector label="Restaurant A" value={selectA} onChange={setSelectA} excludeId={selectB} />
            <div className="pb-3 text-gray-600">
              <ArrowRight className="w-5 h-5" />
            </div>
            <RestaurantSelector label="Restaurant B" value={selectB} onChange={setSelectB} excludeId={selectA} />
          </div>
          <div className="mt-6 text-center">
            <button
              disabled={!hasSelection}
              onClick={() => navigate(`/compare?a=${selectA}&b=${selectB}`)}
              className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                hasSelection
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              Compare
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <GitCompareArrows className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-50">Pricing Comparison</h2>
      </div>

      {/* Restaurant Headers */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <RestaurantHeader restaurant={restaurantA} items={itemsA} />
        <RestaurantHeader restaurant={restaurantB} items={itemsB} />
      </div>

      {/* Category-by-category comparison */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const catItemsA = itemsA.filter((i) => i.category === category);
          const catItemsB = itemsB.filter((i) => i.category === category);
          if (catItemsA.length === 0 && catItemsB.length === 0) return null;

          const maxRows = Math.max(catItemsA.length, catItemsB.length);

          return (
            <div key={category} className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl overflow-hidden">
              {/* Category Header */}
              <div className="px-6 py-3 bg-blue-500/10 border-b border-blue-500/20">
                <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                  {CATEGORY_LABELS[category]}
                </h3>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_100px_1fr_100px_80px] gap-2 px-6 py-2 text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-800">
                <span>{restaurantA.name}</span>
                <span className="text-right">Price</span>
                <span>{restaurantB.name}</span>
                <span className="text-right">Price</span>
                <span className="text-right">Delta</span>
              </div>

              {/* Rows */}
              {Array.from({ length: maxRows }, (_, i) => {
                const itemA = catItemsA[i];
                const itemB = catItemsB[i];
                const delta = itemA && itemB ? itemA.price - itemB.price : null;

                return (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_100px_1fr_100px_80px] gap-2 px-6 py-2.5 border-b border-gray-800/50 last:border-b-0 text-sm hover:bg-gray-800/30 transition-colors"
                  >
                    <span className="text-gray-300 truncate">{itemA?.name || '—'}</span>
                    <span className={`text-right font-mono ${itemA && itemB && itemA.price <= itemB.price ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {itemA ? `$${itemA.price.toFixed(2)}` : '—'}
                    </span>
                    <span className="text-gray-300 truncate">{itemB?.name || '—'}</span>
                    <span className={`text-right font-mono ${itemA && itemB && itemB.price <= itemA.price ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {itemB ? `$${itemB.price.toFixed(2)}` : '—'}
                    </span>
                    <span className="text-right font-mono flex items-center justify-end gap-1">
                      {delta !== null ? (
                        <>
                          {delta > 0 ? (
                            <TrendingUp className="w-3 h-3 text-red-400" />
                          ) : delta < 0 ? (
                            <TrendingDown className="w-3 h-3 text-emerald-400" />
                          ) : null}
                          <span className={delta > 0 ? 'text-red-400' : delta < 0 ? 'text-emerald-400' : 'text-gray-500'}>
                            {delta > 0 ? '+' : ''}${delta.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl px-6 py-5">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{restaurantA.name} Avg</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">${avgA.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{restaurantB.name} Avg</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">${avgB.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Difference</div>
            <div className={`text-2xl font-bold font-mono ${avgA - avgB > 0 ? 'text-red-400' : avgA - avgB < 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
              {avgA - avgB > 0 ? '+' : ''}${(avgA - avgB).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
