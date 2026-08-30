import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import { requestRestNotificationPermission } from '@/src/features/notifications/restNotifications';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

const restOptions = [60, 90, 120, 180];

export default function SettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [notificationMessage, setNotificationMessage] = useState('');
  const toggleNotifications = async (value: boolean) => {
    if (!value) { updateSettings({ notificationsEnabled: false }); setNotificationMessage('Rest alerts are off.'); return; }
    const granted = await requestRestNotificationPermission();
    updateSettings({ notificationsEnabled: granted });
    setNotificationMessage(granted ? 'Rest alerts are enabled.' : 'Notification permission was not granted.');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.label}>WEIGHT UNIT</Text>
        <View style={styles.segment}>
          {(['kg', 'lb'] as const).map((unit) => <Pressable key={unit} onPress={() => updateSettings({ weightUnit: unit })} style={[styles.segmentButton, settings.weightUnit === unit && styles.segmentSelected]}><Text style={[styles.segmentText, settings.weightUnit === unit && styles.segmentTextSelected]}>{unit.toUpperCase()}</Text></Pressable>)}
        </View>

        <Text style={styles.label}>DEFAULT REST TIMER</Text>
        <View style={styles.optionGrid}>
          {restOptions.map((seconds) => <Pressable key={seconds} onPress={() => updateSettings({ restSeconds: seconds })} style={[styles.restOption, settings.restSeconds === seconds && styles.restSelected]}><Text style={[styles.restText, settings.restSeconds === seconds && styles.restTextSelected]}>{seconds < 60 ? `${seconds}s` : `${seconds / 60} min`}</Text></Pressable>)}
        </View>

        <Text style={styles.label}>NOTIFICATIONS</Text>
        <View style={styles.notificationRow}>
          <View style={styles.notificationIcon}><Ionicons name="notifications-outline" size={20} color={colors.accent} /></View>
          <View style={styles.notificationCopy}><Text style={styles.notificationTitle}>Workout reminders</Text><Text style={styles.notificationBody}>Enable reminders and rest-timer alerts.</Text></View>
          <Switch value={settings.notificationsEnabled} onValueChange={(value) => void toggleNotifications(value)} trackColor={{ false: '#313940', true: '#2A6A4B' }} thumbColor={settings.notificationsEnabled ? colors.accent : '#8A949B'} />
        </View>
        {notificationMessage ? <Text style={styles.statusText}>{notificationMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18 },
  label: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginTop: 14, marginBottom: 10 },
  segment: { flexDirection: 'row', backgroundColor: colors.surface, padding: 5, borderRadius: 15, borderWidth: 1, borderColor: colors.border },
  segmentButton: { flex: 1, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { backgroundColor: colors.accent },
  segmentText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  segmentTextSelected: { color: colors.accentDark },
  optionGrid: { flexDirection: 'row', gap: 8 },
  restOption: { flex: 1, height: 45, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  restSelected: { borderColor: colors.accent, backgroundColor: '#192A22' },
  restText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  restTextSelected: { color: colors.accent },
  notificationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14 },
  notificationIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center' },
  notificationCopy: { flex: 1, marginLeft: 11 },
  notificationTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  notificationBody: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  statusText: { color: colors.textMuted, fontSize: 10, marginTop: 9 },
});
