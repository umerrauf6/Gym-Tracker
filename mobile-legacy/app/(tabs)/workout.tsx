import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getExerciseById } from '@/src/features/exercises/data/exercises';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

export default function WorkoutScreen() {
  const routines = useAppStore((state) => state.routines);
  const isPro = useAppStore((state) => state.isPro);
  const activeWorkout = useAppStore((state) => state.activeWorkout);
  const startRoutine = useAppStore((state) => state.startRoutine);
  const startQuickWorkout = useAppStore((state) => state.startQuickWorkout);
  const deleteRoutine = useAppStore((state) => state.deleteRoutine);

  const openNewRoutine = () => {
    if (!isPro && routines.length >= 2) router.push('/paywall');
    else router.push('/routine/new');
  };
  const beginRoutine = (id: string) => {
    if (activeWorkout) {
      Alert.alert('Workout already active', 'Resume or discard your current workout first.');
      return;
    }
    if (startRoutine(id)) router.push('/workout/active');
  };
  const quickStart = () => {
    if (activeWorkout) { router.push('/workout/active'); return; }
    startQuickWorkout();
    router.push('/workout/active');
  };
  const showMenu = (id: string, name: string) => Alert.alert(name, 'Manage this routine', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Edit', onPress: () => router.push(`/routine/${id}`) },
    { text: 'Delete', style: 'destructive', onPress: () => deleteRoutine(id) },
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>YOUR TRAINING</Text><Text style={styles.title}>Workouts</Text></View>
          <Pressable style={styles.addButton} accessibilityLabel="Create routine" onPress={openNewRoutine}><Ionicons name="add" size={24} color={colors.accentDark} /></Pressable>
        </View>

        {activeWorkout && (
          <Pressable onPress={() => router.push('/workout/active')} style={styles.resumeCard}>
            <View style={styles.liveDot} />
            <View style={styles.quickCopy}><Text style={styles.resumeTitle}>Resume {activeWorkout.name}</Text><Text style={styles.quickBody}>{activeWorkout.exercises.length} exercises · session in progress</Text></View>
            <Ionicons name="chevron-forward" size={20} color={colors.accent} />
          </Pressable>
        )}

        <Pressable style={styles.quickStart} onPress={quickStart}>
          <View style={styles.quickIcon}><Ionicons name="flash" size={22} color={colors.accent} /></View>
          <View style={styles.quickCopy}><Text style={styles.quickTitle}>Quick workout</Text><Text style={styles.quickBody}>Start empty and add exercises as you train</Text></View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>My routines</Text><Text style={styles.limit}>{isPro ? 'Unlimited with Pro' : `${routines.length} of 2 free routines`}</Text></View>
        {routines.map((routine, index) => {
          const muscleNames = [...new Set(routine.exerciseIds.map((id) => getExerciseById(id)?.primaryMuscle).filter(Boolean))].join(' · ');
          return (
            <View key={routine.id} style={styles.routineCard}>
              <View style={styles.cardTop}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><Pressable hitSlop={10} onPress={() => showMenu(routine.id, routine.name)}><Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} /></Pressable></View>
              <Text style={styles.routineName}>{routine.name}</Text><Text style={styles.muscles}>{muscleNames || 'No exercises yet'}</Text>
              <View style={styles.stats}><Text style={styles.stat}><Ionicons name="barbell-outline" size={13} /> {routine.exerciseIds.length} exercises</Text><Text style={styles.stat}><Ionicons name="time-outline" size={13} /> ~{Math.max(15, routine.exerciseIds.length * 10)} min</Text></View>
              <Pressable style={styles.startButton} onPress={() => beginRoutine(routine.id)}><Ionicons name="play" size={16} color={colors.accentDark} /><Text style={styles.startText}>Start</Text></Pressable>
            </View>
          );
        })}

        {!isPro && <Pressable style={styles.upgradeCard} onPress={() => router.push('/paywall')}><Ionicons name="infinite" size={24} color={colors.blue} /><View style={styles.upgradeCopy}><Text style={styles.upgradeTitle}>Need more routines?</Text><Text style={styles.upgradeBody}>Unlock unlimited routines with Pro.</Text></View><Ionicons name="chevron-forward" size={18} color={colors.blue} /></Pressable>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 110 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }, eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 }, title: { color: colors.text, fontSize: 29, fontWeight: '800', marginTop: 4 }, addButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  resumeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#15251E', borderWidth: 1, borderColor: '#2D563F', borderRadius: 16, padding: 14, marginBottom: 10 }, liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, marginRight: 3 }, resumeTitle: { color: colors.accent, fontSize: 13, fontWeight: '800' }, quickStart: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 15 }, quickIcon: { width: 45, height: 45, borderRadius: 14, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center' }, quickCopy: { flex: 1, marginLeft: 13 }, quickTitle: { color: colors.text, fontSize: 15, fontWeight: '800' }, quickBody: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 }, sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 29, marginBottom: 13 }, sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800' }, limit: { color: colors.textMuted, fontSize: 11 }, routineCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 17, marginBottom: 12 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between' }, number: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center' }, numberText: { color: colors.accent, fontWeight: '900' }, routineName: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 14 }, muscles: { color: colors.textMuted, fontSize: 12, marginTop: 5 }, stats: { flexDirection: 'row', gap: 16, marginTop: 17 }, stat: { color: '#ADB5BB', fontSize: 11 }, startButton: { height: 44, backgroundColor: colors.accent, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18 }, startText: { color: colors.accentDark, fontSize: 14, fontWeight: '900' }, upgradeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111E2A', borderWidth: 1, borderColor: '#20384B', borderRadius: 17, padding: 15, marginTop: 7 }, upgradeCopy: { flex: 1, marginLeft: 12 }, upgradeTitle: { color: colors.text, fontSize: 13, fontWeight: '800' }, upgradeBody: { color: '#8297A8', fontSize: 11, marginTop: 3 },
});
