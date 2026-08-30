import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native';
import { AuthScreen, authStyles } from '@/src/features/auth/components/AuthScreen';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { supabase } from '@/src/lib/supabase';
import { colors } from '@/src/theme';

export default function ForgotPasswordScreen() {
  const { configured } = useAuth(); const [email, setEmail] = useState(''); const [loading, setLoading] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const send = async () => { if (!supabase) return; setLoading(true); setError(''); const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim()); setLoading(false); if (resetError) setError(resetError.message); else setMessage('Password reset instructions were sent if that email exists.'); };
  const disabled = loading || !configured || !email.trim();
  return <AuthScreen title="Reset password" subtitle="We’ll send instructions to your account email."><Text style={authStyles.label}>EMAIL</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#626C74" style={authStyles.input} />{error ? <Text style={authStyles.error}>{error}</Text> : null}{message ? <Text style={authStyles.success}>{message}</Text> : null}<Pressable disabled={disabled} onPress={send} style={[authStyles.button, disabled && authStyles.buttonDisabled]}>{loading ? <ActivityIndicator color={colors.accentDark} /> : <Text style={authStyles.buttonText}>Send reset email</Text>}</Pressable><Pressable onPress={() => router.back()}><Text style={authStyles.link}>Back to sign in</Text></Pressable></AuthScreen>;
}
