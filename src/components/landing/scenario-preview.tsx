"use client";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { ArrowRight, MessageSquare, FileText, Share2, HelpCircle } from "lucide-react";

const flowSteps = [
  {
    icon: MessageSquare,
    label: "Your scenario",
    content: '"What happens if I resign after 6 months?"',
  },
  {
    icon: FileText,
    label: "Relevant clause",
    content: "Clause 8.2\n60-day notice requirement",
  },
  {
    icon: Share2,
    label: "Obligation",
    content: "Written notice required",
  },
  {
    icon: Share2,
    label: "Related clause",
    content: "Clause 12.3\nPost-employment restriction",
  },
  {
    icon: HelpCircle,
    label: "Professional question",
    content: "Discuss how this applies to your specific situation.",
  },
];

export function ScenarioPreview() {
  return (
    <section className="py-24 sm:py-32 bg-cg-card border-t border-cg-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-20">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-cg-muted mb-4">
              Don&apos;t just read the contract.
            </p>
            <h2 className="font-heading text-5xl sm:text-6xl text-cg-dark mb-5">
              Test it.
            </h2>
            <p className="text-[15px] text-cg-muted max-w-xl mx-auto">
              Explore hypothetical situations using the clauses in your document.
            </p>
          </div>
        </FadeIn>

        <div className="w-full overflow-x-auto pb-8">
          <StaggerContainer
            className="flex items-stretch justify-center min-w-max md:min-w-0"
            staggerDelay={0.15}
          >
            {flowSteps.map((step, i) => (
              <div key={i} className="flex items-center">
                <StaggerItem>
                  <div className="w-40 sm:w-48 bg-white border border-cg-border rounded-lg p-5 flex flex-col items-center text-center h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-cg-background mb-4">
                      <step.icon className="size-4 text-cg-muted" strokeWidth={1.5} />
                    </div>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-cg-dark mb-3">
                      {step.label}
                    </p>
                    <p className="text-[12px] leading-relaxed text-cg-muted whitespace-pre-line">
                      {step.content}
                    </p>
                  </div>
                </StaggerItem>

                {i < flowSteps.length - 1 && (
                  <StaggerItem>
                    <div className="px-3 sm:px-5 flex items-center justify-center text-cg-border">
                      <ArrowRight className="size-4" />
                    </div>
                  </StaggerItem>
                )}
              </div>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
