import { Stack, useLocalSearchParams } from 'expo-router';
import RoutineEditorScreen from '@/src/features/workouts/screens/RoutineEditorScreen';

export default function EditRoutineRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <><Stack.Screen options={{ title: 'Edit routine' }} /><RoutineEditorScreen routineId={id} /></>;
}
