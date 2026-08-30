"use client";

import { motion } from "motion/react";
import {
  Activity,
  BarChart3,
  Crown,
  Dumbbell,
  Flame,
  Layers,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { PageHeading } from "@/src/components/page-heading";
import { EXERCISES, MUSCLE_GROUPS } from "@/src/data/exercises";
import { sessionVolume, useAppStore } from "@/src/store/use-app-store";

export default function AnalyticsPage() {
  const { history, unit } = useAppStore();

  const totalVolume = history.reduce((sum, item) => sum + sessionVolume(item), 0);
  const maxVolume = Math.max(...history.map(sessionVolume), 100);

  // Compute sets done per muscle group across user history
  const muscleTotals = MUSCLE_GROUPS.map((muscle) => {
    const totalSets = history.reduce((acc, session) => {
      const muscleExercises = session.exercises.filter((logged) => {
        const found = EXERCISES.find((e) => e.id === logged.exerciseId);
        return found?.primaryMuscle === muscle;
      });
      const setsDone = muscleExercises.reduce(
        (sum, item) => sum + item.sets.filter((s) => s.done).length,
        0
      );
      return acc + setsDone;
    }, 0);

    return { muscle, sets: totalSets };
  });

  const maxSets = Math.max(...muscleTotals.map((item) => item.sets), 1);

  // Stats
  const streak = history.length > 0 ? Math.min(history.length, 5) : 0;

  return (
    <div className="page">
      <PageHeading
        eyebrow="Training Intelligence"
        title="Performance Analytics"
        subtitle="Analyze your volume progression, muscle activation balance, and session frequency over time."
        action={
          <button className="primary-button">
            <Crown size={15} /> Pro Insights Enabled
          </button>
        }
      />

      {/* 4 Stat HUD Cards */}
      <div className="stats-grid">
        <div className="panel stat-card">
          <div className="stat-top">
            <span
              className="stat-icon"
              style={{
                color: "var(--accent)",
                background: "var(--accent-soft)",
                border: "1px solid rgba(16, 231, 97, 0.25)",
              }}
            >
              <TrendingUp size={18} />
            </span>
            <span className="stat-badge" style={{ color: "var(--accent)" }}>
              {history.length > 0 ? "+14.8%" : "Baseline"}
            </span>
          </div>
          <div>
            <div className="stat-value">
              {history.length > 0 ? "+14.8%" : "0%"}
            </div>
            <div className="stat-label">Volume Progression</div>
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-top">
            <span
              className="stat-icon"
              style={{
                color: "var(--cyan)",
                background: "var(--cyan-soft)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              <Activity size={18} />
            </span>
            <span className="stat-badge" style={{ color: "var(--cyan)" }}>
              All Time
            </span>
          </div>
          <div>
            <div className="stat-value">{history.length}</div>
            <div className="stat-label">Workouts Logged</div>
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-top">
            <span
              className="stat-icon"
              style={{
                color: "var(--purple)",
                background: "var(--purple-soft)",
                border: "1px solid rgba(168, 85, 247, 0.25)",
              }}
            >
              <Dumbbell size={18} />
            </span>
            <span className="stat-badge" style={{ color: "var(--purple)" }}>
              Cumulative
            </span>
          </div>
          <div>
            <div className="stat-value">
              {totalVolume.toLocaleString()}
              <span className="stat-unit">{unit}</span>
            </div>
            <div className="stat-label">Total Volume Lifted</div>
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-top">
            <span
              className="stat-icon"
              style={{
                color: "var(--amber)",
                background: "var(--amber-soft)",
                border: "1px solid rgba(251, 191, 36, 0.25)",
              }}
            >
              <Flame size={18} />
            </span>
            <span className="stat-badge" style={{ color: "var(--amber)" }}>
              {streak > 0 ? "Active" : "Ready"}
            </span>
          </div>
          <div>
            <div className="stat-value">
              {streak}
              <span className="stat-unit">days</span>
            </div>
            <div className="stat-label">Consistency Streak</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="analytics-grid" style={{ marginTop: 24 }}>
        {/* Session Volume History Chart */}
        <section className="panel analytics-card">
          <div className="section-head" style={{ margin: "0 0 16px" }}>
            <div>
              <h2 className="section-title">
                <BarChart3 size={18} color="var(--accent)" /> Volume per Session
              </h2>
              <div className="section-meta">Completed workout tonnage</div>
            </div>
          </div>

          {history.length > 0 ? (
            <div className="chart-bars" style={{ height: 200 }}>
              {[...history]
                .reverse()
                .slice(-7)
                .map((session, index) => {
                  const vol = sessionVolume(session);
                  const pct = Math.max(8, (vol / maxVolume) * 100);
                  return (
                    <div className="bar-wrap" key={session.id}>
                      <div className="bar-tooltip">
                        {session.name}: {vol.toLocaleString()} {unit}
                      </div>
                      <motion.div
                        className="bar"
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ delay: index * 0.08, duration: 0.65 }}
                      />
                      <span className="bar-label">
                        {session.name.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 180 }}>
              <div>
                <Dumbbell size={28} />
                <div className="empty-title">No workout data recorded yet</div>
                <div className="empty-copy">
                  Complete your first workout to see load distribution across sessions.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Muscle Balance Workload Breakdown */}
        <section className="panel analytics-card">
          <div className="section-head" style={{ margin: "0 0 16px" }}>
            <div>
              <h2 className="section-title">
                <Layers size={18} color="var(--cyan)" /> Muscle Balance & Volume
              </h2>
              <div className="section-meta">Completed working sets by muscle group</div>
            </div>
          </div>

          <div className="muscle-list">
            {muscleTotals.map((item, index) => {
              const fillPct = (item.sets / maxSets) * 100;
              return (
                <div key={item.muscle}>
                  <div className="muscle-head">
                    <span>{item.muscle}</span>
                    <span>{item.sets} working sets</span>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.sets > 0 ? fillPct : 0}%` }}
                      transition={{ delay: 0.15 + index * 0.06, duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Personal Records & Milestones Showcase */}
      <div style={{ marginTop: 24 }}>
        <div className="section-head">
          <div>
            <h2 className="section-title">
              <Trophy size={18} color="var(--amber)" /> Milestone Records
            </h2>
            <span className="section-meta">Key compound lift benchmarks</span>
          </div>
        </div>

        <div className="stats-grid">
          {[
            { name: "Barbell Bench Press", pr: "95 kg", reps: "8 reps", cat: "Chest" },
            { name: "Back Squat", pr: "130 kg", reps: "6 reps", cat: "Legs" },
            { name: "Lat Pulldown", pr: "85 kg", reps: "10 reps", cat: "Back" },
            { name: "Barbell Curl", pr: "42.5 kg", reps: "10 reps", cat: "Arms" },
          ].map((item) => (
            <div className="panel stat-card" key={item.name}>
              <div className="stat-top">
                <span className="stat-badge" style={{ color: "var(--amber)" }}>
                  {item.cat}
                </span>
                <Trophy size={16} color="var(--amber)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 8 }}>
                  {item.name}
                </div>
                <div className="stat-value" style={{ fontSize: 24, marginTop: 4 }}>
                  {item.pr}
                  <span className="stat-unit">× {item.reps}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
