import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { AuthScreen, authStyles } from '@/src/features/auth/components/AuthScreen';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { supabase } from '@/src/lib/supabase';
import { colors } from '@/src/theme';
import { SocialButtons } from '@/src/features/auth/components/SocialButtons';

export default function SignInScreen() {
  const { configured, continueAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
    if (!supabase || !email.trim() || !password) return;
    setLoading(true); setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (authError) setError(authError.message);
    else router.replace('/(tabs)');
  };
  const useDemo = async () => { await continueAsDemo(); router.replace('/(tabs)'); };

  return (
    <AuthScreen title="Welcome back" subtitle="Sign in to sync routines and training history across devices.">
      {!configured && <View style={authStyles.configNotice}><Text style={authStyles.configNoticeText}>Supabase is not configured yet. Add the two EXPO_PUBLIC variables from .env.example to enable accounts.</Text></View>}
      <Text style={authStyles.label}>EMAIL</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#626C74" style={authStyles.input} />
      <Text style={authStyles.label}>PASSWORD</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" placeholder="Your password" placeholderTextColor="#626C74" style={authStyles.input} />
      {error ? <Text style={authStyles.error}>{error}</Text> : null}
      <Pressable disabled={loading || !configured || !email.trim() || !password} onPress={signIn} style={[authStyles.button, (loading || !configured || !email.trim() || !password) && authStyles.buttonDisabled]}>{loading ? <ActivityIndicator color={colors.accentDark} /> : <Text style={authStyles.buttonText}>Sign in</Text>}</Pressable>
      <Pressable onPress={() => router.push('/forgot-password')}><Text style={authStyles.link}>Forgot password?</Text></Pressable>
      <Pressable onPress={() => router.push('/sign-up')}><Text style={authStyles.mutedLink}>New here? <Text style={{ color: colors.accent, fontWeight: '800' }}>Create an account</Text></Text></Pressable>
      <View style={authStyles.dividerRow}><View style={authStyles.divider} /><Text style={authStyles.dividerText}>OR</Text><View style={authStyles.divider} /></View>
      <SocialButtons enabled={configured} />
      <Pressable onPress={useDemo} style={authStyles.demoButton}><Text style={authStyles.demoText}>Continue with local demo data</Text></Pressable>
    </AuthScreen>
  );
}
