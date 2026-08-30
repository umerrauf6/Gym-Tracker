import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

export default function HomeScreen() {
  const displayName = useAppStore((state) => state.displayName);
  const history = useAppStore((state) => state.history);
  const routines = useAppStore((state) => state.routines);
  const activeWorkout = useAppStore((state) => state.activeWorkout);
  const startRoutine = useAppStore((state) => state.startRoutine);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekly = history.filter((entry) => new Date(entry.completedAt) >= weekStart);
  const weeklyVolume = weekly.reduce((total, entry) => total + entry.totalVolumeKg, 0);
  const recent = history.slice(0, 3);
  const firstName = displayName.split(' ')[0] || 'Athlete';

  const start = () => {
    if (activeWorkout) { router.push('/workout/active'); return; }
    const routine = routines[0];
    if (routine && startRoutine(routine.id)) router.push('/workout/active');
    else router.push('/(tabs)/workout');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View><Text style={styles.eyebrow}>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Text><Text style={styles.title}>Ready, {firstName}?</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</Text></View></View>
        <View style={styles.hero}><View style={styles.heroGlow} /><View style={styles.streakPill}><Ionicons name="flame" size={14} color={colors.warning} /><Text style={styles.streakText}>{weekly.length} workouts this week</Text></View><Text style={styles.heroTitle}>{activeWorkout ? 'Keep the momentum.' : 'Make today count.'}</Text><Text style={styles.heroBody}>{activeWorkout ? `${activeWorkout.name} is still in progress.` : routines[0] ? `${routines[0].name} is ready when you are.` : 'Create your first routine to get started.'}</Text><Pressable style={styles.startButton} onPress={start}><Ionicons name={activeWorkout ? 'refresh' : 'play'} size={18} color={colors.accentDark} /><Text style={styles.startButtonText}>{activeWorkout ? 'Resume workout' : 'Start workout'}</Text></Pressable></View>
        <Text style={styles.sectionTitle}>This week</Text><View style={styles.metricRow}><Metric label="VOLUME" value={Math.round(weeklyVolume).toLocaleString()} unit="kg" icon="trending-up" /><Metric label="WORKOUTS" value={`${weekly.length}`} unit="sessions" icon="barbell" /></View>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent workouts</Text><Pressable onPress={() => router.push('/history')}><Text style={styles.link}>See all</Text></Pressable></View>
        {recent.length === 0 ? <View style={styles.emptyRecent}><Text style={styles.emptyRecentText}>Finish a workout and your progress will show here.</Text></View> : recent.map((workout) => <Pressable key={workout.id} onPress={() => router.push({ pathname: '/workout/detail', params: { id: workout.id } })} style={styles.workoutRow}><View style={styles.workoutIcon}><Ionicons name="checkmark-circle" size={21} color={colors.accent} /></View><View style={styles.workoutCopy}><Text style={styles.workoutName}>{workout.name}</Text><Text style={styles.workoutMeta}>{new Date(workout.completedAt).toLocaleDateString()} · {Math.round(workout.totalVolumeKg).toLocaleString()} kg</Text></View><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></Pressable>)}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value, unit, icon }: { label: string; value: string; unit: string; icon: 'trending-up' | 'barbell' }) { return <View style={styles.metricCard}><Ionicons name={icon} size={19} color={colors.accent} /><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricUnit}>{unit}</Text></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 110 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, eyebrow: { color: colors.accent, fontSize: 10, letterSpacing: 1.5, fontWeight: '800' }, title: { color: colors.text, fontSize: 29, letterSpacing: -0.8, fontWeight: '800', marginTop: 5 }, avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.accent, fontWeight: '800', fontSize: 12 }, hero: { minHeight: 245, backgroundColor: '#18251F', borderRadius: 24, padding: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#2B4B3C' }, heroGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#22503C', right: -80, top: -85, opacity: 0.5 }, streakPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#273127', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99 }, streakText: { color: '#F4D9A0', fontSize: 11, fontWeight: '700' }, heroTitle: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.7, marginTop: 24 }, heroBody: { color: '#AEBBB4', fontSize: 14, lineHeight: 20, marginTop: 7, maxWidth: 260 }, startButton: { height: 50, borderRadius: 14, backgroundColor: colors.accent, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 22 }, startButtonText: { color: colors.accentDark, fontSize: 15, fontWeight: '900' }, sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 28, marginBottom: 13 }, metricRow: { flexDirection: 'row', gap: 12 }, metricCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16 }, metricLabel: { color: colors.textMuted, fontSize: 9, letterSpacing: 1.2, fontWeight: '800', marginTop: 13 }, metricValue: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 4 }, metricUnit: { color: colors.textMuted, fontSize: 11, marginTop: 1 }, sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }, link: { color: colors.accent, fontSize: 12, fontWeight: '700' }, workoutRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 13, marginBottom: 10 }, workoutIcon: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#203029' }, workoutCopy: { flex: 1, marginLeft: 12 }, workoutName: { color: colors.text, fontSize: 14, fontWeight: '800' }, workoutMeta: { color: colors.textMuted, fontSize: 11, marginTop: 5 }, emptyRecent: { borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, padding: 22 }, emptyRecentText: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
});
