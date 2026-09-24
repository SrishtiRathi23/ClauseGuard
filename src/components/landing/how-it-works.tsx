"use client";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Add your legal document.",
  },
  {
    number: "02",
    title: "Understand",
    description:
      "ClauseGuard uses Gemini to extract clauses, obligations, deadlines and relationships.",
  },
  {
    number: "03",
    title: "Explore",
    description:
      "Ask what-if questions, compare versions and prepare questions for professional review.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-20">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-cg-muted mb-4">
              How it works
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl text-cg-dark mb-4">
              From legal jargon
              <br />
              to clarity.
            </h2>
          </div>
        </FadeIn>

        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative"
          staggerDelay={0.12}
        >
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-[1px] bg-cg-border/60 z-0" />

          {steps.map((step) => (
            <StaggerItem key={step.number}>
              <div className="relative flex flex-col items-center text-center z-10">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-cg-background border border-cg-border shadow-sm mb-6">
                  <span className="font-heading text-2xl text-cg-green">{step.number}</span>
                </div>
                <h3 className="text-base font-bold text-cg-dark mb-3">
                  {step.title}
                </h3>
                <p className="text-[14px] text-cg-muted leading-relaxed max-w-[260px]">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
