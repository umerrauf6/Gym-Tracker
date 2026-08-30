import type { User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import type { ProgressPhoto, Routine, TrainingProfile, WeightUnit, WorkoutHistoryEntry } from '@/src/store/useAppStore';

export type CloudSettings = {
  weightUnit: WeightUnit;
  restSeconds: number;
  notificationsEnabled: boolean;
};

export type CloudSnapshot = {
  displayName: string;
  email: string;
  isPro: boolean;
  routines: Routine[];
  history: WorkoutHistoryEntry[];
  settings: CloudSettings;
  trainingProfile: TrainingProfile;
  progressPhotos: ProgressPhoto[];
};

export type CloudLoadResult = CloudSnapshot & {
  hasTrainingData: boolean;
};

type ExerciseRow = { id: string; slug: string };
type WorkoutRow = { id: string; client_id: string; name: string; created_at: string; updated_at: string };
type WorkoutExerciseRow = { workout_id: string; exercise_id: string; position: number; target_sets: number | null; target_reps_min: number | null; rest_seconds: number; notes: string | null };
type LogRow = {
  id: string;
  client_id: string;
  workout_id: string | null;
  workout_name: string;
  started_at: string;
  completed_at: string;
  notes: string | null;
};
type LogExerciseRow = { id: string; workout_log_id: string; exercise_id: string; position: number; notes: string | null };
type ProgressPhotoRow = { client_id: string; image_url: string | null; storage_path: string | null; caption: string | null; captured_at: string };
type SetRow = {
  id: string;
  workout_log_exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | string | null;
  completed_at: string | null;
};

const requireClient = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

const throwIfError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

async function getExerciseMaps() {
  const client = requireClient();
  const { data, error } = await client.from('exercises').select('id, slug');
  throwIfError(error);
  const rows = (data ?? []) as ExerciseRow[];
  return {
    uuidBySlug: new Map(rows.map((row) => [row.slug, row.id])),
    slugByUuid: new Map(rows.map((row) => [row.id, row.slug])),
  };
}

export async function loadCloudSnapshot(user: User): Promise<CloudLoadResult> {
  const client = requireClient();
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('display_name, subscription_tier, weight_unit, rest_seconds, notifications_enabled, onboarding_complete, training_goal, experience_level, days_per_week')
    .eq('id', user.id)
    .maybeSingle();
  throwIfError(profileError);

  if (!profile) {
    const { error } = await client.from('profiles').insert({
      id: user.id,
      display_name: user.user_metadata.display_name ?? user.email?.split('@')[0] ?? 'Athlete',
    });
    throwIfError(error);
  }

  const [{ slugByUuid }, workoutsResult, logsResult, photosResult] = await Promise.all([
    getExerciseMaps(),
    client.from('workouts').select('id, client_id, name, created_at, updated_at').eq('user_id', user.id).order('created_at'),
    client.from('workout_logs').select('id, client_id, workout_id, workout_name, started_at, completed_at, notes').eq('user_id', user.id).eq('status', 'completed').order('completed_at', { ascending: false }),
    client.from('progress_photos').select('client_id, image_url, storage_path, caption, captured_at').eq('user_id', user.id).order('captured_at', { ascending: false }),
  ]);
  throwIfError(workoutsResult.error);
  throwIfError(logsResult.error);
  throwIfError(photosResult.error);

  const workoutRows = (workoutsResult.data ?? []) as WorkoutRow[];
  const logRows = (logsResult.data ?? []) as LogRow[];
  const workoutIds = workoutRows.map((row) => row.id);
  const logIds = logRows.map((row) => row.id);

  const workoutExercisesResult = workoutIds.length
    ? await client.from('workout_exercises').select('workout_id, exercise_id, position, target_sets, target_reps_min, rest_seconds, notes').in('workout_id', workoutIds).order('position')
    : { data: [], error: null };
  throwIfError(workoutExercisesResult.error);
  const workoutExerciseRows = (workoutExercisesResult.data ?? []) as WorkoutExerciseRow[];

  const logExercisesResult = logIds.length
    ? await client.from('workout_log_exercises').select('id, workout_log_id, exercise_id, position, notes').in('workout_log_id', logIds).order('position')
    : { data: [], error: null };
  throwIfError(logExercisesResult.error);
  const logExerciseRows = (logExercisesResult.data ?? []) as LogExerciseRow[];
  const logExerciseIds = logExerciseRows.map((row) => row.id);

  const setsResult = logExerciseIds.length
    ? await client.from('workout_sets').select('id, workout_log_exercise_id, set_number, reps, weight_kg, completed_at').in('workout_log_exercise_id', logExerciseIds).order('set_number')
    : { data: [], error: null };
  throwIfError(setsResult.error);
  const setRows = (setsResult.data ?? []) as SetRow[];
  const routineClientIdByUuid = new Map(workoutRows.map((row) => [row.id, row.client_id]));

  const routines: Routine[] = workoutRows.map((row) => {
    const children = workoutExerciseRows
      .filter((item) => item.workout_id === row.id)
      .sort((a, b) => a.position - b.position);
    return {
      id: row.client_id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      exerciseIds: children.map((item) => slugByUuid.get(item.exercise_id)).filter((slug): slug is string => Boolean(slug)),
      exerciseTargets: Object.fromEntries(children.flatMap((item) => {
        const slug = slugByUuid.get(item.exercise_id);
        return slug ? [[slug, { targetSets: item.target_sets ?? 3, targetReps: item.target_reps_min ?? 10, restSeconds: item.rest_seconds, notes: item.notes ?? undefined }]] : [];
      })),
    };
  });

  const history: WorkoutHistoryEntry[] = logRows.map((row) => {
    const exercises = logExerciseRows
      .filter((item) => item.workout_log_id === row.id)
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        id: item.id,
        exerciseId: slugByUuid.get(item.exercise_id) ?? '',
        notes: item.notes ?? undefined,
        sets: setRows
          .filter((set) => set.workout_log_exercise_id === item.id)
          .sort((a, b) => a.set_number - b.set_number)
          .map((set) => ({
            id: set.id,
            reps: set.reps ?? 0,
            weightKg: Number(set.weight_kg ?? 0),
            completed: Boolean(set.completed_at),
          })),
      }))
      .filter((exercise) => Boolean(exercise.exerciseId));
    const totalVolumeKg = exercises.reduce(
      (total, exercise) => total + exercise.sets.reduce(
        (setTotal, set) => setTotal + (set.completed ? set.reps * set.weightKg : 0),
        0,
      ),
      0,
    );
    return {
      id: row.client_id,
      routineId: row.workout_id ? routineClientIdByUuid.get(row.workout_id) : undefined,
      name: row.workout_name,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      totalVolumeKg,
      exercises,
      notes: row.notes ?? undefined,
    };
  });

  return {
    displayName: profile?.display_name ?? user.user_metadata.display_name ?? user.email?.split('@')[0] ?? 'Athlete',
    email: user.email ?? '',
    isPro: profile?.subscription_tier === 'pro',
    settings: {
      weightUnit: profile?.weight_unit === 'lb' ? 'lb' : 'kg',
      restSeconds: profile?.rest_seconds ?? 90,
      notificationsEnabled: profile?.notifications_enabled ?? true,
    },
    trainingProfile: {
      complete: profile?.onboarding_complete ?? false,
      goal: profile?.training_goal ?? 'muscle',
      experience: profile?.experience_level ?? 'beginner',
      daysPerWeek: profile?.days_per_week ?? 3,
    },
    progressPhotos: await Promise.all(((photosResult.data ?? []) as ProgressPhotoRow[]).map(async (photo) => {
      let uri = photo.image_url ?? '';
      if (photo.storage_path) {
        const { data } = await client.storage.from('progress-photos').createSignedUrl(photo.storage_path, 60 * 60 * 24 * 7);
        uri = data?.signedUrl ?? uri;
      }
      return { id: photo.client_id, uri, caption: photo.caption ?? undefined, createdAt: photo.captured_at };
    })),
    routines,
    history,
    hasTrainingData: routines.length > 0 || history.length > 0,
  };
}

export async function pushCloudSnapshot(
  user: User,
  snapshot: CloudSnapshot,
  deletedRoutineClientIds: string[] = [],
) {
  const client = requireClient();
  const { uuidBySlug } = await getExerciseMaps();
  if (uuidBySlug.size === 0) throw new Error('The exercise seed migration has not been applied.');

  const { error: profileError } = await client.from('profiles').update({
    display_name: snapshot.displayName,
    weight_unit: snapshot.settings.weightUnit,
    rest_seconds: snapshot.settings.restSeconds,
    notifications_enabled: snapshot.settings.notificationsEnabled,
    onboarding_complete: snapshot.trainingProfile.complete,
    training_goal: snapshot.trainingProfile.goal,
    experience_level: snapshot.trainingProfile.experience,
    days_per_week: snapshot.trainingProfile.daysPerWeek,
  }).eq('id', user.id);
  throwIfError(profileError);

  if (deletedRoutineClientIds.length) {
    const { error } = await client.from('workouts').delete().eq('user_id', user.id).in('client_id', deletedRoutineClientIds);
    throwIfError(error);
  }

  const { data: existingWorkouts, error: workoutsError } = await client
    .from('workouts')
    .select('id, client_id')
    .eq('user_id', user.id);
  throwIfError(workoutsError);
  const workoutUuidByClientId = new Map(
    ((existingWorkouts ?? []) as { id: string; client_id: string }[]).map((row) => [row.client_id, row.id]),
  );

  for (const routine of snapshot.routines) {
    let workoutUuid = workoutUuidByClientId.get(routine.id);
    if (workoutUuid) {
      const { error } = await client.from('workouts').update({ name: routine.name }).eq('id', workoutUuid).eq('user_id', user.id);
      throwIfError(error);
    } else {
      const { data, error } = await client.from('workouts').insert({
        user_id: user.id,
        client_id: routine.id,
        name: routine.name,
        created_at: routine.createdAt,
      }).select('id').single();
      throwIfError(error);
      if (!data?.id) throw new Error('Supabase did not return the new routine ID.');
      workoutUuid = data.id;
      workoutUuidByClientId.set(routine.id, data.id);
    }

    const { error: deleteChildrenError } = await client.from('workout_exercises').delete().eq('workout_id', workoutUuid);
    throwIfError(deleteChildrenError);
    if (routine.exerciseIds.length) {
      const rows = routine.exerciseIds.map((slug, position) => {
        const exerciseId = uuidBySlug.get(slug);
        if (!exerciseId) throw new Error(`Exercise “${slug}” is missing from Supabase.`);
        const target = routine.exerciseTargets?.[slug];
        return { workout_id: workoutUuid, exercise_id: exerciseId, position, target_sets: target?.targetSets ?? 3, target_reps_min: target?.targetReps ?? 10, target_reps_max: target?.targetReps ?? 10, rest_seconds: target?.restSeconds ?? snapshot.settings.restSeconds, notes: target?.notes ?? null };
      });
      const { error } = await client.from('workout_exercises').insert(rows);
      throwIfError(error);
    }
  }

  const { data: existingLogs, error: logsError } = await client
    .from('workout_logs')
    .select('id, client_id')
    .eq('user_id', user.id);
  throwIfError(logsError);
  const logUuidByClientId = new Map(
    ((existingLogs ?? []) as { id: string; client_id: string }[]).map((row) => [row.client_id, row.id]),
  );

  for (const workout of snapshot.history) {
    if (logUuidByClientId.has(workout.id)) continue;
    const logValues = {
      user_id: user.id,
      client_id: workout.id,
      workout_id: workout.routineId ? workoutUuidByClientId.get(workout.routineId) ?? null : null,
      workout_name: workout.name,
      status: 'completed' as const,
      started_at: workout.startedAt,
      completed_at: workout.completedAt,
      notes: workout.notes ?? null,
    };
    const { data, error } = await client.from('workout_logs').insert(logValues).select('id').single();
    throwIfError(error);
    if (!data?.id) throw new Error('Supabase did not return the new workout log ID.');
    const insertedLogUuid = data.id;

    try {
      for (const [position, loggedExercise] of workout.exercises.entries()) {
        const exerciseId = uuidBySlug.get(loggedExercise.exerciseId);
        if (!exerciseId) throw new Error(`Exercise “${loggedExercise.exerciseId}” is missing from Supabase.`);
        const { data: insertedExercise, error: exerciseError } = await client.from('workout_log_exercises').insert({
          workout_log_id: insertedLogUuid,
          exercise_id: exerciseId,
          position,
          notes: loggedExercise.notes ?? null,
        }).select('id').single();
        throwIfError(exerciseError);
        if (!insertedExercise?.id) throw new Error('Supabase did not return the new logged exercise ID.');
        if (loggedExercise.sets.length) {
          const setRows = loggedExercise.sets.map((set, setIndex) => ({
            workout_log_exercise_id: insertedExercise.id,
            set_number: setIndex + 1,
            reps: set.reps,
            weight_kg: set.weightKg,
            completed_at: set.completed ? workout.completedAt : null,
          }));
          const { error: setsError } = await client.from('workout_sets').insert(setRows);
          throwIfError(setsError);
        }
      }
      logUuidByClientId.set(workout.id, insertedLogUuid);
    } catch (writeError) {
      await client.from('workout_logs').delete().eq('id', insertedLogUuid).eq('user_id', user.id);
      throw writeError;
    }
  }

  const { data: existingPhotos, error: photosError } = await client.from('progress_photos').select('client_id, storage_path').eq('user_id', user.id);
  throwIfError(photosError);
  const existingPhotoById = new Map(((existingPhotos ?? []) as { client_id: string; storage_path: string | null }[]).map((photo) => [photo.client_id, photo]));
  const currentPhotoIds = new Set(snapshot.progressPhotos.map((photo) => photo.id));
  const remotePhotoIds = ((existingPhotos ?? []) as { client_id: string }[]).map((photo) => photo.client_id);
  const deletedPhotoIds = remotePhotoIds.filter((id) => !currentPhotoIds.has(id));
  if (deletedPhotoIds.length) {
    const paths = deletedPhotoIds.map((id) => existingPhotoById.get(id)?.storage_path).filter((path): path is string => Boolean(path));
    if (paths.length) {
      const { error: storageError } = await client.storage.from('progress-photos').remove(paths);
      throwIfError(storageError);
    }
    const { error } = await client.from('progress_photos').delete().eq('user_id', user.id).in('client_id', deletedPhotoIds);
    throwIfError(error);
  }
  if (snapshot.progressPhotos.length) {
    const rows = [];
    for (const photo of snapshot.progressPhotos) {
      let storagePath = existingPhotoById.get(photo.id)?.storage_path ?? null;
      if (!storagePath && photo.uri && !photo.uri.startsWith('http')) {
        const response = await fetch(photo.uri);
        if (!response.ok) throw new Error('A progress photo could not be read from this device.');
        const bytes = await response.arrayBuffer();
        storagePath = `${user.id}/${photo.id}.jpg`;
        const { error: uploadError } = await client.storage.from('progress-photos').upload(storagePath, bytes, { contentType: response.headers.get('content-type') ?? 'image/jpeg', upsert: true });
        throwIfError(uploadError);
      }
      rows.push({ user_id: user.id, client_id: photo.id, image_url: storagePath ? null : photo.uri, storage_path: storagePath, caption: photo.caption ?? null, captured_at: photo.createdAt });
    }
    const { error } = await client.from('progress_photos').upsert(rows, { onConflict: 'user_id,client_id' });
    throwIfError(error);
  }
}
