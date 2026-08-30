import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  EQUIPMENT,
  EXERCISES,
  Exercise,
  Equipment,
  MUSCLE_GROUPS,
  MuscleGroup,
} from '@/src/features/exercises/data/exercises';
import { getExerciseDemo } from '@/src/features/exercises/data/exerciseDemos';

type ExerciseLibraryScreenProps = {
  exercises?: Exercise[];
  onExercisePress?: (exercise: Exercise) => void;
};

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function ExerciseCard({
  exercise,
  onPress,
}: {
  exercise: Exercise;
  onPress: () => void;
}) {
  const demo = getExerciseDemo(exercise.id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${exercise.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imagePlaceholder}>
        {demo ? <Image source={demo.source} resizeMode="cover" style={styles.cardImage} /> : <View style={styles.muscleGlyph}><Text style={styles.muscleGlyphText}>{exercise.primaryMuscle.slice(0, 1)}</Text></View>}
        <View style={styles.imageShade} />
        <View style={styles.equipmentBadge}>
          <Text style={styles.equipmentBadgeText}>{exercise.equipment}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.exerciseName}>{exercise.name}</Text>
        <Text numberOfLines={1} style={styles.muscleName}>{exercise.primaryMuscle}</Text>
      </View>
    </Pressable>
  );
}

export default function ExerciseLibraryScreen({
  exercises = EXERCISES,
  onExercisePress = () => undefined,
}: ExerciseLibraryScreenProps) {
  const [query, setQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return exercises.filter((exercise) => {
      const searchableText = [
        exercise.name,
        exercise.primaryMuscle,
        exercise.equipment,
        ...exercise.secondaryMuscles,
      ].join(' ').toLocaleLowerCase();

      const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesMuscle =
        selectedMuscles.length === 0 || selectedMuscles.includes(exercise.primaryMuscle);
      const matchesEquipment =
        selectedEquipment.length === 0 || selectedEquipment.includes(exercise.equipment);

      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [exercises, query, selectedEquipment, selectedMuscles]);

  const activeFilterCount = selectedMuscles.length + selectedEquipment.length;

  const clearFilters = () => {
    setSelectedMuscles([]);
    setSelectedEquipment([]);
  };

  const renderExercise: ListRenderItem<Exercise> = ({ item }) => (
    <ExerciseCard exercise={item} onPress={() => onExercisePress(item)} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D10" />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>TRAIN SMARTER</Text>
                <Text style={styles.title}>Exercise Library</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>FS</Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                accessibilityLabel="Search exercises"
                value={query}
                onChangeText={setQuery}
                placeholder="Search exercises, muscles..."
                placeholderTextColor="#6F7882"
                returnKeyType="search"
                selectionColor="#37F6A1"
                style={styles.searchInput}
              />
              {query.length > 0 && (
                <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={10}>
                  <Text style={styles.clearSearch}>×</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.sectionHeadingRow}>
              <Text style={styles.filterLabel}>MUSCLE GROUP</Text>
              {activeFilterCount > 0 && (
                <Pressable onPress={clearFilters} hitSlop={8}>
                  <Text style={styles.clearFilters}>Clear all ({activeFilterCount})</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.chipList}>
              {MUSCLE_GROUPS.map((muscle) => (
                <FilterChip
                  key={muscle}
                  label={muscle}
                  selected={selectedMuscles.includes(muscle)}
                  onPress={() => setSelectedMuscles((current) => toggleValue(current, muscle))}
                />
              ))}
            </View>

            <Text style={[styles.filterLabel, styles.equipmentLabel]}>EQUIPMENT</Text>
            <View style={styles.chipList}>
              {EQUIPMENT.map((item) => (
                <FilterChip
                  key={item}
                  label={item}
                  selected={selectedEquipment.includes(item)}
                  onPress={() => setSelectedEquipment((current) => toggleValue(current, item))}
                />
              ))}
            </View>

            <View style={styles.resultsRow}>
              <Text style={styles.resultsTitle}>Exercises</Text>
              <Text style={styles.resultsCount}>{filteredExercises.length} results</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptyBody}>Try a different search or clear some filters.</Text>
            <Pressable style={styles.emptyButton} onPress={clearFilters}>
              <Text style={styles.emptyButtonText}>Clear filters</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0D10' },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  eyebrow: { color: '#37F6A1', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#F4F7F8', fontSize: 29, fontWeight: '800', letterSpacing: -0.8, marginTop: 4 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#171D22', borderWidth: 1, borderColor: '#283138' },
  avatarText: { color: '#37F6A1', fontWeight: '800', fontSize: 12 },
  searchContainer: { height: 54, borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#14191E', borderWidth: 1, borderColor: '#232B31' },
  searchIcon: { color: '#8C969F', fontSize: 28, marginRight: 10, marginTop: -4 },
  searchInput: { flex: 1, color: '#F4F7F8', fontSize: 15, height: '100%' },
  clearSearch: { color: '#A9B1B7', fontSize: 25, lineHeight: 25 },
  sectionHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 11 },
  filterLabel: { color: '#7F8992', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  clearFilters: { color: '#37F6A1', fontSize: 12, fontWeight: '700' },
  equipmentLabel: { marginTop: 20, marginBottom: 11 },
  chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 37, paddingHorizontal: 14, borderRadius: 18.5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#14191E', borderWidth: 1, borderColor: '#273038' },
  chipSelected: { backgroundColor: '#37F6A1', borderColor: '#37F6A1' },
  chipText: { color: '#AAB2B8', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#07110C', fontWeight: '800' },
  pressed: { opacity: 0.72 },
  resultsRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 30, marginBottom: 13 },
  resultsTitle: { color: '#F4F7F8', fontSize: 20, fontWeight: '800' },
  resultsCount: { color: '#77818A', fontSize: 12, fontWeight: '600' },
  gridRow: { justifyContent: 'space-between', gap: 12 },
  card: { flex: 1, maxWidth: '48.5%', borderRadius: 18, overflow: 'hidden', backgroundColor: '#14191E', borderWidth: 1, borderColor: '#222A30', marginBottom: 12 },
  cardPressed: { transform: [{ scale: 0.98 }], borderColor: '#3A4A43' },
  imagePlaceholder: { height: 122, backgroundColor: '#1B2228', alignItems: 'center', justifyContent: 'center' },
  cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  imageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.08)' },
  muscleGlyph: { height: 58, width: 58, borderRadius: 29, backgroundColor: '#24332D', borderWidth: 1, borderColor: '#39584A', alignItems: 'center', justifyContent: 'center' },
  muscleGlyphText: { color: '#37F6A1', fontSize: 25, fontWeight: '900' },
  equipmentBadge: { position: 'absolute', left: 9, bottom: 9, backgroundColor: 'rgba(7, 10, 12, 0.78)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7 },
  equipmentBadgeText: { color: '#D9DEE1', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardBody: { padding: 13, minHeight: 82 },
  exerciseName: { color: '#F2F5F6', fontSize: 14, lineHeight: 19, fontWeight: '700' },
  muscleName: { color: '#37F6A1', fontSize: 11, fontWeight: '700', marginTop: 6 },
  emptyState: { alignItems: 'center', paddingVertical: 58, paddingHorizontal: 24 },
  emptyIcon: { color: '#465159', fontSize: 44 },
  emptyTitle: { color: '#F1F4F5', fontSize: 18, fontWeight: '800', marginTop: 8 },
  emptyBody: { color: '#7E8991', fontSize: 14, textAlign: 'center', marginTop: 7 },
  emptyButton: { marginTop: 20, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11, backgroundColor: '#202A25' },
  emptyButtonText: { color: '#37F6A1', fontSize: 13, fontWeight: '800' },
});
