"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Dumbbell,
  History,
  Layers,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeading } from "@/src/components/page-heading";
import { EXERCISES, MUSCLE_GROUPS } from "@/src/data/exercises";
import { sessionVolume, useAppStore } from "@/src/store/use-app-store";

export default function WorkoutsPage() {
  const router = useRouter();
  const {
    routines,
    history,
    activeWorkout,
    unit,
    startRoutine,
    startQuickWorkout,
    saveRoutine,
  } = useAppStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const launch = (id?: string) => {
    if (id) startRoutine(id);
    else startQuickWorkout();
    router.push("/workout/active");
  };

  const editing = routines.find((item) => item.id === editingId);

  return (
    <div className="page">
      <PageHeading
        eyebrow="Structured Training"
        title="Workouts & Routines"
        subtitle="Launch a pre-programmed routine in one tap, or build custom training splits for your goals."
        action={
          <div className="page-head-actions">
            <button
              className="secondary-button"
              onClick={() => setEditingId("new")}
            >
              <Plus size={15} /> Build Routine
            </button>
            <button className="primary-button" onClick={() => launch()}>
              <Play size={15} fill="currentColor" /> Quick Session
            </button>
          </div>
        }
      />

      {/* Active Workout Resume Banner */}
      {activeWorkout && (
        <motion.div
          className="panel workout-resume-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="eyebrow">
              <span className="pulse-dot" /> Session In Progress
            </div>
            <h3 style={{ fontSize: 20, margin: "6px 0 2px", color: "#fff" }}>
              {activeWorkout.name}
            </h3>
            <p className="section-meta">
              {activeWorkout.exercises.length} movements active · Local state synced
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => router.push("/workout/active")}
          >
            <Play size={14} fill="currentColor" /> Resume Workout
          </button>
        </motion.div>
      )}

      {/* Routines Grid */}
      <div className="section-head">
        <div>
          <h2 className="section-title">
            <Layers size={18} color="var(--accent)" /> Saved Routines
          </h2>
          <span className="section-meta">{routines.length} training splits programmed</span>
        </div>
      </div>

      <div className="routine-grid">
        {routines.map((routine, index) => (
          <motion.article
            className="panel routine-card"
            key={routine.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -3 }}
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
                .map((id) => EXERCISES.find((item) => item.id === id)?.name)
                .filter(Boolean)
                .join(" · ")}
            </p>

            <div className="routine-actions">
              <button
                className="primary-button"
                onClick={() => launch(routine.id)}
              >
                <Play size={14} fill="currentColor" /> Start
              </button>
              <button
                className="secondary-button"
                onClick={() => setEditingId(routine.id)}
              >
                Edit
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Workout History Activity Feed */}
      <div className="section-head" style={{ marginTop: 36 }}>
        <div>
          <h2 className="section-title">
            <History size={18} color="var(--cyan)" /> Completed Training History
          </h2>
          <span className="section-meta">Your past recorded workouts</span>
        </div>
      </div>

      <section className="panel profile-card">
        {history.length > 0 ? (
          <div className="activity-list">
            {history.map((session) => (
              <div className="activity-item" key={session.id}>
                <span className="activity-icon">
                  <History size={17} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="activity-title">{session.name}</div>
                  <div className="activity-meta">
                    {session.completedAt
                      ? new Date(session.completedAt).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Completed"}{" "}
                    · {session.exercises.length} exercises ·{" "}
                    <strong style={{ color: "var(--accent)" }}>
                      {sessionVolume(session).toLocaleString()} {unit}
                    </strong>{" "}
                    lifted
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ minHeight: 180 }}>
            <div>
              <div className="empty-title">No workout history yet</div>
              <div className="empty-copy">
                Complete your first training session to view detailed logs and tonnage records.
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Routine Builder Modal */}
      <AnimatePresence>
        {editingId && (
          <RoutineModal
            routine={editing}
            onClose={() => setEditingId(null)}
            onSave={(name, exerciseIds, accent) => {
              saveRoutine({
                id: editing?.id,
                name,
                exerciseIds,
                accent: accent ?? editing?.accent ?? "#10e761",
              });
              setEditingId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RoutineModal({
  routine,
  onClose,
  onSave,
}: {
  routine?: { id: string; name: string; exerciseIds: string[]; accent?: string };
  onClose: () => void;
  onSave: (name: string, exerciseIds: string[], accent?: string) => void;
}) {
  const [name, setName] = useState(routine?.name ?? "");
  const [ids, setIds] = useState<string[]>(
    routine?.exerciseIds ?? [
      "barbell-bench-press",
      "lat-pulldown",
      "back-squat",
    ]
  );
  const [filterMuscle, setFilterMuscle] = useState("All");
  const [search, setSearch] = useState("");

  const toggle = (id: string) =>
    setIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const save = () => {
    if (name.trim() && ids.length) {
      onSave(name.trim(), ids, routine?.accent ?? "#10e761");
    }
  };

  const filteredExercises = EXERCISES.filter(
    (e) =>
      (filterMuscle === "All" || e.primaryMuscle === filterMuscle) &&
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
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
            <div className="eyebrow">Routine Studio</div>
            <h2 className="modal-title">
              {routine ? `Edit "${routine.name}"` : "Create New Routine Split"}
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close routine builder"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        <div className="field">
          <label htmlFor="routine-name">Routine Name</label>
          <input
            id="routine-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Upper Hypertrophy Split"
          />
        </div>

        <div className="section-head" style={{ margin: "20px 0 10px" }}>
          <div>
            <h3 className="section-title" style={{ fontSize: 16 }}>
              Select Movements
            </h3>
            <span className="section-meta">
              {ids.length} movement{ids.length === 1 ? "" : "s"} selected
            </span>
          </div>
        </div>

        {/* Filter categories */}
        <div className="filter-row" style={{ marginBottom: 12 }}>
          {["All", ...MUSCLE_GROUPS].map((item) => (
            <button
              key={item}
              className={`filter-chip ${filterMuscle === item ? "active" : ""}`}
              style={{ height: 32, fontSize: 11, padding: "0 12px" }}
              onClick={() => setFilterMuscle(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="search-box"
          style={{ height: 40, marginBottom: 14, background: "var(--bg-subtle)" }}
        >
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter movements by name..."
          />
        </div>

        <div className="exercise-picker">
          {filteredExercises.map((exercise) => {
            const isChecked = ids.includes(exercise.id);
            return (
              <label className="picker-row" key={exercise.id}>
                <div>
                  <strong style={{ color: "#fff" }}>{exercise.name}</strong>
                  <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: 12 }}>
                    · {exercise.primaryMuscle} ({exercise.equipment})
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(exercise.id)}
                />
              </label>
            );
          })}
        </div>

        <div className="modal-actions">
          <button className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={!name.trim() || !ids.length}
            onClick={save}
          >
            <Check size={14} /> Save Routine
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
