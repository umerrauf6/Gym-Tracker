"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Dumbbell,
  LayoutDashboard,
  Play,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/src/lib/supabase";
import { useAppStore } from "@/src/store/use-app-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/exercises", label: "Exercises", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeWorkout, startQuickWorkout } = useAppStore();
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userName, setUserName] = useState("Lifter");
  const [userInitials, setUserInitials] = useState("UR");

  // Fetch logged in user details
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.email ? user.email.split("@")[0] : "Lifter");
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
      }
    });
  }, []);

  // Global search submit
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (search.trim()) {
      router.push(`/exercises?q=${encodeURIComponent(search.trim())}`);
    }
  };

  // Keyboard shortcut ⌘K / Ctrl+K focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search-input") as HTMLInputElement | null;
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStartWorkout = () => {
    if (!activeWorkout) {
      startQuickWorkout();
    }
    router.push("/workout/active");
  };

  return (
    <div className="unified-app-shell">
      {/* Unified Global Top Navbar */}
      <header className="unified-navbar-wrap">
        <div className="unified-navbar">
          {/* Brand Logo */}
          <Link href="/" className="brand" style={{ padding: 0 }}>
            <span className="brand-mark">
              <Dumbbell size={20} strokeWidth={2.4} />
            </span>
            <span className="brand-name">
              Gym<span>Tracker</span>
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="unified-nav-center">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`unified-nav-link ${isActive ? "active" : ""}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="unified-nav-pill"
                      className="unified-nav-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="unified-top-actions">
            {/* Search Input */}
            <form className="topbar-search" onSubmit={submitSearch}>
              <Search size={15} />
              <input
                id="global-search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search movements..."
                aria-label="Global search"
              />
              <span className="topbar-kbd">⌘K</span>
            </form>

            {/* Active Workout Action */}
            {activeWorkout ? (
              pathname !== "/workout/active" && (
                <Link href="/workout/active" className="active-workout-pill">
                  <span className="pulse-dot" />
                  <span>Resume Session</span>
                </Link>
              )
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -1 }}
                className="primary-button"
                style={{ height: 40, padding: "0 14px", fontSize: 12, flexShrink: 0 }}
                onClick={handleStartWorkout}
              >
                <Play size={13} fill="currentColor" />
                Workout
              </motion.button>
            )}

            {/* Notification Drawer */}
            <div className="notification-wrap">
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="icon-button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((value) => !value)}
              >
                <Bell size={16} />
              </motion.button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    className="notification-popover"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Sparkles size={15} color="var(--accent)" />
                      <strong>Training Hub</strong>
                    </div>
                    <span>
                      {activeWorkout
                        ? `Ongoing session: ${activeWorkout.name}. Log your sets to save volume!`
                        : "Ready for your next workout? Jump into Push Day or create a custom split."}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Chip */}
            <Link href="/profile" className="user-chip">
              <span className="avatar">{userInitials}</span>
              <span className="user-copy">
                <span className="user-name" style={{ textTransform: "capitalize" }}>{userName}</span>
                <span className="user-plan">Pro Member</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="unified-main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Floating Bottom Bar */}
      <nav className="mobile-nav">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "active" : ""}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
