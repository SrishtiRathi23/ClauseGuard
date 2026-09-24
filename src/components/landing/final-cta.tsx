"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 bg-transparent text-center">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-cg-muted mb-4">
            Ready to understand
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-[4rem] text-cg-dark mb-10 leading-[1.05]">
            What you&apos;re signing?
          </h2>
          <Link
            href="/analyze"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-cg-green hover:bg-cg-green/90 text-white gap-2 h-12 px-8 text-[15px] font-medium rounded-full shadow-sm"
            )}
          >
            Analyze a document
            <ArrowRight className="size-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
