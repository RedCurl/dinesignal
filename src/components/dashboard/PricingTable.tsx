import { ArrowUp } from 'lucide-react';
import type { PricingComparison, MenuCategory } from '@/lib/types';

interface PricingTableProps {
  comparisons: PricingComparison[];
}

const CATEGORY_STYLES: Record<MenuCategory, { background: string; color: string }> = {
  entree: { background: 'rgba(59,130,246,0.2)', color: '#60A5FA' },
  appetizer: { background: 'rgba(139,92,246,0.2)', color: '#A78BFA' },
  drink: { background: 'rgba(245,158,11,0.2)', color: '#FBBF24' },
  dessert: { background: 'rgba(236,72,153,0.2)', color: '#F472B6' },
  side: { background: 'rgba(107,114,128,0.2)', color: '#9CA3AF' },
};

function formatDelta(delta: number): { text: string; color: string } {
  if (delta < 0) {
    return { text: `\u2212$${Math.abs(delta).toFixed(2)}`, color: '#34D399' };
  }
  if (delta > 0) {
    return { text: `+$${delta.toFixed(2)}`, color: '#EF4444' };
  }
  return { text: '$0.00', color: '#6B7280' };
}

function percentileBarColor(p: number): string {
  if (p < 40) return '#10B981';
  if (p <= 60) return '#FBBF24';
  return '#EF4444';
}

const mono = "'JetBrains Mono', monospace";
const sans = "'Inter', sans-serif";

export default function PricingTable({ comparisons }: PricingTableProps) {
  const sorted = [...comparisons].sort((a, b) => a.annual_impact - b.annual_impact);

  const totalYearly = sorted
    .filter((c) => c.delta < 0)
    .reduce((sum, c) => sum + Math.abs(c.annual_impact), 0);
  const totalMonthly = Math.round(totalYearly / 12);

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 16px',
    fontWeight: 500,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#9CA3AF',
    fontFamily: sans,
    whiteSpace: 'nowrap',
  };

  const thRight: React.CSSProperties = { ...thStyle, textAlign: 'right' };

  const tdBase: React.CSSProperties = {
    padding: '10px 16px',
    fontSize: 13,
    fontFamily: sans,
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={{
        background: 'rgba(17,24,39,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(59,130,246,0.1)',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', margin: 0, fontFamily: sans }}>
          Pricing Intelligence
        </h2>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0', fontFamily: sans }}>
          Per-item competitive analysis vs. local market
        </p>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1F2937' }}>
              <th style={{ ...thStyle, width: 28 }}></th>
              <th style={thStyle}>Item</th>
              <th style={thStyle}>Category</th>
              <th style={thRight}>Your Price</th>
              <th style={thRight}>Market Avg</th>
              <th style={thRight}>Delta</th>
              <th style={{ ...thStyle, width: 112 }}>Percentile</th>
              <th style={thRight}>Weekly Vol</th>
              <th style={thRight}>Annual Impact</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const delta = formatDelta(row.delta);
              const hasOpportunity = row.delta < 0;
              const impactAbs = Math.abs(row.annual_impact);
              const catStyle = CATEGORY_STYLES[row.category];

              const rowBg = i % 2 === 0 ? 'rgba(17,24,39,0.5)' : 'rgba(31,41,55,0.3)';

              return (
                <tr
                  key={row.item_name}
                  style={{
                    background: rowBg,
                    borderTop: '1px solid rgba(31,41,55,0.5)',
                  }}
                >
                  <td style={{ ...tdBase, width: 28, paddingRight: 0 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: row.delta < -0.5 ? '#10B981' : row.delta > 0.5 ? '#EF4444' : '#6B7280',
                        boxShadow: row.delta < -0.5 ? '0 0 6px rgba(16,185,129,0.4)' : row.delta > 0.5 ? '0 0 6px rgba(239,68,68,0.4)' : 'none',
                      }}
                    />
                  </td>
                  <td style={{ ...tdBase, color: '#F3F4F6', fontWeight: 500 }}>
                    {row.item_name}
                  </td>
                  <td style={tdBase}>
                    <span
                      style={{
                        display: 'inline-block',
                        borderRadius: 9999,
                        padding: '2px 8px',
                        fontSize: 11,
                        textTransform: 'capitalize',
                        background: catStyle.background,
                        color: catStyle.color,
                        fontFamily: sans,
                      }}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', fontFamily: mono, color: '#F3F4F6' }}>
                    ${row.your_price.toFixed(2)}
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', fontFamily: mono, color: '#9CA3AF' }}>
                    ${row.market_avg.toFixed(2)}
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', fontFamily: mono, color: delta.color }}>
                    {delta.text}
                  </td>
                  <td style={tdBase}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 64,
                          height: 6,
                          background: '#374151',
                          borderRadius: 9999,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 9999,
                            background: percentileBarColor(row.percentile),
                            width: `${row.percentile}%`,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: '#6B7280', fontFamily: mono, width: 32 }}>
                        {row.percentile}%
                      </span>
                    </div>
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', fontFamily: mono, color: '#9CA3AF' }}>
                    {row.weekly_volume}
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', fontFamily: mono }}>
                    {hasOpportunity ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#34D399',
                        }}
                      >
                        <ArrowUp style={{ width: 14, height: 14 }} />
                        +${impactAbs.toLocaleString()}/yr
                      </span>
                    ) : (
                      <span style={{ color: '#374151' }}>&mdash;</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary row */}
      <div
        style={{
          borderTop: '2px solid rgba(16,185,129,0.3)',
          background: 'rgba(31,41,55,0.6)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderLeft: '4px solid #10B981',
        }}
      >
        <span style={{ fontSize: 13, color: '#9CA3AF', fontFamily: sans }}>
          Total Identified Opportunity:
        </span>
        <span
          style={{
            fontFamily: mono,
            fontWeight: 700,
            color: '#34D399',
            fontSize: 18,
          }}
        >
          +${totalYearly.toLocaleString()}/year
        </span>
        <span style={{ color: '#374151', margin: '0 4px' }}>&middot;</span>
        <span
          style={{
            fontFamily: mono,
            color: 'rgba(52,211,153,0.7)',
            fontSize: 14,
          }}
        >
          +${totalMonthly.toLocaleString()}/month
        </span>
      </div>
    </div>
  );
}
