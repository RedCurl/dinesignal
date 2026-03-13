import { BarChart3, DollarSign, TrendingUp, Bell } from 'lucide-react';

const FEATURES = [
  {
    icon: BarChart3,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Competitor Price Tracking',
    description:
      'Monitor every menu item from competitors within a configurable radius. Prices update automatically from public sources.',
  },
  {
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'Revenue Gap Analysis',
    description:
      'See exactly how much revenue you leave on the table per item, per week, per year. Prioritized by impact.',
  },
  {
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'Market Positioning',
    description:
      'Understand your price percentile for every item relative to your local market — broken down by cuisine and tier.',
  },
  {
    icon: Bell,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    title: 'Price Change Alerts',
    description:
      'Get notified when competitors raise or lower prices. Stay ahead of market shifts before they hit your bottom line.',
  },
];

export default function FeaturesGrid() {
  return (
    <section id="platform" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Enterprise-grade intelligence</h2>
        <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
          Everything you need to price with confidence.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-8"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} border flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
