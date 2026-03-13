import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Activity, Filter } from 'lucide-react';
import { restaurants, getMenuItemsByRestaurant, getMarketStats } from '@/data';
import type { Restaurant } from '@/lib/types';

const CUISINE_COLORS: Record<string, string> = {
  Mediterranean: '#3B82F6',
  Vietnamese: '#10B981',
  Japanese: '#8B5CF6',
  Pizza: '#F59E0B',
  American: '#EF4444',
  Mexican: '#F97316',
  Italian: '#06B6D4',
  'Latin American': '#EC4899',
  Thai: '#14B8A6',
  Burmese: '#A855F7',
  Chinese: '#F43F5E',
  Indian: '#FBBF24',
  Korean: '#6366F1',
  Burger: '#FB923C',
};

const CUISINE_FILTERS = ['All', 'Italian', 'Mexican', 'Japanese', 'American', 'Indian', 'Mediterranean', 'Chinese', 'Thai', 'Pizza'];

function getAvgEntreePrice(restaurantId: string): number {
  const items = getMenuItemsByRestaurant(restaurantId);
  const entrees = items.filter((i) => i.category === 'entree');
  if (entrees.length === 0) return 0;
  return Math.round((entrees.reduce((s, i) => s + i.price, 0) / entrees.length) * 100) / 100;
}

function formatRevenue(low: number, high: number): string {
  const avg = (low + high) / 2;
  if (avg >= 1_000_000) return `$${(avg / 1_000_000).toFixed(1)}M`;
  return `$${(avg / 1_000).toFixed(0)}K`;
}

export default function MarketMap() {
  const navigate = useNavigate();
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const stats = getMarketStats();

  const filteredRestaurants = useMemo(() => {
    if (activeCuisine === 'All') return restaurants;
    return restaurants.filter((r) => r.cuisine_type === activeCuisine);
  }, [activeCuisine]);

  // Compute bounds for coordinate normalization
  const bounds = useMemo(() => {
    const lats = restaurants.map((r) => r.latitude);
    const lngs = restaurants.map((r) => r.longitude);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, []);

  const padding = 60; // px padding inside the map container

  function toPixel(r: Restaurant, containerWidth: number, containerHeight: number) {
    const latRange = bounds.maxLat - bounds.minLat || 0.01;
    const lngRange = bounds.maxLng - bounds.minLng || 0.01;
    // Invert latitude (higher lat = higher on screen = lower y)
    const x = padding + ((r.longitude - bounds.minLng) / lngRange) * (containerWidth - padding * 2);
    const y = padding + ((bounds.maxLat - r.latitude) / latRange) * (containerHeight - padding * 2);
    return { x, y };
  }

  const containerWidth = 1200;
  const containerHeight = 600;

  const totalMarket = restaurants.reduce(
    (sum, r) => sum + (r.estimated_monthly_revenue_low + r.estimated_monthly_revenue_high) / 2,
    0,
  );
  const totalMarketYearly = totalMarket * 12;

  const avgEntreeAll = useMemo(() => {
    let total = 0;
    let count = 0;
    filteredRestaurants.forEach((r) => {
      const avg = getAvgEntreePrice(r.id);
      if (avg > 0) {
        total += avg;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(2) : '0.00';
  }, [filteredRestaurants]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-50">Market Intelligence Map</h2>
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
            Bay Area
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Activity className="w-4 h-4" />
          <span>{restaurants.length} tracked locations</span>
        </div>
      </div>

      {/* Map Container */}
      <div
        className="relative w-full bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl overflow-hidden"
        style={{ height: containerHeight }}
      >
        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 8 }, (_, i) => {
            const y = (containerHeight / 8) * (i + 1);
            return <line key={`h-${i}`} x1="0" y1={y} x2="100%" y2={y} stroke="#3B82F6" strokeWidth="0.5" />;
          })}
          {Array.from({ length: 12 }, (_, i) => {
            const x = (containerWidth / 12) * (i + 1);
            return <line key={`v-${i}`} x1={`${(x / containerWidth) * 100}%`} y1="0" x2={`${(x / containerWidth) * 100}%`} y2="100%" stroke="#3B82F6" strokeWidth="0.5" />;
          })}
        </svg>

        {/* Restaurant dots */}
        {filteredRestaurants.map((r) => {
          const { x, y } = toPixel(r, containerWidth, containerHeight);
          const color = CUISINE_COLORS[r.cuisine_type] || '#3B82F6';
          const isHovered = hoveredId === r.id;
          const size = r.price_tier >= 3 ? 12 : 9;

          return (
            <div
              key={r.id}
              className="absolute cursor-pointer transition-transform duration-200"
              style={{
                left: `${(x / containerWidth) * 100}%`,
                top: `${(y / containerHeight) * 100}%`,
                transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.8)' : 'scale(1)'}`,
                zIndex: isHovered ? 50 : 10,
              }}
              onMouseEnter={() => setHoveredId(r.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => navigate(`/dashboard/${r.id}`)}
            >
              {/* Glow */}
              <div
                className="absolute rounded-full animate-pulse"
                style={{
                  width: size + 12,
                  height: size + 12,
                  left: -(size + 12 - size) / 2,
                  top: -(size + 12 - size) / 2,
                  backgroundColor: color,
                  opacity: 0.2,
                  filter: 'blur(4px)',
                }}
              />
              {/* Dot */}
              <div
                className="rounded-full border-2 border-white/20"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}80`,
                }}
              />

              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute z-50 pointer-events-none"
                  style={{
                    bottom: size + 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="bg-gray-900/95 backdrop-blur-xl border border-blue-500/30 rounded-lg px-4 py-3 shadow-2xl whitespace-nowrap min-w-[220px]">
                    <div className="text-sm font-semibold text-gray-50 mb-1">{r.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {r.cuisine_type}
                      <span className="text-gray-600">|</span>
                      {'$'.repeat(r.price_tier)}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-gray-500">Avg Entree</span>
                      <span className="text-emerald-400 font-mono text-right">${getAvgEntreePrice(r.id).toFixed(2)}</span>
                      <span className="text-gray-500">Rating</span>
                      <span className="text-blue-400 font-mono text-right">{r.rating.toFixed(1)}</span>
                      <span className="text-gray-500">Est. Revenue</span>
                      <span className="text-emerald-400 font-mono text-right">
                        {formatRevenue(r.estimated_monthly_revenue_low, r.estimated_monthly_revenue_high)}/mo
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-blue-500/20 rounded-lg px-3 py-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Cuisine Types</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 max-w-xs">
            {Object.entries(CUISINE_COLORS)
              .filter(([cuisine]) => filteredRestaurants.some((r) => r.cuisine_type === cuisine))
              .map(([cuisine, color]) => (
                <div key={cuisine} className="flex items-center gap-1 text-[10px] text-gray-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {cuisine}
                </div>
              ))}
          </div>
        </div>

        {/* Dot size legend */}
        <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-blue-500/20 rounded-lg px-3 py-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Price Tier</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              $$
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              $$$+
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2 mt-6 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500 mr-1" />
        {CUISINE_FILTERS.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => setActiveCuisine(cuisine)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 cursor-pointer ${
              activeCuisine === cuisine
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                : 'bg-gray-900/50 text-gray-400 border-gray-700/50 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Bottom Stats Bar */}
      <div className="mt-6 bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Showing <span className="text-gray-50 font-semibold">{filteredRestaurants.length}</span> of{' '}
            <span className="text-gray-50 font-semibold">{stats.total_restaurants}</span> restaurants
          </span>
          <span className="text-gray-400">
            Avg entree price:{' '}
            <span className="text-emerald-400 font-mono font-semibold">${avgEntreeAll}</span>
          </span>
          <span className="text-gray-400">
            Total estimated market:{' '}
            <span className="text-emerald-400 font-mono font-semibold">
              ${(totalMarketYearly / 1_000_000).toFixed(1)}M/yr
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
