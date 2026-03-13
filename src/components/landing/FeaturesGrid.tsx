import { BarChart3, DollarSign, TrendingUp, Bell } from 'lucide-react';
import type { ElementType } from 'react';

const FEATURES: { icon: ElementType; color: string; title: string; description: string }[] = [
  {
    icon: BarChart3,
    color: '#3B82F6',
    title: 'Competitor Price Tracking',
    description: 'Monitor every menu item from competitors within a configurable radius. Prices update automatically from public sources.',
  },
  {
    icon: DollarSign,
    color: '#10B981',
    title: 'Revenue Gap Analysis',
    description: 'See exactly how much revenue you leave on the table per item, per week, per year. Prioritized by impact.',
  },
  {
    icon: TrendingUp,
    color: '#8B5CF6',
    title: 'Market Positioning',
    description: 'Understand your price percentile for every item relative to your local market — broken down by cuisine and tier.',
  },
  {
    icon: Bell,
    color: '#F59E0B',
    title: 'Price Change Alerts',
    description: 'Get notified when competitors raise or lower prices. Stay ahead of market shifts before they hit your bottom line.',
  },
];

export default function FeaturesGrid() {
  return (
    <section id="platform" style={{ padding: '80px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '8px' }}>
        Enterprise-grade intelligence
      </h2>
      <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '48px', fontSize: '15px' }}>
        Everything you need to price with confidence.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} style={{
              background: 'rgba(17,24,39,0.7)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '16px',
              padding: '32px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${f.color}15`,
                border: `1px solid ${f.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <Icon style={{ width: '24px', height: '24px', color: f.color }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1.6 }}>{f.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
