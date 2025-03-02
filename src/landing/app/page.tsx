// import { useTranslations } from 'next-intl';

// Import components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import LandlordFeatures from './components/LandlordFeatures';
import TenantFeatures from './components/TenantFeatures';
// import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function Home() {
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <LandlordFeatures />
      <TenantFeatures />
      {/* <Testimonials /> */}
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}