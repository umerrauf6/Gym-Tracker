"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Check,
  Crown,
  LogOut,
  Moon,
  Ruler,
  Sparkles,
  Timer,
  Volume2,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageHeading } from "@/src/components/page-heading";
import { getSupabaseBrowserClient } from "@/src/lib/supabase";
import { sessionVolume, useAppStore } from "@/src/store/use-app-store";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    notifications,
    toggleNotifications,
    restSeconds,
    setRestSeconds,
    unit,
    setUnit,
    history,
    isPro,
    setIsPro,
  } = useAppStore();

  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("Lifter");
  const [userInitials, setUserInitials] = useState<string>("UR");
  const [signingOut, setSigningOut] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const totalTonnage = history.reduce((sum, item) => sum + sessionVolume(item), 0);

  // Check for successful payment return
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setIsPro(true);
    }
  }, [searchParams, setIsPro]);

  // Fetch logged in user details
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const email = user.email || "";
        setUserEmail(email);
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (email ? email.split("@")[0] : "Lifter");
        setUserName(name);
        if (name) {
          const initials = name
            .split(" ")
            .map((part: string) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          setUserInitials(initials || "UR");
        }
        if (user.user_metadata?.is_pro || user.app_metadata?.is_pro) {
          setIsPro(true);
        }
      }
    });
  }, [setIsPro]);

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      setCheckoutError("");
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || "Could not launch Stripe Checkout");
      }
    } catch {
      setCheckoutError("Failed to connect to checkout service");
    } finally {
      setCheckingOut(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    await getSupabaseBrowserClient()?.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="page">
      <PageHeading
        eyebrow="Account Command"
        title="Profile & Preferences"
        subtitle="Manage your training preferences, rest timer durations, workout units, and membership tier."
      />

      <div className="profile-layout">
        {/* Main Settings Panel */}
        <section className="panel profile-card">
          {/* User Hero */}
          <div className="profile-hero">
            <div className="profile-avatar">{userInitials}</div>
            <div>
              <h2 className="profile-name" style={{ textTransform: "capitalize" }}>{userName}</h2>
              <div className="profile-email">
                {userEmail || "Signed In User"} ·{" "}
                {isPro ? (
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>Pro Member</span>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Free Plan</span>
                )}
              </div>
            </div>
          </div>

          {/* Lifetime Summary */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              margin: "20px 0",
              padding: 16,
              background: "var(--bg-subtle)",
              borderRadius: 10,
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Total Sessions
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginTop: 2 }}>
                {history.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Total Tonnage
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)", marginTop: 2 }}>
                {totalTonnage.toLocaleString()} {unit}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Status
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: isPro ? "var(--accent)" : "var(--cyan)", marginTop: 2 }}>
                {isPro ? "Pro" : "Active"}
              </div>
            </div>
          </div>

          {/* Preferences List */}
          <div className="setting-list">
            {/* Notifications */}
            <div className="setting-row">
              <div className="setting-copy">
                <strong>
                  <Bell size={15} color="var(--accent)" /> Workout Notifications
                </strong>
                <span>Rest interval alerts and scheduled workout reminders</span>
              </div>
              <button
                aria-label="Toggle notifications"
                className={`toggle ${notifications ? "active" : ""}`}
                onClick={toggleNotifications}
              >
                <motion.span
                  className="toggle-dot"
                  animate={{ x: notifications ? 22 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </button>
            </div>

            {/* Rest Timer */}
            <div className="setting-row">
              <div className="setting-copy">
                <strong>
                  <Timer size={15} color="var(--cyan)" /> Default Rest Interval
                </strong>
                <span>Auto-countdown time after finishing each working set</span>
              </div>
              <select
                className="set-input"
                style={{ width: 110 }}
                value={restSeconds}
                onChange={(event) => setRestSeconds(Number(event.target.value))}
              >
                <option value="45">45 sec</option>
                <option value="60">60 sec</option>
                <option value="90">90 sec</option>
                <option value="120">2 min</option>
                <option value="180">3 min</option>
              </select>
            </div>

            {/* Units */}
            <div className="setting-row">
              <div className="setting-copy">
                <strong>
                  <Ruler size={15} color="var(--purple)" /> Weight Metric Units
                </strong>
                <span>Used across exercise logs, routine builders, and analytics</span>
              </div>
              <select
                className="set-input"
                style={{ width: 90 }}
                value={unit}
                onChange={(event) => setUnit(event.target.value as "kg" | "lb")}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>

            {/* Sound Effects */}
            <div className="setting-row">
              <div className="setting-copy">
                <strong>
                  <Volume2 size={15} color="var(--amber)" /> Timer Audio Cue
                </strong>
                <span>Audible ping when rest period completes</span>
              </div>
              <button
                aria-label="Toggle sound cues"
                className={`toggle ${soundEnabled ? "active" : ""}`}
                onClick={() => setSoundEnabled((v) => !v)}
              >
                <motion.span
                  className="toggle-dot"
                  animate={{ x: soundEnabled ? 22 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </button>
            </div>

            {/* Appearance */}
            <div className="setting-row">
              <div className="setting-copy">
                <strong>
                  <Moon size={15} color="var(--accent)" /> Visual Theme
                </strong>
                <span>High-contrast Obsidian Dark engineered for low-light gym floors</span>
              </div>
              <span className="detail-tag">Obsidian Dark</span>
            </div>
          </div>

          <button
            className="ghost-button danger-button"
            style={{ marginTop: 28 }}
            onClick={signOut}
            disabled={signingOut}
          >
            <LogOut size={15} /> {signingOut ? "Signing out..." : "Sign out of account"}
          </button>
        </section>

        {/* Pro Membership Card Sidebar */}
        <aside
          className="panel profile-card"
          style={{
            alignSelf: "start",
            border: isPro ? "1px solid rgba(16, 231, 97, 0.3)" : "1px solid var(--border)",
            background: isPro
              ? "linear-gradient(180deg, rgba(16, 231, 97, 0.08) 0%, rgba(16, 22, 32, 0.9) 100%)"
              : "var(--bg-card)",
          }}
        >
          <div
            className="stat-icon"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: isPro ? "var(--accent-soft)" : "rgba(255,255,255,0.05)",
              color: isPro ? "var(--accent)" : "var(--text-muted)",
              border: isPro ? "1px solid rgba(16, 231, 97, 0.3)" : "1px solid var(--border)",
            }}
          >
            <Crown size={22} />
          </div>
          <h3 className="routine-title" style={{ marginTop: 16 }}>
            {isPro ? "GymTracker Pro Active" : "GymTracker Pro"}
          </h3>
          <p className="routine-meta" style={{ marginTop: 4 }}>
            {isPro
              ? "You have lifetime access to all elite progression tools and cloud sync."
              : "Everything you need for elite athletic progression and zero-friction training."}
          </p>

          <div className="goal-list" style={{ margin: "20px 0" }}>
            <div className="goal-row">
              <span>
                <Check size={14} color={isPro ? "var(--accent)" : "var(--text-muted)"} style={{ display: "inline", marginRight: 6 }} />
                Unlimited Custom Splits
              </span>
              <strong style={{ color: isPro ? "var(--accent)" : "var(--text-muted)" }}>{isPro ? "Unlocked" : "Pro"}</strong>
            </div>
            <div className="goal-row">
              <span>
                <Check size={14} color={isPro ? "var(--accent)" : "var(--text-muted)"} style={{ display: "inline", marginRight: 6 }} />
                Smart Equipment Swaps
              </span>
              <strong style={{ color: isPro ? "var(--accent)" : "var(--text-muted)" }}>{isPro ? "Unlocked" : "Pro"}</strong>
            </div>
            <div className="goal-row">
              <span>
                <Check size={14} color={isPro ? "var(--accent)" : "var(--text-muted)"} style={{ display: "inline", marginRight: 6 }} />
                Volume & Balance Radar
              </span>
              <strong style={{ color: isPro ? "var(--accent)" : "var(--text-muted)" }}>{isPro ? "Unlocked" : "Pro"}</strong>
            </div>
            <div className="goal-row">
              <span>
                <Check size={14} color={isPro ? "var(--accent)" : "var(--text-muted)"} style={{ display: "inline", marginRight: 6 }} />
                Cloud Device Sync
              </span>
              <strong style={{ color: isPro ? "var(--accent)" : "var(--text-muted)" }}>{isPro ? "Unlocked" : "Pro"}</strong>
            </div>
          </div>

          <button
            className={isPro ? "secondary-button" : "primary-button"}
            style={{ width: "100%" }}
            onClick={() => setUpgradeOpen(true)}
          >
            {isPro ? (
              <>
                <Crown size={15} /> Pro Membership Active
              </>
            ) : (
              <>
                <Sparkles size={15} /> Upgrade to Pro ($29)
              </>
            )}
          </button>
        </aside>
      </div>

      {/* Pro Membership Modal */}
      <AnimatePresence>
        {upgradeOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setUpgradeOpen(false)}
          >
            <motion.section
              className="modal"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <div className="eyebrow">
                    <Crown size={14} /> Tier Overview
                  </div>
                  <h2 className="modal-title">
                    {isPro ? "GymTracker Pro Unlocked" : "Upgrade to GymTracker Pro"}
                  </h2>
                </div>
                <button
                  className="icon-button"
                  aria-label="Close upgrade dialog"
                  onClick={() => setUpgradeOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              <p className="page-subtitle" style={{ margin: "0 0 20px" }}>
                {isPro
                  ? "Your account has full lifetime access to all Pro features. Customize infinite routines, switch equipment on the fly, and inspect muscle balance metrics."
                  : "Upgrade now to unlock infinite routine splits, on-the-fly equipment alternatives, and detailed muscle balance radar analytics."}
              </p>

              <div className="goal-list" style={{ margin: "20px 0" }}>
                {[
                  "Unlimited custom routine splits with multi-muscle targeting",
                  "1-tap equipment alternative replacement for busy gym hours",
                  "Automated volume tonnage accumulator and rest timer HUD",
                  "Offline-first local storage and private Supabase authentication",
                ].map((item) => (
                  <div className="goal-row" key={item} style={{ padding: "8px 0" }}>
                    <span>
                      <Check
                        size={15}
                        color="var(--accent)"
                        style={{ verticalAlign: "middle", marginRight: 8 }}
                      />
                      {item}
                    </span>
                    <strong style={{ color: isPro ? "var(--accent)" : "var(--text-muted)" }}>
                      {isPro ? "Active" : "Pro"}
                    </strong>
                  </div>
                ))}
              </div>

              {checkoutError && (
                <div className="auth-error" style={{ marginBottom: 16 }}>
                  {checkoutError}
                </div>
              )}

              <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
                {!isPro ? (
                  <button
                    className="primary-button"
                    style={{ width: "100%", height: 48, fontSize: 14 }}
                    disabled={checkingOut}
                    onClick={handleCheckout}
                  >
                    <Sparkles size={16} /> {checkingOut ? "Redirecting to Stripe..." : "Upgrade to Pro Lifetime ($29)"}
                  </button>
                ) : (
                  <button
                    className="secondary-button"
                    style={{ width: "100%", height: 48, fontSize: 14 }}
                    onClick={() => setUpgradeOpen(false)}
                  >
                    <Check size={16} /> Continue Training with Pro
                  </button>
                )}
                <button
                  className="ghost-button"
                  style={{ width: "100%", height: 40, fontSize: 13 }}
                  onClick={() => setUpgradeOpen(false)}
                >
                  Dismiss
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="page" style={{ padding: 24 }}>Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
