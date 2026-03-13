import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceEvent {
  id: number;
  restaurant: string;
  item: string;
  change: number;
  date: string;
}

const EVENTS: PriceEvent[] = [
  { id: 1, restaurant: "Oren's Hummus", item: 'Falafel Plate', change: 1.5, date: 'Mar 2' },
  { id: 2, restaurant: 'Tamarine', item: 'Lunch Special', change: -0.5, date: 'Feb 28' },
  { id: 3, restaurant: 'Nobu Palo Alto', item: 'Omakase Set', change: 5.0, date: 'Feb 25' },
  { id: 4, restaurant: 'Evvia Estiatorio', item: 'Grilled Lamb', change: 2.0, date: 'Feb 20' },
  { id: 5, restaurant: 'Burma Love', item: 'Tea Leaf Salad', change: -1.0, date: 'Feb 15' },
];

const mono = "'JetBrains Mono', monospace";
const sans = "'Inter', sans-serif";

export default function PriceTrends() {
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div
          style={{
            width: 6,
            height: 20,
            borderRadius: 9999,
            background: '#F59E0B',
          }}
        />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', margin: 0, fontFamily: sans }}>
          Recent Market Activity
        </h3>
      </div>

      {/* Events */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {EVENTS.map((e, idx) => {
          const isIncrease = e.change > 0;
          const isLast = idx === EVENTS.length - 1;
          return (
            <div
              key={e.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '8px 0',
                borderBottom: isLast ? 'none' : '1px solid rgba(31,41,55,0.4)',
              }}
            >
              {/* Dot */}
              <div
                style={{
                  marginTop: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: isIncrease ? '#EF4444' : '#10B981',
                }}
              />

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: '#E5E7EB', margin: 0, fontFamily: sans }}>
                  <span style={{ fontWeight: 500 }}>{e.restaurant}</span>{' '}
                  <span style={{ color: '#9CA3AF' }}>
                    {isIncrease ? 'raised' : 'lowered'}{' '}
                  </span>
                  <span style={{ color: '#D1D5DB' }}>{e.item}</span>{' '}
                  <span style={{ color: '#9CA3AF' }}>by </span>
                  <span
                    style={{
                      fontFamily: mono,
                      color: isIncrease ? '#EF4444' : '#34D399',
                    }}
                  >
                    ${Math.abs(e.change).toFixed(2)}
                  </span>
                </p>
              </div>

              {/* Right side */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {isIncrease ? (
                  <TrendingUp style={{ width: 14, height: 14, color: '#EF4444' }} />
                ) : (
                  <TrendingDown style={{ width: 14, height: 14, color: '#34D399' }} />
                )}
                <span style={{ fontSize: 11, color: '#6B7280', fontFamily: sans }}>
                  {e.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
