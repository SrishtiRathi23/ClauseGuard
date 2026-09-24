import { DocumentAnalysis } from "@/lib/ai/schemas";

export function AnalysisMetrics({ analysis }: { analysis: DocumentAnalysis }) {
  const metrics = [
    { label: "Clauses", count: analysis.clauses?.length || 0 },
    { label: "Obligations", count: analysis.obligations?.length || 0 },
    { label: "Deadlines", count: analysis.deadlines?.length || 0 },
    { label: "Points to review", count: analysis.attentionPoints?.length || 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-white border border-cg-border rounded-xl p-5 shadow-sm text-center">
          <span className="block font-heading text-3xl sm:text-4xl text-cg-dark mb-1">{metric.count}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cg-muted">{metric.label}</span>
        </div>
      ))}
    </div>
  );
}
