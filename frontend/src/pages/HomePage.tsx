import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AboutSection from '../components/public/AboutSection';
import AwardsSection from '../components/public/AwardsSection';
import ContactSection from '../components/public/ContactSection';
import FeaturedCarousel from '../components/public/FeaturedCarousel';
import HeroSection from '../components/public/HeroSection';
import ExperienceSection from '../components/public/ExperienceSection';
import PricingSection from '../components/public/PricingSection';
import ServicesSection from '../components/public/ServicesSection';
import SignatureMomentsSection from '../components/public/SignatureMomentsSection';
import TestimonialsSection from '../components/public/TestimonialsSection';
import Seo from '../seo/Seo';

export default function HomePage() {
  const { hash } = useLocation();

  // Support /#about style navigation from other pages.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <Seo />
      <HeroSection />
      <SignatureMomentsSection />
      <AboutSection />
      <ServicesSection />
      <PricingSection />
      <ExperienceSection />
      <FeaturedCarousel />
      <AwardsSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
