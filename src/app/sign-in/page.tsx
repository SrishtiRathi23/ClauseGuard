"use client";

import { useState } from "react";
import { ArrowRight, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export default function SignInPage() {
  const [name, setName] = useState("");
  const { signIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      signIn(name.trim());
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 min-h-[70vh]">
      <div className="w-full max-w-[400px]">
        <div className="bg-white border border-cg-border rounded-2xl shadow-sm p-8 sm:p-10">

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cg-green" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5V4.5C4 3.67157 4.67157 3 5.5 3H14.5L19.5 8V19.5C19.5 20.3284 18.8284 21 18 21H5.5C4.67157 21 4 20.3284 4 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 3V8.5C14 8.77614 14.2239 9 14.5 9H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-cg-dark font-semibold tracking-tight text-[18px]">
                ClauseGuard
              </span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl text-cg-dark mb-2">Try the demo</h1>
            <p className="text-[13px] text-cg-muted">Enter a name to start exploring ClauseGuard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="size-4 text-cg-muted" />
                </div>
                <input
                  type="text"
                  aria-label="Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-transparent border border-cg-border rounded-lg text-[14px] text-cg-dark placeholder:text-cg-muted/60 focus:outline-none focus:ring-1 focus:ring-cg-green focus:border-cg-green transition-all"
                  placeholder="Name"
                />
              </div>
            </div>

            <button
              type="submit"
              className={cn(
                buttonVariants(),
                "w-full h-12 bg-cg-dark hover:bg-cg-dark/90 text-white rounded-lg font-medium text-[14px] gap-2 transition-all mt-6"
              )}
            >
              Continue to demo
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-[12px] text-cg-muted">
          This is a hackathon demo. Your name stays in this browser.
        </p>
      </div>
    </div>
  );
}
