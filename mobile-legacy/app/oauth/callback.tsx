import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { colors } from '@/src/theme';

export default function OAuthCallbackScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [message, setMessage] = useState('Completing secure sign-in…');
  useEffect(() => {
    const finish = async () => {
      if (!supabase || !code) { setMessage('This sign-in link is incomplete. Return and try again.'); return; }
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) setMessage(error.message);
      else router.replace('/onboarding');
    };
    void finish();
  }, [code]);
  return <SafeAreaView style={styles.page}><ActivityIndicator color={colors.accent} size="large" /><Text style={styles.text}>{message}</Text></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24 }, text: { color: colors.textMuted, marginTop: 16, textAlign: 'center' } });
