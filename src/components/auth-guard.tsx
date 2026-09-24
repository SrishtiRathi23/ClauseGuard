"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/sign-in");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-cg-green border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return <>{children}</>;
}
