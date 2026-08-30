import { getExerciseById, MuscleGroup } from '@/src/features/exercises/data/exercises';
import type { WorkoutHistoryEntry } from '@/src/store/useAppStore';

export type AnalyticsRange = 28 | 84 | 0;

export type WeeklyVolume = {
  key: string;
  label: string;
  volumeKg: number;
  workouts: number;
};

export type ExercisePerformance = {
  exerciseId: string;
  name: string;
  volumeKg: number;
  completedSets: number;
  bestWeightKg: number;
};

export type WorkoutAnalytics = {
  workoutCount: number;
  totalVolumeKg: number;
  completedSets: number;
  averageDurationMinutes: number;
  weeklyStreak: number;
  weeklyVolume: WeeklyVolume[];
  muscleSets: { muscle: MuscleGroup; sets: number; percentage: number }[];
  topExercises: ExercisePerformance[];
};

const startOfWeek = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const mondayOffset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - mondayOffset);
  return result;
};

const weekKey = (date: Date) => startOfWeek(date).toISOString().slice(0, 10);

function getWeeklyStreak(history: WorkoutHistoryEntry[], now: Date) {
  const trainedWeeks = new Set(history.map((workout) => weekKey(new Date(workout.completedAt))));
  const cursor = startOfWeek(now);
  if (!trainedWeeks.has(weekKey(cursor))) cursor.setDate(cursor.getDate() - 7);

  let streak = 0;
  while (trainedWeeks.has(weekKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export function calculateWorkoutAnalytics(
  history: WorkoutHistoryEntry[],
  range: AnalyticsRange = 28,
  now = new Date(),
): WorkoutAnalytics {
  const cutoff = range === 0 ? null : new Date(now.getTime() - range * 24 * 60 * 60 * 1000);
  const workouts = history.filter((workout) => !cutoff || new Date(workout.completedAt) >= cutoff);
  const totalVolumeKg = workouts.reduce((total, workout) => total + workout.totalVolumeKg, 0);
  const completedSets = workouts.reduce(
    (total, workout) => total + workout.exercises.reduce(
      (exerciseTotal, exercise) => exerciseTotal + exercise.sets.filter((set) => set.completed).length,
      0,
    ),
    0,
  );
  const totalDurationMinutes = workouts.reduce((total, workout) => {
    const duration = new Date(workout.completedAt).getTime() - new Date(workout.startedAt).getTime();
    return total + Math.max(1, Math.round(duration / 60000));
  }, 0);

  const bucketCount = range === 84 ? 12 : range === 0 ? 12 : 4;
  const currentWeek = startOfWeek(now);
  const weeklyVolume = Array.from({ length: bucketCount }, (_, index) => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - (bucketCount - index - 1) * 7);
    return {
      key: weekKey(start),
      label: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volumeKg: 0,
      workouts: 0,
    };
  });
  const buckets = new Map(weeklyVolume.map((bucket) => [bucket.key, bucket]));

  const muscleCounts = new Map<MuscleGroup, number>();
  const exercisePerformance = new Map<string, ExercisePerformance>();

  workouts.forEach((workout) => {
    const bucket = buckets.get(weekKey(new Date(workout.completedAt)));
    if (bucket) {
      bucket.volumeKg += workout.totalVolumeKg;
      bucket.workouts += 1;
    }

    workout.exercises.forEach((loggedExercise) => {
      const exercise = getExerciseById(loggedExercise.exerciseId);
      if (!exercise) return;
      const completed = loggedExercise.sets.filter((set) => set.completed);
      if (completed.length === 0) return;
      muscleCounts.set(exercise.primaryMuscle, (muscleCounts.get(exercise.primaryMuscle) ?? 0) + completed.length);

      const current = exercisePerformance.get(exercise.id) ?? {
        exerciseId: exercise.id,
        name: exercise.name,
        volumeKg: 0,
        completedSets: 0,
        bestWeightKg: 0,
      };
      completed.forEach((set) => {
        current.volumeKg += set.reps * set.weightKg;
        current.completedSets += 1;
        current.bestWeightKg = Math.max(current.bestWeightKg, set.weightKg);
      });
      exercisePerformance.set(exercise.id, current);
    });
  });

  const muscleSets = Array.from(muscleCounts.entries())
    .map(([muscle, sets]) => ({ muscle, sets, percentage: completedSets ? Math.round((sets / completedSets) * 100) : 0 }))
    .sort((a, b) => b.sets - a.sets);

  return {
    workoutCount: workouts.length,
    totalVolumeKg,
    completedSets,
    averageDurationMinutes: workouts.length ? Math.round(totalDurationMinutes / workouts.length) : 0,
    weeklyStreak: getWeeklyStreak(history, now),
    weeklyVolume,
    muscleSets,
    topExercises: Array.from(exercisePerformance.values()).sort((a, b) => b.volumeKg - a.volumeKg).slice(0, 5),
  };
}
