import { BarChart3 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <BarChart3 className="w-4 h-4 text-blue-500/60" />
          <span>&copy; 2025 DineSignal. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="#platform" className="text-gray-500 hover:text-gray-300 transition-colors">Platform</a>
          <a href="#pricing" className="text-gray-500 hover:text-gray-300 transition-colors">Pricing</a>
          <a href="#about" className="text-gray-500 hover:text-gray-300 transition-colors">About</a>
          <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
