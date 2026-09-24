"use client";

import { FileCheck, Target, MessageSquareText } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

const values = [
  {
    icon: FileCheck,
    title: "Document-grounded",
    description: "Understand the language in your document.",
  },
  {
    icon: Target,
    title: "Action-oriented",
    description: "See obligations and deadlines.",
  },
  {
    icon: MessageSquareText,
    title: "Professional-ready",
    description: "Prepare better questions for legal review.",
  },
];

export function TrustStrip() {
  return (
    <section className="bg-transparent border-t border-cg-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-cg-border"
          staggerDelay={0.1}
        >
          {values.map((value, i) => (
            <StaggerItem key={value.title}>
              <div className={`flex flex-col items-center text-center py-8 sm:py-0 px-6 ${i === 0 ? "sm:pl-0" : ""} ${i === 2 ? "sm:pr-0" : ""}`}>
                <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full border border-cg-border bg-white mb-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <value.icon className="size-5 text-cg-green" strokeWidth={1.5} />
                </div>
                <h3 className="text-[13px] font-bold tracking-widest uppercase text-cg-dark mb-2">
                  {value.title}
                </h3>
                <p className="text-[14px] text-cg-muted leading-relaxed max-w-[240px]">
                  {value.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
