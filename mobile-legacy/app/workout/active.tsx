import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EXERCISES, Exercise, getExerciseById } from '@/src/features/exercises/data/exercises';
import { cancelRestNotification, scheduleRestNotification } from '@/src/features/notifications/restNotifications';
import { getWorkoutAlternatives, LoggedSet, useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function ActiveWorkoutScreen() {
  const activeWorkout = useAppStore((state) => state.activeWorkout);
  const settings = useAppStore((state) => state.settings);
  const isPro = useAppStore((state) => state.isPro);
  const addExercise = useAppStore((state) => state.addExerciseToActive);
  const removeExercise = useAppStore((state) => state.removeExerciseFromActive);
  const swapExercise = useAppStore((state) => state.swapActiveExercise);
  const addSet = useAppStore((state) => state.addSet);
  const removeSet = useAppStore((state) => state.removeSet);
  const updateSet = useAppStore((state) => state.updateSet);
  const updateExerciseNote = useAppStore((state) => state.updateActiveExerciseNote);
  const updateWorkoutNote = useAppStore((state) => state.updateActiveWorkoutNote);
  const toggleSet = useAppStore((state) => state.toggleSetComplete);
  const finishWorkout = useAppStore((state) => state.finishActiveWorkout);
  const discardWorkout = useAppStore((state) => state.discardActiveWorkout);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [swapTargetId, setSwapTargetId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [confirmAction, setConfirmAction] = useState<'finish' | 'finish-empty' | 'discard' | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      if (timerRunning) {
        setTimerSeconds((seconds) => {
          if (seconds <= 1) {
            setTimerRunning(false);
            notificationIdRef.current = null;
            return 0;
          }
          return seconds - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const swapTarget = activeWorkout?.exercises.find((item) => item.id === swapTargetId);
  const alternatives = useMemo(
    () => swapTarget ? getWorkoutAlternatives(swapTarget.exerciseId) : [],
    [swapTarget],
  );

  if (!activeWorkout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Active workout' }} />
        <View style={styles.noWorkout}>
          <Ionicons name="barbell-outline" size={43} color={colors.textMuted} />
          <Text style={styles.noWorkoutTitle}>No workout in progress</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/workout')}><Text style={styles.primaryButtonText}>Choose a workout</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - new Date(activeWorkout.startedAt).getTime()) / 1000));
  const completedSets = activeWorkout.exercises.reduce((total, item) => total + item.sets.filter((set) => set.completed).length, 0);

  const replaceRestNotification = async (seconds: number, exerciseName?: string) => {
    await cancelRestNotification(notificationIdRef.current);
    notificationIdRef.current = settings.notificationsEnabled ? await scheduleRestNotification(seconds, exerciseName) : null;
  };

  const handleToggleSet = (loggedExerciseId: string, setId: string) => {
    if (toggleSet(loggedExerciseId, setId)) {
      const loggedExercise = activeWorkout.exercises.find((item) => item.id === loggedExerciseId);
      const restSeconds = loggedExercise?.restSeconds ?? settings.restSeconds;
      const exerciseName = loggedExercise ? getExerciseById(loggedExercise.exerciseId)?.name : undefined;
      setTimerSeconds(restSeconds);
      setTimerRunning(true);
      void replaceRestNotification(restSeconds, exerciseName);
    }
  };

  const handleSwap = (loggedExerciseId: string) => {
    if (!isPro) {
      router.push('/paywall');
      return;
    }
    setSwapTargetId(loggedExerciseId);
  };

  const finish = () => {
    setConfirmAction(completedSets === 0 ? 'finish-empty' : 'finish');
  };

  const discard = () => setConfirmAction('discard');

  const confirmHeaderAction = () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (action === 'discard') {
      void cancelRestNotification(notificationIdRef.current);
      discardWorkout();
      router.replace('/(tabs)/workout');
      return;
    }
    void cancelRestNotification(notificationIdRef.current);
    const result = finishWorkout();
    if (result) router.replace({ pathname: '/workout/summary', params: { id: result.id } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.activeHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close workout" hitSlop={8} onPress={discard} style={styles.headerIcon}><Ionicons name="close" size={23} color={colors.text} /></Pressable>
        <View style={styles.headerCopy}><Text numberOfLines={1} style={styles.workoutTitle}>{activeWorkout.name}</Text><Text style={styles.elapsed}>{formatTime(elapsedSeconds)} elapsed</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Finish workout" hitSlop={8} onPress={finish} style={styles.finishButton}><Text style={styles.finishText}>Finish</Text></Pressable>
      </View>

      {timerSeconds > 0 && (
        <View style={styles.timerBar}>
          <Ionicons name="timer" size={20} color={colors.accent} />
          <View style={styles.timerCopy}><Text style={styles.timerLabel}>REST TIMER</Text><Text style={styles.timerValue}>{formatTime(timerSeconds)}</Text></View>
          <Pressable onPress={() => { const nextRunning = !timerRunning; setTimerRunning(nextRunning); if (nextRunning) void replaceRestNotification(timerSeconds); else void cancelRestNotification(notificationIdRef.current); }} style={styles.timerAction}><Ionicons name={timerRunning ? 'pause' : 'play'} size={17} color={colors.text} /></Pressable>
          <Pressable onPress={() => { const next = timerSeconds + 30; setTimerSeconds(next); if (timerRunning) void replaceRestNotification(next); }} style={styles.timerAction}><Text style={styles.timerActionText}>+30</Text></Pressable>
          <Pressable onPress={() => { setTimerSeconds(0); setTimerRunning(false); void cancelRestNotification(notificationIdRef.current); notificationIdRef.current = null; }} style={styles.timerAction}><Text style={styles.timerActionText}>Skip</Text></Pressable>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {activeWorkout.exercises.length === 0 && (
          <View style={styles.emptyWorkout}>
            <Text style={styles.emptyTitle}>Build as you train</Text>
            <Text style={styles.emptyBody}>Add your first exercise to this quick workout.</Text>
          </View>
        )}

        {activeWorkout.exercises.map((loggedExercise) => {
          const exercise = getExerciseById(loggedExercise.exerciseId);
          if (!exercise) return null;
          return (
            <View key={loggedExercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseMarker}><Text style={styles.exerciseMarkerText}>{exercise.primaryMuscle[0]}</Text></View>
                <View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseMeta}>{exercise.primaryMuscle} · {exercise.equipment}</Text></View>
                <Pressable onPress={() => handleSwap(loggedExercise.id)} style={styles.swapButton}><Ionicons name="swap-horizontal" size={16} color={isPro ? colors.accent : colors.warning} /><Text style={[styles.swapText, !isPro && { color: colors.warning }]}>Swap</Text></Pressable>
                <Pressable onPress={() => removeExercise(loggedExercise.id)} hitSlop={8}><Ionicons name="trash-outline" size={18} color={colors.textMuted} /></Pressable>
              </View>
              <View style={styles.setHeader}><Text style={styles.setHeaderCell}>SET</Text><Text style={styles.setHeaderInput}>{settings.weightUnit.toUpperCase()}</Text><Text style={styles.setHeaderInput}>REPS</Text><View style={styles.completeSpacer} /></View>
              {loggedExercise.sets.map((workoutSet, index) => (
                <SetRow
                  key={workoutSet.id}
                  workoutSet={workoutSet}
                  index={index}
                  weightUnit={settings.weightUnit}
                  onChange={(values) => updateSet(loggedExercise.id, workoutSet.id, values)}
                  onToggle={() => handleToggleSet(loggedExercise.id, workoutSet.id)}
                  onRemove={() => removeSet(loggedExercise.id, workoutSet.id)}
                />
              ))}
              <TextInput value={loggedExercise.notes ?? ''} onChangeText={(notes) => updateExerciseNote(loggedExercise.id, notes)} placeholder="Exercise notes (form, tempo, setup…)" placeholderTextColor="#586169" multiline style={styles.exerciseNotes} />
              <Pressable onPress={() => addSet(loggedExercise.id)} style={styles.addSetButton}><Ionicons name="add" size={17} color={colors.accent} /><Text style={styles.addSetText}>Add set</Text></Pressable>
            </View>
          );
        })}
        <Pressable onPress={() => setExercisePickerOpen(true)} style={styles.addExerciseButton}><Ionicons name="add-circle-outline" size={20} color={colors.accent} /><Text style={styles.addExerciseText}>Add exercise</Text></Pressable>
        <TextInput value={activeWorkout.notes ?? ''} onChangeText={updateWorkoutNote} placeholder="Workout notes, energy, or anything to remember…" placeholderTextColor="#586169" multiline style={styles.workoutNotes} />
      </ScrollView>

      <ExercisePickerModal
        visible={exercisePickerOpen}
        title="Add exercise"
        exercises={EXERCISES}
        onClose={() => setExercisePickerOpen(false)}
        onSelect={(exercise) => { addExercise(exercise.id); setExercisePickerOpen(false); }}
      />
      <ExercisePickerModal
        visible={Boolean(swapTargetId)}
        title="Smart alternatives"
        exercises={alternatives}
        emptyText="No exact alternatives are available yet."
        onClose={() => setSwapTargetId(null)}
        onSelect={(exercise) => {
          if (swapTargetId) swapExercise(swapTargetId, exercise.id);
          setSwapTargetId(null);
        }}
      />
      <WorkoutActionModal
        action={confirmAction}
        completedSets={completedSets}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmHeaderAction}
      />
    </SafeAreaView>
  );
}

function SetRow({ workoutSet, index, weightUnit, onChange, onToggle, onRemove }: {
  workoutSet: LoggedSet;
  index: number;
  weightUnit: 'kg' | 'lb';
  onChange: (values: Partial<Pick<LoggedSet, 'reps' | 'weightKg'>>) => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const displayWeight = weightUnit === 'lb' ? workoutSet.weightKg * 2.20462 : workoutSet.weightKg;
  const [weight, setWeight] = useState(displayWeight ? displayWeight.toFixed(1).replace('.0', '') : '');
  const [reps, setReps] = useState(String(workoutSet.reps));
  return (
    <View style={[styles.setRow, workoutSet.completed && styles.setRowComplete]}>
      <Pressable onLongPress={onRemove} style={styles.setNumber}><Text style={styles.setNumberText}>{index + 1}</Text></Pressable>
      <TextInput
        value={weight}
        onChangeText={(value) => {
          setWeight(value);
          const parsed = Number.parseFloat(value.replace(',', '.')) || 0;
          onChange({ weightKg: weightUnit === 'lb' ? parsed / 2.20462 : parsed });
        }}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#586169"
        style={styles.setInput}
      />
      <TextInput
        value={reps}
        onChangeText={(value) => { setReps(value); onChange({ reps: Number.parseInt(value, 10) || 0 }); }}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor="#586169"
        style={styles.setInput}
      />
      <Pressable accessibilityRole="checkbox" accessibilityLabel={`Mark set ${index + 1} complete`} accessibilityState={{ checked: workoutSet.completed }} onPress={onToggle} style={[styles.completeButton, workoutSet.completed && styles.completeButtonDone]}>
        <Ionicons name="checkmark" size={18} color={workoutSet.completed ? colors.accentDark : colors.textMuted} />
      </Pressable>
    </View>
  );
}

function WorkoutActionModal({ action, completedSets, onCancel, onConfirm }: {
  action: 'finish' | 'finish-empty' | 'discard' | null;
  completedSets: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDiscard = action === 'discard';
  const isEmpty = action === 'finish-empty';
  const title = isDiscard ? 'Discard workout?' : isEmpty ? 'Finish without completed sets?' : 'Finish workout?';
  const body = isDiscard
    ? 'Your current set entries and workout progress will be permanently removed.'
    : isEmpty
      ? 'No sets are marked complete. You can save a zero-volume session or keep training.'
      : `${completedSets} completed ${completedSets === 1 ? 'set' : 'sets'} will be saved to your workout history.`;
  const confirmLabel = isDiscard ? 'Discard workout' : isEmpty ? 'Finish anyway' : 'Save workout';

  return (
    <Modal transparent visible={Boolean(action)} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.confirmBackdrop}>
        <View style={styles.confirmSheet}>
          <View style={[styles.confirmIcon, isDiscard && styles.confirmIconDanger]}><Ionicons name={isDiscard ? 'trash-outline' : isEmpty ? 'alert-circle-outline' : 'checkmark-circle-outline'} size={27} color={isDiscard ? colors.danger : isEmpty ? colors.warning : colors.accent} /></View>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmBody}>{body}</Text>
          <View style={styles.confirmButtons}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.confirmCancel}><Text style={styles.confirmCancelText}>Keep training</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={onConfirm} style={[styles.confirmPrimary, isDiscard && styles.confirmPrimaryDanger, isEmpty && styles.confirmPrimaryWarning]}><Text style={[styles.confirmPrimaryText, (isDiscard || isEmpty) && styles.confirmPrimaryTextLight]}>{confirmLabel}</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ExercisePickerModal({ visible, title, exercises, emptyText, onClose, onSelect }: {
  visible: boolean;
  title: string;
  exercises: Exercise[];
  emptyText?: string;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}><Pressable onPress={onClose}><Text style={styles.modalCancel}>Cancel</Text></Pressable><Text style={styles.modalTitle}>{title}</Text><View style={{ width: 48 }} /></View>
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.modalList}
          ListEmptyComponent={<Text style={styles.modalEmpty}>{emptyText}</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelect(item)} style={styles.modalExercise}>
              <View style={styles.modalExerciseIcon}><Text style={styles.exerciseMarkerText}>{item.primaryMuscle[0]}</Text></View>
              <View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{item.name}</Text><Text style={styles.exerciseMeta}>{item.primaryMuscle} · {item.equipment}</Text></View>
              <Ionicons name="add-circle" size={22} color={colors.accent} />
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  activeHeader: { height: 68, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  headerCopy: { flex: 1, marginHorizontal: 12 },
  workoutTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  elapsed: { color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 3 },
  finishButton: { backgroundColor: colors.accent, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 10 },
  finishText: { color: colors.accentDark, fontSize: 12, fontWeight: '900' },
  timerBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#14241D', borderBottomWidth: 1, borderBottomColor: '#284836', paddingHorizontal: 16, paddingVertical: 10 },
  timerCopy: { flex: 1, marginLeft: 10 },
  timerLabel: { color: '#7E9D8D', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  timerValue: { color: colors.accent, fontSize: 18, fontWeight: '900' },
  timerAction: { minWidth: 38, height: 33, borderRadius: 10, backgroundColor: '#23342C', alignItems: 'center', justifyContent: 'center', marginLeft: 7, paddingHorizontal: 8 },
  timerActionText: { color: colors.text, fontSize: 10, fontWeight: '800' },
  content: { padding: 14, paddingBottom: 80 },
  exerciseCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 19, padding: 14, marginBottom: 13 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  exerciseMarker: { width: 39, height: 39, borderRadius: 12, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center' },
  exerciseMarkerText: { color: colors.accent, fontSize: 15, fontWeight: '900' },
  exerciseCopy: { flex: 1, marginLeft: 11 },
  exerciseName: { color: colors.text, fontSize: 13, fontWeight: '800' },
  exerciseMeta: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  swapButton: { height: 33, flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 9, borderRadius: 10, backgroundColor: '#1E2B25', marginRight: 9 },
  swapText: { color: colors.accent, fontSize: 10, fontWeight: '800' },
  setHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  setHeaderCell: { width: 38, color: colors.textMuted, fontSize: 8, fontWeight: '800', textAlign: 'center' },
  setHeaderInput: { flex: 1, color: colors.textMuted, fontSize: 8, fontWeight: '800', textAlign: 'center' },
  completeSpacer: { width: 39 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7, borderRadius: 10 },
  setRowComplete: { backgroundColor: '#13231C' },
  setNumber: { width: 38, height: 42, alignItems: 'center', justifyContent: 'center' },
  setNumberText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  setInput: { flex: 1, height: 42, borderRadius: 10, backgroundColor: '#0D1114', borderWidth: 1, borderColor: '#232B31', color: colors.text, textAlign: 'center', fontSize: 13, fontWeight: '700' },
  completeButton: { width: 39, height: 39, borderRadius: 12, borderWidth: 1, borderColor: '#39434A', alignItems: 'center', justifyContent: 'center' },
  completeButtonDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  exerciseNotes: { minHeight: 42, maxHeight: 86, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: '#0D1114', color: colors.text, fontSize: 11, lineHeight: 16, paddingHorizontal: 11, paddingVertical: 9, marginTop: 3, textAlignVertical: 'top' },
  addSetButton: { height: 38, borderRadius: 11, backgroundColor: '#19241F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 5 },
  addSetText: { color: colors.accent, fontSize: 11, fontWeight: '800' },
  addExerciseButton: { height: 52, borderRadius: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: '#3B5B4A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addExerciseText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  workoutNotes: { minHeight: 78, maxHeight: 130, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontSize: 12, lineHeight: 18, padding: 13, marginTop: 12, textAlignVertical: 'top' },
  emptyWorkout: { alignItems: 'center', paddingVertical: 42 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  emptyBody: { color: colors.textMuted, fontSize: 12, marginTop: 7 },
  noWorkout: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 },
  noWorkoutTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 12 },
  primaryButton: { height: 47, paddingHorizontal: 20, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  primaryButtonText: { color: colors.accentDark, fontWeight: '900' },
  modalSafeArea: { flex: 1, backgroundColor: colors.background },
  modalHeader: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalCancel: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  modalList: { padding: 15 },
  modalExercise: { minHeight: 65, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 9 },
  modalExerciseIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center' },
  modalEmpty: { color: colors.textMuted, textAlign: 'center', marginTop: 50 },
  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  confirmSheet: { width: '100%', maxWidth: 420, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, padding: 20 },
  confirmIcon: { width: 53, height: 53, borderRadius: 17, backgroundColor: '#193127', alignItems: 'center', justifyContent: 'center' },
  confirmIconDanger: { backgroundColor: '#361E24' },
  confirmTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 16 },
  confirmBody: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  confirmButtons: { flexDirection: 'row', gap: 10, marginTop: 21 },
  confirmCancel: { flex: 1, height: 47, borderRadius: 13, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  confirmCancelText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  confirmPrimary: { flex: 1, height: 47, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  confirmPrimaryDanger: { backgroundColor: colors.danger },
  confirmPrimaryWarning: { backgroundColor: '#8B6322' },
  confirmPrimaryText: { color: colors.accentDark, fontSize: 11, fontWeight: '900' },
  confirmPrimaryTextLight: { color: colors.text },
});
