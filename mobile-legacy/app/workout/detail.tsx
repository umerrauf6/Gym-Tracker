import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getExerciseById } from '@/src/features/exercises/data/exercises';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

const KG_TO_LB = 2.20462;

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const workout = useAppStore((state) => state.history.find((entry) => entry.id === id));
  const unit = useAppStore((state) => state.settings.weightUnit);

  if (!workout) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.missing}><Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} /><Text style={styles.missingTitle}>Workout not found</Text><Text style={styles.missingBody}>This session may no longer be available on this device.</Text><Pressable onPress={() => router.replace('/history')} style={styles.missingButton}><Text style={styles.missingButtonText}>Back to history</Text></Pressable></View></SafeAreaView>;
  }

  const durationMinutes = Math.max(1, Math.round((new Date(workout.completedAt).getTime() - new Date(workout.startedAt).getTime()) / 60000));
  const completedSets = workout.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0);
  const totalReps = workout.exercises.reduce((total, exercise) => total + exercise.sets.reduce((sum, set) => sum + (set.completed ? set.reps : 0), 0), 0);
  const volume = unit === 'lb' ? workout.totalVolumeKg * KG_TO_LB : workout.totalVolumeKg;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>COMPLETED {new Date(workout.completedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</Text>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.time}>{new Date(workout.startedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} – {new Date(workout.completedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>

        <View style={styles.summary}>
          <SummaryStat icon="time-outline" value={`${durationMinutes}`} unit="min" label="DURATION" />
          <SummaryStat icon="layers-outline" value={`${completedSets}`} unit="sets" label="WORK" />
          <SummaryStat icon="repeat-outline" value={`${totalReps}`} unit="reps" label="REPS" />
          <SummaryStat icon="trending-up-outline" value={formatNumber(volume)} unit={unit} label="VOLUME" />
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Exercise breakdown</Text><Text style={styles.exerciseCount}>{workout.exercises.length} exercises</Text></View>
        {workout.exercises.map((loggedExercise, exerciseIndex) => {
          const exercise = getExerciseById(loggedExercise.exerciseId);
          const completed = loggedExercise.sets.filter((set) => set.completed);
          const exerciseVolumeKg = completed.reduce((total, set) => total + set.reps * set.weightKg, 0);
          const exerciseVolume = unit === 'lb' ? exerciseVolumeKg * KG_TO_LB : exerciseVolumeKg;
          return (
            <View key={loggedExercise.id} style={styles.exerciseCard}>
              <Pressable disabled={!exercise} onPress={() => exercise && router.push(`/exercise/${exercise.id}`)} style={styles.exerciseHeader}>
                <View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{exerciseIndex + 1}</Text></View>
                <View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{exercise?.name ?? 'Unknown exercise'}</Text><Text style={styles.exerciseMeta}>{completed.length} completed {completed.length === 1 ? 'set' : 'sets'} · {formatNumber(exerciseVolume)} {unit}</Text></View>
                {exercise ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
              </Pressable>

              <View style={styles.setHeader}><Text style={[styles.cell, styles.setCell]}>SET</Text><Text style={styles.cell}>WEIGHT</Text><Text style={styles.cell}>REPS</Text><Text style={styles.cell}>VOLUME</Text></View>
              {loggedExercise.sets.map((set, setIndex) => {
                const weight = unit === 'lb' ? set.weightKg * KG_TO_LB : set.weightKg;
                return <View key={set.id} style={[styles.setRow, !set.completed && styles.setRowSkipped]}><View style={[styles.setBadge, set.completed && styles.setBadgeDone]}><Text style={[styles.setBadgeText, set.completed && styles.setBadgeTextDone]}>{setIndex + 1}</Text></View><Text style={styles.setValue}>{formatNumber(weight)} {unit}</Text><Text style={styles.setValue}>{set.reps}</Text><Text style={styles.setValue}>{set.completed ? formatNumber(weight * set.reps) : 'Skipped'}</Text></View>;
              })}
            </View>
          );
        })}

        <Pressable onPress={() => router.push('/analytics')} style={styles.analyticsButton}><Ionicons name="analytics-outline" size={19} color={colors.accent} /><Text style={styles.analyticsText}>View progress analytics</Text><Ionicons name="chevron-forward" size={17} color={colors.textMuted} /></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryStat({ icon, value, unit, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; unit: string; label: string }) {
  return <View style={styles.summaryStat}><Ionicons name={icon} size={17} color={colors.accent} /><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryUnit}>{unit}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

const formatNumber = (value: number) => Math.round(value).toLocaleString();

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 55 },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }, title: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 5 }, time: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  summary: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, marginTop: 21, paddingVertical: 16 }, summaryStat: { flex: 1, alignItems: 'center' }, summaryValue: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 5 }, summaryUnit: { color: colors.textMuted, fontSize: 8, marginTop: 1 }, summaryLabel: { color: '#657079', fontSize: 7, fontWeight: '900', letterSpacing: 0.7, marginTop: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, marginBottom: 12 }, sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900' }, exerciseCount: { color: colors.textMuted, fontSize: 10 },
  exerciseCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 11 }, exerciseHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 13 }, exerciseNumber: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center' }, exerciseNumberText: { color: colors.accent, fontSize: 11, fontWeight: '900' }, exerciseCopy: { flex: 1, marginLeft: 11 }, exerciseName: { color: colors.text, fontSize: 13, fontWeight: '900' }, exerciseMeta: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  setHeader: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 8 }, cell: { flex: 1, color: '#66717A', fontSize: 7, fontWeight: '900', textAlign: 'center', letterSpacing: 0.6 }, setCell: { textAlign: 'left' }, setRow: { flexDirection: 'row', alignItems: 'center', minHeight: 42 }, setRowSkipped: { opacity: 0.4 }, setBadge: { width: 25, height: 25, borderRadius: 8, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' }, setBadgeDone: { backgroundColor: '#20392D' }, setBadgeText: { color: colors.textMuted, fontSize: 9, fontWeight: '900' }, setBadgeTextDone: { color: colors.accent }, setValue: { flex: 1, color: '#DCE2E5', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  analyticsButton: { height: 54, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 }, analyticsText: { flex: 1, color: colors.text, fontSize: 12, fontWeight: '800' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 }, missingTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 12 }, missingBody: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 6 }, missingButton: { height: 46, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.accent, marginTop: 20 }, missingButtonText: { color: colors.accentDark, fontSize: 12, fontWeight: '900' },
});
