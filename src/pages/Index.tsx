import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TickerBar from "@/components/landing/TickerBar";
import MarketsSection from "@/components/landing/MarketsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import FeesSection from "@/components/landing/FeesSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TickerBar />
      <MarketsSection />
      <FeaturesSection />
      <FeesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
