"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LoggedSet = { id: string; reps: number; weight: number; done: boolean };
export type WorkoutExercise = { id: string; exerciseId: string; sets: LoggedSet[] };
export type Routine = { id: string; name: string; exerciseIds: string[]; accent: string };
export type WorkoutSession = {
  id: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  exercises: WorkoutExercise[];
};

const routines: Routine[] = [
  { id: "push", name: "Push Day", exerciseIds: ["barbell-bench-press", "incline-dumbbell-press", "machine-chest-press", "triceps-pushdown"], accent: "#78e87c" },
  { id: "pull", name: "Pull Day", exerciseIds: ["pull-up", "lat-pulldown", "one-arm-dumbbell-row", "barbell-curl"], accent: "#6ca9ff" },
  { id: "legs", name: "Leg Day", exerciseIds: ["back-squat", "leg-press", "dumbbell-lunge", "split-squat"], accent: "#ffb66e" },
];

const history: WorkoutSession[] = [];

type AppState = {
  routines: Routine[];
  history: WorkoutSession[];
  activeWorkout: WorkoutSession | null;
  restSeconds: number;
  unit: "kg" | "lb";
  notifications: boolean;
  isPro: boolean;
  setIsPro: (isPro: boolean) => void;
  startRoutine: (routineId: string) => void;
  startQuickWorkout: () => void;
  updateSet: (exerciseId: string, setId: string, field: "reps" | "weight", value: number) => void;
  toggleSet: (exerciseId: string, setId: string) => void;
  addSet: (exerciseId: string) => void;
  swapExercise: (oldExerciseId: string, newExerciseId: string) => void;
  finishWorkout: () => void;
  discardWorkout: () => void;
  setRestSeconds: (seconds: number) => void;
  setUnit: (unit: "kg" | "lb") => void;
  toggleNotifications: () => void;
  saveRoutine: (routine: Omit<Routine, "id"> & { id?: string }) => void;
};

const makeWorkout = (name: string, exerciseIds: string[]): WorkoutSession => ({
  id: crypto.randomUUID(), name, startedAt: new Date().toISOString(),
  exercises: exerciseIds.map((exerciseId) => ({ id: crypto.randomUUID(), exerciseId, sets: [
    { id: crypto.randomUUID(), reps: 10, weight: 20, done: false },
    { id: crypto.randomUUID(), reps: 10, weight: 20, done: false },
    { id: crypto.randomUUID(), reps: 8, weight: 25, done: false },
  ] })),
});

export const useAppStore = create<AppState>()(persist((set, get) => ({
  routines, history, activeWorkout: null, restSeconds: 90, unit: "kg", notifications: true, isPro: false,
  setIsPro: (isPro) => set({ isPro }),
  startRoutine: (routineId) => { const routine = get().routines.find((item) => item.id === routineId); if (routine) set({ activeWorkout: makeWorkout(routine.name, routine.exerciseIds) }); },
  startQuickWorkout: () => set({ activeWorkout: makeWorkout("Quick Workout", ["barbell-bench-press", "lat-pulldown", "back-squat"]) }),
  updateSet: (exerciseId, setId, field, value) => set((state) => ({ activeWorkout: state.activeWorkout ? { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((exercise) => exercise.exerciseId === exerciseId ? { ...exercise, sets: exercise.sets.map((item) => item.id === setId ? { ...item, [field]: Math.max(0, value || 0) } : item) } : exercise) } : null })),
  toggleSet: (exerciseId, setId) => set((state) => ({ activeWorkout: state.activeWorkout ? { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((exercise) => exercise.exerciseId === exerciseId ? { ...exercise, sets: exercise.sets.map((item) => item.id === setId ? { ...item, done: !item.done } : item) } : exercise) } : null })),
  addSet: (exerciseId) => set((state) => ({ activeWorkout: state.activeWorkout ? { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((exercise) => exercise.exerciseId === exerciseId ? { ...exercise, sets: [...exercise.sets, { id: crypto.randomUUID(), reps: 8, weight: exercise.sets.at(-1)?.weight ?? 20, done: false }] } : exercise) } : null })),
  swapExercise: (oldExerciseId, newExerciseId) => set((state) => ({ activeWorkout: state.activeWorkout ? { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((exercise) => exercise.exerciseId === oldExerciseId ? { ...exercise, exerciseId: newExerciseId } : exercise) } : null })),
  finishWorkout: () => set((state) => state.activeWorkout ? ({ history: [{ ...state.activeWorkout, completedAt: new Date().toISOString() }, ...state.history], activeWorkout: null }) : state),
  discardWorkout: () => set({ activeWorkout: null }),
  setRestSeconds: (restSeconds) => set({ restSeconds }), setUnit: (unit) => set({ unit }), toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
  saveRoutine: (routine) => set((state) => {
    const next = { ...routine, id: routine.id ?? crypto.randomUUID() } as Routine;
    return { routines: state.routines.some((item) => item.id === next.id) ? state.routines.map((item) => item.id === next.id ? next : item) : [...state.routines, next] };
  }),
}), {
  name: "flexsaas-web",
  version: 2,
  migrate: (persisted) => {
    const state = persisted as Partial<AppState>;
    // Remove only the original demo sessions; keep workouts the user creates.
    return { ...state, history: (state.history ?? []).filter((session) => !session.id.startsWith("history-")) } as AppState;
  },
}));

export const sessionVolume = (session: WorkoutSession) => session.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.done).reduce((sum, set) => sum + set.reps * set.weight, 0), 0);
