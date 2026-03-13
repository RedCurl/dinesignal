import { Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin } from 'lucide-react';
import type { Restaurant } from '@/lib/types';

interface DashboardHeaderProps {
  restaurant: Restaurant;
  opportunity: { monthly: number; yearly: number };
}

export default function DashboardHeader({ restaurant, opportunity }: DashboardHeaderProps) {
  const dollarSigns = '$'.repeat(restaurant.price_tier);

  return (
    <div className="mb-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Search
      </Link>

      <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left side */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-50">{restaurant.name}</h1>
            <span className="bg-blue-500/20 text-blue-400 rounded-full px-3 py-1 text-sm">
              {restaurant.cuisine_type}
            </span>
            <span className="text-gray-500 text-sm">{dollarSigns}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {restaurant.address}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400" />
              {restaurant.rating}
            </span>
            <span className="text-gray-500">
              {restaurant.review_count.toLocaleString()} reviews
            </span>
          </div>
        </div>

        {/* Right side — opportunity */}
        <div className="bg-gray-800/60 border border-green-500/30 rounded-xl px-6 py-4 min-w-[260px] shadow-[0_0_30px_rgba(16,185,129,0.08)]">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Potential Additional Revenue
          </p>
          <p className="text-4xl font-mono text-green-400 font-bold leading-tight">
            +${opportunity.yearly.toLocaleString()}<span className="text-lg text-green-400/70">/year</span>
          </p>
          <p className="text-lg font-mono text-green-400/60 mt-0.5">
            +${opportunity.monthly.toLocaleString()}/month
          </p>
        </div>
      </div>
    </div>
  );
}
