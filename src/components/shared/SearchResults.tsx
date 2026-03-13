import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, SearchX } from 'lucide-react';
import { searchRestaurants } from '@/data';

interface Props {
  query: string;
}

export default function SearchResults({ query }: Props) {
  const results = useMemo(() => searchRestaurants(query), [query]);

  if (results.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <SearchX className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No restaurants found</h3>
        <p className="text-gray-500 text-sm">
          No results for "<span className="text-gray-300">{query}</span>". Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-400 mb-6">
        Found <span className="text-gray-50 font-semibold">{results.length}</span> result{results.length !== 1 ? 's' : ''} for "
        <span className="text-blue-400">{query}</span>"
      </div>

      <div className="space-y-4">
        {results.map((r) => {
          const avgRev = (r.estimated_monthly_revenue_low + r.estimated_monthly_revenue_high) / 2;
          const revStr =
            avgRev >= 1_000_000
              ? `$${(avgRev / 1_000_000).toFixed(1)}M`
              : `$${(avgRev / 1_000).toFixed(0)}K`;

          return (
            <div
              key={r.id}
              className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-50 group-hover:text-blue-400 transition-colors">
                      {r.name}
                    </h3>
                    <span className="px-2 py-0.5 text-xs bg-blue-500/15 text-blue-300 border border-blue-500/25 rounded">
                      {r.cuisine_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {r.address}
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-50 font-mono">{r.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({r.review_count.toLocaleString()})</span>
                    </div>
                    <div className="text-gray-400">
                      Price: <span className="text-gray-50">{'$'.repeat(r.price_tier)}</span>
                    </div>
                    <div className="text-gray-400">
                      Est. Revenue:{' '}
                      <span className="text-emerald-400 font-mono">{revStr}/mo</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/dashboard/${r.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg border border-blue-500/30 transition-all duration-200 whitespace-nowrap mt-1"
                >
                  View Report
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
