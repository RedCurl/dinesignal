import { useEffect, useState, useRef } from 'react';

interface Stat {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  borderColor: string;
}

const STATS: Stat[] = [
  { value: 12847, label: 'Restaurants Tracked', borderColor: '#3B82F6' },
  { value: 2.4, label: 'Menu Items Analyzed', suffix: 'M', borderColor: '#3B82F6' },
  { value: 137, label: 'Avg Revenue Left on Table', prefix: '$', suffix: 'K', borderColor: '#10B981' },
  { value: 30, label: 'Time to First Insight', prefix: '< ', suffix: 's', borderColor: 'rgba(255,255,255,0.3)' },
];

const mono = "'JetBrains Mono', monospace";

function StatCard({ stat }: { stat: Stat }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / 2000, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * stat.value);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat.value]);

  const display = stat.value >= 100
    ? Math.round(value).toLocaleString()
    : stat.value >= 1
      ? value.toFixed(1)
      : Math.round(value).toString();

  return (
    <div ref={ref} style={{
      background: 'rgba(17,24,39,0.7)',
      border: '1px solid rgba(59,130,246,0.2)',
      borderTop: `2px solid ${stat.borderColor}`,
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
    }}>
      <p style={{ fontFamily: mono, fontSize: '32px', fontWeight: 700, color: '#fff' }}>
        {stat.prefix ?? ''}{display}{stat.suffix ?? ''}
      </p>
      <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '8px' }}>{stat.label}</p>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section style={{ padding: '48px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
