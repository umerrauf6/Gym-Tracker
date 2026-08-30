export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Arms' | 'Core';
export type Equipment = 'Dumbbell' | 'Barbell' | 'Cable' | 'Machine' | 'Bodyweight';

export type Exercise = {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: string[];
  equipment: Equipment;
  imageUrl?: string;
  instructions: string[];
  commonMistakes: string[];
};

export const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Arms', 'Core'];
export const EQUIPMENT: Equipment[] = ['Dumbbell', 'Barbell', 'Cable', 'Machine', 'Bodyweight'];

export const EXERCISES: Exercise[] = [
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front delts'],
    equipment: 'Barbell',
    instructions: [
      'Lie on the bench with your eyes directly under the bar.',
      'Plant your feet, retract your shoulder blades, and grip just wider than shoulder width.',
      'Lower the bar with control to your lower chest.',
      'Press upward while keeping your upper back tight and feet planted.',
    ],
    commonMistakes: ['Flaring the elbows too far', 'Bouncing the bar off the chest', 'Lifting the hips from the bench'],
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front delts'],
    equipment: 'Dumbbell',
    instructions: ['Set the bench to 30–45 degrees.', 'Start with dumbbells above the upper chest.', 'Lower until elbows pass the torso slightly.', 'Press up without colliding the dumbbells.'],
    commonMistakes: ['Using too steep an incline', 'Shrugging the shoulders', 'Cutting the range of motion short'],
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rear delts'],
    equipment: 'Cable',
    instructions: ['Secure your thighs beneath the pad.', 'Lean back slightly with the chest tall.', 'Drive elbows down and pull the bar toward the upper chest.', 'Return slowly until the lats are fully lengthened.'],
    commonMistakes: ['Pulling behind the neck', 'Using excessive momentum', 'Turning the movement into a row'],
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Core'],
    equipment: 'Bodyweight',
    instructions: ['Hang with a shoulder-width overhand grip.', 'Brace your core and depress your shoulder blades.', 'Pull until your chin clears the bar.', 'Lower to a controlled full hang.'],
    commonMistakes: ['Kipping unintentionally', 'Craning the neck', 'Dropping through the eccentric'],
  },
  {
    id: 'back-squat',
    name: 'Back Squat',
    primaryMuscle: 'Legs',
    secondaryMuscles: ['Glutes', 'Core'],
    equipment: 'Barbell',
    instructions: ['Set the bar securely across your upper back.', 'Brace and stand with feet around shoulder width.', 'Sit down between your hips while tracking knees over toes.', 'Drive the floor away to stand tall.'],
    commonMistakes: ['Losing torso tension', 'Knees collapsing inward', 'Rising onto the toes'],
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    primaryMuscle: 'Legs',
    secondaryMuscles: ['Glutes'],
    equipment: 'Machine',
    instructions: ['Place feet shoulder-width on the platform.', 'Release the safety with your back against the pad.', 'Lower until you reach a comfortable deep position.', 'Press through the whole foot without locking the knees.'],
    commonMistakes: ['Letting the lower back round', 'Using a shallow range', 'Locking out aggressively'],
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    primaryMuscle: 'Arms',
    secondaryMuscles: ['Forearms'],
    equipment: 'Dumbbell',
    instructions: ['Stand tall with dumbbells at your sides.', 'Keep elbows close to the torso.', 'Curl while rotating palms upward.', 'Lower under control to full extension.'],
    commonMistakes: ['Swinging the torso', 'Moving elbows forward', 'Dropping the weights quickly'],
  },
  {
    id: 'triceps-pushdown',
    name: 'Cable Triceps Pushdown',
    primaryMuscle: 'Arms',
    secondaryMuscles: ['Triceps'],
    equipment: 'Cable',
    instructions: ['Grip the attachment with elbows pinned to your sides.', 'Extend the elbows until arms are straight.', 'Pause briefly at full extension.', 'Return without letting the elbows drift forward.'],
    commonMistakes: ['Using bodyweight to push', 'Flaring the elbows', 'Stopping short of full extension'],
  },
  {
    id: 'hanging-knee-raise',
    name: 'Hanging Knee Raise',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Hip flexors'],
    equipment: 'Bodyweight',
    instructions: ['Hang from a bar with shoulders active.', 'Tuck the pelvis and brace the abdomen.', 'Raise knees toward the chest without swinging.', 'Lower slowly to the start.'],
    commonMistakes: ['Using momentum', 'Only flexing at the hips', 'Relaxing the shoulders'],
  },
  {
    id: 'machine-chest-press',
    name: 'Machine Chest Press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front delts'],
    equipment: 'Machine',
    instructions: ['Adjust the seat so handles align with mid-chest.', 'Keep your upper back against the pad.', 'Press forward without locking the elbows.', 'Return until you feel a controlled chest stretch.'],
    commonMistakes: ['Setting the seat too low', 'Shrugging', 'Letting the weight stack slam'],
  },
  {
    id: 'push-up', name: 'Push-Up', primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Core'], equipment: 'Bodyweight',
    instructions: ['Set hands just wider than shoulder width.', 'Brace into a straight body line.', 'Lower the chest between the hands.', 'Press the floor away.'],
    commonMistakes: ['Dropping the hips', 'Flaring elbows excessively', 'Using a partial range'],
  },
  {
    id: 'cable-fly', name: 'Cable Fly', primaryMuscle: 'Chest', secondaryMuscles: ['Front delts'], equipment: 'Cable',
    instructions: ['Set handles around chest height.', 'Step forward into a stable stance.', 'Bring hands together in a wide arc.', 'Return with control.'],
    commonMistakes: ['Turning it into a press', 'Overstretching the shoulders', 'Using momentum'],
  },
  {
    id: 'one-arm-dumbbell-row', name: 'One-Arm Dumbbell Row', primaryMuscle: 'Back', secondaryMuscles: ['Biceps', 'Rear delts'], equipment: 'Dumbbell',
    instructions: ['Brace one hand on a bench.', 'Keep the spine neutral.', 'Drive the elbow toward the hip.', 'Lower to a full stretch.'],
    commonMistakes: ['Rotating the torso', 'Shrugging', 'Pulling toward the shoulder'],
  },
  {
    id: 'machine-row', name: 'Machine Row', primaryMuscle: 'Back', secondaryMuscles: ['Biceps', 'Rear delts'], equipment: 'Machine',
    instructions: ['Set the chest pad for a full reach.', 'Keep the chest supported.', 'Pull elbows behind the torso.', 'Return slowly.'],
    commonMistakes: ['Lifting the chest off the pad', 'Shortening the reach', 'Yanking the handles'],
  },
  {
    id: 'dumbbell-lunge', name: 'Dumbbell Lunge', primaryMuscle: 'Legs', secondaryMuscles: ['Glutes', 'Core'], equipment: 'Dumbbell',
    instructions: ['Stand tall with dumbbells at your sides.', 'Step forward into a stable stance.', 'Lower the back knee toward the floor.', 'Push through the front foot.'],
    commonMistakes: ['Using too narrow a stance', 'Pushing off the back foot', 'Losing balance'],
  },
  {
    id: 'split-squat', name: 'Bodyweight Split Squat', primaryMuscle: 'Legs', secondaryMuscles: ['Glutes'], equipment: 'Bodyweight',
    instructions: ['Take a long staggered stance.', 'Keep most weight over the front leg.', 'Lower straight down.', 'Stand through the front foot.'],
    commonMistakes: ['Stance too short', 'Front heel lifting', 'Rushing repetitions'],
  },
  {
    id: 'barbell-curl', name: 'Barbell Curl', primaryMuscle: 'Arms', secondaryMuscles: ['Forearms'], equipment: 'Barbell',
    instructions: ['Grip the bar around shoulder width.', 'Pin elbows near the torso.', 'Curl without leaning back.', 'Lower to full extension.'],
    commonMistakes: ['Swinging the bar', 'Moving elbows forward', 'Bending the wrists'],
  },
  {
    id: 'close-grip-push-up', name: 'Close-Grip Push-Up', primaryMuscle: 'Arms', secondaryMuscles: ['Chest', 'Core'], equipment: 'Bodyweight',
    instructions: ['Set hands just inside shoulder width.', 'Brace the body straight.', 'Lower with elbows close.', 'Press to full arm extension.'],
    commonMistakes: ['Hands too narrow', 'Elbows flaring', 'Hips sagging'],
  },
  {
    id: 'cable-crunch', name: 'Cable Crunch', primaryMuscle: 'Core', secondaryMuscles: ['Obliques'], equipment: 'Cable',
    instructions: ['Kneel facing the cable stack.', 'Hold the rope beside your head.', 'Curl ribs toward the pelvis.', 'Return without pulling with the arms.'],
    commonMistakes: ['Hinging only at the hips', 'Pulling with the arms', 'Using excessive weight'],
  },
  {
    id: 'dumbbell-russian-twist', name: 'Dumbbell Russian Twist', primaryMuscle: 'Core', secondaryMuscles: ['Obliques'], equipment: 'Dumbbell',
    instructions: ['Sit with knees bent and torso leaned back.', 'Brace and hold one dumbbell.', 'Rotate the ribcage side to side.', 'Move with control.'],
    commonMistakes: ['Only moving the arms', 'Rounding excessively', 'Moving too quickly'],
  },
  {
    id: 'ab-crunch-machine', name: 'Ab Crunch Machine', primaryMuscle: 'Core', secondaryMuscles: ['Obliques'], equipment: 'Machine',
    instructions: ['Adjust the seat and pads.', 'Brace before moving.', 'Curl ribs toward the pelvis.', 'Return slowly without resting the stack.'],
    commonMistakes: ['Pulling with the arms', 'Using momentum', 'Overextending on return'],
  },
];

export function getExerciseById(id: string) {
  return EXERCISES.find((exercise) => exercise.id === id);
}
