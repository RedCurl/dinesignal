import { useState } from 'react';
import { Search, ArrowUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchRestaurants } from '@/data';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const results = searchRestaurants(query);
    if (results.length > 0) {
      navigate(`/dashboard/${results[0].id}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        paddingTop: '140px',
        paddingBottom: '80px',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Radial glow overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.12), transparent)',
      }} />

      <div style={{
        position: 'relative',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center',
      }}>
        {/* Left */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '9999px',
            padding: '6px 16px',
            marginBottom: '24px',
          }}>
            <span style={{
              color: '#60A5FA',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Menu Pricing Intelligence
            </span>
          </div>

          <h1 style={{
            fontSize: '52px',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            The pricing intelligence platform for restaurants
          </h1>

          <p style={{
            fontSize: '17px',
            color: '#9CA3AF',
            marginTop: '20px',
            maxWidth: '480px',
            lineHeight: 1.6,
          }}>
            We analyze every competitor menu near you and show you exactly where
            you're underpriced — down to the dollar.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSubmit} style={{
            marginTop: '32px',
            display: 'flex',
            maxWidth: '500px',
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#6B7280',
              }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your restaurant name or address..."
                style={{
                  width: '100%',
                  background: 'rgba(31,41,55,0.5)',
                  border: '1px solid #374151',
                  borderRight: 'none',
                  borderRadius: '12px 0 0 12px',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                background: '#2563EB',
                color: '#fff',
                fontWeight: 500,
                padding: '14px 24px',
                borderRadius: '0 12px 12px 0',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Analyze
            </button>
          </form>

          {/* Sub-line */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#6B7280',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'inline-block',
              boxShadow: '0 0 8px #10B981',
            }} />
            Free report · 12,847 restaurants tracked · Updated in real-time
          </div>
        </div>

        {/* Right — mini dashboard preview */}
        <div>
          <div style={{
            background: 'rgba(17,24,39,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3), 0 0 40px rgba(59,130,246,0.05)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Revenue Gap Detected
                </p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#34D399', fontFamily: "'JetBrains Mono', monospace", marginTop: '4px' }}>
                  +$47,200<span style={{ fontSize: '16px', color: '#6B7280' }}>/yr</span>
                </p>
              </div>
              <div style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '8px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <ArrowUp style={{ width: '14px', height: '14px', color: '#34D399' }} />
                <span style={{ color: '#34D399', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>+18.3%</span>
              </div>
            </div>

            {/* Mini table */}
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                gap: '8px',
                fontSize: '10px',
                color: '#6B7280',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(55,65,81,0.5)',
              }}>
                <span>Item</span>
                <span style={{ textAlign: 'right' }}>Your Price</span>
                <span style={{ textAlign: 'right' }}>Market Avg</span>
                <span style={{ textAlign: 'right' }}>Delta</span>
              </div>
              {[
                { item: 'Grilled Salmon', yours: '$24.00', market: '$29.50', delta: '+$5.50' },
                { item: 'Lamb Chops', yours: '$32.00', market: '$38.00', delta: '+$6.00' },
                { item: 'Caesar Salad', yours: '$12.00', market: '$14.50', delta: '+$2.50' },
              ].map((row) => (
                <div
                  key={row.item}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                    gap: '8px',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(31,41,55,0.5)',
                  }}
                >
                  <span style={{ color: '#D1D5DB', fontSize: '13px' }}>{row.item}</span>
                  <span style={{ textAlign: 'right', color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>{row.yours}</span>
                  <span style={{ textAlign: 'right', color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>{row.market}</span>
                  <span style={{ textAlign: 'right', color: '#34D399', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500 }}>{row.delta}</span>
                </div>
              ))}
            </div>

            {/* Price position bar */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Price Position</span>
                <span style={{ color: '#60A5FA', fontFamily: "'JetBrains Mono', monospace" }}>32nd percentile</span>
              </div>
              <div style={{ height: '6px', background: '#1F2937', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '32%', background: 'linear-gradient(to right, #2563EB, #60A5FA)', borderRadius: '3px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#4B5563', fontFamily: "'JetBrains Mono', monospace", marginTop: '4px' }}>
                <span>Lowest</span>
                <span>Market Avg</span>
                <span>Highest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
