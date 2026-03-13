import { Database, BarChart3, DollarSign } from 'lucide-react';
import type { ElementType } from 'react';

const STEPS: { icon: ElementType; title: string; description: string; color: string }[] = [
  {
    icon: Database,
    title: 'Connect',
    color: '#3B82F6',
    description: 'Enter your restaurant. We pull your menu from delivery platforms and public sources automatically.',
  },
  {
    icon: BarChart3,
    title: 'Analyze',
    color: '#8B5CF6',
    description: 'Our engine compares every item against nearby competitors, adjusted for cuisine type, location, and market tier.',
  },
  {
    icon: DollarSign,
    title: 'Profit',
    color: '#10B981',
    description: 'Get your pricing gap report with exact dollar amounts — how much to raise, which items, and projected revenue impact.',
  },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '80px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '8px' }}>
        How it works
      </h2>
      <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '48px', fontSize: '15px' }}>
        Three steps to uncover hidden revenue in your menu.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} style={{
              background: 'rgba(17,24,39,0.7)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: step.color,
                color: '#fff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {i + 1}
              </div>

              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${step.color}15`,
                border: `1px solid ${step.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Icon style={{ width: '24px', height: '24px', color: step.color }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1.6 }}>{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
