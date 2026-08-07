// Helpers de data + agregações por dia, usados pela agenda semanal
// (anéis de progresso) e por outros widgets que precisam saber
// "o que aconteceu nesse dia".
import { db } from "../services/storage";

export const DAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
export const DAY_LABELS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

export function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr() {
  return toDateStr(new Date());
}

// Retorna as 7 datas (dom→sáb) da semana que contém `reference`.
export function buildWeek(reference) {
  const start = new Date(reference);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// Treinos executados (log) em uma data específica.
export function getWorkoutLogsForDate(dateStr) {
  return db.getWorkoutLogs().filter((log) => toDateStr(new Date(log.date)) === dateStr);
}

// Refeições registradas em uma data específica.
export function getMealsForDate(dateStr) {
  return db.getMeals().filter((m) => toDateStr(new Date(m.date)) === dateStr);
}

// Agrega estatísticas de treino do dia: séries feitas, volume (kg) e reps totais.
// Volume é aproximado como carga x reps-alvo por série concluída — não é
// perfeitamente exato (não guardamos reps reais por série), mas dá uma boa
// noção de progressão de carga total movimentada.
export function getTrainingStatsForDate(dateStr) {
  const logs = getWorkoutLogsForDate(dateStr);
  let sets = 0;
  let volume = 0;
  let reps = 0;
  let calories = 0;
  logs.forEach((log) => {
    calories += Number(log.caloriesBurned) || 0;
    log.exercises?.forEach((ex) => {
      sets += ex.setsCompleted || 0;
      if (ex.repsUsed?.length) {
        // Treinos novos guardam as reps reais feitas em cada série
        // (ajustadas durante o treino), então usamos elas pro cálculo.
        ex.repsUsed.forEach((r, i) => {
          const repsN = Number(r) || 0;
          reps += repsN;
          const loadN = Number((ex.loadsUsed || [])[i]);
          if (!Number.isNaN(loadN) && loadN > 0) volume += loadN * repsN;
        });
      } else {
        // Fallback pra treinos registrados antes dessa mudança, que só
        // guardavam a meta de reps (não a real feita série a série).
        reps += (ex.setsCompleted || 0) * (ex.reps || 0);
        (ex.loadsUsed || []).forEach((load) => {
          const n = Number(load);
          if (!Number.isNaN(n) && n > 0) volume += n * (ex.reps || 1);
        });
      }
    });
  });
  return { sets, volume: Math.round(volume), reps, logs, calories: Math.round(calories) };
}

// Agrega macros/calorias do dia a partir das refeições.
export function getNutritionStatsForDate(dateStr) {
  const meals = getMealsForDate(dateStr);
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (Number(m.calories) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return { ...totals, meals };
}
