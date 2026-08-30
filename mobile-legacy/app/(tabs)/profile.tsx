import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '@/src/store/useAppStore';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { useCloudSync } from '@/src/features/sync/CloudSyncProvider';
import { colors } from '@/src/theme';

export default function ProfileScreen() {
  const localDisplayName = useAppStore((state) => state.displayName);
  const localEmail = useAppStore((state) => state.email);
  const isPro = useAppStore((state) => state.isPro);
  const settings = useAppStore((state) => state.settings);
  const { configured, demoMode, exitDemo, session, signOut } = useAuth();
  const { status: syncStatus, error: syncError, lastSyncedAt, syncNow } = useCloudSync();
  const displayName: string = typeof session?.user.user_metadata.display_name === 'string'
    ? session.user.user_metadata.display_name
    : localDisplayName;
  const email = session?.user.email || localEmail;
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const settingsRows = [
    { label: 'Units & measurements', icon: 'speedometer-outline' as const, value: settings.weightUnit },
    { label: 'Rest timer', icon: 'timer-outline' as const, value: `${settings.restSeconds} sec` },
    { label: 'Notifications', icon: 'notifications-outline' as const, value: settings.notificationsEnabled ? 'On' : 'Off' },
  ];
  const leaveAccount = async () => {
    if (session) await signOut();
    else await exitDemo();
    router.replace('/sign-in');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text><Text style={styles.title}>Profile</Text>
        <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><View style={styles.identityCopy}><Text style={styles.name}>{displayName}</Text><Text style={styles.email}>{email}</Text></View><Pressable onPress={() => router.push('/profile-edit')} style={styles.editButton}><Ionicons name="pencil" size={18} color={colors.textMuted} /></Pressable></View>
        {session ? <Pressable disabled={syncStatus === 'loading' || syncStatus === 'syncing'} onPress={() => void syncNow()} style={[styles.syncCard, syncStatus === 'error' && styles.syncCardError]}><View style={styles.syncIcon}><Ionicons name={syncStatus === 'error' ? 'cloud-offline-outline' : syncStatus === 'synced' ? 'cloud-done-outline' : 'sync-outline'} size={20} color={syncStatus === 'error' ? colors.danger : colors.accent} /></View><View style={styles.syncCopy}><Text style={styles.syncTitle}>{syncStatus === 'error' ? 'Cloud backup needs attention' : syncStatus === 'loading' ? 'Loading cloud data…' : syncStatus === 'syncing' ? 'Backing up changes…' : 'Cloud backup is on'}</Text><Text numberOfLines={2} style={styles.syncBody}>{syncError ?? (lastSyncedAt ? `Last synced ${lastSyncedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : 'Routines and workout history sync automatically.')}</Text></View><Ionicons name={syncStatus === 'error' ? 'refresh' : 'chevron-forward'} size={18} color={syncStatus === 'error' ? colors.danger : colors.textMuted} /></Pressable> : null}
        {isPro ? <View style={styles.proActive}><Ionicons name="sparkles" size={20} color={colors.warning} /><View><Text style={styles.proTitle}>FlexSaaS Pro active</Text><Text style={styles.proBody}>All MVP features are unlocked.</Text></View></View> : <Pressable style={styles.proCard} onPress={() => router.push('/paywall')}><View style={styles.proIcon}><Ionicons name="sparkles" size={22} color={colors.warning} /></View><View style={styles.proCopy}><Text style={styles.proTitle}>Upgrade to FlexSaaS Pro</Text><Text style={styles.proBody}>Unlimited routines, smart swaps and analytics.</Text></View><Ionicons name="chevron-forward" size={19} color={colors.warning} /></Pressable>}
        <Text style={styles.sectionTitle}>Settings</Text><View style={styles.settingsCard}>{settingsRows.map((setting, index) => <Pressable key={setting.label} onPress={() => router.push('/settings')} style={[styles.settingRow, index < settingsRows.length - 1 && styles.settingBorder]}><Ionicons name={setting.icon} size={20} color={colors.textMuted} /><Text style={styles.settingLabel}>{setting.label}</Text><Text style={styles.settingValue}>{setting.value}</Text><Ionicons name="chevron-forward" size={17} color="#58626A" /></Pressable>)}</View>
        <Pressable onPress={() => router.push(isPro ? '/analytics' : '/paywall')} style={styles.analyticsButton}><View style={styles.analyticsIcon}><Ionicons name="analytics" size={19} color={isPro ? colors.accent : colors.warning} /></View><View style={styles.analyticsCopy}><Text style={styles.analyticsTitle}>Training analytics</Text><Text style={styles.analyticsBody}>{isPro ? 'Volume, consistency and muscle balance' : 'Unlock advanced progress insights with Pro'}</Text></View>{!isPro && <Text style={styles.proLabel}>PRO</Text>}<Ionicons name="chevron-forward" size={17} color={colors.textMuted} /></Pressable>
        <Pressable onPress={() => router.push('/history')} style={styles.historyButton}><Ionicons name="time-outline" size={19} color={colors.accent} /><Text style={styles.historyText}>Workout history</Text><Ionicons name="chevron-forward" size={17} color={colors.textMuted} /></Pressable>
        <Pressable onPress={() => router.push('/progress-photos')} style={styles.historyButton}><Ionicons name="images-outline" size={19} color={colors.blue} /><Text style={styles.historyText}>Progress photos</Text><Ionicons name="chevron-forward" size={17} color={colors.textMuted} /></Pressable>
        <Pressable onPress={() => router.push('/achievements')} style={styles.historyButton}><Ionicons name="trophy-outline" size={19} color={colors.warning} /><Text style={styles.historyText}>Achievements & records</Text><Ionicons name="chevron-forward" size={17} color={colors.textMuted} /></Pressable>
        <Pressable onPress={() => router.push('/onboarding')} style={styles.historyButton}><Ionicons name="options-outline" size={19} color={colors.warning} /><Text style={styles.historyText}>Training profile</Text><Ionicons name="chevron-forward" size={17} color={colors.textMuted} /></Pressable>
        <Text style={styles.accountSectionTitle}>Account</Text>
        {!session ? <Pressable onPress={() => router.push('/sign-in')} style={styles.connectButton}><Ionicons name="cloud-upload-outline" size={18} color={colors.accent} /><Text style={styles.connectButtonText}>{configured && demoMode ? 'Connect demo to an account' : 'Connect a Supabase account'}</Text></Pressable> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={() => void leaveAccount()} style={styles.signOutButton}><Ionicons name="log-out-outline" size={19} color={colors.danger} /><Text style={styles.accountButtonText}>Sign out</Text></Pressable>
        <Text style={styles.version}>FlexSaaS MVP · Version 0.6.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 110 }, eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 }, title: { color: colors.text, fontSize: 29, fontWeight: '800', marginTop: 4, marginBottom: 24 }, identity: { flexDirection: 'row', alignItems: 'center' }, avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#203029', borderWidth: 1, borderColor: '#365543', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.accent, fontWeight: '900', fontSize: 17 }, identityCopy: { flex: 1, marginLeft: 14 }, name: { color: colors.text, fontSize: 18, fontWeight: '800' }, email: { color: colors.textMuted, fontSize: 12, marginTop: 4 }, editButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, proCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 18, backgroundColor: '#282419', borderWidth: 1, borderColor: '#4A4127', marginTop: 27 }, proActive: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, backgroundColor: '#282419', borderWidth: 1, borderColor: '#4A4127', marginTop: 27 }, proIcon: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3A321C' }, proCopy: { flex: 1, marginLeft: 12 }, proTitle: { color: colors.text, fontSize: 13, fontWeight: '800' }, proBody: { color: '#B1A57E', fontSize: 11, lineHeight: 15, marginTop: 4 }, sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 29, marginBottom: 12 }, settingsCard: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 }, settingRow: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 12 }, settingBorder: { borderBottomWidth: 1, borderBottomColor: colors.border }, settingLabel: { flex: 1, color: '#DDE2E5', fontSize: 13, fontWeight: '600' }, settingValue: { color: colors.textMuted, fontSize: 12 }, historyButton: { height: 57, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 15, marginTop: 13 }, historyText: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '700' }, version: { color: '#586169', fontSize: 11, textAlign: 'center', marginTop: 35 },
  accountSectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 28, marginBottom: 12 },
  connectButton: { height: 50, borderRadius: 15, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  connectButtonText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  signOutButton: { height: 52, borderRadius: 15, borderWidth: 1, borderColor: '#513039', backgroundColor: '#25171B', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  accountButtonText: { color: colors.danger, fontSize: 12, fontWeight: '800' },
  analyticsButton: { minHeight: 68, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, marginTop: 13 },
  analyticsIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center' },
  analyticsCopy: { flex: 1, marginLeft: 11 }, analyticsTitle: { color: colors.text, fontSize: 13, fontWeight: '800' }, analyticsBody: { color: colors.textMuted, fontSize: 9, marginTop: 4 }, proLabel: { color: colors.warning, fontSize: 8, fontWeight: '900', letterSpacing: 0.7, marginRight: 7 },
  syncCard: { minHeight: 66, borderRadius: 16, borderWidth: 1, borderColor: '#294537', backgroundColor: '#14221B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, marginTop: 18 },
  syncCardError: { borderColor: '#513039', backgroundColor: '#25171B' }, syncIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, syncCopy: { flex: 1, marginLeft: 11, marginRight: 8 }, syncTitle: { color: colors.text, fontSize: 12, fontWeight: '800' }, syncBody: { color: colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 4 },
});
