import { router } from 'expo-router';
import ExerciseLibraryScreen from '@/src/features/exercises/screens/ExerciseLibraryScreen';

export default function ExercisesRoute() {
  return (
    <ExerciseLibraryScreen
      onExercisePress={(exercise) => router.push(`/exercise/${exercise.id}`)}
    />
  );
}
