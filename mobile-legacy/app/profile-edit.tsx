import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { supabase } from '@/src/lib/supabase';
import { useAppStore } from '@/src/store/useAppStore';
import { colors } from '@/src/theme';

export default function EditProfileScreen() {
  const localName = useAppStore((state) => state.displayName);
  const localEmail = useAppStore((state) => state.email);
  const setProfile = useAppStore((state) => state.setProfile);
  const { session } = useAuth();
  const [name, setName] = useState(session?.user.user_metadata.display_name || localName);
  const [email, setEmail] = useState(session?.user.email || localEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!name.trim() || !email.trim()) return;
    setLoading(true); setError('');
    if (session && supabase) {
      const { error: authError } = await supabase.auth.updateUser({ email: email.trim(), data: { display_name: name.trim() } });
      if (authError) { setError(authError.message); setLoading(false); return; }
      const { error: profileError } = await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', session.user.id);
      if (profileError) { setError(profileError.message); setLoading(false); return; }
    }
    setProfile(name, email);
    setLoading(false);
    router.back();
  };

  return <SafeAreaView style={styles.safeArea}><View style={styles.content}><Text style={styles.label}>DISPLAY NAME</Text><TextInput value={name} onChangeText={setName} style={styles.input} /><Text style={styles.label}>EMAIL</Text><TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />{session && <Text style={styles.hint}>Changing your account email may require confirmation from both addresses.</Text>}{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable disabled={loading || !name.trim() || !email.trim()} onPress={save} style={[styles.save, loading && { opacity: 0.6 }]}>{loading ? <ActivityIndicator color={colors.accentDark} /> : <Text style={styles.saveText}>Save profile</Text>}</Pressable></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18 }, label: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 15, marginBottom: 9 }, input: { height: 52, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: 14 }, hint: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 12 }, error: { color: colors.danger, fontSize: 11, marginTop: 12 }, save: { height: 51, backgroundColor: colors.accent, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 27 }, saveText: { color: colors.accentDark, fontWeight: '900' },
});
