import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import LiveDataTable from '@/components/landing/LiveDataTable';
import StatsBar from '@/components/landing/StatsBar';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Navbar />
      <HeroSection />
      <LiveDataTable />
      <StatsBar />
      <HowItWorks />
      <FeaturesGrid />
      <CTASection />
      <Footer />
    </div>
  );
}
