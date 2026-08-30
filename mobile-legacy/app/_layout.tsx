import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/src/theme';
import { AuthProvider } from '@/src/features/auth/AuthProvider';
import { CloudSyncProvider } from '@/src/features/sync/CloudSyncProvider';
import { SubscriptionEntitlementProvider } from '@/src/features/subscriptions/SubscriptionEntitlementProvider';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <CloudSyncProvider>
        <SubscriptionEntitlementProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="oauth/callback" options={{ headerShown: false }} />
          <Stack.Screen name="progress-photos" options={{ title: 'Progress photos' }} />
          <Stack.Screen name="achievements" options={{ title: 'Achievements' }} />
          <Stack.Screen name="exercise/[id]" options={{ title: 'Exercise' }} />
          <Stack.Screen name="workout/active" options={{ headerShown: false }} />
          <Stack.Screen name="workout/summary" options={{ headerShown: false }} />
          <Stack.Screen name="workout/detail" options={{ title: 'Workout details' }} />
          <Stack.Screen name="history" options={{ title: 'Workout history' }} />
          <Stack.Screen name="analytics" options={{ title: 'Training analytics' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="profile-edit" options={{ title: 'Edit profile' }} />
          <Stack.Screen name="routine/new" options={{ title: 'New routine' }} />
          <Stack.Screen name="routine/[id]" options={{ title: 'Edit routine' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal', title: 'FlexSaaS Pro' }} />
        </Stack>
        </SubscriptionEntitlementProvider>
      </CloudSyncProvider>
    </AuthProvider>
  );
}
