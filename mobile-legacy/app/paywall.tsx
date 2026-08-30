import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { isBillingConfigured, purchasePro, restorePro } from '@/src/features/subscriptions/billing';

const features = [
  ['swap-horizontal', 'Smart exercise swaps', 'Get three alternatives when equipment is busy.'],
  ['infinite', 'Unlimited routines', 'Build and save as many training plans as you need.'],
  ['analytics', 'Advanced analytics', 'See progress, volume trends and personal records.'],
] as const;

export default function PaywallScreen() {
  const activatePro = useAppStore((state) => state.activatePro);
  const { demoMode, session } = useAuth();
  const [loading, setLoading] = useState<'purchase' | 'restore' | null>(null);
  const [message, setMessage] = useState('');
  const startTrial = async () => {
    setMessage('');
    if (!isBillingConfigured) {
      if (demoMode) { activatePro(); router.back(); return; }
      setMessage('Add RevenueCat SDK keys and run a development build to accept purchases.'); return;
    }
    setLoading('purchase');
    try {
      if (await purchasePro(session?.user.id)) { activatePro(); router.back(); }
      else setMessage('The purchase completed without activating the Pro entitlement.');
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Purchase failed.'); }
    finally { setLoading(null); }
  };
  const restore = async () => {
    setMessage(''); setLoading('restore');
    try { if (await restorePro(session?.user.id)) { activatePro(); setMessage('Pro access restored.'); } else setMessage('No active Pro purchase was found.'); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Restore failed.'); }
    finally { setLoading(null); }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroIcon}><Ionicons name="sparkles" size={31} color={colors.warning} /></View>
        <Text style={styles.eyebrow}>FLEXSAAS PRO</Text>
        <Text style={styles.title}>Train without limits.</Text>
        <Text style={styles.subtitle}>Everything you need to adapt faster and understand your progress.</Text>

        <View style={styles.featureList}>
          {features.map(([icon, title, body]) => (
            <View key={title} style={styles.featureRow}>
              <View style={styles.featureIcon}><Ionicons name={icon} size={22} color={colors.accent} /></View>
              <View style={styles.featureCopy}><Text style={styles.featureTitle}>{title}</Text><Text style={styles.featureBody}>{body}</Text></View>
            </View>
          ))}
        </View>

        <View style={styles.priceCard}>
          <View><Text style={styles.planName}>Annual</Text><Text style={styles.billing}>7-day free trial, then billed yearly</Text></View>
          <View><Text style={styles.price}>€59.99</Text><Text style={styles.perMonth}>€5 / month</Text></View>
        </View>
        <Pressable disabled={Boolean(loading)} style={[styles.cta, loading && {opacity:0.6}]} onPress={() => void startTrial()}>{loading === 'purchase' ? <ActivityIndicator color={colors.accentDark} /> : <Text style={styles.ctaText}>{isBillingConfigured ? 'Start free trial' : demoMode ? 'Activate demo Pro' : 'Billing setup required'}</Text>}</Pressable>
        <Pressable disabled={Boolean(loading) || !isBillingConfigured} onPress={() => void restore()}><Text style={[styles.restore, !isBillingConfigured && {opacity:0.4}]}>{loading === 'restore' ? 'Restoring…' : 'Restore purchases'}</Text></Pressable>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Text style={styles.legal}>{isBillingConfigured ? 'Subscriptions are processed by the App Store or Google Play through RevenueCat.' : 'Store purchases require RevenueCat public SDK keys and an Expo development build. Demo mode never charges.'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingBottom: 50, alignItems: 'center' },
  heroIcon: { width: 70, height: 70, borderRadius: 24, backgroundColor: '#302A1B', borderWidth: 1, borderColor: '#504526', alignItems: 'center', justifyContent: 'center', marginTop: 13 },
  eyebrow: { color: colors.warning, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 20 },
  title: { color: colors.text, fontSize: 31, fontWeight: '900', letterSpacing: -0.8, textAlign: 'center', marginTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 330, marginTop: 9 },
  featureList: { alignSelf: 'stretch', marginTop: 29 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
  featureIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#203029', alignItems: 'center', justifyContent: 'center' },
  featureCopy: { flex: 1, marginLeft: 13 },
  featureTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  featureBody: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  priceCard: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.accent, borderRadius: 18, padding: 16, marginTop: 9 },
  planName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  billing: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  price: { color: colors.text, fontSize: 17, fontWeight: '900', textAlign: 'right' },
  perMonth: { color: colors.accent, fontSize: 10, marginTop: 3, textAlign: 'right' },
  cta: { alignSelf: 'stretch', height: 53, borderRadius: 15, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  ctaText: { color: colors.accentDark, fontSize: 15, fontWeight: '900' },
  restore: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 18 },
  legal: { color: '#586169', fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 17, maxWidth: 300 },
  message: { color: colors.warning, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 14, maxWidth: 320 },
});
