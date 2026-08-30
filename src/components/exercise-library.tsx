"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeading } from "@/src/components/page-heading";
import { EQUIPMENT, EXERCISES, MUSCLE_GROUPS } from "@/src/data/exercises";

export function ExerciseLibrary() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [muscle, setMuscle] = useState("All");
  const [equipment, setEquipment] = useState("All");

  const filtered = useMemo(
    () =>
      EXERCISES.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) &&
          (muscle === "All" || item.primaryMuscle === muscle) &&
          (equipment === "All" || item.equipment === equipment)
      ),
    [query, muscle, equipment]
  );

  const resetFilters = () => {
    setQuery("");
    setMuscle("All");
    setEquipment("All");
  };

  const hasActiveFilters = query.trim() !== "" || muscle !== "All" || equipment !== "All";

  return (
    <div className="page">
      <PageHeading
        eyebrow="Movement Science"
        title="Exercise Database"
        subtitle="Explore 21 guided gym movements, master execution cues, and find biomechanically matched equipment alternatives."
      />

      {/* Toolbar & Search */}
      <div className="exercise-toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by exercise name, muscle, or equipment..."
            aria-label="Search exercise database"
          />
        </label>
        {hasActiveFilters && (
          <button className="secondary-button" onClick={resetFilters}>
            <SlidersHorizontal size={14} /> Reset Filters
          </button>
        )}
      </div>

      {/* Muscle Group Chips */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Filter by Target Muscle
        </div>
        <div className="filter-row">
          {["All", ...MUSCLE_GROUPS].map((item) => (
            <button
              key={item}
              className={`filter-chip ${muscle === item ? "active" : ""}`}
              onClick={() => setMuscle(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Chips */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Filter by Equipment
        </div>
        <div className="filter-row">
          {["All", ...EQUIPMENT].map((item) => (
            <button
              key={item}
              className={`filter-chip ${equipment === item ? "active" : ""}`}
              onClick={() => setEquipment(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Result Count Status */}
      <div className="section-head">
        <h2 className="section-title" style={{ fontSize: 16 }}>
          <BookOpen size={16} color="var(--accent)" /> {filtered.length} Movement{filtered.length === 1 ? "" : "s"} Found
        </h2>
        <span className="section-meta">
          Showing {muscle === "All" ? "all muscle groups" : muscle} · {equipment === "All" ? "all equipment" : equipment}
        </span>
      </div>

      {/* Exercise Card Grid */}
      <motion.div layout className="exercise-grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((exercise) => (
            <motion.div
              layout
              key={exercise.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={`/exercises/${exercise.id}`}
                className="exercise-card"
                style={{ display: "block" }}
              >
                <div className="exercise-media">
                  <Image
                    src={`/exercises/${exercise.id}.png`}
                    alt={exercise.name}
                    fill
                    sizes="(max-width: 860px) 50vw, 33vw"
                  />
                  <span className="exercise-overlay" />
                  <span className="equipment-tag">{exercise.equipment}</span>
                </div>

                <div className="exercise-info">
                  <div>
                    <h3 className="exercise-name">{exercise.name}</h3>
                    <div className="exercise-muscles">
                      {exercise.primaryMuscle}
                      {exercise.secondaryMuscles.length > 0 && (
                        <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
                          · {exercise.secondaryMuscles.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="exercise-arrow">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {!filtered.length && (
        <div className="panel empty-state">
          <div>
            <Search size={32} />
            <div className="empty-title">No exercises matched your filters</div>
            <div className="empty-copy">
              Try clearing your search query or selecting &quot;All&quot; muscle groups and equipment.
            </div>
            <button
              className="secondary-button"
              style={{ marginTop: 18 }}
              onClick={resetFilters}
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
