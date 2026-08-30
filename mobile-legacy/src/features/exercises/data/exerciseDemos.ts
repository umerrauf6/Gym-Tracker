import type { ImageSourcePropType } from 'react-native';

export type ExerciseDemo = {
  source: ImageSourcePropType;
  cue: string;
  accent: string;
};

const EXERCISE_DEMOS: Record<string, ExerciseDemo> = {
  'barbell-bench-press': {
    source: require('../../../../assets/exercises/barbell-bench-press.png'),
    cue: 'Keep your feet planted and lower the bar under control toward the lower chest.',
    accent: '#37F6A1',
  },
  'incline-dumbbell-press': {
    source: require('../../../../assets/exercises/incline-dumbbell-press.png'),
    cue: 'Keep your shoulder blades anchored as the dumbbells travel over the upper chest.',
    accent: '#37F6A1',
  },
  'lat-pulldown': {
    source: require('../../../../assets/exercises/lat-pulldown.png'),
    cue: 'Keep the chest tall and drive your elbows down instead of pulling with your hands.',
    accent: '#4DA3FF',
  },
  'pull-up': {
    source: require('../../../../assets/exercises/pull-up.png'),
    cue: 'Begin from active shoulders, then drive your elbows down without swinging.',
    accent: '#4DA3FF',
  },
  'back-squat': {
    source: require('../../../../assets/exercises/back-squat.png'),
    cue: 'Brace before descending and keep your knees tracking in line with your toes.',
    accent: '#8DFF3F',
  },
  'leg-press': {
    source: require('../../../../assets/exercises/leg-press.png'),
    cue: 'Keep your hips against the pad and press through your whole foot without locking out.',
    accent: '#8DFF3F',
  },
  'dumbbell-curl': {
    source: require('../../../../assets/exercises/dumbbell-curl.png'),
    cue: 'Keep the elbows near your sides and move the dumbbells without torso momentum.',
    accent: '#FFB441',
  },
  'triceps-pushdown': {
    source: require('../../../../assets/exercises/triceps-pushdown.png'),
    cue: 'Pin your elbows at your sides and separate the rope only as your arms reach extension.',
    accent: '#FFB441',
  },
  'hanging-knee-raise': {
    source: require('../../../../assets/exercises/hanging-knee-raise.png'),
    cue: 'Use a controlled pelvic tuck to raise the knees while keeping the shoulders active.',
    accent: '#A76BFF',
  },
  'machine-chest-press': {
    source: require('../../../../assets/exercises/machine-chest-press.png'),
    cue: 'Set the handles at mid-chest and keep your upper back firmly against the pad.',
    accent: '#37F6A1',
  },
  'push-up': {
    source: require('../../../../assets/exercises/push-up.png'),
    cue: 'Move as one rigid plank while your elbows track roughly 45 degrees from your torso.',
    accent: '#37F6A1',
  },
  'cable-fly': {
    source: require('../../../../assets/exercises/cable-fly.png'),
    cue: 'Hold a soft elbow bend and bring your hands together through a wide, controlled arc.',
    accent: '#37F6A1',
  },
  'one-arm-dumbbell-row': {
    source: require('../../../../assets/exercises/one-arm-dumbbell-row.png'),
    cue: 'Brace hard on the bench and pull the dumbbell toward your hip without twisting.',
    accent: '#4DA3FF',
  },
  'machine-row': {
    source: require('../../../../assets/exercises/machine-row.png'),
    cue: 'Keep your chest connected to the pad as your elbows travel behind your torso.',
    accent: '#4DA3FF',
  },
  'dumbbell-lunge': {
    source: require('../../../../assets/exercises/dumbbell-lunge.png'),
    cue: 'Take a stable step and lower straight down while keeping the front heel planted.',
    accent: '#8DFF3F',
  },
  'split-squat': {
    source: require('../../../../assets/exercises/split-squat.png'),
    cue: 'Keep both feet grounded in a long stance and descend vertically through the front leg.',
    accent: '#8DFF3F',
  },
  'barbell-curl': {
    source: require('../../../../assets/exercises/barbell-curl.png'),
    cue: 'Keep your torso still, wrists neutral and elbows pinned while the bar travels upward.',
    accent: '#FFB441',
  },
  'close-grip-push-up': {
    source: require('../../../../assets/exercises/close-grip-push-up.png'),
    cue: 'Place your hands just inside shoulder width and keep your elbows close to your ribs.',
    accent: '#FFB441',
  },
  'cable-crunch': {
    source: require('../../../../assets/exercises/cable-crunch.png'),
    cue: 'Keep your hips quiet and curl your ribs toward your pelvis instead of pulling the rope.',
    accent: '#A76BFF',
  },
  'dumbbell-russian-twist': {
    source: require('../../../../assets/exercises/dumbbell-russian-twist.png'),
    cue: 'Rotate your ribcage as one unit and keep the movement controlled from side to side.',
    accent: '#A76BFF',
  },
  'ab-crunch-machine': {
    source: require('../../../../assets/exercises/ab-crunch-machine.png'),
    cue: 'Use your abs to curl your ribs toward your pelvis while your hips stay seated.',
    accent: '#A76BFF',
  },
};

export function getExerciseDemo(exerciseId: string) {
  return EXERCISE_DEMOS[exerciseId];
}
