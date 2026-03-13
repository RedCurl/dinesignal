import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CompetitorCard } from '@/lib/types';

interface CompetitorCardsProps {
  competitors: CompetitorCard[];
  restaurantId: string;
}

const mono = "'JetBrains Mono', monospace";
const sans = "'Inter', sans-serif";

export default function CompetitorCards({ competitors, restaurantId }: CompetitorCardsProps) {
  const shown = competitors.slice(0, 6);

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
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', margin: 0, fontFamily: sans }}>
          Nearby Competitors
        </h3>
        <span
          style={{
            background: 'rgba(59,130,246,0.2)',
            color: '#60A5FA',
            fontSize: 11,
            borderRadius: 9999,
            padding: '2px 8px',
            fontFamily: sans,
          }}
        >
          {competitors.length}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        {shown.map((c) => (
          <div
            key={c.id}
            style={{
              background: 'rgba(31,41,55,0.5)',
              border: '1px solid rgba(55,65,81,0.5)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <p
              style={{
                fontWeight: 700,
                color: '#F3F4F6',
                fontSize: 13,
                marginBottom: 6,
                fontFamily: sans,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: '0 0 6px',
              }}
            >
              {c.name}
            </p>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(59,130,246,0.15)',
                color: '#60A5FA',
                borderRadius: 9999,
                padding: '2px 8px',
                fontSize: 11,
                marginBottom: 8,
                fontFamily: sans,
              }}
            >
              {c.cuisine_type}
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#9CA3AF',
                marginBottom: 4,
                fontFamily: sans,
              }}
            >
              <span>{c.distance} mi</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#FBBF24' }}>
                <Star style={{ width: 12, height: 12, fill: '#FBBF24', color: '#FBBF24' }} />
                {c.rating}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <span style={{ fontFamily: mono, fontSize: 13, color: '#E5E7EB' }}>
                ${c.avg_entree_price.toFixed(2)}
                <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 4 }}>avg</span>
              </span>
              <Link
                to={`/compare?a=${restaurantId}&b=${c.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  fontSize: 11,
                  color: '#60A5FA',
                  textDecoration: 'none',
                  fontFamily: sans,
                }}
              >
                Compare
                <ArrowRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
