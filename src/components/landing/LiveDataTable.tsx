import { ArrowUp } from 'lucide-react';

const DATA = [
  { item: 'Margherita Pizza', yours: 14.00, market: 17.50, delta: 3.50, pct: 22, impact: 9100 },
  { item: 'Grilled Salmon', yours: 24.00, market: 29.50, delta: 5.50, pct: 28, impact: 22880 },
  { item: 'Caesar Salad', yours: 12.00, market: 14.50, delta: 2.50, pct: 18, impact: 6500 },
  { item: 'Filet Mignon', yours: 42.00, market: 48.00, delta: 6.00, pct: 35, impact: 24960 },
  { item: 'Truffle Fries', yours: 11.00, market: 13.00, delta: 2.00, pct: 30, impact: 5200 },
  { item: 'Lobster Risotto', yours: 28.00, market: 34.00, delta: 6.00, pct: 25, impact: 24960 },
];

const totalAnnual = DATA.reduce((s, r) => s + r.impact, 0);
const totalMonthly = Math.round(totalAnnual / 12);

const mono = "'JetBrains Mono', monospace";

export default function LiveDataTable() {
  return (
    <section style={{ padding: '80px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Real-time competitive analysis</h2>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%', background: '#10B981',
          display: 'inline-block', boxShadow: '0 0 8px #10B981',
        }} />
        <span style={{
          background: 'rgba(16,185,129,0.2)', color: '#34D399',
          fontSize: '11px', fontFamily: mono, fontWeight: 500,
          padding: '2px 10px', borderRadius: '9999px',
        }}>LIVE</span>
      </div>

      {/* Table container */}
      <div style={{
        background: 'rgba(17,24,39,0.7)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1.2fr',
          gap: '16px',
          padding: '14px 24px',
          fontSize: '10px',
          color: '#6B7280',
          fontFamily: mono,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderBottom: '1px solid rgba(55,65,81,0.5)',
          background: 'rgba(17,24,39,0.5)',
        }}>
          <span>Menu Item</span>
          <span style={{ textAlign: 'right' }}>Your Price</span>
          <span style={{ textAlign: 'right' }}>Market Avg</span>
          <span style={{ textAlign: 'right' }}>Delta</span>
          <span>Percentile</span>
          <span style={{ textAlign: 'right' }}>Annual Impact</span>
        </div>

        {/* Data rows */}
        {DATA.map((row, i) => (
          <div
            key={row.item}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1.2fr',
              gap: '16px',
              padding: '14px 24px',
              alignItems: 'center',
              borderBottom: '1px solid rgba(31,41,55,0.4)',
              background: i % 2 === 0 ? 'rgba(17,24,39,0.3)' : 'rgba(31,41,55,0.15)',
            }}
          >
            <span style={{ color: '#E5E7EB', fontSize: '14px' }}>{row.item}</span>
            <span style={{ textAlign: 'right', color: '#9CA3AF', fontFamily: mono, fontSize: '14px' }}>
              ${row.yours.toFixed(2)}
            </span>
            <span style={{ textAlign: 'right', color: '#9CA3AF', fontFamily: mono, fontSize: '14px' }}>
              ${row.market.toFixed(2)}
            </span>
            <span style={{ textAlign: 'right', color: '#34D399', fontFamily: mono, fontSize: '14px', fontWeight: 500 }}>
              +${row.delta.toFixed(2)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '6px', background: '#1F2937', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${row.pct}%`, background: '#3B82F6', borderRadius: '3px' }} />
              </div>
              <span style={{ color: '#6B7280', fontFamily: mono, fontSize: '12px', minWidth: '30px', textAlign: 'right' }}>{row.pct}%</span>
            </div>
            <span style={{
              textAlign: 'right', color: '#34D399', fontFamily: mono, fontSize: '14px', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
            }}>
              <ArrowUp style={{ width: '14px', height: '14px' }} />
              +${row.impact.toLocaleString()}
            </span>
          </div>
        ))}

        {/* Summary */}
        <div style={{
          padding: '16px 24px',
          borderTop: '2px solid rgba(16,185,129,0.3)',
          background: 'rgba(16,185,129,0.05)',
        }}>
          <p style={{ fontSize: '14px', color: '#D1D5DB' }}>
            Total identified opportunity:{' '}
            <span style={{ color: '#34D399', fontFamily: mono, fontWeight: 700 }}>
              +${totalAnnual.toLocaleString()}/year
            </span>{' '}
            ·{' '}
            <span style={{ color: '#34D399', fontFamily: mono, fontWeight: 500 }}>
              +${totalMonthly.toLocaleString()}/month
            </span>{' '}
            ·{' '}
            <span style={{ color: '#6B7280' }}>Based on 23 competitors within 2 miles</span>
          </p>
        </div>
      </div>
    </section>
  );
}
