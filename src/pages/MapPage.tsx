import MarketMap from '@/components/map/MarketMap';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Navbar */}
      <nav className="border-b border-blue-500/10 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-gray-50 font-bold text-lg hover:text-blue-400 transition-colors">
            <span className="text-blue-400">Dine</span>Signal
          </a>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="/" className="hover:text-gray-200 transition-colors">Home</a>
            <a href="/map" className="text-blue-400">Map</a>
            <a href="/compare" className="hover:text-gray-200 transition-colors">Compare</a>
            <a href="/search" className="hover:text-gray-200 transition-colors">Search</a>
          </div>
        </div>
      </nav>

      <main className="pb-8">
        <MarketMap />
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-500/10 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-500">
          DineSignal — Restaurant Pricing Intelligence Platform
        </div>
      </footer>
    </div>
  );
}
