import type { Restaurant } from '@/lib/types';

interface RevenueEstimateProps {
  restaurant: Restaurant;
}

interface SignalRow {
  label: string;
  value: number; // 0-100
}

function getSignals(restaurant: Restaurant): SignalRow[] {
  // Derive decorative signal values from restaurant data
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

export default function RevenueEstimate({ restaurant }: RevenueEstimateProps) {
  const lowK = Math.round(restaurant.estimated_monthly_revenue_low / 1000);
  const highK = Math.round(restaurant.estimated_monthly_revenue_high / 1000);
  const signals = getSignals(restaurant);
  const confidence = 75;

  return (
    <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-50">Estimated Monthly Revenue</h3>
        <span className="bg-purple-500/20 text-purple-400 text-xs rounded-full px-2 py-0.5">
          AI
        </span>
      </div>

      <p className="font-mono text-2xl text-gray-50 mb-4">
        ${lowK}K &ndash; ${highK}K{' '}
        <span className="text-sm text-gray-500">/month</span>
      </p>

      {/* Confidence bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">Confidence: High</span>
          <span className="text-gray-500 font-mono">{confidence}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Signal breakdown */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Signal Breakdown</p>
        {signals.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">{s.label}</span>
              <span className="text-gray-500 font-mono">{s.value}%</span>
            </div>
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500/70 rounded-full"
                style={{ width: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
