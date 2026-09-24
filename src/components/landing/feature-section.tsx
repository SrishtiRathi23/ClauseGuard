"use client";

import {
  FileText,
  ListTodo,
  GitCompareArrows,
  HelpCircle,
  Share2,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

const features = [
  {
    icon: FileText,
    title: "Clause Explorer",
    subtitle: "See what each clause actually says.",
    details: ["Original language", "Plain explanation", "Source reference"],
  },
  {
    icon: ListTodo,
    title: "Obligation Map",
    subtitle: "Know who has to do what.",
    details: ["Deadlines", "Responsibilities", "Continuing obligations"],
  },
  {
    icon: Share2,
    title: "Scenario Lab",
    subtitle: "What happens if...?",
    details: ["Explore real scenarios", "See clause relationships", "Understand consequences"],
  },
  {
    icon: GitCompareArrows,
    title: "Semantic Compare",
    subtitle: "Don't just see what changed. Understand what changed.",
    details: ["Meaningful differences", "Added or removed clauses", "Practical impact"],
  },
  {
    icon: HelpCircle,
    title: "Lawyer Questions",
    subtitle: "Turn uncertainty into focused questions.",
    details: ["Clause-linked questions", "Categorized by topic", "Downloadable brief"],
  },
];

export function FeatureSection() {
  return (
    <section className="py-24 sm:py-32 bg-transparent border-t border-cg-border">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-20">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-cg-muted mb-4">
              Key Features
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl text-cg-dark mb-4">
              More than a summary.
              <br />
              A deeper understanding.
            </h2>
          </div>
        </FadeIn>

        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 max-w-full mx-auto"
          staggerDelay={0.08}
        >
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white border border-cg-border mb-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <feature.icon className="size-5 text-cg-green" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-bold text-cg-dark mb-2">
                  {feature.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-cg-muted mb-5 min-h-[40px]">
                  {feature.subtitle}
                </p>

                <ul className="space-y-2.5 text-left w-full max-w-[200px] mx-auto">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2 text-[12px] text-cg-muted">
                      <svg className="w-3.5 h-3.5 text-cg-green shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
