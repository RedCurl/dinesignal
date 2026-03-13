import type { Restaurant, CompetitorCard } from '@/lib/types';
import { getMenuItemsByRestaurant } from '@/data';

interface PricePositionChartProps {
  restaurant: Restaurant;
  competitors: CompetitorCard[];
}

export default function PricePositionChart({ restaurant, competitors }: PricePositionChartProps) {
  // Calculate this restaurant's avg entree price
  const myItems = getMenuItemsByRestaurant(restaurant.id);
  const myEntrees = myItems.filter((i) => i.category === 'entree');
  const myAvg =
    myEntrees.length > 0
      ? myEntrees.reduce((s, i) => s + i.price, 0) / myEntrees.length
      : 0;

  const allPrices = [myAvg, ...competitors.map((c) => c.avg_entree_price)].filter((p) => p > 0);
  if (allPrices.length === 0) return null;

  const minPrice = Math.floor(Math.min(...allPrices) - 2);
  const maxPrice = Math.ceil(Math.max(...allPrices) + 2);
  const range = maxPrice - minPrice;

  function pct(price: number) {
    return ((price - minPrice) / range) * 100;
  }

  return (
    <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-50 mb-1">
        Your Price Position vs. Nearby Competitors
      </h3>
      <p className="text-sm text-gray-500 mb-6">Average entree price comparison</p>

      <div className="relative py-8">
        {/* Axis line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-700" />

        {/* Price labels */}
        <div className="absolute top-1/2 mt-6 left-0 text-xs text-gray-500 font-mono">
          ${minPrice}
        </div>
        <div className="absolute top-1/2 mt-6 right-0 text-xs text-gray-500 font-mono">
          ${maxPrice}
        </div>

        {/* Competitor dots */}
        {competitors.map((c) => {
          const left = pct(c.avg_entree_price);
          return (
            <div
              key={c.id}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${left}%` }}
            >
              <span className="text-[10px] text-gray-500 whitespace-nowrap mb-1 -translate-y-4">
                {c.name.length > 14 ? c.name.slice(0, 14) + '...' : c.name}
              </span>
              <div className="w-3 h-3 rounded-full bg-gray-500/60 border border-gray-500" />
              <span className="text-[10px] text-gray-600 font-mono mt-1 translate-y-1">
                ${c.avg_entree_price.toFixed(0)}
              </span>
            </div>
          );
        })}

        {/* This restaurant dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-10"
          style={{ left: `${pct(myAvg)}%` }}
        >
          <span className="text-[11px] text-blue-400 font-bold whitespace-nowrap mb-1 -translate-y-4">
            {restaurant.name}
          </span>
          <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
          <span className="text-[11px] text-blue-400 font-mono font-bold mt-1 translate-y-1">
            ${myAvg.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
