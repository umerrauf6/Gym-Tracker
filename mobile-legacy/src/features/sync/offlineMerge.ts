import type { CloudSnapshot } from './cloudSync';

const newest = <T extends { id: string }>(local: T[], remote: T[], updatedAt: (item: T) => string) => {
  const merged = new Map(remote.map((item) => [item.id, item]));
  local.forEach((item) => {
    const current = merged.get(item.id);
    if (!current || updatedAt(item) >= updatedAt(current)) merged.set(item.id, item);
  });
  return [...merged.values()];
};

export function mergeCloudSnapshots(
  local: CloudSnapshot,
  remote: CloudSnapshot,
  deletedRoutineIds: Set<string> = new Set(),
  deletedPhotoIds: Set<string> = new Set(),
): CloudSnapshot {
  return {
    ...remote,
    routines: newest(local.routines, remote.routines, (routine) => routine.updatedAt ?? routine.createdAt).filter((routine) => !deletedRoutineIds.has(routine.id)),
    history: newest(local.history, remote.history, (workout) => workout.completedAt).sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    progressPhotos: newest(local.progressPhotos, remote.progressPhotos, (photo) => photo.createdAt).filter((photo) => !deletedPhotoIds.has(photo.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    trainingProfile: remote.trainingProfile.complete ? remote.trainingProfile : local.trainingProfile,
  };
}
