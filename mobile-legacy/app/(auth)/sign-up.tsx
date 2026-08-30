import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { AuthScreen, authStyles } from '@/src/features/auth/components/AuthScreen';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { supabase } from '@/src/lib/supabase';
import { colors } from '@/src/theme';
import { SocialButtons } from '@/src/features/auth/components/SocialButtons';

export default function SignUpScreen() {
  const { configured } = useAuth();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const signUp = async () => {
    if (!supabase || password.length < 8) return;
    setLoading(true); setError(''); setMessage('');
    const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: name.trim() } } });
    setLoading(false);
    if (authError) setError(authError.message);
    else if (data.session) router.replace('/onboarding');
    else setMessage('Check your email to confirm your account, then return to sign in.');
  };
  const disabled = loading || !configured || !name.trim() || !email.trim() || password.length < 8;
  return <AuthScreen title="Create your account" subtitle="Start tracking workouts and keep your progress synced."><Text style={authStyles.label}>DISPLAY NAME</Text><TextInput value={name} onChangeText={setName} autoComplete="name" placeholder="Your name" placeholderTextColor="#626C74" style={authStyles.input} /><Text style={authStyles.label}>EMAIL</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#626C74" style={authStyles.input} /><Text style={authStyles.label}>PASSWORD</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" placeholderTextColor="#626C74" style={authStyles.input} />{error ? <Text style={authStyles.error}>{error}</Text> : null}{message ? <Text style={authStyles.success}>{message}</Text> : null}<Pressable disabled={disabled} onPress={signUp} style={[authStyles.button, disabled && authStyles.buttonDisabled]}>{loading ? <ActivityIndicator color={colors.accentDark} /> : <Text style={authStyles.buttonText}>Create account</Text>}</Pressable><View style={authStyles.dividerRow}><View style={authStyles.divider} /><Text style={authStyles.dividerText}>OR</Text><View style={authStyles.divider} /></View><SocialButtons enabled={configured} /><Pressable onPress={() => router.back()}><Text style={authStyles.mutedLink}>Already have an account? <Text style={{ color: colors.accent, fontWeight: '800' }}>Sign in</Text></Text></Pressable></AuthScreen>;
}
