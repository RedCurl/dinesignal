import { useParams, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import {
  getRestaurantById,
  getPricingComparison,
  getCompetitors,
  getRestaurantOpportunity,
} from '@/data';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PricingTable from '@/components/dashboard/PricingTable';
import RevenueEstimate from '@/components/dashboard/RevenueEstimate';
import CompetitorCards from '@/components/dashboard/CompetitorCards';
import PricePositionChart from '@/components/dashboard/PricePositionChart';
import PriceTrends from '@/components/dashboard/PriceTrends';

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <NotFound />;
  }

  let restaurant;
  try {
    restaurant = getRestaurantById(id);
  } catch {
    return <NotFound />;
  }

  const comparisons = getPricingComparison(id);
  const competitors = getCompetitors(id);
  const opportunity = getRestaurantOpportunity(id);

  return (
    <div className="min-h-screen bg-[#0A0E1A] px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <DashboardHeader restaurant={restaurant} opportunity={opportunity} />

      <PricingTable comparisons={comparisons} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueEstimate restaurant={restaurant} />
        <CompetitorCards competitors={competitors} restaurantId={id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PricePositionChart restaurant={restaurant} competitors={competitors} />
        <PriceTrends />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-red-500/20 rounded-xl p-8 text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-50 mb-2">Restaurant Not Found</h2>
        <p className="text-gray-400 mb-4">
          The restaurant you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
