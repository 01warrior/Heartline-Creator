import React from 'react';
import { LandingHeader } from '../components/landing/LandingHeader';
import { HeroSection } from '../components/landing/HeroSection';
import { DemoShowcaseSection } from '../components/landing/DemoShowcaseSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { StyleGallerySection } from '../components/landing/StyleGallerySection';
import { SecuritySection } from '../components/landing/SecuritySection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { FaqSection } from '../components/landing/FaqSection';
import { CtaFinalSection } from '../components/landing/CtaFinalSection';
import { LandingFooter } from '../components/landing/LandingFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1A1A1A] font-sans selection:bg-[#C5A880] selection:text-white relative overflow-x-clip">
      <LandingHeader />
      <HeroSection />
      <DemoShowcaseSection />
      <FeaturesSection />
      <StyleGallerySection />
      <SecuritySection />
      <TestimonialsSection />
      <FaqSection />
      <CtaFinalSection />
      <LandingFooter />
    </div>
  );
}
