import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { signInWithSocial, SocialProvider } from '@/src/features/auth/socialAuth';
import { colors } from '@/src/theme';

export function SocialButtons({ enabled }: { enabled: boolean }) {
  const [loading, setLoading] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');
  const start = async (provider: SocialProvider) => {
    setLoading(provider); setError('');
    try {
      await signInWithSocial(provider);
      router.replace('/onboarding');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Social sign-in failed.');
    } finally { setLoading(null); }
  };
  return <View style={styles.wrap}>
    <View style={styles.row}>
      {(['google', 'apple'] as const).map((provider) => <Pressable key={provider} disabled={!enabled || Boolean(loading)} onPress={() => void start(provider)} style={[styles.button, (!enabled || Boolean(loading)) && styles.disabled]}>
        {loading === provider ? <ActivityIndicator color={colors.text} /> : <><Ionicons name={provider === 'apple' ? 'logo-apple' : 'logo-google'} size={18} color={colors.text} /><Text style={styles.label}>{provider === 'apple' ? 'Apple' : 'Google'}</Text></>}
      </Pressable>)}
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({ wrap: { marginTop: 15 }, row: { flexDirection: 'row', gap: 10 }, button: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, disabled: { opacity: 0.5 }, label: { color: colors.text, fontSize: 12, fontWeight: '800' }, error: { color: colors.danger, fontSize: 10, textAlign: 'center', lineHeight: 15, marginTop: 10 } });
