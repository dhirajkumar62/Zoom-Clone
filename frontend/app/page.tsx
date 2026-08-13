'use client';

import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import LandingHero from '@/components/landing/LandingHero';
import ActionCards from '@/components/landing/ActionCards';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorks from '@/components/landing/HowItWorks';
import ProductPreview from '@/components/landing/ProductPreview';
import TrustSection from '@/components/landing/TrustSection';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-gray-100 selection:bg-blue-500 selection:text-white">
      {/* Sticky Marketing Navbar */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        <LandingHero />
        <ActionCards />
        <FeaturesSection />
        <HowItWorks />
        <ProductPreview />
        <TrustSection />
        <LandingCTA />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
