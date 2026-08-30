"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Dumbbell } from "lucide-react";

export function PublicNavbar() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/sign-in" || pathname === "/register";

  return (
    <header className="public-header">
      <div className="public-nav-container">
        {/* Brand Mark & Name */}
        <Link href="/" className="brand" style={{ padding: 0 }}>
          <span className="brand-mark">
            <Dumbbell size={20} strokeWidth={2.4} />
          </span>
          <span className="brand-name">
            Gym<span>Tracker</span>
          </span>
        </Link>

        {/* Center Public Navigation Links - Only on Landing/Marketing pages */}
        {!isAuthPage && (
          <nav className="public-nav-menu">
            <Link
              href="/#features"
              className="public-nav-item"
            >
              Features
            </Link>
            <Link
              href="/exercises"
              className={`public-nav-item ${pathname.startsWith("/exercises") ? "active" : ""}`}
            >
              Movements
            </Link>
            <Link
              href="/#how-it-works"
              className="public-nav-item"
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="public-nav-item"
            >
              Pricing
            </Link>
          </nav>
        )}

        {/* Right Public Auth CTA - Only on Landing/Marketing pages */}
        <div className="public-nav-buttons">
          {!isAuthPage && (
            <Link
              href="/login"
              className="primary-button"
              style={{ height: 40, padding: "0 20px", fontSize: 13, fontWeight: 700 }}
            >
              Sign In <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
