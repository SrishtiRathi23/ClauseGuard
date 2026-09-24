"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, Scale, Clock, Eye } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

const stats = [
  { label: "Clauses", value: "12", icon: FileText },
  { label: "Obligations", value: "5", icon: Scale },
  { label: "Deadlines", value: "4", icon: Clock },
  { label: "Attention", value: "3", icon: AlertTriangle },
];

const reviewPoints = [
  {
    label: "Termination",
    detail: "60-day notice requirement",
    severity: "attention" as const,
  },
  {
    label: "IP Ownership",
    detail: "Broad assignment language",
    severity: "warning" as const,
  },
  {
    label: "Confidentiality",
    detail: "Continues after termination",
    severity: "info" as const,
  },
];

export function ProductPreview() {
  return (
    <FadeIn delay={0.3} duration={0.6} className="w-full max-w-md lg:max-w-lg">
      <div className="relative">
        {/* Decorative glow - very subtle */}
        <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-cg-border to-transparent" />

        <div className="relative bg-cg-card rounded-xl border border-cg-border shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-cg-border bg-cg-background/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-cg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-cg-border" />
            </div>
            <div className="flex-1 mx-4">
              <div className="h-5 w-48 bg-cg-background rounded-md" />
            </div>
          </div>

          <div className="p-5">
            {/* Document title */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium mb-2 bg-cg-green-light text-cg-green border-0"
                >
                  Analyzed
                </Badge>
                <h3 className="text-sm font-semibold text-cg-dark">
                  Employment Agreement
                </h3>
                <p className="text-xs text-cg-muted mt-0.5">
                  Uploaded document • 24 pages
                </p>
              </div>
              <button className="p-1.5 rounded-md hover:bg-cg-background transition-colors" aria-label="View document">
                <Eye className="size-3.5 text-cg-muted" />
              </button>
            </div>

            {/* Stats */}
            <StaggerContainer
              className="grid grid-cols-4 gap-2 mb-5"
              staggerDelay={0.08}
            >
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="text-center p-2 rounded-lg bg-cg-background">
                    <stat.icon className="size-3.5 mx-auto mb-1 text-cg-muted" />
                    <p className="text-base font-semibold text-cg-dark leading-none">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-cg-muted mt-0.5">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Review points */}
            <div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-cg-muted mb-2.5">
                Points to review
              </p>
              <StaggerContainer className="space-y-2" staggerDelay={0.1}>
                {reviewPoints.map((point) => (
                  <StaggerItem key={point.label}>
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-cg-background/80 border border-cg-border/60">
                      <div
                        className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                          point.severity === "attention"
                            ? "bg-cg-attention"
                            : point.severity === "warning"
                            ? "bg-cg-accent"
                            : "bg-cg-green-secondary"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-cg-dark">
                          {point.label}
                        </p>
                        <p className="text-[11px] text-cg-muted leading-snug">
                          {point.detail}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>

        {/* Preview label */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <span className="text-[10px] font-medium text-cg-muted bg-cg-background px-3 py-1 rounded-full border border-cg-border">
            Product preview
          </span>
        </div>
      </div>
    </FadeIn>
  );
}
