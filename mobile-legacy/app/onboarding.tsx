import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TrainingProfile, useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

const goals: { id: TrainingProfile['goal']; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'muscle', label: 'Build muscle', icon: 'barbell-outline' }, { id: 'strength', label: 'Get stronger', icon: 'flash-outline' },
  { id: 'fitness', label: 'General fitness', icon: 'heart-outline' }, { id: 'weight-loss', label: 'Lose weight', icon: 'flame-outline' },
];
const levels: TrainingProfile['experience'][] = ['beginner', 'intermediate', 'advanced'];

export default function OnboardingScreen() {
  const profile = useAppStore((state) => state.trainingProfile);
  const update = useAppStore((state) => state.updateTrainingProfile);
  const finish = () => { update({ complete: true }); router.replace('/(tabs)'); };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>PERSONALIZE FLEXSAAS</Text><Text style={styles.title}>Build your training profile.</Text><Text style={styles.body}>We’ll use this to tune defaults and keep your plan realistic.</Text>
    <Text style={styles.section}>PRIMARY GOAL</Text><View style={styles.grid}>{goals.map((goal) => <Pressable key={goal.id} onPress={() => update({ goal: goal.id })} style={[styles.goal, profile.goal === goal.id && styles.selected]}><Ionicons name={goal.icon} size={22} color={profile.goal === goal.id ? colors.accent : colors.textMuted} /><Text style={styles.goalText}>{goal.label}</Text></Pressable>)}</View>
    <Text style={styles.section}>EXPERIENCE</Text><View style={styles.segment}>{levels.map((level) => <Pressable key={level} onPress={() => update({ experience: level })} style={[styles.segmentItem, profile.experience === level && styles.segmentSelected]}><Text style={[styles.segmentText, profile.experience === level && styles.segmentTextSelected]}>{level}</Text></Pressable>)}</View>
    <Text style={styles.section}>TRAINING DAYS PER WEEK</Text><View style={styles.days}>{[2,3,4,5,6].map((day) => <Pressable key={day} onPress={() => update({ daysPerWeek: day })} style={[styles.day, profile.daysPerWeek === day && styles.daySelected]}><Text style={[styles.dayText, profile.daysPerWeek === day && styles.dayTextSelected]}>{day}</Text></Pressable>)}</View>
    <Pressable onPress={finish} style={styles.cta}><Text style={styles.ctaText}>{profile.complete ? 'Save profile' : 'Start training'}</Text><Ionicons name="arrow-forward" size={18} color={colors.accentDark} /></Pressable>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:colors.background},content:{padding:22,paddingBottom:45},eyebrow:{color:colors.accent,fontSize:10,fontWeight:'900',letterSpacing:1.8,marginTop:18},title:{color:colors.text,fontSize:30,fontWeight:'900',lineHeight:36,marginTop:8},body:{color:colors.textMuted,fontSize:13,lineHeight:20,marginTop:8},section:{color:colors.textMuted,fontSize:10,fontWeight:'900',letterSpacing:1.3,marginTop:29,marginBottom:11},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},goal:{width:'48%',minHeight:82,borderRadius:17,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,padding:14,gap:9},selected:{borderColor:colors.accent,backgroundColor:'#16281F'},goalText:{color:colors.text,fontSize:12,fontWeight:'800'},segment:{flexDirection:'row',backgroundColor:colors.surface,borderRadius:15,padding:4,borderWidth:1,borderColor:colors.border},segmentItem:{flex:1,height:41,alignItems:'center',justifyContent:'center',borderRadius:11},segmentSelected:{backgroundColor:colors.surfaceRaised},segmentText:{color:colors.textMuted,fontSize:10,fontWeight:'800',textTransform:'capitalize'},segmentTextSelected:{color:colors.accent},days:{flexDirection:'row',justifyContent:'space-between'},day:{width:52,height:52,borderRadius:16,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},daySelected:{borderColor:colors.accent,backgroundColor:'#16281F'},dayText:{color:colors.textMuted,fontWeight:'900'},dayTextSelected:{color:colors.accent},cta:{height:56,borderRadius:16,backgroundColor:colors.accent,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,marginTop:34},ctaText:{color:colors.accentDark,fontSize:14,fontWeight:'900'} });
