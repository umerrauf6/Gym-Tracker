import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getExerciseById } from '@/src/features/exercises/data/exercises';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

export default function WorkoutSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = useAppStore((state) => state.history.find((entry) => entry.id === id));

  if (!workout) return <SafeAreaView style={styles.safeArea}><Text style={styles.missing}>Workout summary unavailable.</Text></SafeAreaView>;
  const durationMinutes = Math.max(1, Math.round((new Date(workout.completedAt).getTime() - new Date(workout.startedAt).getTime()) / 60000));
  const completedSets = workout.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.checkCircle}><Ionicons name="checkmark" size={43} color={colors.accentDark} /></View>
        <Text style={styles.eyebrow}>WORKOUT COMPLETE</Text>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.subtitle}>Strong work. Your session was saved to history.</Text>
        <View style={styles.stats}>
          <Stat label="DURATION" value={`${durationMinutes}`} unit="min" />
          <View style={styles.divider} />
          <Stat label="VOLUME" value={Math.round(workout.totalVolumeKg).toLocaleString()} unit="kg" />
          <View style={styles.divider} />
          <Stat label="SETS" value={`${completedSets}`} unit="done" />
        </View>
        {workout.personalRecords?.length ? <View style={styles.prCard}><View style={styles.prHeader}><Ionicons name="trophy" size={19} color={colors.warning} /><Text style={styles.prTitle}>{workout.personalRecords.length} personal {workout.personalRecords.length === 1 ? 'record' : 'records'}</Text></View>{workout.personalRecords.slice(0, 4).map((record, index) => <View key={`${record.exerciseId}-${record.type}-${index}`} style={styles.prRow}><View style={styles.prDot} /><Text style={styles.prName}>{getExerciseById(record.exerciseId)?.name ?? record.exerciseId}</Text><Text style={styles.prValue}>{record.type === 'weight' ? `${formatWeight(record.newBest)} kg` : `${Math.round(record.newBest)} kg volume`}</Text></View>)}</View> : null}
        <Pressable style={styles.doneButton} onPress={() => router.replace('/(tabs)')}><Text style={styles.doneText}>Back to home</Text></Pressable>
        <Pressable onPress={() => router.replace({ pathname: '/workout/detail', params: { id: workout.id } })}><Text style={styles.historyLink}>View full workout details</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.statUnit}>{unit}</Text></View>;
}

const formatWeight = (value: number) => Number.isInteger(value) ? `${value}` : value.toFixed(1);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 22, paddingVertical: 38 },
  checkCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginTop: 22 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 8 },
  stats: { alignSelf: 'stretch', flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 19, paddingVertical: 18, marginTop: 29 },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 6 },
  statUnit: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  divider: { width: 1, backgroundColor: colors.border },
  prCard: { alignSelf: 'stretch', borderRadius: 18, borderWidth: 1, borderColor: '#504526', backgroundColor: '#282419', padding: 15, marginTop: 13 }, prHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }, prTitle: { color: colors.text, fontSize: 13, fontWeight: '900' }, prRow: { minHeight: 29, flexDirection: 'row', alignItems: 'center' }, prDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.warning, marginRight: 8 }, prName: { flex: 1, color: '#D9D1B8', fontSize: 10 }, prValue: { color: colors.warning, fontSize: 10, fontWeight: '800' },
  doneButton: { alignSelf: 'stretch', height: 52, borderRadius: 15, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  doneText: { color: colors.accentDark, fontSize: 14, fontWeight: '900' },
  historyLink: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 18 },
  missing: { color: colors.text, textAlign: 'center', marginTop: 80 },
});
