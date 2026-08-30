import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EXERCISES, Exercise } from '@/src/features/exercises/data/exercises';
import { RoutineExercisePrescription, useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

export default function RoutineEditorScreen({ routineId }: { routineId?: string }) {
  const routine = useAppStore((state) => state.routines.find((item) => item.id === routineId));
  const createRoutine = useAppStore((state) => state.createRoutine);
  const updateRoutine = useAppStore((state) => state.updateRoutine);
  const [name, setName] = useState(routine?.name ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>(routine?.exerciseIds ?? []);
  const [targets, setTargets] = useState<Record<string, RoutineExercisePrescription>>(routine?.exerciseTargets ?? {});
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return !normalized ? EXERCISES : EXERCISES.filter((exercise) =>
      `${exercise.name} ${exercise.primaryMuscle} ${exercise.equipment}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  const targetFor = (id: string) => targets[id] ?? { targetSets: 3, targetReps: 10, restSeconds: 90 };
  const toggleExercise = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setTargets((current) => current[id] ? current : { ...current, [id]: targetFor(id) });
  };
  const updateTarget = (id: string, updates: Partial<RoutineExercisePrescription>) => setTargets((current) => ({ ...current, [id]: { ...targetFor(id), ...updates } }));
  const moveExercise = (id: string, direction: -1 | 1) => setSelectedIds((current) => {
    const index = current.indexOf(id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
    const next = [...current];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    return next;
  });

  const save = () => {
    if (!name.trim()) {
      setError('Give your routine a name.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Choose at least one exercise for this routine.');
      return;
    }
    if (routineId) {
      updateRoutine(routineId, name, selectedIds, targets);
    } else if (!createRoutine(name, selectedIds, targets)) {
      router.replace('/paywall');
      return;
    }
    router.back();
  };

  const renderExercise = ({ item }: { item: Exercise }) => {
    const selected = selectedIds.includes(item.id);
    return (
      <Pressable onPress={() => toggleExercise(item.id)} style={[styles.exerciseRow, selected && styles.exerciseSelected]}>
        <View style={[styles.check, selected && styles.checkSelected]}><Text style={styles.checkText}>{selected ? '✓' : ''}</Text></View>
        <View style={styles.exerciseCopy}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.exerciseMeta}>{item.primaryMuscle} · {item.equipment}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.label}>ROUTINE NAME</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Upper Body" placeholderTextColor="#68727A" style={styles.nameInput} maxLength={40} />
            <View style={styles.countRow}><Text style={styles.label}>ROUTINE ORDER & TARGETS</Text><Text style={styles.count}>{selectedIds.length} selected</Text></View>
            {selectedIds.length === 0 ? <View style={styles.emptyOrder}><Text style={styles.emptyOrderText}>Select exercises below to configure the routine.</Text></View> : selectedIds.map((exerciseId, index) => {
              const exercise = EXERCISES.find((item) => item.id === exerciseId);
              const target = targetFor(exerciseId);
              if (!exercise) return null;
              return <View key={exerciseId} style={styles.targetCard}><View style={styles.targetTop}><View style={styles.orderNumber}><Text style={styles.orderNumberText}>{index + 1}</Text></View><View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseMeta}>{exercise.primaryMuscle} · {exercise.equipment}</Text></View><Pressable accessibilityLabel="Move exercise up" disabled={index === 0} onPress={() => moveExercise(exerciseId, -1)} style={[styles.orderButton, index === 0 && styles.orderButtonDisabled]}><Ionicons name="chevron-up" size={16} color={colors.text} /></Pressable><Pressable accessibilityLabel="Move exercise down" disabled={index === selectedIds.length - 1} onPress={() => moveExercise(exerciseId, 1)} style={[styles.orderButton, index === selectedIds.length - 1 && styles.orderButtonDisabled]}><Ionicons name="chevron-down" size={16} color={colors.text} /></Pressable></View><View style={styles.targetInputs}><TargetInput label="SETS" value={target.targetSets} onChange={(value) => updateTarget(exerciseId, { targetSets: value })} /><TargetInput label="REPS" value={target.targetReps} onChange={(value) => updateTarget(exerciseId, { targetReps: value })} /><TargetInput label="REST SEC" value={target.restSeconds} onChange={(value) => updateTarget(exerciseId, { restSeconds: value })} /></View></View>;
            })}
            <View style={styles.countRow}><Text style={styles.label}>EXERCISE LIBRARY</Text><Text style={styles.count}>Tap to add/remove</Text></View>
            <TextInput value={query} onChangeText={setQuery} placeholder="Search exercises" placeholderTextColor="#68727A" style={styles.searchInput} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListFooterComponent={<Pressable onPress={save} style={styles.saveButton}><Text style={styles.saveText}>{routineId ? 'Save changes' : 'Create routine'}</Text></Pressable>}
      />
    </SafeAreaView>
  );
}

function TargetInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <View style={styles.targetInputWrap}><Text style={styles.targetLabel}>{label}</Text><TextInput value={`${value}`} onChangeText={(text) => onChange(Math.max(1, Number.parseInt(text, 10) || 1))} keyboardType="number-pad" selectTextOnFocus style={styles.targetInput} /></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 50 },
  label: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  nameInput: { height: 53, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: 15, marginTop: 9, fontSize: 15 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, marginBottom: 9 },
  count: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  emptyOrder: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 14, padding: 16, marginBottom: 8 }, emptyOrderText: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  targetCard: { borderRadius: 16, borderWidth: 1, borderColor: '#31483C', backgroundColor: '#151F1A', padding: 12, marginBottom: 9 }, targetTop: { flexDirection: 'row', alignItems: 'center' }, orderNumber: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#20372C', alignItems: 'center', justifyContent: 'center' }, orderNumberText: { color: colors.accent, fontSize: 10, fontWeight: '900' }, orderButton: { width: 31, height: 31, borderRadius: 9, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }, orderButtonDisabled: { opacity: 0.25 },
  targetInputs: { flexDirection: 'row', gap: 8, marginTop: 11 }, targetInputWrap: { flex: 1 }, targetLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center', marginBottom: 5 }, targetInput: { height: 38, borderRadius: 10, backgroundColor: '#0D1114', borderWidth: 1, borderColor: colors.border, color: colors.text, textAlign: 'center', fontSize: 12, fontWeight: '800' },
  searchInput: { height: 47, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: 14, marginBottom: 12 },
  exerciseRow: { minHeight: 64, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center' },
  exerciseSelected: { borderColor: '#3B694F', backgroundColor: '#17241E' },
  check: { width: 27, height: 27, borderRadius: 9, borderWidth: 1, borderColor: '#465058', alignItems: 'center', justifyContent: 'center' },
  checkSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkText: { color: colors.accentDark, fontWeight: '900' },
  exerciseCopy: { flex: 1, marginLeft: 12 },
  exerciseName: { color: colors.text, fontSize: 13, fontWeight: '800' },
  exerciseMeta: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  saveButton: { height: 52, backgroundColor: colors.accent, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 13 },
  saveText: { color: colors.accentDark, fontSize: 14, fontWeight: '900' },
  error: { color: colors.danger, fontSize: 11, marginBottom: 10 },
});
