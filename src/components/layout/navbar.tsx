"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const publicLinks = [
  { href: "/analyze", label: "Analyze" },
  { href: "/compare", label: "Compare" },
];

const appLinks = [
  { href: "/analyze", label: "Analyze" },
  { href: "/compare", label: "Compare" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = user ? appLinks : publicLinks;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-cg-background/95 backdrop-blur-md border-b border-cg-border"
          : "bg-cg-background border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <svg className="w-5 h-5 text-cg-green" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5V4.5C4 3.67157 4.67157 3 5.5 3H14.5L19.5 8V19.5C19.5 20.3284 18.8284 21 18 21H5.5C4.67157 21 4 20.3284 4 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 3V8.5C14 8.77614 14.2239 9 14.5 9H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-cg-dark font-semibold tracking-tight text-[16px]">
            ClauseGuard
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-[13px] font-medium rounded-full transition-all",
                  isActive
                    ? "text-cg-dark bg-cg-card shadow-sm border border-cg-border"
                    : "text-cg-muted hover:text-cg-dark hover:bg-cg-card/50"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA / Profile */}
        <div className="hidden lg:flex items-center">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-cg-card border border-cg-border text-xs font-semibold text-cg-dark hover:bg-cg-background transition-colors"
              >
                {user.initials}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-cg-border py-1 z-50">
                  <div className="px-4 py-2 border-b border-cg-border mb-1">
                    <p className="text-sm font-medium text-cg-dark truncate">{user.name}</p>
                    <p className="text-[10px] text-cg-muted uppercase tracking-wider mt-0.5">Demo session</p>
                  </div>
                  <Link href="/analyze" className="block px-4 py-2 text-sm text-cg-dark hover:bg-cg-background transition-colors" onClick={() => setShowDropdown(false)}>
                    New Analysis
                  </Link>
                  <button onClick={() => { signOut(); setShowDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-cg-attention hover:bg-cg-background transition-colors">
                    Leave demo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/analyze"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-cg-green hover:bg-cg-green/90 text-white gap-1.5 px-4 h-8 text-[13px] font-medium rounded-full"
              )}
            >
              New Analysis
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-cg-dark"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-cg-background border-cg-border p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b border-cg-border">
                <span className="text-cg-dark font-semibold tracking-tight text-[16px]">
                  ClauseGuard
                </span>
                <SheetClose
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Close menu" className="rounded-full" />
                  }
                >
                  <X className="size-4" />
                </SheetClose>
              </div>

              {user && (
                <div className="px-5 py-4 border-b border-cg-border flex items-center gap-3 bg-cg-card/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cg-card border border-cg-border text-xs font-semibold text-cg-dark">
                    {user.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cg-dark truncate">{user.name}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Mobile navigation">
                {links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <SheetClose
                      key={link.label}
                      render={
                        <Link
                          href={link.href}
                          className={cn(
                            "px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                            isActive
                              ? "text-cg-dark bg-cg-card border-l-2 border-cg-green pl-2.5"
                              : "text-cg-muted hover:text-cg-dark hover:bg-cg-card/60"
                          )}
                        />
                      }
                    >
                      {link.label}
                    </SheetClose>
                  );
                })}
              </nav>
              <div className="mt-auto px-5 pb-6 flex flex-col gap-3">
                {user ? (
                  <>
                    <SheetClose
                      render={
                        <Link
                          href="/analyze"
                          className={cn(
                            buttonVariants(),
                            "w-full bg-cg-green hover:bg-cg-green/90 text-white gap-1.5 h-11 text-[15px] font-medium rounded-lg"
                          )}
                        />
                      }
                    >
                      New Analysis
                      <ArrowRight className="size-4" />
                    </SheetClose>
                    <SheetClose
                      render={
                        <button
                          onClick={signOut}
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "w-full border-cg-border text-cg-attention bg-transparent h-11 text-[15px] font-medium rounded-lg hover:bg-cg-card"
                          )}
                        />
                      }
                    >
                      Leave demo
                    </SheetClose>
                  </>
                ) : (
                  <SheetClose
                    render={
                      <Link
                        href="/analyze"
                        className={cn(
                          buttonVariants(),
                          "w-full bg-cg-green hover:bg-cg-green/90 text-white gap-1.5 h-11 text-[15px] font-medium rounded-lg"
                        )}
                      />
                    }
                  >
                    New Analysis
                    <ArrowRight className="size-4" />
                  </SheetClose>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
