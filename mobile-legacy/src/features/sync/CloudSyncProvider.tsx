import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { CloudSnapshot, loadCloudSnapshot, pushCloudSnapshot } from '@/src/features/sync/cloudSync';
import { useAppStore } from '@/src/store/useAppStore';
import { mergeCloudSnapshots } from '@/src/features/sync/offlineMerge';

export type CloudSyncStatus = 'local' | 'loading' | 'syncing' | 'synced' | 'error';

type CloudSyncContextValue = {
  status: CloudSyncStatus;
  error: string | null;
  lastSyncedAt: Date | null;
  syncNow: () => Promise<void>;
};

const CloudSyncContext = createContext<CloudSyncContextValue | null>(null);
const pendingKey = (userId: string) => `flexsaas-pending-deletions:${userId}`;

function snapshotFromStore(): CloudSnapshot {
  const state = useAppStore.getState();
  return {
    displayName: state.displayName,
    email: state.email,
    isPro: state.isPro,
    routines: state.routines,
    history: state.history,
    settings: state.settings,
    trainingProfile: state.trainingProfile,
    progressPhotos: state.progressPhotos,
  };
}

const fingerprint = (snapshot: CloudSnapshot) => JSON.stringify({
  displayName: snapshot.displayName,
  routines: snapshot.routines,
  history: snapshot.history,
  settings: snapshot.settings,
  trainingProfile: snapshot.trainingProfile,
  progressPhotos: snapshot.progressPhotos,
});

async function waitForStoreHydration() {
  if (useAppStore.persist.hasHydrated()) return;
  await new Promise<void>((resolve) => {
    const unsubscribe = useAppStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

export function CloudSyncProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const [status, setStatus] = useState<CloudSyncStatus>('local');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const initializedRef = useRef(false);
  const runningRef = useRef(false);
  const queuedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFingerprintRef = useRef('');
  const previousRoutineIdsRef = useRef<Set<string>>(new Set());
  const pendingDeletedRoutineIdsRef = useRef<Set<string>>(new Set());
  const previousPhotoIdsRef = useRef<Set<string>>(new Set());
  const pendingDeletedPhotoIdsRef = useRef<Set<string>>(new Set());

  const performSync = useCallback(async () => {
    const user = session?.user;
    if (!user || !initializedRef.current) return;
    if (runningRef.current) {
      queuedRef.current = true;
      return;
    }

    runningRef.current = true;
    queuedRef.current = false;
    setStatus('syncing');
    setError(null);
    const snapshot = snapshotFromStore();
    const deletedRoutineIds = [...pendingDeletedRoutineIdsRef.current];
    let succeeded = false;
    try {
      await pushCloudSnapshot(user, snapshot, deletedRoutineIds);
      succeeded = true;
      deletedRoutineIds.forEach((id) => pendingDeletedRoutineIdsRef.current.delete(id));
      pendingDeletedPhotoIdsRef.current.clear();
      await AsyncStorage.removeItem(pendingKey(user.id));
      lastFingerprintRef.current = fingerprint(snapshot);
      setLastSyncedAt(new Date());
      setStatus('synced');
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'Cloud sync failed.');
      setStatus('error');
    } finally {
      runningRef.current = false;
      const changedDuringSync = fingerprint(snapshotFromStore()) !== lastFingerprintRef.current;
      if (succeeded && (queuedRef.current || changedDuringSync || pendingDeletedRoutineIdsRef.current.size > 0 || pendingDeletedPhotoIdsRef.current.size > 0)) {
        timerRef.current = setTimeout(() => void performSync(), 700);
      }
    }
  }, [session?.user]);

  useEffect(() => {
    let cancelled = false;
    initializedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingDeletedRoutineIdsRef.current.clear();
    pendingDeletedPhotoIdsRef.current.clear();

    if (!session?.user) {
      setStatus('local');
      setError(null);
      setLastSyncedAt(null);
      return;
    }

    const initialize = async () => {
      setStatus('loading');
      setError(null);
      try {
        await waitForStoreHydration();
        const local = snapshotFromStore();
        const pending = JSON.parse(await AsyncStorage.getItem(pendingKey(session.user.id)) ?? '{"routines":[],"photos":[]}') as { routines?: string[]; photos?: string[] };
        pendingDeletedRoutineIdsRef.current = new Set(pending.routines ?? []);
        pendingDeletedPhotoIdsRef.current = new Set(pending.photos ?? []);
        const remote = await loadCloudSnapshot(session.user);
        if (cancelled) return;
        useAppStore.getState().hydrateFromCloud(mergeCloudSnapshots(local, remote, pendingDeletedRoutineIdsRef.current, pendingDeletedPhotoIdsRef.current));
        await pushCloudSnapshot(session.user, snapshotFromStore(), [...pendingDeletedRoutineIdsRef.current]);
        pendingDeletedRoutineIdsRef.current.clear();
        pendingDeletedPhotoIdsRef.current.clear();
        await AsyncStorage.removeItem(pendingKey(session.user.id));

        if (cancelled) return;
        const snapshot = snapshotFromStore();
        previousRoutineIdsRef.current = new Set(snapshot.routines.map((routine) => routine.id));
        previousPhotoIdsRef.current = new Set(snapshot.progressPhotos.map((photo) => photo.id));
        lastFingerprintRef.current = fingerprint(snapshot);
        initializedRef.current = true;
        setLastSyncedAt(new Date());
        setStatus('synced');
      } catch (initialError) {
        if (cancelled) return;
        initializedRef.current = true;
        previousRoutineIdsRef.current = new Set(snapshotFromStore().routines.map((routine) => routine.id));
        previousPhotoIdsRef.current = new Set(snapshotFromStore().progressPhotos.map((photo) => photo.id));
        lastFingerprintRef.current = fingerprint(snapshotFromStore());
        setError(initialError instanceof Error ? initialError.message : 'Cloud sync could not start.');
        setStatus('error');
      }
    };
    void initialize();

    const unsubscribe = useAppStore.subscribe((state) => {
      if (cancelled || !initializedRef.current) return;
      const currentRoutineIds = new Set(state.routines.map((routine) => routine.id));
      previousRoutineIdsRef.current.forEach((id) => {
        if (!currentRoutineIds.has(id)) pendingDeletedRoutineIdsRef.current.add(id);
      });
      previousRoutineIdsRef.current = currentRoutineIds;
      const currentPhotoIds = new Set(state.progressPhotos.map((photo) => photo.id));
      previousPhotoIdsRef.current.forEach((id) => {
        if (!currentPhotoIds.has(id)) pendingDeletedPhotoIdsRef.current.add(id);
      });
      previousPhotoIdsRef.current = currentPhotoIds;
      if (pendingDeletedRoutineIdsRef.current.size || pendingDeletedPhotoIdsRef.current.size) {
        void AsyncStorage.setItem(pendingKey(session.user.id), JSON.stringify({ routines: [...pendingDeletedRoutineIdsRef.current], photos: [...pendingDeletedPhotoIdsRef.current] }));
      }

      const nextFingerprint = fingerprint(snapshotFromStore());
      if (nextFingerprint === lastFingerprintRef.current && pendingDeletedRoutineIdsRef.current.size === 0 && pendingDeletedPhotoIdsRef.current.size === 0) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void performSync(), 1200);
    });

    return () => {
      cancelled = true;
      initializedRef.current = false;
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [performSync, session?.user]);

  const value = useMemo<CloudSyncContextValue>(() => ({
    status,
    error,
    lastSyncedAt,
    syncNow: performSync,
  }), [error, lastSyncedAt, performSync, status]);

  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
}

export function useCloudSync() {
  const value = useContext(CloudSyncContext);
  if (!value) throw new Error('useCloudSync must be used inside CloudSyncProvider');
  return value;
}
