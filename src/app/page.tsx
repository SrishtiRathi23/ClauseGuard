import { Hero } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/trust-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeatureSection } from "@/components/landing/feature-section";
import { ScenarioPreview } from "@/components/landing/scenario-preview";
import { LegalBoundary } from "@/components/landing/legal-boundary";
import { FinalCTA } from "@/components/landing/final-cta";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <FeatureSection />
      <ScenarioPreview />
      <LegalBoundary />
      <FinalCTA />
    </div>
  );
}
