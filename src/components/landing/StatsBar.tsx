import { useEffect, useState, useRef } from 'react';

interface Stat {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  accent: string;
}

const STATS: Stat[] = [
  { value: 12847, label: 'Restaurants Tracked', suffix: '', accent: 'border-blue-500' },
  { value: 2.4,   label: 'Menu Items Analyzed', suffix: 'M', accent: 'border-blue-500' },
  { value: 137,   label: 'Avg Revenue Left on Table', prefix: '$', suffix: 'K', accent: 'border-green-500' },
  { value: 30,    label: 'Time to First Insight', prefix: '< ', suffix: 's', accent: 'border-white/50' },
];

function useCountUp(target: number, duration = 2000) {
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
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * target);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function StatCard({ stat }: { stat: Stat }) {
  const { value, ref } = useCountUp(stat.value);

  const display =
    stat.value >= 100
      ? Math.round(value).toLocaleString()
      : stat.value >= 1
        ? value.toFixed(1)
        : Math.round(value).toString();

  return (
    <div
      ref={ref}
      className={`bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 border-t-2 ${stat.accent} rounded-xl p-6 text-center`}
    >
      <p className="font-mono text-3xl font-bold text-white">
        {stat.prefix ?? ''}
        {display}
        {stat.suffix ?? ''}
      </p>
      <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
