import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { calculateWorkoutAnalytics } from '@/src/features/analytics/workoutAnalytics';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

export default function AchievementsScreen() {
  const history = useAppStore((state) => state.history);
  const analytics = calculateWorkoutAnalytics(history, 0);
  const prCount = history.reduce((sum, workout) => sum + (workout.personalRecords?.length ?? 0), 0);
  const achievements = [
    { title: 'First Rep', body: 'Complete your first workout', current: history.length, target: 1, icon: 'flag-outline' as const },
    { title: 'On a Roll', body: 'Complete 5 workouts', current: history.length, target: 5, icon: 'flame-outline' as const },
    { title: 'Volume Builder', body: 'Lift 10,000 kg total volume', current: analytics.totalVolumeKg, target: 10000, icon: 'barbell-outline' as const },
    { title: 'Record Breaker', body: 'Set 5 personal records', current: prCount, target: 5, icon: 'trophy-outline' as const },
    { title: 'Consistency', body: 'Build a 4-week training streak', current: analytics.weeklyStreak, target: 4, icon: 'calendar-outline' as const },
  ];
  const unlocked = achievements.filter((item) => item.current >= item.target).length;
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="trophy" size={28} color={colors.warning} /></View><View><Text style={styles.heroValue}>{unlocked}/{achievements.length}</Text><Text style={styles.heroLabel}>ACHIEVEMENTS UNLOCKED</Text></View></View>
    {achievements.map((achievement) => { const complete=achievement.current>=achievement.target; const progress=Math.min(1,achievement.current/achievement.target); return <View key={achievement.title} style={[styles.card,complete&&styles.completeCard]}><View style={[styles.icon,complete&&styles.completeIcon]}><Ionicons name={complete?'checkmark':achievement.icon} size={21} color={complete?colors.accentDark:colors.textMuted}/></View><View style={styles.copy}><Text style={styles.title}>{achievement.title}</Text><Text style={styles.body}>{achievement.body}</Text><View style={styles.track}><View style={[styles.fill,{width:`${progress*100}%`}]} /></View><Text style={styles.progress}>{Math.min(Math.round(achievement.current),achievement.target).toLocaleString()} / {achievement.target.toLocaleString()}</Text></View></View>; })}
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},content:{padding:18,paddingBottom:45},hero:{borderRadius:20,borderWidth:1,borderColor:'#4A4127',backgroundColor:'#282419',padding:18,flexDirection:'row',alignItems:'center',gap:14,marginBottom:16},heroIcon:{width:52,height:52,borderRadius:17,backgroundColor:'#3A321C',alignItems:'center',justifyContent:'center'},heroValue:{color:colors.text,fontSize:22,fontWeight:'900'},heroLabel:{color:colors.warning,fontSize:9,fontWeight:'900',letterSpacing:1,marginTop:3},card:{borderRadius:18,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,padding:14,flexDirection:'row',marginBottom:11,opacity:0.72},completeCard:{opacity:1,borderColor:'#294537'},icon:{width:45,height:45,borderRadius:14,backgroundColor:colors.surfaceRaised,alignItems:'center',justifyContent:'center'},completeIcon:{backgroundColor:colors.accent},copy:{flex:1,marginLeft:12},title:{color:colors.text,fontSize:13,fontWeight:'900'},body:{color:colors.textMuted,fontSize:10,marginTop:3},track:{height:5,borderRadius:3,backgroundColor:'#2B3339',overflow:'hidden',marginTop:10},fill:{height:'100%',backgroundColor:colors.accent},progress:{color:colors.textMuted,fontSize:8,textAlign:'right',marginTop:4}});
