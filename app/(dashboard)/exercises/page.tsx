import { Suspense } from "react";
import { ExerciseLibrary } from "@/src/components/exercise-library";

export default function ExercisesPage() {
  return <Suspense fallback={<div className="page"><div className="panel empty-state"><div><div className="empty-title">Loading exercise library…</div><div className="empty-copy">Preparing your movements.</div></div></div></div>}><ExerciseLibrary /></Suspense>;
}
