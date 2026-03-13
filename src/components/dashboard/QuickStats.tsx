import { DollarSign, Target, AlertCircle, TrendingUp } from 'lucide-react';
import type { PricingComparison } from '@/lib/types';

interface QuickStatsProps {
  comparisons: PricingComparison[];
  opportunity: { monthly: number; yearly: number };
}

const mono = "'JetBrains Mono', monospace";
const sans = "'Inter', sans-serif";

const cardStyle: React.CSSProperties = {
  background: 'rgba(17,24,39,0.7)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(59,130,246,0.15)',
  borderRadius: 16,
  padding: '20px 24px',
  flex: 1,
  minWidth: 0,
};

export default function QuickStats({ comparisons, opportunity }: QuickStatsProps) {
  const entrees = comparisons.filter((c) => c.category === 'entree');
  const myAvg =
    entrees.length > 0
      ? entrees.reduce((s, c) => s + c.your_price, 0) / entrees.length
      : 0;
  const areaAvg =
    entrees.length > 0
      ? entrees.reduce((s, c) => s + c.market_avg, 0) / entrees.length
      : 0;

  const allPercentiles = comparisons.map((c) => c.percentile);
  const avgPercentile =
    allPercentiles.length > 0
      ? Math.round(allPercentiles.reduce((s, p) => s + p, 0) / allPercentiles.length)
      : 50;

  const underpriced = comparisons.filter((c) => c.delta < 0).length;
  const total = comparisons.length;

  const percentileColor = avgPercentile < 40 ? '#10B981' : avgPercentile <= 60 ? '#FBBF24' : '#EF4444';

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        marginBottom: 32,
      }}
    >
      {/* Card 1: Your Avg Entree */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(59,130,246,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign style={{ width: 18, height: 18, color: '#3B82F6' }} />
          </div>
          <span style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: sans }}>
            Your Avg Entree
          </span>
        </div>
        <p style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: '#F9FAFB', margin: 0, lineHeight: 1.1 }}>
          ${myAvg.toFixed(2)}
        </p>
        <p style={{ fontFamily: sans, fontSize: 12, color: '#9CA3AF', margin: '6px 0 0' }}>
          vs <span style={{ fontFamily: mono, color: '#6B7280' }}>${areaAvg.toFixed(2)}</span> area avg
        </p>
      </div>

      {/* Card 2: Price Position */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${percentileColor}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target style={{ width: 18, height: 18, color: percentileColor }} />
          </div>
          <span style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: sans }}>
            Price Position
          </span>
        </div>
        <p style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: percentileColor, margin: 0, lineHeight: 1.1 }}>
          {avgPercentile}<span style={{ fontSize: 16, color: percentileColor }}>th</span>
        </p>
        <p style={{ fontFamily: sans, fontSize: 12, color: '#9CA3AF', margin: '6px 0 0' }}>
          percentile — {avgPercentile < 40 ? 'room to grow' : avgPercentile <= 60 ? 'at market' : 'premium'}
        </p>
      </div>

      {/* Card 3: Items Underpriced */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(251,191,36,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, color: '#FBBF24' }} />
          </div>
          <span style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: sans }}>
            Items Underpriced
          </span>
        </div>
        <p style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: '#F9FAFB', margin: 0, lineHeight: 1.1 }}>
          {underpriced} <span style={{ fontSize: 16, color: '#6B7280' }}>of {total}</span>
        </p>
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              width: '100%',
              height: 6,
              background: '#374151',
              borderRadius: 9999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: underpriced > 0 ? '#FBBF24' : '#10B981',
                borderRadius: 9999,
                width: `${total > 0 ? (underpriced / total) * 100 : 0}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Card 4: Annual Opportunity */}
      <div style={{ ...cardStyle, border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 0 30px rgba(16,185,129,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(16,185,129,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp style={{ width: 18, height: 18, color: '#10B981' }} />
          </div>
          <span style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: sans }}>
            Annual Opportunity
          </span>
        </div>
        <p style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: '#34D399', margin: 0, lineHeight: 1.1 }}>
          +${opportunity.yearly.toLocaleString()}
          <span style={{ fontSize: 14, color: 'rgba(52,211,153,0.7)' }}>/yr</span>
        </p>
        <p style={{ fontFamily: sans, fontSize: 12, color: 'rgba(52,211,153,0.6)', margin: '6px 0 0' }}>
          +${opportunity.monthly.toLocaleString()}/month
        </p>
      </div>
    </div>
  );
}
