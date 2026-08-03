// Estimativa de calorias gastas no treino.
//
// Usa o conceito de MET (Metabolic Equivalent of Task): cada grupo
// muscular trabalhado tem um MET aproximado de musculação (referência:
// Compendium of Physical Activities), e a fórmula padrão
//   kcal/min = (MET * 3.5 * peso_kg) / 200
// converte isso em calorias por minuto de treino. É uma estimativa, não
// um valor clínico — mas dá uma noção real de gasto calórico, parecido
// com o que apps como o Hevy mostram no resumo do treino.

import { getMuscleGroup } from "../data/exerciseVisuals";

export const MET_BY_MUSCLE_GROUP = {
  peito: 5,
  costas: 5,
  perna: 6, // pernas grandes = mais gasto
  ombro: 4.5,
  braco: 4,
  core: 4,
  cardio: 8,
  geral: 5,
};

export const DEFAULT_WEIGHT_KG = 75;

export function getMetForExercise(exerciseName) {
  const group = getMuscleGroup(exerciseName);
  return MET_BY_MUSCLE_GROUP[group] || MET_BY_MUSCLE_GROUP.geral;
}

// Estimativa simples: usa a duração total do treino (em minutos) e a
// média dos MET dos exercícios realizados.
export function estimateWorkoutCaloriesSimple({ exerciseNames = [], durationMinutes = 0, weightKg }) {
  const weight = Number(weightKg) > 0 ? Number(weightKg) : DEFAULT_WEIGHT_KG;
  const mets = exerciseNames.length ? exerciseNames.map(getMetForExercise) : [MET_BY_MUSCLE_GROUP.geral];
  const avgMet = mets.reduce((a, b) => a + b, 0) / mets.length;
  const kcalPerMin = (avgMet * 3.5 * weight) / 200;
  return Math.max(0, Math.round(kcalPerMin * Math.max(0, durationMinutes)));
}
