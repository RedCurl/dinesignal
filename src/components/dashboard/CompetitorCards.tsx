import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CompetitorCard } from '@/lib/types';

interface CompetitorCardsProps {
  competitors: CompetitorCard[];
  restaurantId: string;
}

export default function CompetitorCards({ competitors, restaurantId }: CompetitorCardsProps) {
  const shown = competitors.slice(0, 6);

  return (
    <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-50">Nearby Competitors</h3>
        <span className="bg-blue-500/20 text-blue-400 text-xs rounded-full px-2 py-0.5">
          {competitors.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {shown.map((c) => (
          <div
            key={c.id}
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-blue-500/30 transition-colors"
          >
            <p className="font-bold text-gray-100 text-sm mb-1.5 truncate">{c.name}</p>
            <span className="inline-block bg-blue-500/15 text-blue-400 rounded-full px-2 py-0.5 text-xs mb-2">
              {c.cuisine_type}
            </span>

            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>{c.distance} mi</span>
              <span className="flex items-center gap-0.5 text-yellow-400">
                <Star className="w-3 h-3 fill-yellow-400" />
                {c.rating}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-sm text-gray-200">
                ${c.avg_entree_price.toFixed(2)}
                <span className="text-xs text-gray-500 ml-1">avg</span>
              </span>
              <Link
                to={`/compare?a=${restaurantId}&b=${c.id}`}
                className="inline-flex items-center gap-0.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Compare
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
