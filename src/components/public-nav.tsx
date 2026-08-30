"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Dumbbell, Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/sign-in" || pathname === "/register";

  return (
    <header className="public-header">
      <div className="public-nav-container">
        {/* Brand Mark & Name */}
        <Link href="/" className="brand" style={{ padding: 0 }} onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-mark">
            <Dumbbell size={20} strokeWidth={2.4} />
          </span>
          <span className="brand-name">
            Gym<span>Tracker</span>
          </span>
        </Link>

        {/* Center Public Navigation Links (Desktop) */}
        {!isAuthPage && (
          <nav className="public-nav-menu">
            <Link href="/#features" className="public-nav-item">
              Features
            </Link>
            <Link
              href="/exercises"
              className={`public-nav-item ${pathname.startsWith("/exercises") ? "active" : ""}`}
            >
              Movements
            </Link>
            <Link href="/#how-it-works" className="public-nav-item">
              How It Works
            </Link>
            <Link href="/#pricing" className="public-nav-item">
              Pricing
            </Link>
          </nav>
        )}

        {/* Right Public Auth CTA */}
        <div className="public-nav-buttons">
          {!isAuthPage && (
            <>
              <Link
                href="/login"
                className="primary-button desktop-only-button"
                style={{ height: 40, padding: "0 20px", fontSize: 13, fontWeight: 700 }}
              >
                Sign In <ArrowRight size={14} />
              </Link>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                className="icon-button mobile-menu-toggle"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Nav Dropdown Menu */}
      <AnimatePresence>
        {!isAuthPage && mobileMenuOpen && (
          <motion.div
            className="mobile-public-dropdown"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="mobile-public-links">
              <Link
                href="/#features"
                className="mobile-public-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/exercises"
                className={`mobile-public-link ${pathname.startsWith("/exercises") ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Movements
              </Link>
              <Link
                href="/#how-it-works"
                className="mobile-public-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/#pricing"
                className="mobile-public-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="primary-button"
                style={{ width: "100%", height: 44, marginTop: 8, justifyContent: "center" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In to Account <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
