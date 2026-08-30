import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  demoMode: boolean;
  configured: boolean;
  continueAsDemo: () => Promise<void>;
  exitDemo: () => Promise<void>;
  signOut: () => Promise<void>;
};

const DEMO_MODE_KEY = 'flexsaas-demo-mode';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const client = supabase;
    const loadingWatchdog = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 4000);

    const initialize = async () => {
      try {
        const storedDemoMode = await AsyncStorage.getItem(DEMO_MODE_KEY);
        if (mounted && storedDemoMode === 'true') setDemoMode(true);
        if (!client) return;

        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        if (mounted) setSession(data.session);
      } catch (error) {
        console.warn('Authentication session initialization failed', error);
        if (mounted) setSession(null);
      } finally {
        clearTimeout(loadingWatchdog);
        if (mounted) setLoading(false);
      }
    };
    void initialize();

    const authSubscription = client?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    }).data.subscription;

    const appStateSubscription = Platform.OS === 'web' || !client
      ? undefined
      : AppState.addEventListener('change', (state) => {
          if (state === 'active') client.auth.startAutoRefresh();
          else client.auth.stopAutoRefresh();
        });

    return () => {
      mounted = false;
      clearTimeout(loadingWatchdog);
      authSubscription?.unsubscribe();
      appStateSubscription?.remove();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    loading,
    demoMode,
    configured: isSupabaseConfigured,
    continueAsDemo: async () => {
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      setDemoMode(true);
    },
    exitDemo: async () => {
      await AsyncStorage.removeItem(DEMO_MODE_KEY);
      setDemoMode(false);
    },
    signOut: async () => {
      if (supabase) await supabase.auth.signOut();
      await AsyncStorage.removeItem(DEMO_MODE_KEY);
      setDemoMode(false);
      setSession(null);
    },
  }), [demoMode, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
