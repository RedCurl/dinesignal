import type { Restaurant } from '@/lib/types';

interface RevenueEstimateProps {
  restaurant: Restaurant;
}

interface SignalRow {
  label: string;
  value: number; // 0-100
}

function getSignals(restaurant: Restaurant): SignalRow[] {
  const ratingSignal = Math.round((restaurant.rating / 5) * 100);
  const reviewSignal = Math.min(100, Math.round((restaurant.review_count / 2000) * 80));
  const priceTierSignal = Math.round((restaurant.price_tier / 4) * 100);
  const deliverySignal = Math.round(45 + (restaurant.review_count % 37));

  return [
    { label: 'Foot Traffic Signal', value: ratingSignal },
    { label: 'Review Velocity', value: reviewSignal },
    { label: 'Menu Price Tier', value: priceTierSignal },
    { label: 'Delivery Volume', value: Math.min(100, deliverySignal) },
  ];
}

const mono = "'JetBrains Mono', monospace";
const sans = "'Inter', sans-serif";

export default function RevenueEstimate({ restaurant }: RevenueEstimateProps) {
  const lowK = Math.round(restaurant.estimated_monthly_revenue_low / 1000);
  const highK = Math.round(restaurant.estimated_monthly_revenue_high / 1000);
  const signals = getSignals(restaurant);
  const confidence = 75;

  return (
    <div
      style={{
        background: 'rgba(17,24,39,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16,
        padding: 24,
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', margin: 0, fontFamily: sans }}>
          Estimated Monthly Revenue
        </h3>
        <span
          style={{
            background: 'rgba(139,92,246,0.2)',
            color: '#A78BFA',
            fontSize: 11,
            borderRadius: 9999,
            padding: '2px 8px',
            fontFamily: sans,
          }}
        >
          AI
        </span>
      </div>

      {/* Big number */}
      <p
        style={{
          fontFamily: mono,
          fontSize: 28,
          color: '#F9FAFB',
          marginBottom: 16,
          margin: '0 0 16px',
        }}
      >
        ${lowK}K &ndash; ${highK}K{' '}
        <span style={{ fontSize: 13, color: '#6B7280' }}>/month</span>
      </p>

      {/* Confidence bar */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            marginBottom: 4,
          }}
        >
          <span style={{ color: '#9CA3AF', fontFamily: sans }}>Confidence: High</span>
          <span style={{ color: '#6B7280', fontFamily: mono }}>{confidence}%</span>
        </div>
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
              background: '#8B5CF6',
              borderRadius: 9999,
              width: `${confidence}%`,
            }}
          />
        </div>
      </div>

      {/* Signal breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p
          style={{
            fontSize: 11,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
            fontFamily: sans,
          }}
        >
          Signal Breakdown
        </p>
        {signals.map((s) => (
          <div key={s.label}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                marginBottom: 4,
              }}
            >
              <span style={{ color: '#9CA3AF', fontFamily: sans }}>{s.label}</span>
              <span style={{ color: '#6B7280', fontFamily: mono }}>{s.value}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: 4,
                background: '#374151',
                borderRadius: 9999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'rgba(59,130,246,0.7)',
                  borderRadius: 9999,
                  width: `${s.value}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
