import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from '@/src/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = 'google' | 'apple';

export async function signInWithSocial(provider: SocialProvider) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const redirectTo = Linking.createURL('/oauth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
  });
  if (error) throw error;
  if (Platform.OS === 'web') return;
  if (!data.url) throw new Error('The provider did not return a sign-in URL.');
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') throw new Error(result.type === 'cancel' ? 'Sign-in was cancelled.' : 'Sign-in did not complete.');
  const code = new URL(result.url).searchParams.get('code');
  if (!code) throw new Error('The sign-in callback did not contain an authorization code.');
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
}
