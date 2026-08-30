import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnalyticsRange, calculateWorkoutAnalytics } from '@/src/features/analytics/workoutAnalytics';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

const ranges: { label: string; value: AnalyticsRange }[] = [
  { label: '4 weeks', value: 28 },
  { label: '12 weeks', value: 84 },
  { label: 'All time', value: 0 },
];

export default function AnalyticsScreen() {
  const history = useAppStore((state) => state.history);
  const isPro = useAppStore((state) => state.isPro);
  const weightUnit = useAppStore((state) => state.settings.weightUnit);
  const [range, setRange] = useState<AnalyticsRange>(28);
  const analytics = useMemo(() => calculateWorkoutAnalytics(history, range), [history, range]);
  const weightFactor = weightUnit === 'lb' ? 2.20462 : 1;

  if (!isPro) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.locked}>
          <View style={styles.lockedIcon}><Ionicons name="analytics" size={34} color={colors.warning} /></View>
          <Text style={styles.lockedTitle}>Unlock training analytics</Text>
          <Text style={styles.lockedBody}>See volume trends, muscle balance, consistency, and your strongest exercises with FlexSaaS Pro.</Text>
          <Pressable onPress={() => router.push('/paywall')} style={styles.unlockButton}><Text style={styles.unlockText}>View Pro options</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const maxWeeklyVolume = Math.max(...analytics.weeklyVolume.map((week) => week.volumeKg), 1);
  const maxMuscleSets = Math.max(...analytics.muscleSets.map((item) => item.sets), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introRow}><View><Text style={styles.eyebrow}>PRO INSIGHTS</Text><Text style={styles.title}>Your progress</Text></View><View style={styles.proBadge}><Ionicons name="sparkles" size={13} color={colors.warning} /><Text style={styles.proText}>PRO</Text></View></View>

        <View style={styles.rangeTabs}>
          {ranges.map((option) => <Pressable key={option.value} onPress={() => setRange(option.value)} style={[styles.rangeTab, range === option.value && styles.rangeTabActive]}><Text style={[styles.rangeText, range === option.value && styles.rangeTextActive]}>{option.label}</Text></Pressable>)}
        </View>

        {history.length === 0 ? (
          <View style={styles.empty}><Ionicons name="bar-chart-outline" size={38} color={colors.textMuted} /><Text style={styles.emptyTitle}>Your trends start here</Text><Text style={styles.emptyBody}>Complete a workout to generate volume, consistency, and muscle-group insights.</Text><Pressable onPress={() => router.replace('/(tabs)/workout')} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Start a workout</Text></Pressable></View>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <Kpi icon="barbell-outline" label="WORKOUTS" value={`${analytics.workoutCount}`} unit="sessions" />
              <Kpi icon="trending-up-outline" label="VOLUME" value={compactNumber(analytics.totalVolumeKg * weightFactor)} unit={weightUnit} />
              <Kpi icon="checkmark-done-outline" label="SETS" value={`${analytics.completedSets}`} unit="completed" />
              <Kpi icon="time-outline" label="AVG. TIME" value={`${analytics.averageDurationMinutes}`} unit="minutes" />
            </View>

            <View style={styles.streakCard}><View style={styles.streakIcon}><Ionicons name="flame" size={25} color={colors.warning} /></View><View style={styles.streakCopy}><Text style={styles.cardEyebrow}>CONSISTENCY</Text><Text style={styles.streakTitle}>{analytics.weeklyStreak} week streak</Text><Text style={styles.cardHint}>{analytics.weeklyStreak ? 'Keep showing up—consistency compounds.' : 'Finish a workout this week to begin a streak.'}</Text></View></View>

            <Section title="Weekly volume" subtitle="Total completed load">
              <View style={styles.chart}>
                {analytics.weeklyVolume.map((week, index) => {
                  const height = week.volumeKg ? Math.max(8, Math.round((week.volumeKg / maxWeeklyVolume) * 112)) : 3;
                  const showLabel = analytics.weeklyVolume.length <= 4 || index % 3 === 0 || index === analytics.weeklyVolume.length - 1;
                  return <View key={week.key} style={styles.chartColumn}><Text style={styles.barValue}>{week.volumeKg ? compactNumber(week.volumeKg * weightFactor) : ''}</Text><View style={[styles.bar, { height }, index === analytics.weeklyVolume.length - 1 && styles.barCurrent]} /><Text numberOfLines={1} style={styles.barLabel}>{showLabel ? week.label : ''}</Text></View>;
                })}
              </View>
            </Section>

            <Section title="Muscle balance" subtitle="Completed sets by primary group">
              {analytics.muscleSets.length ? analytics.muscleSets.map((item) => <View key={item.muscle} style={styles.muscleRow}><View style={styles.muscleHeader}><Text style={styles.muscleName}>{item.muscle}</Text><Text style={styles.muscleValue}>{item.sets} {item.sets === 1 ? 'set' : 'sets'} · {item.percentage}%</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${Math.max(5, (item.sets / maxMuscleSets) * 100)}%` }]} /></View></View>) : <Text style={styles.noData}>No completed sets in this period.</Text>}
            </Section>

            <Section title="Top exercises" subtitle="Ranked by training volume">
              {analytics.topExercises.length ? analytics.topExercises.map((exercise, index) => <View key={exercise.exerciseId} style={styles.exerciseRow}><View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View><View style={styles.exerciseCopy}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseMeta}>{exercise.completedSets} {exercise.completedSets === 1 ? 'set' : 'sets'} · best {formatWeight(exercise.bestWeightKg * weightFactor)} {weightUnit}</Text></View><Text style={styles.exerciseVolume}>{compactNumber(exercise.volumeKg * weightFactor)} {weightUnit}</Text></View>) : <Text style={styles.noData}>No weighted sets in this period.</Text>}
            </Section>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({ icon, label, value, unit }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; unit: string }) {
  return <View style={styles.kpi}><Ionicons name={icon} size={19} color={colors.accent} /><Text style={styles.kpiLabel}>{label}</Text><Text style={styles.kpiValue}>{value}</Text><Text style={styles.kpiUnit}>{unit}</Text></View>;
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionSubtitle}>{subtitle}</Text></View>{children}</View>;
}

const compactNumber = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : `${Math.round(value)}`;
const formatWeight = (value: number) => Number.isInteger(value) ? `${value}` : value.toFixed(1);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 55 },
  introRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 },
  proBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#302A1B', borderWidth: 1, borderColor: '#514527' }, proText: { color: colors.warning, fontSize: 9, fontWeight: '900' },
  rangeTabs: { flexDirection: 'row', padding: 4, backgroundColor: colors.surface, borderRadius: 14, marginTop: 22 }, rangeTab: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }, rangeTabActive: { backgroundColor: colors.surfaceRaised }, rangeText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' }, rangeTextActive: { color: colors.text },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }, kpi: { width: '48.5%', backgroundColor: colors.surface, borderRadius: 17, borderWidth: 1, borderColor: colors.border, padding: 15 }, kpiLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginTop: 11 }, kpiValue: { color: colors.text, fontSize: 23, fontWeight: '900', marginTop: 3 }, kpiUnit: { color: colors.textMuted, fontSize: 10, marginTop: 1 },
  streakCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#262219', borderColor: '#4A4025', borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12 }, streakIcon: { width: 49, height: 49, borderRadius: 16, backgroundColor: '#392F1D', alignItems: 'center', justifyContent: 'center' }, streakCopy: { flex: 1, marginLeft: 13 }, cardEyebrow: { color: '#B7A66F', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, streakTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginTop: 3 }, cardHint: { color: '#A99E7E', fontSize: 10, marginTop: 3 },
  section: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 12 }, sectionHeader: { marginBottom: 17 }, sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900' }, sectionSubtitle: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  chart: { height: 158, flexDirection: 'row', alignItems: 'flex-end', gap: 5 }, chartColumn: { flex: 1, height: 155, alignItems: 'center', justifyContent: 'flex-end' }, bar: { width: '68%', maxWidth: 22, minHeight: 3, borderRadius: 6, backgroundColor: '#315746' }, barCurrent: { backgroundColor: colors.accent }, barLabel: { color: colors.textMuted, fontSize: 7, marginTop: 7, height: 11 }, barValue: { color: colors.textMuted, fontSize: 7, marginBottom: 4 },
  muscleRow: { marginBottom: 14 }, muscleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }, muscleName: { color: colors.text, fontSize: 11, fontWeight: '800' }, muscleValue: { color: colors.textMuted, fontSize: 9 }, track: { height: 7, backgroundColor: colors.surfaceRaised, borderRadius: 99, overflow: 'hidden' }, fill: { height: 7, backgroundColor: colors.blue, borderRadius: 99 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', minHeight: 57, borderBottomWidth: 1, borderBottomColor: colors.border }, rank: { width: 29, height: 29, borderRadius: 10, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center' }, rankText: { color: colors.accent, fontSize: 10, fontWeight: '900' }, exerciseCopy: { flex: 1, marginLeft: 10 }, exerciseName: { color: colors.text, fontSize: 11, fontWeight: '800' }, exerciseMeta: { color: colors.textMuted, fontSize: 9, marginTop: 3 }, exerciseVolume: { color: colors.accent, fontSize: 10, fontWeight: '800' }, noData: { color: colors.textMuted, fontSize: 11 },
  empty: { alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 28, marginTop: 18 }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 12 }, emptyBody: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7 }, emptyButton: { height: 45, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.accent, marginTop: 18 }, emptyButtonText: { color: colors.accentDark, fontSize: 12, fontWeight: '900' },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, lockedIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#302A1B', borderWidth: 1, borderColor: '#504526' }, lockedTitle: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 19 }, lockedBody: { color: colors.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 340, marginTop: 8 }, unlockButton: { height: 49, alignSelf: 'stretch', borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 22 }, unlockText: { color: colors.accentDark, fontSize: 13, fontWeight: '900' },
});
