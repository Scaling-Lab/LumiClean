"use client";
import React, { useState } from "react";
import { HeroSection } from "./HeroSection";
import { ProblemSection } from "./ProblemSection";
import { IntroductionSection } from "./IntroductionSection";
import { BenefitsSection } from "./BenefitsSection";
import { TestimonialCarousel } from "./TestimonialCarousel";
import { ComparisonSection } from "./ComparisonSection";
import { PricingSection } from "./PricingSection";
import { GuaranteeSection } from "./GuaranteeSection";
import { FeatureSection } from "./FeatureSection";
import { HowToUseSection } from "./HowToUseSection";
import { FaqSection } from "./FaqSection";
import { Footer } from "./Footer";
import { Testimonial } from "./types";

const LumiCleanHomePage: React.FC = () => {
  const [testimonials] = useState<Testimonial[]>([
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/043c6d183cdca5fbab8c3dc3cb9327323f235e69",
      text: "I used to constantly worry about germs, especially with my kids. LUMICLEAN has been a game-changer. I finally feel like my home is truly clean, and I have so much more peace of mind.",
      author: "Jessica M.",
      role: "Mom of Two",
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/043c6d183cdca5fbab8c3dc3cb9327323f235e69",
      text: "As someone with allergies, this device has made a huge difference. The air feels cleaner and I've noticed less dust accumulation.",
      author: "Michael R.",
      role: "Allergy Sufferer",
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/043c6d183cdca5fbab8c3dc3cb9327323f235e69",
      text: "Perfect for my home office. I feel more confident about the air quality now that I'm working from home full-time.",
      author: "Sarah K.",
      role: "Remote Professional",
    },
  ]);

  return (
    <main className="flex overflow-hidden flex-col items-center mx-auto w-full bg-white max-w-[480px]">
      <HeroSection />
      <ProblemSection />
      <IntroductionSection />
      <BenefitsSection />
      <TestimonialCarousel testimonials={testimonials} />
      <ComparisonSection />
      <PricingSection />
      <GuaranteeSection />
      <FeatureSection />
      <HowToUseSection />
      <FaqSection />
      <Footer />
    </main>
  );
};

export default LumiCleanHomePage;
