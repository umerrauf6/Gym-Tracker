import { Stack } from 'expo-router';
import RoutineEditorScreen from '@/src/features/workouts/screens/RoutineEditorScreen';

export default function NewRoutineRoute() {
  return <><Stack.Screen options={{ title: 'New routine' }} /><RoutineEditorScreen /></>;
}
