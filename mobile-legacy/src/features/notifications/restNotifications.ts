import { Platform } from 'react-native';

let handlerConfigured = false;

async function getNotifications() {
  if (Platform.OS === 'web') return null;
  const Notifications = await import('expo-notifications');
  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('rest-timers', {
        name: 'Rest timers',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 150, 250],
        sound: 'default',
      });
    }
    handlerConfigured = true;
  }
  return Notifications;
}

export async function requestRestNotificationPermission() {
  const Notifications = await getNotifications();
  if (!Notifications) return true;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleRestNotification(seconds: number, exerciseName?: string) {
  const Notifications = await getNotifications();
  if (!Notifications || seconds <= 0) return null;
  const granted = await requestRestNotificationPermission();
  if (!granted) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rest complete',
      body: exerciseName ? `Ready for your next ${exerciseName} set.` : 'Ready for your next set.',
      sound: 'default',
      data: { route: '/workout/active' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(seconds)),
      channelId: Platform.OS === 'android' ? 'rest-timers' : undefined,
    },
  });
}

export async function cancelRestNotification(identifier: string | null) {
  if (!identifier) return;
  const Notifications = await getNotifications();
  if (Notifications) await Notifications.cancelScheduledNotificationAsync(identifier);
}
