import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getExerciseDemo } from '@/src/features/exercises/data/exerciseDemos';
import { getExerciseById } from '@/src/features/exercises/data/exercises';
import { colors } from '@/src/theme';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = getExerciseById(id);
  const demo = getExerciseDemo(id);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoExpanded, setDemoExpanded] = useState(false);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setDemoExpanded(false);
  }, [id]);

  useEffect(() => {
    if (!isPlaying || !exercise || exercise.instructions.length < 2) return;
    const interval = setInterval(() => {
      setCurrentStep((step) => (step + 1) % exercise.instructions.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [exercise, isPlaying]);

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={42} color={colors.textMuted} />
          <Text style={styles.notFoundTitle}>Exercise not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: exercise.name }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole={demo ? 'button' : undefined} accessibilityLabel={demo ? `Expand ${exercise.name} visual demonstration` : undefined} disabled={!demo} onPress={() => setDemoExpanded(true)} style={styles.media}>
          {demo ? <Image source={demo.source} resizeMode="cover" style={styles.demoImage} /> : <View style={styles.mediaFallback}><View style={styles.mediaCircle}><Text style={styles.mediaLetter}>{exercise.primaryMuscle[0]}</Text></View><Text style={styles.fallbackTitle}>Interactive form guide</Text><Text style={styles.fallbackBody}>Follow the coached steps below</Text></View>}
          <View style={styles.mediaTopBadge}><Ionicons name={demo ? 'body-outline' : 'list-outline'} size={14} color={demo?.accent ?? colors.accent} /><Text style={styles.mediaTopText}>{demo ? 'TWO-PHASE FORM DEMO' : `${exercise.instructions.length} GUIDED STEPS`}</Text></View>
          {demo ? <View style={styles.demoBadge}><Ionicons name="expand-outline" size={15} color={colors.text} /><Text style={styles.demoText}>Tap to expand</Text></View> : null}
        </Pressable>

        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.tags}>
          <Tag text={exercise.primaryMuscle} accent />
          <Tag text={exercise.equipment} />
        </View>

        <Text style={styles.sectionTitle}>Guided coaching</Text>
        <View style={styles.coachCard}>
          <View style={styles.coachHeader}><View><Text style={styles.coachEyebrow}>STEP {currentStep + 1} OF {exercise.instructions.length}</Text><Text style={styles.coachTitle}>{currentStep === 0 ? 'Set your position' : currentStep === exercise.instructions.length - 1 ? 'Finish with control' : 'Own the movement'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause guided steps' : 'Play guided steps'} onPress={() => setIsPlaying((playing) => !playing)} style={[styles.playButton, isPlaying && styles.playButtonActive]}><Ionicons name={isPlaying ? 'pause' : 'play'} size={17} color={isPlaying ? colors.accentDark : colors.accent} /></Pressable></View>
          <Text style={styles.coachInstruction}>{exercise.instructions[currentStep]}</Text>
          <View style={styles.stepProgress}>{exercise.instructions.map((_, index) => <View key={index} style={[styles.progressDot, index === currentStep && styles.progressDotActive]} />)}</View>
          <View style={styles.coachControls}><Pressable accessibilityRole="button" accessibilityLabel="Previous instruction" disabled={currentStep === 0} onPress={() => { setIsPlaying(false); setCurrentStep((step) => Math.max(0, step - 1)); }} style={[styles.coachControl, currentStep === 0 && styles.coachControlDisabled]}><Ionicons name="chevron-back" size={16} color={colors.text} /><Text style={styles.coachControlText}>Previous</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Next instruction" onPress={() => { setIsPlaying(false); setCurrentStep((step) => (step + 1) % exercise.instructions.length); }} style={[styles.coachControl, styles.coachControlNext]}><Text style={styles.coachControlNextText}>{currentStep === exercise.instructions.length - 1 ? 'Restart' : 'Next'}</Text><Ionicons name={currentStep === exercise.instructions.length - 1 ? 'refresh' : 'chevron-forward'} size={16} color={colors.accentDark} /></Pressable></View>
        </View>

        <Text style={styles.sectionTitle}>Muscles worked</Text>
        <View style={styles.muscleCard}>
          <View><Text style={styles.cardLabel}>PRIMARY</Text><Text style={styles.cardValue}>{exercise.primaryMuscle}</Text></View>
          <View style={styles.divider} />
          <View style={styles.secondary}><Text style={styles.cardLabel}>SECONDARY</Text><Text style={styles.cardValue}>{exercise.secondaryMuscles.join(', ')}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>How to perform</Text>
        {exercise.instructions.map((instruction, index) => (
          <View key={instruction} style={styles.instructionRow}>
            <View style={styles.step}><Text style={styles.stepText}>{index + 1}</Text></View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Common mistakes</Text>
        <View style={styles.mistakesCard}>
          {exercise.commonMistakes.map((mistake) => (
            <View key={mistake} style={styles.mistakeRow}>
              <Ionicons name="close-circle" size={18} color={colors.danger} />
              <Text style={styles.mistakeText}>{mistake}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {demo ? <Modal visible={demoExpanded} transparent animationType="fade" onRequestClose={() => setDemoExpanded(false)}><SafeAreaView style={styles.expandedSafeArea}><View style={styles.expandedHeader}><View><Text style={styles.expandedEyebrow}>VISUAL FORM GUIDE</Text><Text style={styles.expandedTitle}>{exercise.name}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close visual demonstration" onPress={() => setDemoExpanded(false)} style={styles.expandedClose}><Ionicons name="close" size={22} color={colors.text} /></Pressable></View><View style={styles.expandedMedia}><Image source={demo.source} resizeMode="contain" style={styles.expandedImage} /></View><View style={styles.cueCard}><Ionicons name="sparkles-outline" size={20} color={demo.accent} /><View style={styles.cueCopy}><Text style={[styles.cueLabel, { color: demo.accent }]}>FORM CUE</Text><Text style={styles.cueText}>{demo.cue}</Text></View></View></SafeAreaView></Modal> : null}
    </SafeAreaView>
  );
}

function Tag({ text, accent = false }: { text: string; accent?: boolean }) {
  return <View style={[styles.tag, accent && styles.tagAccent]}><Text style={[styles.tagText, accent && styles.tagTextAccent]}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 70 },
  media: { height: 235, backgroundColor: colors.surfaceRaised, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  demoImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  mediaFallback: { alignItems: 'center', justifyContent: 'center' },
  mediaCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#24332D', borderWidth: 1, borderColor: '#3B5D4C', alignItems: 'center', justifyContent: 'center' },
  mediaLetter: { color: colors.accent, fontSize: 42, fontWeight: '900' },
  fallbackTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 12 }, fallbackBody: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  mediaTopBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(7,10,12,0.82)', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9 }, mediaTopText: { color: colors.text, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  demoBadge: { position: 'absolute', bottom: 13, right: 13, flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(7,10,12,0.82)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 },
  demoText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.6, marginTop: 23 },
  tags: { flexDirection: 'row', gap: 8, marginTop: 13 },
  tag: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  tagAccent: { backgroundColor: '#203029', borderColor: '#345542' },
  tagText: { color: '#AEB6BC', fontSize: 11, fontWeight: '700' },
  tagTextAccent: { color: colors.accent },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 28, marginBottom: 13 },
  coachCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16 },
  coachHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, coachEyebrow: { color: colors.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, coachTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: 4 },
  playButton: { width: 39, height: 39, borderRadius: 13, borderWidth: 1, borderColor: '#345443', backgroundColor: '#1A2A22', alignItems: 'center', justifyContent: 'center' }, playButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  coachInstruction: { color: '#CDD4D8', fontSize: 13, lineHeight: 20, minHeight: 60, marginTop: 15 }, stepProgress: { flexDirection: 'row', gap: 5, marginTop: 11 }, progressDot: { height: 4, flex: 1, borderRadius: 99, backgroundColor: colors.surfaceRaised }, progressDotActive: { backgroundColor: colors.accent },
  coachControls: { flexDirection: 'row', gap: 9, marginTop: 16 }, coachControl: { flex: 1, height: 42, borderRadius: 12, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, coachControlDisabled: { opacity: 0.35 }, coachControlText: { color: colors.text, fontSize: 10, fontWeight: '800' }, coachControlNext: { backgroundColor: colors.accent, borderColor: colors.accent }, coachControlNextText: { color: colors.accentDark, fontSize: 10, fontWeight: '900' },
  muscleCard: { flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 16 },
  cardLabel: { color: colors.textMuted, fontSize: 9, letterSpacing: 1.2, fontWeight: '800' },
  cardValue: { color: colors.text, fontSize: 13, marginTop: 5, fontWeight: '700' },
  divider: { width: 1, backgroundColor: colors.border, marginHorizontal: 18 },
  secondary: { flex: 1 },
  instructionRow: { flexDirection: 'row', marginBottom: 15 },
  step: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepText: { color: colors.accent, fontSize: 12, fontWeight: '900' },
  instructionText: { flex: 1, color: '#C1C8CD', fontSize: 13, lineHeight: 20 },
  mistakesCard: { backgroundColor: '#1B1518', borderWidth: 1, borderColor: '#382328', borderRadius: 17, padding: 15 },
  mistakeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  mistakeText: { flex: 1, color: '#D3BCC1', fontSize: 12, lineHeight: 17 },
  expandedSafeArea: { flex: 1, backgroundColor: '#050709' }, expandedHeader: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }, expandedEyebrow: { color: colors.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, expandedTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 4 }, expandedClose: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  expandedMedia: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }, expandedImage: { width: '100%', height: '100%' }, cueCard: { flexDirection: 'row', alignItems: 'flex-start', margin: 18, marginTop: 4, padding: 15, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, cueCopy: { flex: 1, marginLeft: 11 }, cueLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1 }, cueText: { color: '#C8D0D4', fontSize: 11, lineHeight: 17, marginTop: 5 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 12 },
});
