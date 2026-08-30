import { describe, expect, it } from 'vitest';
import { calculateWorkoutAnalytics } from './workoutAnalytics';
import type { WorkoutHistoryEntry } from '@/src/store/useAppStore';

const workout: WorkoutHistoryEntry = {
  id: 'workout-1', name: 'Push Day', startedAt: '2026-08-10T10:00:00.000Z', completedAt: '2026-08-10T10:45:00.000Z', totalVolumeKg: 2400,
  exercises: [{ id: 'logged-1', exerciseId: 'barbell-bench-press', sets: [{ id: 'set-1', reps: 10, weightKg: 80, completed: true }, { id: 'set-2', reps: 10, weightKg: 80, completed: false }] }],
};

describe('calculateWorkoutAnalytics', () => {
  it('counts only completed sets while keeping saved workout volume', () => {
    const result = calculateWorkoutAnalytics([workout], 28, new Date('2026-08-15T12:00:00.000Z'));
    expect(result.workoutCount).toBe(1);
    expect(result.completedSets).toBe(1);
    expect(result.totalVolumeKg).toBe(2400);
    expect(result.averageDurationMinutes).toBe(45);
    expect(result.topExercises[0]).toMatchObject({ exerciseId: 'barbell-bench-press', bestWeightKg: 80, volumeKg: 800 });
  });

  it('excludes workouts outside the selected range', () => {
    expect(calculateWorkoutAnalytics([workout], 28, new Date('2026-10-15T12:00:00.000Z')).workoutCount).toBe(0);
  });
});
