"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PublicNavbar } from "@/src/components/public-nav";
import { createClient } from "@/src/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();

  // Redirect signed in users immediately to dashboard
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  // Interactive Live Gym Floor Simulator for hero
  const [demoSets, setDemoSets] = useState([
    { id: 1, reps: 10, weight: 80, done: true },
    { id: 2, reps: 8, weight: 85, done: true },
    { id: 3, reps: 8, weight: 90, done: false },
  ]);
  const [demoRest, setDemoRest] = useState(48);
  const [activeTab, setActiveTab] = useState<"bench" | "swap">("bench");

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoRest((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSet = (id: number) => {
    setDemoSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  return (
    <div className="public-page-wrapper">
      {/* Unified Public Top Navbar */}
      <PublicNavbar />

      <main className="landing-content">
        {/* ==========================================================================
            Hero Section
            ========================================================================== */}
        <section className="landing-hero-container">
          <div className="landing-hero-layout">
            <div className="landing-hero-text">
              <div className="landing-eyebrow">
                <Sparkles size={13} /> Built for the Gym Floor
              </div>
              <h1 className="landing-main-title">
                Lift with intent.<br />
                <span>Track with precision.</span>
              </h1>
              <p className="landing-main-subtitle">
                Log working sets in seconds, calculate progressive overload automatically, and switch busy equipment without losing workout tempo.
              </p>

              <div className="landing-cta-group">
                <Link className="primary-button" href="/login" style={{ height: 48, padding: "0 24px", fontSize: 14 }}>
                  Start Training Free <ArrowRight size={15} />
                </Link>
                <Link className="secondary-button" href="/exercises" style={{ height: 48, padding: "0 22px", fontSize: 14 }}>
                  Browse 21 Guided Movements
                </Link>
              </div>

              <div className="landing-trust-row">
                <span>
                  <ShieldCheck size={16} color="var(--accent)" /> Private & offline-ready
                </span>
                <span>
                  <Timer size={16} color="var(--accent)" /> Auto rest timing
                </span>
                <span>
                  <Zap size={16} color="var(--accent)" /> Zero friction logging
                </span>
              </div>
            </div>

            {/* Interactive Live Gym-Floor Simulator */}
            <div className="hero-interactive-card">
              <div className="interactive-card-header">
                <div>
                  <div className="live-status-indicator">
                    <span className="pulse-dot" /> Live Session Simulator
                  </div>
                  <h3 className="interactive-exercise-name">Barbell Bench Press</h3>
                </div>
                <div className="interactive-tab-pills">
                  <button
                    onClick={() => setActiveTab("bench")}
                    className={`filter-chip ${activeTab === "bench" ? "active" : ""}`}
                    style={{ height: 32, fontSize: 11, padding: "0 12px" }}
                  >
                    Set Table
                  </button>
                  <button
                    onClick={() => setActiveTab("swap")}
                    className={`filter-chip ${activeTab === "swap" ? "active" : ""}`}
                    style={{ height: 32, fontSize: 11, padding: "0 12px" }}
                  >
                    <ArrowLeftRight size={12} style={{ display: "inline", marginRight: 4 }} /> Swap
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "bench" ? (
                  <motion.div
                    key="bench-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="interactive-exercise-badge">
                      <div className="interactive-thumb-wrap">
                        <Image src="/exercises/barbell-bench-press.png" alt="Barbell Bench Press" fill style={{ objectFit: "cover" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Chest & Triceps
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                          Primary Compound · Barbell
                        </div>
                      </div>
                    </div>

                    <table className="set-table">
                      <thead>
                        <tr>
                          <th>Set</th>
                          <th>Weight (kg)</th>
                          <th>Reps</th>
                          <th style={{ textAlign: "center" }}>Done</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoSets.map((s, idx) => (
                          <tr key={s.id}>
                            <td className="set-number">{idx + 1}</td>
                            <td style={{ fontWeight: 700, color: "#fff" }}>{s.weight}</td>
                            <td style={{ fontWeight: 700, color: "#fff" }}>{s.reps}</td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                className={`set-check ${s.done ? "done" : ""}`}
                                onClick={() => toggleSet(s.id)}
                                style={{ margin: "0 auto", width: 34, height: 32 }}
                                aria-label={`Toggle set ${idx + 1}`}
                              >
                                {s.done && <Check size={16} />}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Live Rest Timer Pill */}
                    <div className="interactive-rest-hud">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", fontSize: 12, fontWeight: 700 }}>
                        <Timer size={16} /> Rest Interval
                      </div>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>
                        00:{String(demoRest).padStart(2, "0")}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="swap-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: "grid", gap: 10 }}
                  >
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Bench occupied? Switch to a matched movement with 1 tap:
                    </div>
                    {[
                      { name: "Incline Dumbbell Press", equip: "Dumbbells", id: "incline-dumbbell-press" },
                      { name: "Machine Chest Press", equip: "Machine", id: "machine-chest-press" },
                      { name: "Cable Fly", equip: "Cables", id: "cable-fly" },
                    ].map((alt) => (
                      <div
                        key={alt.id}
                        className="interactive-swap-item"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ position: "relative", width: 44, height: 34, borderRadius: 6, overflow: "hidden" }}>
                            <Image src={`/exercises/${alt.id}.png`} alt={alt.name} fill style={{ objectFit: "cover" }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{alt.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{alt.equip}</div>
                          </div>
                        </div>
                        <span className="detail-tag" style={{ fontSize: 10, padding: "4px 8px" }}>1-Tap Swap</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            Stats & Proof Metric Strip (Under Hero)
            ========================================================================== */}
        <section className="landing-proof-strip">
          <div className="proof-strip-grid">
            <div className="proof-stat-cell">
              <div className="proof-number">&lt; 2s</div>
              <div className="proof-label">Average set logging time on gym floor</div>
            </div>
            <div className="proof-stat-cell">
              <div className="proof-number">21+</div>
              <div className="proof-label">Guided compound & isolation movements</div>
            </div>
            <div className="proof-stat-cell">
              <div className="proof-number">100%</div>
              <div className="proof-label">Private & offline-ready data sync</div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            Features Bento Grid Section (#features)
            ========================================================================== */}
        <section id="features" className="landing-section">
          <div className="section-intro">
            <h2 className="section-main-heading">Everything your training demands.</h2>
            <p className="section-main-subtext">
              No bloated spreadsheets. No slow network delays. Engineered for lifters who care about real strength progression.
            </p>
          </div>

          <div className="features-bento-grid">
            {/* Bento 1: Set Steppers (Span 7) */}
            <div className="bento-card bento-span-7">
              <div className="bento-card-icon" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                <Dumbbell size={22} />
              </div>
              <h3 className="bento-card-title">High-Contrast Gym Floor Logging</h3>
              <p className="bento-card-text">
                Large tactile buttons, quick rep and weight steppers, and single-tap completion checkboxes designed for rapid pacing in low-light gym floors.
              </p>
              <div className="bento-metric-row">
                <div className="bento-mini-stat">
                  <div className="mini-stat-label">Pace</div>
                  <div className="mini-stat-val">&lt; 2s / set</div>
                </div>
                <div className="bento-mini-stat">
                  <div className="mini-stat-label">Controls</div>
                  <div className="mini-stat-val" style={{ color: "var(--accent)" }}>+/- Steppers</div>
                </div>
                <div className="bento-mini-stat">
                  <div className="mini-stat-label">Storage</div>
                  <div className="mini-stat-val">Local Cache</div>
                </div>
              </div>
            </div>

            {/* Bento 2: Smart Rest Timing (Span 5) */}
            <div className="bento-card bento-span-5" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="bento-card-icon" style={{ background: "var(--cyan-soft)", color: "var(--cyan)" }}>
                  <Timer size={22} />
                </div>
                <h3 className="bento-card-title">Automatic Rest Timing</h3>
                <p className="bento-card-text">
                  The countdown starts the exact millisecond you check a set. Extend with +30s or skip with zero friction.
                </p>
              </div>
              <div className="bento-timer-box">
                <div style={{ fontSize: 38, fontWeight: 800, color: "var(--cyan)", fontFamily: "var(--font-heading)" }}>
                  01:30
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginTop: 4 }}>
                  Optimal Muscle Recovery
                </div>
              </div>
            </div>

            {/* Bento 3: Instant Equipment Swap (Span 5) */}
            <div className="bento-card bento-span-5">
              <div className="bento-card-icon" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>
                <ArrowLeftRight size={22} />
              </div>
              <h3 className="bento-card-title">Instant Equipment Swapping</h3>
              <p className="bento-card-text">
                Squat rack or cable tower taken? Instantly swap to biomechanically equivalent dumbbell or machine variations with one tap.
              </p>
            </div>

            {/* Bento 4: Volume & Progression Analytics (Span 7) */}
            <div className="bento-card bento-span-7">
              <div className="bento-card-icon" style={{ background: "var(--purple-soft)", color: "var(--purple)" }}>
                <BarChart3 size={22} />
              </div>
              <h3 className="bento-card-title">Volume Overload & Muscle Balance</h3>
              <p className="bento-card-text">
                Track weekly tonnage, working set distribution across chest, back, and legs, and streak records backed by your real workout data.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            How It Works Section (#how-it-works)
            ========================================================================== */}
        <section id="how-it-works" className="landing-section">
          <div className="section-intro">
            <h2 className="section-main-heading">Simple 3-step workout workflow.</h2>
            <p className="section-main-subtext">
              Designed from ground up to get out of your way while training.
            </p>
          </div>

          <div className="workflow-steps-grid">
            <div className="workflow-step-card">
              <div className="step-number-badge">01</div>
              <h3 className="step-card-title">Pick or Build Your Split</h3>
              <p className="step-card-text">
                Choose classic Push / Pull / Legs or build custom routines with exercise order, target reps, and weights.
              </p>
            </div>

            <div className="workflow-step-card">
              <div className="step-number-badge">02</div>
              <h3 className="step-card-title">Log Working Sets Live</h3>
              <p className="step-card-text">
                Tap through your working sets on the gym floor. Rest timers launch automatically between each completed set.
              </p>
            </div>

            <div className="workflow-step-card">
              <div className="step-number-badge">03</div>
              <h3 className="step-card-title">Monitor Overload & Records</h3>
              <p className="step-card-text">
                Review weekly volume tonnage, session durations, and milestone personal records as you progress.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            Movement Library Showcase
            ========================================================================== */}
        <section className="landing-section">
          <div className="section-intro" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", textAlign: "left", maxWidth: "100%" }}>
            <div>
              <h2 className="section-main-heading">21 Guided Movement Standards</h2>
              <p className="section-main-subtext" style={{ margin: "6px 0 0" }}>
                Form execution cues, muscle activation badges, and common error warnings for every lift.
              </p>
            </div>
            <Link className="secondary-button" href="/exercises" style={{ height: 42, padding: "0 18px", fontSize: 13 }}>
              View All Movements <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="showcase-movement-grid">
            {[
              {
                id: "barbell-bench-press",
                name: "Barbell Bench Press",
                muscles: "Chest · Triceps · Shoulders",
                tag: "Compound Heavy",
                image: "/exercises/barbell-bench-press.png",
              },
              {
                id: "pull-up",
                name: "Pull-Up",
                muscles: "Lats · Biceps · Upper Back",
                tag: "Bodyweight Master",
                image: "/exercises/pull-up.png",
              },
              {
                id: "back-squat",
                name: "Barbell Back Squat",
                muscles: "Quads · Glutes · Hamstrings",
                tag: "Lower Compound",
                image: "/exercises/back-squat.png",
              },
            ].map((mov) => (
              <Link key={mov.id} href={`/exercises/${mov.id}`} className="showcase-movement-card">
                <div className="showcase-media-wrap">
                  <Image src={mov.image} alt={mov.name} fill style={{ objectFit: "cover" }} />
                  <div className="showcase-tag">{mov.tag}</div>
                </div>
                <div className="showcase-card-body">
                  <div className="showcase-card-name">{mov.name}</div>
                  <div className="showcase-card-muscles">{mov.muscles}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ==========================================================================
            Pricing Section (#pricing)
            ========================================================================== */}
        <section id="pricing" className="landing-section">
          <div className="section-intro">
            <h2 className="section-main-heading">Simple, transparent access.</h2>
            <p className="section-main-subtext">
              Start free today with full logging capabilities. Upgrade to Pro for lifetime advanced analytics.
            </p>
          </div>

          <div className="pricing-cards-grid">
            {/* Free Tier */}
            <div className="pricing-card">
              <div className="pricing-tier-name">Free Lifter</div>
              <div className="pricing-amount">
                $0 <span>forever</span>
              </div>
              <p className="pricing-desc">Everything needed to log workouts and build consistency on the gym floor.</p>

              <ul className="pricing-feature-list">
                <li><CheckCircle2 size={16} color="var(--accent)" /> Unlimited gym floor workout sessions</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> 21 Guided movement form guides</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Automatic rest countdown timer</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> 3 Standard workout routines</li>
              </ul>

              <Link className="secondary-button" href="/login" style={{ width: "100%", height: 46, marginTop: 24 }}>
                Get Started Free
              </Link>
            </div>

            {/* Pro Lifetime Tier */}
            <div className="pricing-card pricing-featured">
              <div className="pricing-featured-badge">Most Popular</div>
              <div className="pricing-tier-name">Pro Lifetime</div>
              <div className="pricing-amount">
                $29 <span>one-time</span>
              </div>
              <p className="pricing-desc">Unlimited custom splits, equipment swapping, and detailed volume analytics.</p>

              <ul className="pricing-feature-list">
                <li><CheckCircle2 size={16} color="var(--accent)" /> Everything in Free Lifter</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Unlimited custom routine builder</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> 1-Tap smart equipment substitution</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Volume progression & muscle balance graphs</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Personal record milestone badges</li>
              </ul>

              <Link className="primary-button" href="/login" style={{ width: "100%", height: 46, marginTop: 24 }}>
                Unlock Pro Lifetime <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            Final High-Impact CTA Section
            ========================================================================== */}
        <section className="landing-final-cta">
          <h2 className="final-cta-heading">Ready to elevate your training?</h2>
          <p className="final-cta-subtext">
            Join lifters tracking volume, progressive overload, and personal records without distraction.
          </p>
          <Link className="primary-button" href="/login" style={{ height: 50, padding: "0 32px", fontSize: 15 }}>
            Start Training Free <ArrowRight size={16} />
          </Link>
        </section>

        {/* ==========================================================================
            Minimal Footer
            ========================================================================== */}
        <footer className="landing-footer">
          <div className="footer-inner">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="brand-mark" style={{ width: 28, height: 28 }}>
                <Dumbbell size={15} strokeWidth={2.4} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>
                Gym<span style={{ color: "var(--accent)" }}>Tracker</span>
              </span>
            </div>

            <div className="footer-links">
              <Link href="/exercises">Movement Guide</Link>
              <Link href="/#features">Features</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/login">Sign In</Link>
            </div>

            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              © {new Date().getFullYear()} GymTracker. Built for intentional lifters.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
