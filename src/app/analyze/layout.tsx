import { AuthGuard } from "@/components/auth-guard";

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex-1 flex flex-col bg-cg-background min-h-[calc(100vh-64px)]">
        {children}
      </div>
    </AuthGuard>
  );
}
