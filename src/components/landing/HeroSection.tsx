import { useState } from 'react';
import { Search, ArrowUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchRestaurants } from '@/data';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const results = searchRestaurants(query);
    if (results.length > 0) {
      navigate(`/dashboard/${results[0].id}`);
    } else {
      navigate('/dashboard/rest-1');
    }
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-16"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(59,130,246,0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />

      <div className="relative max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-blue-400 font-mono text-xs tracking-widest uppercase">
              Menu Pricing Intelligence
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
            The pricing intelligence platform for restaurants
          </h1>

          <p className="text-lg text-gray-400 mt-4 max-w-lg leading-relaxed">
            We analyze every competitor menu near you and show you exactly where
            you're underpriced — down to the dollar.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSubmit} className="mt-8 flex items-center gap-0 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your restaurant name or address..."
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-blue-500 rounded-l-xl pl-12 pr-4 py-3.5 text-white text-sm placeholder:text-gray-500 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3.5 rounded-r-xl transition-colors text-sm whitespace-nowrap"
            >
              Analyze
            </button>
          </form>

          {/* Sub-line */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Free report &middot; 12,847 restaurants tracked &middot; Updated in
            real-time
          </div>
        </div>

        {/* Right — mini dashboard preview */}
        <div className="hidden lg:block">
          <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 shadow-2xl shadow-blue-500/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                  Revenue Gap Detected
                </p>
                <p className="text-3xl font-bold text-green-400 font-mono mt-1">
                  +$47,200<span className="text-lg text-gray-500">/yr</span>
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 flex items-center gap-1">
                <ArrowUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 text-xs font-mono font-medium">+18.3%</span>
              </div>
            </div>

            {/* Mini table */}
            <div className="space-y-0 text-sm">
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-mono uppercase tracking-wider pb-2 border-b border-gray-700/50">
                <span>Item</span>
                <span className="text-right">Your Price</span>
                <span className="text-right">Market Avg</span>
                <span className="text-right">Delta</span>
              </div>
              {[
                { item: 'Grilled Salmon', yours: '$24.00', market: '$29.50', delta: '+$5.50' },
                { item: 'Lamb Chops', yours: '$32.00', market: '$38.00', delta: '+$6.00' },
                { item: 'Caesar Salad', yours: '$12.00', market: '$14.50', delta: '+$2.50' },
              ].map((row) => (
                <div
                  key={row.item}
                  className="grid grid-cols-4 gap-2 py-2.5 border-b border-gray-800/50"
                >
                  <span className="text-gray-300 text-sm truncate">{row.item}</span>
                  <span className="text-right text-gray-400 font-mono text-sm">{row.yours}</span>
                  <span className="text-right text-gray-400 font-mono text-sm">{row.market}</span>
                  <span className="text-right text-green-400 font-mono text-sm font-medium">
                    {row.delta}
                  </span>
                </div>
              ))}
            </div>

            {/* Price position bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-mono">Price Position</span>
                <span className="text-blue-400 font-mono">32nd percentile</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  style={{ width: '32%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-1">
                <span>Lowest</span>
                <span>Market Avg</span>
                <span>Highest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
