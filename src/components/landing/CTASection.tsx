import { ChevronRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-32 px-6 relative">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(59,130,246,0.08),transparent)]" />

      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Stop guessing. Start seeing.
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Join the restaurants using data to price smarter.
        </p>

        <a
          href="#hero"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-lg transition-colors text-sm"
        >
          Get Your Free Report
          <ChevronRight className="w-4 h-4" />
        </a>

        <p className="text-gray-600 text-sm mt-4">
          No credit card required &middot; Results in 30 seconds
        </p>
      </div>
    </section>
  );
}
