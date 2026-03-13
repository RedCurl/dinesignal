import { ArrowUp } from 'lucide-react';
import type { PricingComparison, MenuCategory } from '@/lib/types';

interface PricingTableProps {
  comparisons: PricingComparison[];
}

const CATEGORY_COLORS: Record<MenuCategory, string> = {
  entree: 'bg-blue-500/20 text-blue-400',
  appetizer: 'bg-purple-500/20 text-purple-400',
  drink: 'bg-orange-500/20 text-orange-400',
  dessert: 'bg-pink-500/20 text-pink-400',
  side: 'bg-gray-500/20 text-gray-400',
};

function formatDelta(delta: number): { text: string; className: string } {
  if (delta < 0) {
    return { text: `\u2212$${Math.abs(delta).toFixed(2)}`, className: 'text-green-400' };
  }
  if (delta > 0) {
    return { text: `+$${delta.toFixed(2)}`, className: 'text-red-400' };
  }
  return { text: '$0.00', className: 'text-gray-500' };
}

function percentileColor(p: number): string {
  if (p < 40) return 'bg-green-500';
  if (p <= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function PricingTable({ comparisons }: PricingTableProps) {
  const sorted = [...comparisons].sort((a, b) => a.annual_impact - b.annual_impact);

  const totalYearly = sorted
    .filter((c) => c.delta < 0)
    .reduce((sum, c) => sum + Math.abs(c.annual_impact), 0);
  const totalMonthly = Math.round(totalYearly / 12);

  return (
    <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-blue-500/10">
        <h2 className="text-lg font-bold text-gray-50">Pricing Intelligence</h2>
        <p className="text-sm text-gray-500">Per-item competitive analysis vs. local market</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800 text-gray-400 uppercase text-xs tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Item</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Your Price</th>
              <th className="text-right px-4 py-3 font-medium">Market Avg</th>
              <th className="text-right px-4 py-3 font-medium">Delta</th>
              <th className="text-left px-4 py-3 font-medium w-28">Percentile</th>
              <th className="text-right px-4 py-3 font-medium">Weekly Vol</th>
              <th className="text-right px-4 py-3 font-medium">Annual Impact</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const delta = formatDelta(row.delta);
              const hasOpportunity = row.delta < 0;
              const impactAbs = Math.abs(row.annual_impact);

              return (
                <tr
                  key={row.item_name}
                  className={`border-t border-gray-800/50 ${
                    i % 2 === 0 ? 'bg-gray-900/50' : 'bg-gray-800/30'
                  } hover:bg-blue-500/5 transition-colors`}
                >
                  <td className="px-4 py-3 text-gray-100 font-medium">{row.item_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${CATEGORY_COLORS[row.category]}`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-100">
                    ${row.your_price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-400">
                    ${row.market_avg.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${delta.className}`}>
                    {delta.text}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${percentileColor(row.percentile)}`}
                          style={{ width: `${row.percentile}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-mono w-8">{row.percentile}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-400">
                    {row.weekly_volume}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {hasOpportunity ? (
                      <span className="inline-flex items-center gap-1 text-green-400">
                        <ArrowUp className="w-3.5 h-3.5" />
                        +${impactAbs.toLocaleString()}/yr
                      </span>
                    ) : (
                      <span className="text-gray-600">&mdash;</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary row */}
      <div className="border-t-2 border-green-500/30 bg-gray-800/60 px-6 py-4 flex items-center gap-2 border-l-4 border-l-green-500">
        <span className="text-sm text-gray-400">Total Identified Opportunity:</span>
        <span className="font-mono font-bold text-green-400 text-lg">
          +${totalYearly.toLocaleString()}/year
        </span>
        <span className="text-gray-600 mx-1">&middot;</span>
        <span className="font-mono text-green-400/70">
          +${totalMonthly.toLocaleString()}/month
        </span>
      </div>
    </div>
  );
}
