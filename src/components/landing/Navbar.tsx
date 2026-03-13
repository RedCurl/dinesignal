import { BarChart3 } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E1A]/80 backdrop-blur-xl border-b border-blue-500/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <span className="text-white font-bold text-lg tracking-tight">DineSignal</span>
        </a>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#platform" className="text-gray-400 hover:text-white transition-colors text-sm">Platform</a>
          <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a>
          <a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">About</a>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Log In</a>
          <a
            href="#hero"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get Early Access
          </a>
        </div>
      </div>
    </nav>
  );
}
