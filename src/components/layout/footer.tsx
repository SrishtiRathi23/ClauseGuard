import Link from "next/link";

const productLinks = [
  { href: "/analyze", label: "Analyze" },
  { href: "/compare", label: "Compare" },
];

const infoLinks = [
  { href: "/#legal-boundary", label: "Legal boundary" },
];

export function Footer() {
  return (
    <footer className="bg-transparent border-t border-cg-border py-16" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-cg-dark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5V4.5C4 3.67157 4.67157 3 5.5 3H14.5L19.5 8V19.5C19.5 20.3284 18.8284 21 18 21H5.5C4.67157 21 4 20.3284 4 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 3V8.5C14 8.77614 14.2239 9 14.5 9H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-cg-dark font-semibold tracking-tight text-[15px]">
                ClauseGuard
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-cg-muted">
              Understand what you sign.<br/>
              See what happens next.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-cg-dark mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-cg-muted hover:text-cg-dark transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-cg-dark mb-4">
              Information
            </h3>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-cg-muted hover:text-cg-dark transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <div className="lg:col-span-1 lg:text-right flex flex-col justify-end lg:items-end">
            <p className="text-[11px] text-cg-muted">
              &copy; {new Date().getFullYear()} ClauseGuard
              <br />
              All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
