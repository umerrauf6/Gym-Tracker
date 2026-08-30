import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getExerciseById } from '@/src/features/exercises/data/exercises';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

export default function HistoryScreen() {
  const history = useAppStore((state) => state.history);
  const unit = useAppStore((state) => state.settings.weightUnit);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {history.length === 0 ? (
          <View style={styles.empty}><Ionicons name="time-outline" size={45} color={colors.textMuted} /><Text style={styles.emptyTitle}>No workouts yet</Text><Text style={styles.emptyBody}>Completed sessions will appear here.</Text></View>
        ) : history.map((workout) => {
          const completedSets = workout.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0);
          return (
            <Pressable key={workout.id} onPress={() => router.push({ pathname: '/workout/detail', params: { id: workout.id } })} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
              <View style={styles.cardHeader}><Text style={styles.name}>{workout.name}</Text><Text style={styles.date}>{new Date(workout.completedAt).toLocaleDateString()}</Text></View>
              <Text style={styles.exercises}>{workout.exercises.map((item) => getExerciseById(item.exerciseId)?.name).filter(Boolean).join(' · ')}</Text>
              <View style={styles.stats}><Text style={styles.stat}>{completedSets} sets</Text><Text style={styles.stat}>{Math.round(unit === 'lb' ? workout.totalVolumeKg * 2.20462 : workout.totalVolumeKg).toLocaleString()} {unit} volume</Text><Ionicons name="chevron-forward" size={17} color={colors.textMuted} style={styles.chevron} /></View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 60 },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptyBody: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 11 },
  cardPressed: { opacity: 0.72 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.text, fontSize: 16, fontWeight: '800' },
  date: { color: colors.textMuted, fontSize: 10 },
  exercises: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 8 },
  stats: { flexDirection: 'row', gap: 14, marginTop: 13 },
  stat: { color: colors.accent, fontSize: 10, fontWeight: '800' },
  chevron: { marginLeft: 'auto' },
});
