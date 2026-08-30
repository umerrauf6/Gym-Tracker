import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Dumbbell,
  Layers,
  TriangleAlert,
} from "lucide-react";
import * as motion from "motion/react-client";
import { EXERCISES, getExerciseById } from "@/src/data/exercises";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return EXERCISES.map((exercise) => ({ id: exercise.id }));
}

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = getExerciseById(id);
  if (!exercise) notFound();

  // Find matching alternative exercises targeting the same muscle
  const alternatives = EXERCISES.filter(
    (item) => item.primaryMuscle === exercise.primaryMuscle && item.id !== exercise.id
  ).slice(0, 3);

  return (
    <div className="page">
      <Link
        href="/exercises"
        className="ghost-button"
        style={{ marginBottom: 18, display: "inline-flex" }}
      >
        <ArrowLeft size={15} /> Back to Exercise Library
      </Link>

      {/* Cinematic Hero */}
      <motion.section
        className="detail-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Image
          src={`/exercises/${exercise.id}.png`}
          alt={exercise.name}
          fill
          priority
          sizes="100vw"
        />
        <div className="detail-shade" />

        <div className="detail-copy">
          <div className="eyebrow">
            <Dumbbell size={14} /> {exercise.equipment} Compound Movement
          </div>
          <h1 className="detail-title">{exercise.name}</h1>
          <p className="page-subtitle" style={{ color: "#cbd5e1" }}>
            Targeted primary movement for developing the{" "}
            <strong style={{ color: "var(--accent)" }}>{exercise.primaryMuscle}</strong>
            {exercise.secondaryMuscles.length > 0 && (
              <>
                {" "}with secondary recruitment of{" "}
                <strong style={{ color: "#fff" }}>
                  {exercise.secondaryMuscles.join(" and ")}
                </strong>
              </>
            )}
            .
          </p>

          <div className="detail-tags">
            <span className="detail-tag">Primary · {exercise.primaryMuscle}</span>
            {exercise.secondaryMuscles.map((muscle) => (
              <span
                className="detail-tag"
                key={muscle}
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  color: "var(--text-secondary)",
                  borderColor: "var(--border)",
                }}
              >
                Secondary · {muscle}
              </span>
            ))}
            <span
              className="detail-tag"
              style={{
                background: "var(--cyan-soft)",
                color: "var(--cyan)",
                borderColor: "rgba(56, 189, 248, 0.3)",
              }}
            >
              {exercise.equipment}
            </span>
          </div>
        </div>
      </motion.section>

      {/* Instructions & Mistakes Grid */}
      <div className="detail-grid">
        {/* Step-by-Step Execution Guide */}
        <section className="panel detail-card">
          <h2 className="section-title">
            <CheckCircle2 size={18} color="var(--accent)" /> Execution Steps
          </h2>
          <ol className="instruction-list">
            {exercise.instructions.map((item, index) => (
              <li className="instruction-item" key={item}>
                <span className="step-badge">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Common Form Mistakes */}
        <section className="panel detail-card">
          <h2 className="section-title">
            <TriangleAlert size={18} color="var(--rose)" /> Common Mistakes to Avoid
          </h2>
          <ul className="instruction-list">
            {exercise.commonMistakes.map((item) => (
              <li className="instruction-item mistake-item" key={item}>
                <span className="step-badge">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Matching Equipment Swaps & Alternatives */}
      {alternatives.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="section-head">
            <div>
              <h2 className="section-title">
                <Layers size={18} color="var(--amber)" /> Alternative {exercise.primaryMuscle} Movements
              </h2>
              <span className="section-meta">
                Interchangeable exercises for busy gym floors
              </span>
            </div>
          </div>

          <div className="exercise-grid">
            {alternatives.map((alt) => (
              <Link
                key={alt.id}
                href={`/exercises/${alt.id}`}
                className="exercise-card"
                style={{ display: "block" }}
              >
                <div className="exercise-media">
                  <Image
                    src={`/exercises/${alt.id}.png`}
                    alt={alt.name}
                    fill
                    sizes="(max-width: 860px) 50vw, 33vw"
                  />
                  <span className="exercise-overlay" />
                  <span className="equipment-tag">{alt.equipment}</span>
                </div>

                <div className="exercise-info">
                  <div>
                    <h3 className="exercise-name">{alt.name}</h3>
                    <div className="exercise-muscles">
                      {alt.primaryMuscle} · {alt.equipment}
                    </div>
                  </div>
                  <span className="exercise-arrow">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
