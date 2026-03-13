import { Database, BarChart3, DollarSign } from 'lucide-react';

const STEPS = [
  {
    icon: Database,
    title: 'Connect',
    description:
      'Enter your restaurant. We pull your menu from delivery platforms and public sources automatically.',
  },
  {
    icon: BarChart3,
    title: 'Analyze',
    description:
      'Our engine compares every item against nearby competitors, adjusted for cuisine type, location, and market tier.',
  },
  {
    icon: DollarSign,
    title: 'Profit',
    description:
      'Get your pricing gap report with exact dollar amounts — how much to raise, which items, and projected revenue impact.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-4">How it works</h2>
        <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
          Three steps to uncover hidden revenue in your menu.
        </p>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-8 text-center relative"
              >
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {i + 1}
                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
