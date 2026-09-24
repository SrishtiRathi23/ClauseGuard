"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-32 sm:pt-36 sm:pb-40">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn delay={0} duration={0.6} distance={15}>
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-cg-muted mb-6">
            Contracts are complex. Understanding them shouldn&apos;t be.
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-cg-dark mb-8 leading-[1.05] tracking-tight">
            Legal documents
            <br />
            without the
            <br />
            <span className="text-cg-green italic font-medium pr-2">legal jargon.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.15} duration={0.6} distance={15}>
          <p className="text-lg sm:text-xl font-medium text-cg-dark mb-4">
            Understand what you sign. See what happens next.
          </p>
          <p className="text-[15px] sm:text-base text-cg-muted leading-relaxed max-w-2xl mx-auto mb-12">
            ClauseGuard uses GenAI to turn complex legal documents into understandable
            clauses, obligations, scenarios and questions for professional review.
          </p>
        </FadeIn>

        <FadeIn delay={0.3} duration={0.6} distance={15}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analyze"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-cg-green hover:bg-cg-green/90 text-white gap-2 h-12 px-8 text-[15px] font-medium rounded-full transition-all"
              )}
            >
              Analyze a document
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "gap-2 h-12 px-8 text-[15px] font-medium border-cg-border text-cg-dark hover:bg-cg-card rounded-full bg-transparent transition-all"
              )}
            >
              See how it works
              <PlayCircle className="size-4 text-cg-muted" />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
