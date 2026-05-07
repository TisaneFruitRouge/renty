// import { useTranslations } from 'next-intl';

// Import components
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Pains from '../components/Pains';
import Features from '../components/Features';
import FounderConfig from '../components/FounderConfig';
import Trust from '../components/Trust';
// import Testimonials from './components/Testimonials';
import Pricing from '../components/Pricing';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Home() {
  
  return (
    <div className="min-h-screen overflow-x-hidden scroll-smooth">
      <Navbar />
      <Hero />
      <Pains />
      <Features />
      <FounderConfig />
      {/* <Testimonials /> */}
      <Pricing />
      <Trust />
      <CTA />
      <Footer />
    </div>
  );
}
