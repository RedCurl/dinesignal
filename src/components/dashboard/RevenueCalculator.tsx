import { useState, useMemo } from 'react';
import { DollarSign, Zap } from 'lucide-react';
import type { PricingComparison } from '@/lib/types';

interface RevenueCalculatorProps {
  comparisons: PricingComparison[];
}

const mono = "'JetBrains Mono', monospace";
const sans = "'Inter', sans-serif";

export default function RevenueCalculator({ comparisons }: RevenueCalculatorProps) {
  // Only show underpriced items (delta < 0 means your price is below market)
  const underpricedItems = useMemo(
    () => comparisons.filter((c) => c.delta < 0).sort((a, b) => a.annual_impact - b.annual_impact),
    [comparisons],
  );

  // Track slider values: key = item_name, value = selected new price
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    underpricedItems.forEach((item) => {
      init[item.item_name] = item.your_price;
    });
    return init;
  });

  const handleSliderChange = (itemName: string, value: number) => {
    setSliderValues((prev) => ({ ...prev, [itemName]: value }));
  };

  // Calculate totals
  const impacts = underpricedItems.map((item) => {
    const newPrice = sliderValues[item.item_name] ?? item.your_price;
    const diff = newPrice - item.your_price;
    const annualImpact = Math.round(diff * item.weekly_volume * 52);
    return { ...item, newPrice, diff, annualImpact };
  });

  const totalAnnual = impacts.reduce((s, i) => s + i.annualImpact, 0);
  const totalMonthly = Math.round(totalAnnual / 12);
  const avgIncrease = impacts.length > 0
    ? impacts.reduce((s, i) => s + i.diff, 0) / impacts.length
    : 0;

  if (underpricedItems.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(17,24,39,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(16,185,129,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DollarSign style={{ width: 20, height: 20, color: '#34D399' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F9FAFB', margin: 0, fontFamily: sans }}>
            Revenue Impact Calculator
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0', fontFamily: sans }}>
            Adjust prices to see your potential revenue increase
          </p>
        </div>
      </div>

      {/* Items table */}
      <div style={{ marginTop: 20 }}>
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 90px 1fr 90px 120px',
            gap: 12,
            padding: '8px 16px',
            borderBottom: '1px solid rgba(59,130,246,0.1)',
            alignItems: 'center',
          }}
        >
          {['Item', 'Current', 'Adjust Price', 'New Price', 'Impact'].map((label) => (
            <span
              key={label}
              style={{
                fontSize: 10,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#6B7280',
                fontFamily: sans,
                textAlign: label === 'Impact' ? 'right' : 'left',
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {impacts.map((item, i) => {
          const pctFilled =
            item.market_avg > item.your_price
              ? ((item.newPrice - item.your_price) / (item.market_avg - item.your_price)) * 100
              : 0;

          return (
            <div
              key={item.item_name}
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 90px 1fr 90px 120px',
                gap: 12,
                padding: '12px 16px',
                alignItems: 'center',
                background: i % 2 === 0 ? 'rgba(17,24,39,0.3)' : 'transparent',
                borderRadius: 8,
              }}
            >
              {/* Item name */}
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F3F4F6', fontFamily: sans }}>
                  {item.item_name}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 11,
                    color: '#6B7280',
                    fontFamily: sans,
                    marginTop: 2,
                  }}
                >
                  Mkt avg: <span style={{ fontFamily: mono }}>${item.market_avg.toFixed(2)}</span>
                </span>
              </div>

              {/* Current price */}
              <span style={{ fontFamily: mono, fontSize: 13, color: '#9CA3AF' }}>
                ${item.your_price.toFixed(2)}
              </span>

              {/* Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  {/* Track background */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      left: 0,
                      right: 0,
                      height: 6,
                      background: '#1F2937',
                      borderRadius: 9999,
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Filled track */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      left: 0,
                      width: `${Math.min(100, Math.max(0, pctFilled))}%`,
                      height: 6,
                      background: item.annualImpact > 0 ? '#10B981' : '#374151',
                      borderRadius: 9999,
                      pointerEvents: 'none',
                      transition: 'width 0.05s ease',
                    }}
                  />
                  <input
                    type="range"
                    min={item.your_price * 100}
                    max={item.market_avg * 100}
                    step={5}
                    value={Math.round(item.newPrice * 100)}
                    onChange={(e) => handleSliderChange(item.item_name, Number(e.target.value) / 100)}
                    style={{
                      width: '100%',
                      height: 20,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 2,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* New price */}
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 14,
                  fontWeight: 600,
                  color: item.annualImpact > 0 ? '#34D399' : '#9CA3AF',
                }}
              >
                ${item.newPrice.toFixed(2)}
              </span>

              {/* Impact */}
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 13,
                  fontWeight: 600,
                  color: item.annualImpact > 0 ? '#34D399' : '#374151',
                  textAlign: 'right',
                }}
              >
                {item.annualImpact > 0 ? `+$${item.annualImpact.toLocaleString()}/yr` : '\u2014'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div
        style={{
          marginTop: 20,
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 12,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap style={{ width: 20, height: 20, color: '#34D399' }} />
          <div>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: sans }}>
              Total additional revenue
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 2 }}>
              <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: '#34D399' }}>
                +${totalAnnual.toLocaleString()}/year
              </span>
              <span style={{ fontFamily: mono, fontSize: 14, color: 'rgba(52,211,153,0.7)' }}>
                +${totalMonthly.toLocaleString()}/month
              </span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: sans, display: 'block' }}>
            Avg price increase
          </span>
          <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 600, color: '#F9FAFB', marginTop: 2, display: 'block' }}>
            +${avgIncrease.toFixed(2)} <span style={{ fontSize: 12, color: '#6B7280' }}>per item</span>
          </span>
        </div>
      </div>
    </div>
  );
}
