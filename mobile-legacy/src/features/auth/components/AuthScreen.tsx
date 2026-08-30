import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme';

export function AuthScreen({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}><Ionicons name="barbell" size={27} color={colors.accentDark} /></View>
          <Text style={styles.brand}>FLEXSAAS</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.form}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const authStyles = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 15, marginBottom: 8 },
  input: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontSize: 14, paddingHorizontal: 14 },
  button: { height: 52, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 23 },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: colors.accentDark, fontSize: 14, fontWeight: '900' },
  link: { color: colors.accent, fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 18 },
  mutedLink: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 17 },
  error: { color: colors.danger, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 13 },
  success: { color: colors.accent, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 13 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 23 },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 9, marginHorizontal: 11, fontWeight: '700' },
  demoButton: { height: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  demoText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  configNotice: { backgroundColor: '#292318', borderWidth: 1, borderColor: '#4A3E24', borderRadius: 13, padding: 12, marginBottom: 6 },
  configNoticeText: { color: '#C9B77D', fontSize: 10, lineHeight: 15, textAlign: 'center' },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 48 },
  logo: { width: 58, height: 58, borderRadius: 19, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  brand: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 2.2, textAlign: 'center', marginTop: 13 },
  title: { color: colors.text, fontSize: 29, fontWeight: '900', letterSpacing: -0.6, textAlign: 'center', marginTop: 24 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  form: { marginTop: 25 },
});
