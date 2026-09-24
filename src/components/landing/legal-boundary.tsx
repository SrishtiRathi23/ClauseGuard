"use client";

import { FadeIn } from "@/components/ui/fade-in";

export function LegalBoundary() {
  return (
    <section id="legal-boundary" className="py-24 sm:py-32 bg-transparent border-t border-cg-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-cg-muted mb-4">
            Information, not legal advice.
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl text-cg-dark mb-6">
            We help you understand.
          </h2>
          <p className="text-[15px] text-cg-muted leading-relaxed max-w-xl mx-auto">
            ClauseGuard provides document-based legal information and assistance.
            It does not replace a qualified legal professional.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
