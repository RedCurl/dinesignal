import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Restaurant, CompetitorCard } from '@/lib/types';

interface MiniMapProps {
  restaurant: Restaurant;
  competitors: CompetitorCard[];
  allRestaurants: Restaurant[];
}

const mono = "'JetBrains Mono', monospace";
const sans = "'Inter', sans-serif";

export default function MiniMap({ restaurant, competitors, allRestaurants }: MiniMapProps) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerWidth = 460;
  const containerHeight = 400;
  const padding = 40;

  // Build competitor lookup for lat/lng from allRestaurants
  const competitorRestaurants = useMemo(() => {
    const ids = new Set(competitors.map((c) => c.id));
    return allRestaurants.filter((r) => ids.has(r.id));
  }, [competitors, allRestaurants]);

  const bounds = useMemo(() => {
    const points = [restaurant, ...competitorRestaurants];
    const lats = points.map((r) => r.latitude);
    const lngs = points.map((r) => r.longitude);
    const pad = 0.002;
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    };
  }, [restaurant, competitorRestaurants]);

  function toPixel(lat: number, lng: number) {
    const latRange = bounds.maxLat - bounds.minLat || 0.01;
    const lngRange = bounds.maxLng - bounds.minLng || 0.01;
    const x = padding + ((lng - bounds.minLng) / lngRange) * (containerWidth - padding * 2);
    const y = padding + ((bounds.maxLat - lat) / latRange) * (containerHeight - padding * 2);
    return { x, y };
  }


  return (
    <div
      style={{
        background: 'rgba(17,24,39,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16,
        padding: 24,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <MapPin style={{ width: 18, height: 18, color: '#3B82F6' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', margin: 0, fontFamily: sans }}>
          Competitor Map
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

      {/* Map Area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: 1,
          minHeight: 300,
          background: 'rgba(10,14,26,0.6)',
          borderRadius: 12,
          border: '1px solid rgba(59,130,246,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.08 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 10 }, (_, i) => {
            const y = (containerHeight / 10) * (i + 1);
            return (
              <line key={`h-${i}`} x1="0" y1={y} x2="100%" y2={y} stroke="#3B82F6" strokeWidth="0.5" />
            );
          })}
          {Array.from({ length: 12 }, (_, i) => {
            const pct = ((i + 1) / 12) * 100;
            return (
              <line key={`v-${i}`} x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%" stroke="#3B82F6" strokeWidth="0.5" />
            );
          })}
        </svg>

        {/* Competitor dots */}
        {competitorRestaurants.map((cr) => {
          const comp = competitors.find((c) => c.id === cr.id);
          if (!comp) return null;
          const { x, y } = toPixel(cr.latitude, cr.longitude);
          const isHovered = hoveredId === cr.id;
          const leftPct = (x / containerWidth) * 100;
          const topPct = (y / containerHeight) * 100;

          return (
            <div
              key={cr.id}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.5)' : 'scale(1)'}`,
                zIndex: isHovered ? 40 : 10,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={() => setHoveredId(cr.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => navigate(`/compare?a=${restaurant.id}&b=${cr.id}`)}
            >
              {/* Glow */}
              <div
                style={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  left: -5,
                  top: -5,
                  borderRadius: '50%',
                  background: 'rgba(107,114,128,0.2)',
                  filter: 'blur(3px)',
                }}
              />
              {/* Dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isHovered ? '#9CA3AF' : 'rgba(107,114,128,0.6)',
                  border: '1.5px solid rgba(107,114,128,0.8)',
                  boxShadow: isHovered ? '0 0 8px rgba(107,114,128,0.5)' : 'none',
                }}
              />

              {/* Tooltip */}
              {isHovered && comp && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 50,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(17,24,39,0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      whiteSpace: 'nowrap',
                      minWidth: 180,
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#F9FAFB', margin: 0, fontFamily: sans }}>
                      {comp.name}
                    </p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11, color: '#9CA3AF', fontFamily: sans }}>
                      <span>{comp.distance} mi</span>
                      <span style={{ color: '#374151' }}>|</span>
                      <span style={{ fontFamily: mono, color: '#34D399' }}>${comp.avg_entree_price.toFixed(2)} avg</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* User's restaurant — big blue dot */}
        {(() => {
          const { x, y } = toPixel(restaurant.latitude, restaurant.longitude);
          const leftPct = (x / containerWidth) * 100;
          const topPct = (y / containerHeight) * 100;
          return (
            <div
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 30,
              }}
            >
              {/* Outer glow */}
              <div
                style={{
                  position: 'absolute',
                  width: 36,
                  height: 36,
                  left: -9,
                  top: -9,
                  borderRadius: '50%',
                  background: 'rgba(59,130,246,0.15)',
                  filter: 'blur(6px)',
                }}
              />
              {/* Dot */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#3B82F6',
                  border: '2.5px solid #93C5FD',
                  boxShadow: '0 0 16px rgba(59,130,246,0.6)',
                }}
              />
              {/* Label */}
              <div
                style={{
                  position: 'absolute',
                  top: -22,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#60A5FA',
                  fontFamily: sans,
                }}
              >
                YOU
              </div>
            </div>
          );
        })()}
      </div>

      {/* Footer */}
      <p style={{ fontSize: 12, color: '#6B7280', margin: '12px 0 0', fontFamily: sans }}>
        Showing <span style={{ color: '#9CA3AF' }}>{competitors.length}</span> competitors within{' '}
        <span style={{ color: '#9CA3AF' }}>2 miles</span>
      </p>
    </div>
  );
}
