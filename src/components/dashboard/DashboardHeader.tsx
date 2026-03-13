import { Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin } from 'lucide-react';
import type { Restaurant } from '@/lib/types';

interface DashboardHeaderProps {
  restaurant: Restaurant;
  opportunity: { monthly: number; yearly: number };
}

export default function DashboardHeader({ restaurant, opportunity }: DashboardHeaderProps) {
  const dollarSigns = '$'.repeat(restaurant.price_tier);

  return (
    <div style={{ marginBottom: 32 }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 14,
          color: '#9CA3AF',
          textDecoration: 'none',
          marginBottom: 16,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Back to Search
      </Link>

      <div
        style={{
          background: 'rgba(17,24,39,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 16,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Left side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#F9FAFB',
                fontFamily: "'Inter', sans-serif",
                margin: 0,
              }}
            >
              {restaurant.name}
            </h1>
            <span
              style={{
                background: 'rgba(59,130,246,0.2)',
                color: '#60A5FA',
                borderRadius: 9999,
                padding: '4px 12px',
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {restaurant.cuisine_type}
            </span>
            <span
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {dollarSigns}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 13,
              color: '#9CA3AF',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin style={{ width: 14, height: 14 }} />
              {restaurant.address}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 13,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#FBBF24',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Star style={{ width: 16, height: 16, fill: '#FBBF24', color: '#FBBF24' }} />
              {restaurant.rating}
            </span>
            <span
              style={{
                color: '#6B7280',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {restaurant.review_count.toLocaleString()} reviews
            </span>
          </div>
        </div>

        {/* Right side - opportunity */}
        <div
          style={{
            background: 'rgba(31,41,55,0.6)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 16,
            padding: '16px 24px',
            minWidth: 260,
            boxShadow: '0 0 30px rgba(16,185,129,0.08)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Potential Additional Revenue
          </p>
          <p
            style={{
              fontSize: 36,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#34D399',
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            +${opportunity.yearly.toLocaleString()}
            <span style={{ fontSize: 16, color: 'rgba(52,211,153,0.7)' }}>/year</span>
          </p>
          <p
            style={{
              fontSize: 18,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(52,211,153,0.6)',
              marginTop: 2,
              margin: 0,
            }}
          >
            +${opportunity.monthly.toLocaleString()}/month
          </p>
        </div>
      </div>
    </div>
  );
}
