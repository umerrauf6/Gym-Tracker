import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type * as ZustandMiddleware from 'zustand/middleware';
import { EXERCISES } from '@/src/features/exercises/data/exercises';

// Metro's web resolver currently selects Zustand's ESM middleware build, which
// contains `import.meta` and crashes Expo's classic web bundle before React can
// mount. Requiring the published CommonJS build keeps native and web aligned.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createJSONStorage, persist } = require('zustand/middleware') as typeof ZustandMiddleware;

export type WeightUnit = 'kg' | 'lb';

export type RoutineExercisePrescription = {
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  notes?: string;
};

export type Routine = {
  id: string;
  name: string;
  exerciseIds: string[];
  exerciseTargets?: Record<string, RoutineExercisePrescription>;
  createdAt: string;
  updatedAt?: string;
};

export type LoggedSet = {
  id: string;
  reps: number;
  weightKg: number;
  completed: boolean;
};

export type LoggedExercise = {
  id: string;
  exerciseId: string;
  sets: LoggedSet[];
  restSeconds?: number;
  notes?: string;
};

export type ActiveWorkout = {
  id: string;
  routineId?: string;
  name: string;
  startedAt: string;
  exercises: LoggedExercise[];
  notes?: string;
};

export type PersonalRecord = {
  exerciseId: string;
  type: 'weight' | 'set-volume';
  previousBest: number;
  newBest: number;
};

export type WorkoutHistoryEntry = ActiveWorkout & {
  completedAt: string;
  totalVolumeKg: number;
  personalRecords?: PersonalRecord[];
};

export type ProgressPhoto = {
  id: string;
  uri: string;
  createdAt: string;
  caption?: string;
};

export type TrainingProfile = {
  complete: boolean;
  goal: 'strength' | 'muscle' | 'fitness' | 'weight-loss';
  experience: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
};

export type AppSettings = {
  weightUnit: WeightUnit;
  restSeconds: number;
  notificationsEnabled: boolean;
};

type AppState = {
  displayName: string;
  email: string;
  isPro: boolean;
  routines: Routine[];
  activeWorkout: ActiveWorkout | null;
  history: WorkoutHistoryEntry[];
  progressPhotos: ProgressPhoto[];
  trainingProfile: TrainingProfile;
  settings: AppSettings;
  createRoutine: (name: string, exerciseIds: string[], exerciseTargets?: Record<string, RoutineExercisePrescription>) => string | null;
  updateRoutine: (id: string, name: string, exerciseIds: string[], exerciseTargets?: Record<string, RoutineExercisePrescription>) => void;
  deleteRoutine: (id: string) => void;
  startRoutine: (routineId: string) => string | null;
  startQuickWorkout: () => string;
  addExerciseToActive: (exerciseId: string) => void;
  removeExerciseFromActive: (loggedExerciseId: string) => void;
  swapActiveExercise: (loggedExerciseId: string, replacementExerciseId: string) => void;
  addSet: (loggedExerciseId: string) => void;
  removeSet: (loggedExerciseId: string, setId: string) => void;
  updateSet: (loggedExerciseId: string, setId: string, values: Partial<Pick<LoggedSet, 'reps' | 'weightKg'>>) => void;
  updateActiveExerciseNote: (loggedExerciseId: string, notes: string) => void;
  updateActiveWorkoutNote: (notes: string) => void;
  toggleSetComplete: (loggedExerciseId: string, setId: string) => boolean;
  finishActiveWorkout: () => WorkoutHistoryEntry | null;
  discardActiveWorkout: () => void;
  setProfile: (displayName: string, email: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  activatePro: () => void;
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id' | 'createdAt'>) => string;
  updateProgressPhoto: (id: string, updates: Partial<Pick<ProgressPhoto, 'caption' | 'uri'>>) => void;
  deleteProgressPhoto: (id: string) => void;
  updateTrainingProfile: (profile: Partial<TrainingProfile>) => void;
  hydrateFromCloud: (snapshot: Pick<AppState, 'displayName' | 'email' | 'isPro' | 'routines' | 'history' | 'settings'> & Partial<Pick<AppState, 'trainingProfile' | 'progressPhotos'>>) => void;
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const createSets = (count = 3, reps = 10): LoggedSet[] => Array.from({ length: count }, () => ({
  id: createId('set'),
  reps,
  weightKg: 0,
  completed: false,
}));

const createLoggedExercise = (exerciseId: string, prescription?: RoutineExercisePrescription, defaultRestSeconds = 90): LoggedExercise => ({
  id: createId('logged-exercise'),
  exerciseId,
  sets: createSets(prescription?.targetSets ?? 3, prescription?.targetReps ?? 10),
  restSeconds: prescription?.restSeconds ?? defaultRestSeconds,
  notes: prescription?.notes,
});

const defaultRoutines: Routine[] = [
  {
    id: 'push-day',
    name: 'Push Day',
    exerciseIds: ['barbell-bench-press', 'incline-dumbbell-press', 'machine-chest-press', 'triceps-pushdown'],
    createdAt: new Date(2026, 7, 1).toISOString(),
    updatedAt: new Date(2026, 7, 1).toISOString(),
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    exerciseIds: ['pull-up', 'lat-pulldown', 'dumbbell-curl'],
    createdAt: new Date(2026, 7, 2).toISOString(),
    updatedAt: new Date(2026, 7, 2).toISOString(),
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      displayName: 'Umer Rauf',
      email: 'umer@example.com',
      isPro: false,
      routines: defaultRoutines,
      activeWorkout: null,
      history: [],
      progressPhotos: [],
      trainingProfile: { complete: false, goal: 'muscle', experience: 'beginner', daysPerWeek: 3 },
      settings: {
        weightUnit: 'kg',
        restSeconds: 90,
        notificationsEnabled: true,
      },

      createRoutine: (name, exerciseIds, exerciseTargets = {}) => {
        const state = get();
        if (!state.isPro && state.routines.length >= 2) return null;
        const id = createId('routine');
        set({
          routines: [...state.routines, { id, name: name.trim(), exerciseIds, exerciseTargets, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        });
        return id;
      },

      updateRoutine: (id, name, exerciseIds, exerciseTargets = {}) => set((state) => ({
        routines: state.routines.map((routine) =>
          routine.id === id ? { ...routine, name: name.trim(), exerciseIds, exerciseTargets, updatedAt: new Date().toISOString() } : routine,
        ),
      })),

      deleteRoutine: (id) => set((state) => ({
        routines: state.routines.filter((routine) => routine.id !== id),
      })),

      startRoutine: (routineId) => {
        const routine = get().routines.find((item) => item.id === routineId);
        if (!routine) return null;
        const id = createId('workout');
        set({
          activeWorkout: {
            id,
            routineId,
            name: routine.name,
            startedAt: new Date().toISOString(),
            exercises: routine.exerciseIds.map((exerciseId) => createLoggedExercise(exerciseId, routine.exerciseTargets?.[exerciseId], get().settings.restSeconds)),
          },
        });
        return id;
      },

      startQuickWorkout: () => {
        const id = createId('workout');
        set({ activeWorkout: { id, name: 'Quick Workout', startedAt: new Date().toISOString(), exercises: [] } });
        return id;
      },

      addExerciseToActive: (exerciseId) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: [...state.activeWorkout.exercises, createLoggedExercise(exerciseId, undefined, state.settings.restSeconds)],
          },
        };
      }),

      removeExerciseFromActive: (loggedExerciseId) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.filter((item) => item.id !== loggedExerciseId),
          },
        };
      }),

      swapActiveExercise: (loggedExerciseId, replacementExerciseId) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map((item) =>
              item.id === loggedExerciseId ? { ...item, exerciseId: replacementExerciseId } : item,
            ),
          },
        };
      }),

      addSet: (loggedExerciseId) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map((item) => {
              if (item.id !== loggedExerciseId) return item;
              const last = item.sets[item.sets.length - 1];
              return {
                ...item,
                sets: [...item.sets, {
                  id: createId('set'),
                  reps: last?.reps ?? 10,
                  weightKg: last?.weightKg ?? 0,
                  completed: false,
                }],
              };
            }),
          },
        };
      }),

      removeSet: (loggedExerciseId, setId) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map((item) =>
              item.id === loggedExerciseId
                ? { ...item, sets: item.sets.filter((workoutSet) => workoutSet.id !== setId) }
                : item,
            ),
          },
        };
      }),

      updateSet: (loggedExerciseId, setId, values) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: state.activeWorkout.exercises.map((item) =>
              item.id === loggedExerciseId
                ? { ...item, sets: item.sets.map((workoutSet) => workoutSet.id === setId ? { ...workoutSet, ...values } : workoutSet) }
                : item,
            ),
          },
        };
      }),

      updateActiveExerciseNote: (loggedExerciseId, notes) => set((state) => {
        if (!state.activeWorkout) return state;
        return { activeWorkout: { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((exercise) => exercise.id === loggedExerciseId ? { ...exercise, notes } : exercise) } };
      }),
      updateActiveWorkoutNote: (notes) => set((state) => state.activeWorkout ? { activeWorkout: { ...state.activeWorkout, notes } } : state),

      toggleSetComplete: (loggedExerciseId, setId) => {
        let becameComplete = false;
        set((state) => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.map((item) =>
                item.id === loggedExerciseId
                  ? {
                      ...item,
                      sets: item.sets.map((workoutSet) => {
                        if (workoutSet.id !== setId) return workoutSet;
                        becameComplete = !workoutSet.completed;
                        return { ...workoutSet, completed: !workoutSet.completed };
                      }),
                    }
                  : item,
              ),
            },
          };
        });
        return becameComplete;
      },

      finishActiveWorkout: () => {
        const active = get().activeWorkout;
        if (!active) return null;
        const previousHistory = get().history;
        const totalVolumeKg = active.exercises.reduce(
          (workoutTotal, exercise) => workoutTotal + exercise.sets.reduce(
            (setTotal, workoutSet) => setTotal + (workoutSet.completed ? workoutSet.reps * workoutSet.weightKg : 0),
            0,
          ),
          0,
        );
        const personalRecords: PersonalRecord[] = [];
        active.exercises.forEach((exercise) => {
          const completed = exercise.sets.filter((workoutSet) => workoutSet.completed);
          if (!completed.length) return;
          const previousSets = previousHistory.flatMap((workout) => workout.exercises.filter((item) => item.exerciseId === exercise.exerciseId).flatMap((item) => item.sets.filter((workoutSet) => workoutSet.completed)));
          const previousWeight = Math.max(0, ...previousSets.map((workoutSet) => workoutSet.weightKg));
          const previousSetVolume = Math.max(0, ...previousSets.map((workoutSet) => workoutSet.weightKg * workoutSet.reps));
          const newWeight = Math.max(...completed.map((workoutSet) => workoutSet.weightKg));
          const newSetVolume = Math.max(...completed.map((workoutSet) => workoutSet.weightKg * workoutSet.reps));
          if (newWeight > previousWeight && newWeight > 0) personalRecords.push({ exerciseId: exercise.exerciseId, type: 'weight', previousBest: previousWeight, newBest: newWeight });
          if (newSetVolume > previousSetVolume && newSetVolume > 0) personalRecords.push({ exerciseId: exercise.exerciseId, type: 'set-volume', previousBest: previousSetVolume, newBest: newSetVolume });
        });
        const entry: WorkoutHistoryEntry = { ...active, completedAt: new Date().toISOString(), totalVolumeKg, personalRecords };
        set((state) => ({ activeWorkout: null, history: [entry, ...state.history] }));
        return entry;
      },

      discardActiveWorkout: () => set({ activeWorkout: null }),
      setProfile: (displayName, email) => set({ displayName: displayName.trim(), email: email.trim() }),
      updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
      activatePro: () => set({ isPro: true }),
      addProgressPhoto: (photo) => {
        const id = createId('progress-photo');
        set((state) => ({ progressPhotos: [{ ...photo, id, createdAt: new Date().toISOString() }, ...state.progressPhotos] }));
        return id;
      },
      updateProgressPhoto: (id, updates) => set((state) => ({ progressPhotos: state.progressPhotos.map((photo) => photo.id === id ? { ...photo, ...updates } : photo) })),
      deleteProgressPhoto: (id) => set((state) => ({ progressPhotos: state.progressPhotos.filter((photo) => photo.id !== id) })),
      updateTrainingProfile: (profile) => set((state) => ({ trainingProfile: { ...state.trainingProfile, ...profile } })),
      hydrateFromCloud: (snapshot) => set(snapshot),
    }),
    {
      name: 'flexsaas-app-state',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        displayName: state.displayName,
        email: state.email,
        isPro: state.isPro,
        routines: state.routines,
        activeWorkout: state.activeWorkout,
        history: state.history,
        progressPhotos: state.progressPhotos,
        trainingProfile: state.trainingProfile,
        settings: state.settings,
      }),
    },
  ),
);

export function getWorkoutAlternatives(exerciseId: string) {
  const current = EXERCISES.find((exercise) => exercise.id === exerciseId);
  if (!current) return [];
  const differentEquipment = EXERCISES.filter(
    (exercise) =>
      exercise.id !== current.id &&
      exercise.primaryMuscle === current.primaryMuscle &&
      exercise.equipment !== current.equipment,
  );
  const sameEquipmentFallback = EXERCISES.filter(
    (exercise) => exercise.id !== current.id && exercise.primaryMuscle === current.primaryMuscle,
  );
  return [...differentEquipment, ...sameEquipmentFallback]
    .filter((exercise, index, array) => array.findIndex((item) => item.id === exercise.id) === index)
    .slice(0, 3);
}
