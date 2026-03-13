import { ArrowUp } from 'lucide-react';

const DATA = [
  { item: 'Margherita Pizza',     yours: 14.00, market: 17.50, delta: 3.50,  pct: 22, impact: 9100  },
  { item: 'Grilled Salmon',       yours: 24.00, market: 29.50, delta: 5.50,  pct: 28, impact: 22880 },
  { item: 'Caesar Salad',         yours: 12.00, market: 14.50, delta: 2.50,  pct: 18, impact: 6500  },
  { item: 'Filet Mignon',         yours: 42.00, market: 48.00, delta: 6.00,  pct: 35, impact: 24960 },
  { item: 'Truffle Fries',        yours: 11.00, market: 13.00, delta: 2.00,  pct: 30, impact: 5200  },
  { item: 'Lobster Risotto',      yours: 28.00, market: 34.00, delta: 6.00,  pct: 25, impact: 24960 },
];

const totalAnnual = DATA.reduce((s, r) => s + r.impact, 0);
const totalMonthly = Math.round(totalAnnual / 12);

export default function LiveDataTable() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold text-white">Real-time competitive analysis</h2>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="bg-green-500/20 text-green-400 text-xs font-mono font-medium px-2 py-0.5 rounded-full">
            LIVE
          </span>
        </div>

        {/* Table */}
        <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 px-6 py-3 text-xs text-gray-500 font-mono uppercase tracking-wider border-b border-gray-700/50">
            <span>Menu Item</span>
            <span className="text-right">Your Price</span>
            <span className="text-right">Market Avg</span>
            <span className="text-right">Delta</span>
            <span>Percentile</span>
            <span className="text-right">Annual Impact</span>
          </div>

          {/* Rows */}
          {DATA.map((row, i) => (
            <div
              key={row.item}
              className={`grid grid-cols-6 gap-4 px-6 py-4 items-center border-b border-gray-800/40 ${
                i % 2 === 0 ? 'bg-gray-900/50' : 'bg-gray-800/30'
              }`}
            >
              <span className="text-gray-200 text-sm">{row.item}</span>
              <span className="text-right text-gray-400 font-mono text-sm">
                ${row.yours.toFixed(2)}
              </span>
              <span className="text-right text-gray-400 font-mono text-sm">
                ${row.market.toFixed(2)}
              </span>
              <span className="text-right text-green-400 font-mono text-sm font-medium">
                +${row.delta.toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="text-gray-500 font-mono text-xs w-8 text-right">{row.pct}%</span>
              </div>
              <span className="text-right text-green-400 font-mono text-sm font-medium flex items-center justify-end gap-1">
                <ArrowUp className="w-3.5 h-3.5" />
                +${row.impact.toLocaleString()}
              </span>
            </div>
          ))}

          {/* Summary */}
          <div className="px-6 py-4 border-t-2 border-green-500/30 bg-green-500/5">
            <p className="text-sm text-gray-300">
              Total identified opportunity:{' '}
              <span className="text-green-400 font-mono font-bold">
                +${totalAnnual.toLocaleString()}/year
              </span>{' '}
              &middot;{' '}
              <span className="text-green-400 font-mono font-medium">
                +${totalMonthly.toLocaleString()}/month
              </span>{' '}
              &middot;{' '}
              <span className="text-gray-500">Based on 23 competitors within 2 miles</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
