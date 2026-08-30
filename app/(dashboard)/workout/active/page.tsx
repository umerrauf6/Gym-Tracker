"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeftRight,
  Check,
  CircleStop,
  Dumbbell,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Timer,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EXERCISES, getExerciseById } from "@/src/data/exercises";
import { sessionVolume, useAppStore } from "@/src/store/use-app-store";

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const {
    activeWorkout,
    restSeconds,
    unit,
    startQuickWorkout,
    updateSet,
    toggleSet,
    addSet,
    swapExercise,
    finishWorkout,
    discardWorkout,
  } = useAppStore();

  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [swapping, setSwapping] = useState<string | null>(null);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);

  // Rest Timer Countdown
  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setTimer((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  const completedSets = useMemo(
    () =>
      activeWorkout?.exercises
        .flatMap((item) => item.sets)
        .filter((item) => item.done).length ?? 0,
    [activeWorkout]
  );

  const totalSets =
    activeWorkout?.exercises.flatMap((item) => item.sets).length ?? 0;

  const currentVolume = activeWorkout ? sessionVolume(activeWorkout) : 0;
  const progressPercent = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;

  if (!activeWorkout) {
    return (
      <div className="page">
        <div className="panel empty-state">
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <div
              className="stat-icon"
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 16px",
                background: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              <Dumbbell size={28} />
            </div>
            <h2 className="empty-title" style={{ fontSize: 22 }}>
              No Active Workout Session
            </h2>
            <p className="empty-copy">
              Choose a saved routine from your training plan or start a flexible session right now.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
              <button
                className="primary-button"
                onClick={() => {
                  startQuickWorkout();
                }}
              >
                <Plus size={15} /> Start Quick Workout
              </button>
              <button
                className="secondary-button"
                onClick={() => router.push("/workouts")}
              >
                Browse Routines
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = (exerciseId: string, setId: string, wasDone: boolean) => {
    toggleSet(exerciseId, setId);
    if (!wasDone) {
      setTimer(restSeconds);
      setRunning(true);
    }
  };

  const adjustWeight = (exerciseId: string, setId: string, current: number, delta: number) => {
    updateSet(exerciseId, setId, "weight", Math.max(0, current + delta));
  };

  const adjustReps = (exerciseId: string, setId: string, current: number, delta: number) => {
    updateSet(exerciseId, setId, "reps", Math.max(1, current + delta));
  };

  const handleFinish = () => {
    finishWorkout();
    setFinishModalOpen(false);
    router.replace("/workouts");
  };

  const handleDiscard = () => {
    discardWorkout();
    setDiscardModalOpen(false);
    router.replace("/workouts");
  };

  return (
    <div className="page">
      {/* Active Workout Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">
            <span className="pulse-dot" /> Live Gym Session
          </div>
          <h1 className="page-title">{activeWorkout.name}</h1>
          <p className="page-subtitle">
            {completedSets} of {totalSets} sets completed ({progressPercent}%) · {currentVolume.toLocaleString()} {unit} lifted
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="ghost-button danger-button"
            onClick={() => setDiscardModalOpen(true)}
          >
            <Trash2 size={14} /> Discard
          </button>
          <button
            className="primary-button"
            onClick={() => setFinishModalOpen(true)}
          >
            <CircleStop size={15} /> Finish Workout
          </button>
        </div>
      </div>

      {/* Progress Bar Top HUD */}
      <div
        style={{
          height: 6,
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <motion.div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #0db84e, var(--accent))",
            borderRadius: "inherit",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="active-layout">
        {/* Exercises Logging List */}
        <div>
          {activeWorkout.exercises.map((logged, index) => {
            const exercise = getExerciseById(logged.exerciseId);
            if (!exercise) return null;

            const alternatives = EXERCISES.filter(
              (item) =>
                item.primaryMuscle === exercise.primaryMuscle &&
                item.equipment !== exercise.equipment &&
                !activeWorkout.exercises.some((active) => active.exerciseId === item.id)
            ).slice(0, 3);

            return (
              <motion.section
                className="panel exercise-log"
                key={logged.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <div className="log-head">
                  <div className="log-identity">
                    <Image
                      className="log-thumb"
                      src={`/exercises/${exercise.id}.png`}
                      alt={exercise.name}
                      width={128}
                      height={96}
                    />
                    <div>
                      <div className="log-title">{exercise.name}</div>
                      <div className="log-meta">
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                          {exercise.primaryMuscle}
                        </span>{" "}
                        · {exercise.equipment}
                      </div>
                    </div>
                  </div>

                  <button
                    className="secondary-button"
                    style={{ height: 36, padding: "0 12px", fontSize: 12 }}
                    onClick={() =>
                      setSwapping(swapping === exercise.id ? null : exercise.id)
                    }
                  >
                    <ArrowLeftRight size={13} /> Swap Machine
                  </button>
                </div>

                {/* Inline Equipment Swapper Deck */}
                <AnimatePresence>
                  {swapping === exercise.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        padding: 14,
                        background: "var(--bg-subtle)",
                        borderRadius: 10,
                        border: "1px solid var(--border-strong)",
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          marginBottom: 10,
                          fontWeight: 600,
                        }}
                      >
                        Equipment occupied? Select a biomechanically matched alternative:
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {alternatives.length > 0 ? (
                          alternatives.map((alt) => (
                            <button
                              key={alt.id}
                              className="filter-chip"
                              style={{ display: "flex", alignItems: "center", gap: 6 }}
                              onClick={() => {
                                swapExercise(exercise.id, alt.id);
                                setSwapping(null);
                              }}
                            >
                              <ArrowLeftRight size={12} color="var(--accent)" />
                              <span>{alt.name}</span>
                              <span style={{ color: "var(--text-muted)" }}>({alt.equipment})</span>
                            </button>
                          ))
                        ) : (
                          <span className="section-meta">
                            No unused alternatives found for {exercise.primaryMuscle}.
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Set Table */}
                <table className="set-table">
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>Set</th>
                      <th>Weight ({unit})</th>
                      <th>Reps</th>
                      <th style={{ width: 60, textAlign: "center" }}>Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logged.sets.map((set, setIndex) => (
                      <tr key={set.id}>
                        <td className="set-number">{setIndex + 1}</td>
                        <td>
                          <div className="set-stepper">
                            <button
                              className="stepper-btn"
                              aria-label="Decrease weight"
                              onClick={() => adjustWeight(exercise.id, set.id, set.weight, -2.5)}
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              aria-label={`Weight set ${setIndex + 1}`}
                              className="set-input"
                              type="number"
                              step="0.5"
                              value={set.weight}
                              onChange={(event) =>
                                updateSet(
                                  exercise.id,
                                  set.id,
                                  "weight",
                                  Number(event.target.value)
                                )
                              }
                            />
                            <button
                              className="stepper-btn"
                              aria-label="Increase weight"
                              onClick={() => adjustWeight(exercise.id, set.id, set.weight, 2.5)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="set-stepper">
                            <button
                              className="stepper-btn"
                              aria-label="Decrease reps"
                              onClick={() => adjustReps(exercise.id, set.id, set.reps, -1)}
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              aria-label={`Reps set ${setIndex + 1}`}
                              className="set-input"
                              type="number"
                              value={set.reps}
                              onChange={(event) =>
                                updateSet(
                                  exercise.id,
                                  set.id,
                                  "reps",
                                  Number(event.target.value)
                                )
                              }
                            />
                            <button
                              className="stepper-btn"
                              aria-label="Increase reps"
                              onClick={() => adjustReps(exercise.id, set.id, set.reps, 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <motion.button
                            whileTap={{ scale: 0.88 }}
                            aria-label={`Complete set ${setIndex + 1}`}
                            className={`set-check ${set.done ? "done" : ""}`}
                            onClick={() => handleToggle(exercise.id, set.id, set.done)}
                          >
                            {set.done && <Check size={18} strokeWidth={2.6} />}
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  className="ghost-button"
                  style={{ marginTop: 14 }}
                  onClick={() => addSet(exercise.id)}
                >
                  <Plus size={14} /> Add Next Set
                </button>
              </motion.section>
            );
          })}
        </div>

        {/* Sticky Gym Floor Control Center (Timer + Session Volume HUD) */}
        <aside className="workout-aside">
          {/* Rest Timer Card */}
          <section className="panel timer-card">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--accent)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Timer size={16} /> REST INTERVAL
            </div>

            <div className={`timer-number ${running ? "running" : ""}`}>
              {formatTime(timer)}
            </div>
            <div className="timer-label">
              {running ? "Rest period active" : "Auto-starts on set completion"}
            </div>

            {/* Quick Timer Controls */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18 }}>
              <button
                className="secondary-button"
                style={{ flex: 1, height: 38, fontSize: 12 }}
                onClick={() => {
                  setTimer(restSeconds);
                  setRunning(true);
                }}
              >
                <Play size={12} fill="currentColor" /> {restSeconds}s
              </button>
              <button
                className="secondary-button"
                style={{ height: 38, padding: "0 12px", fontSize: 12 }}
                onClick={() => {
                  setTimer((t) => t + 30);
                  setRunning(true);
                }}
              >
                +30s
              </button>
              <button
                className="ghost-button"
                style={{ height: 38, padding: "0 12px" }}
                onClick={() => {
                  setTimer(0);
                  setRunning(false);
                }}
                aria-label="Reset timer"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </section>

          {/* Real-time Session Summary Card */}
          <section className="panel session-card">
            <h2 className="section-title" style={{ fontSize: 16 }}>
              <Sparkles size={16} color="var(--accent)" /> Session Load
            </h2>

            <div className="session-row" style={{ marginTop: 12 }}>
              <span>Completed Sets</span>
              <strong>
                {completedSets} / {totalSets}
              </strong>
            </div>
            <div className="session-row">
              <span>Volume Lifted</span>
              <strong style={{ color: "var(--accent)" }}>
                {currentVolume.toLocaleString()} {unit}
              </strong>
            </div>
            <div className="session-row">
              <span>Movements</span>
              <strong>{activeWorkout.exercises.length} Exercises</strong>
            </div>

            <button
              className="primary-button"
              style={{ width: "100%", marginTop: 20, height: 48, fontSize: 14 }}
              onClick={() => setFinishModalOpen(true)}
            >
              <Check size={16} /> Complete & Save
            </button>
          </section>
        </aside>
      </div>

      {/* Finish Session Confirmation Modal */}
      <AnimatePresence>
        {finishModalOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setFinishModalOpen(false)}
          >
            <motion.section
              className="modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: "center", padding: "12px 0 20px" }}>
                <div
                  className="stat-icon"
                  style={{
                    width: 60,
                    height: 60,
                    margin: "0 auto 16px",
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    border: "1px solid rgba(16, 231, 97, 0.3)",
                  }}
                >
                  <Trophy size={30} />
                </div>
                <h2 className="modal-title" style={{ fontSize: 28 }}>
                  Finish Workout?
                </h2>
                <p className="page-subtitle" style={{ margin: "8px auto 0", maxWidth: 440 }}>
                  You completed {completedSets} sets with a total volume of{" "}
                  <strong style={{ color: "var(--accent)" }}>
                    {currentVolume.toLocaleString()} {unit}
                  </strong>
                  .
                </p>
              </div>

              <div className="goal-list" style={{ margin: "20px 0" }}>
                <div className="goal-row">
                  <span>Workout Name</span>
                  <strong>{activeWorkout.name}</strong>
                </div>
                <div className="goal-row">
                  <span>Completion Rate</span>
                  <strong>{progressPercent}%</strong>
                </div>
                <div className="goal-row">
                  <span>Logged Volume</span>
                  <strong>
                    {currentVolume.toLocaleString()} {unit}
                  </strong>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="ghost-button"
                  onClick={() => setFinishModalOpen(false)}
                >
                  Keep Training
                </button>
                <button className="primary-button" onClick={handleFinish}>
                  <Check size={16} /> Save to History
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discard Confirmation Modal */}
      <AnimatePresence>
        {discardModalOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setDiscardModalOpen(false)}
          >
            <motion.section
              className="modal"
              style={{ maxWidth: 460 }}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <div>
                  <div className="eyebrow" style={{ color: "var(--rose)" }}>
                    Discard Workout
                  </div>
                  <h2 className="modal-title">Discard this session?</h2>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setDiscardModalOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>
              <p className="page-subtitle" style={{ margin: 0 }}>
                All logged sets for this session will be cleared. This action cannot be undone.
              </p>

              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button
                  className="ghost-button"
                  onClick={() => setDiscardModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="primary-button danger-button"
                  onClick={handleDiscard}
                >
                  <Trash2 size={15} /> Yes, Discard
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
