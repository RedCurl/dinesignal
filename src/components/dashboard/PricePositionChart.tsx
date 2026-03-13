import type { Restaurant, CompetitorCard } from '@/lib/types';
import { getMenuItemsByRestaurant } from '@/data';

interface PricePositionChartProps {
  restaurant: Restaurant;
  competitors: CompetitorCard[];
}

const mono = "'JetBrains Mono', monospace";
const sans = "'Inter', sans-serif";

export default function PricePositionChart({ restaurant, competitors }: PricePositionChartProps) {
  const myItems = getMenuItemsByRestaurant(restaurant.id);
  const myEntrees = myItems.filter((i) => i.category === 'entree');
  const myAvg =
    myEntrees.length > 0
      ? myEntrees.reduce((s, i) => s + i.price, 0) / myEntrees.length
      : 0;

  const allPrices = [myAvg, ...competitors.map((c) => c.avg_entree_price)].filter((p) => p > 0);
  if (allPrices.length === 0) return null;

  const minPrice = Math.floor(Math.min(...allPrices) - 2);
  const maxPrice = Math.ceil(Math.max(...allPrices) + 2);
  const range = maxPrice - minPrice;

  function pct(price: number) {
    return ((price - minPrice) / range) * 100;
  }

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
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', margin: '0 0 4px', fontFamily: sans }}>
        Your Price Position vs. Nearby Competitors
      </h3>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 24px', fontFamily: sans }}>
        Average entree price comparison
      </p>

      <div style={{ position: 'relative', padding: '32px 0' }}>
        {/* Axis line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            background: '#374151',
          }}
        />

        {/* Min price label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            marginTop: 24,
            left: 0,
            fontSize: 11,
            color: '#6B7280',
            fontFamily: mono,
          }}
        >
          ${minPrice}
        </div>

        {/* Max price label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            marginTop: 24,
            right: 0,
            fontSize: 11,
            color: '#6B7280',
            fontFamily: mono,
          }}
        >
          ${maxPrice}
        </div>

        {/* Competitor dots */}
        {competitors.map((c) => {
          const left = pct(c.avg_entree_price);
          return (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                left: `${left}%`,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: '#6B7280',
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                  transform: 'translateY(-16px)',
                  fontFamily: sans,
                }}
              >
                {c.name.length > 14 ? c.name.slice(0, 14) + '...' : c.name}
              </span>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'rgba(107,114,128,0.6)',
                  border: '1px solid #6B7280',
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: '#4B5563',
                  fontFamily: mono,
                  marginTop: 4,
                  transform: 'translateY(4px)',
                }}
              >
                ${c.avg_entree_price.toFixed(0)}
              </span>
            </div>
          );
        })}

        {/* This restaurant dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            left: `${pct(myAvg)}%`,
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: '#60A5FA',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              marginBottom: 4,
              transform: 'translateY(-16px)',
              fontFamily: sans,
            }}
          >
            {restaurant.name}
          </span>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#3B82F6',
              border: '2px solid #93C5FD',
              boxShadow: '0 0 12px rgba(59,130,246,0.5)',
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: '#60A5FA',
              fontFamily: mono,
              fontWeight: 700,
              marginTop: 4,
              transform: 'translateY(4px)',
            }}
          >
            ${myAvg.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
