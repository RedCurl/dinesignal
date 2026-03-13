import { useParams, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import {
  getRestaurantById,
  getPricingComparison,
  getCompetitors,
  getRestaurantOpportunity,
  restaurants,
} from '@/data';
import Navbar from '@/components/landing/Navbar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickStats from '@/components/dashboard/QuickStats';
import PricingTable from '@/components/dashboard/PricingTable';
import MiniMap from '@/components/dashboard/MiniMap';
import RevenueCalculator from '@/components/dashboard/RevenueCalculator';
import CompetitorCards from '@/components/dashboard/CompetitorCards';
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
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0E1A',
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Main content — offset for fixed navbar */}
      <div
        style={{
          maxWidth: 1360,
          margin: '0 auto',
          padding: '0 40px',
          paddingTop: 96,
          paddingBottom: 48,
        }}
      >
        {/* 1. Dashboard Header */}
        <DashboardHeader restaurant={restaurant} opportunity={opportunity} />

        {/* 2. Quick Stats Row */}
        <QuickStats comparisons={comparisons} opportunity={opportunity} />

        {/* 3. Two-column: Pricing Table (60%) + Mini Map (40%) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '3fr 2fr',
            gap: 24,
            marginBottom: 32,
            alignItems: 'start',
          }}
        >
          <PricingTable comparisons={comparisons} />
          <MiniMap
            restaurant={restaurant}
            competitors={competitors}
            allRestaurants={restaurants}
          />
        </div>

        {/* 4. Full-width: Revenue Calculator */}
        <RevenueCalculator comparisons={comparisons} />

        {/* 5. Two-column: Competitor Cards + Price Trends */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '3fr 2fr',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <CompetitorCards competitors={competitors} restaurantId={id} />
          <PriceTrends />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0E1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(17,24,39,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <AlertTriangle style={{ width: 48, height: 48, color: '#F87171' }} />
        </div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#F9FAFB',
            marginBottom: 8,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Restaurant Not Found
        </h2>
        <p
          style={{
            color: '#9CA3AF',
            marginBottom: 16,
            fontSize: 14,
            lineHeight: 1.5,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          The restaurant you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            background: '#3B82F6',
            color: '#FFFFFF',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
