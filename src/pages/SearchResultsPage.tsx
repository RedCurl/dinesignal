import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import SearchResults from '@/components/shared/SearchResults';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  }

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
            <a href="/map" className="hover:text-gray-200 transition-colors">Map</a>
            <a href="/compare" className="hover:text-gray-200 transition-colors">Compare</a>
            <a href="/search" className="text-blue-400">Search</a>
          </div>
        </div>
      </nav>

      <main className="pb-8">
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search restaurants by name, cuisine, or location..."
              className="w-full bg-gray-900/70 border border-blue-500/20 rounded-xl pl-12 pr-28 py-3.5 text-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        <SearchResults query={query} />
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
