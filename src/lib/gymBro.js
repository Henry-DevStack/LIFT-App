// "Gym Bro": analisa o histórico de treinos pra dar a dica de "hora de
// subir a carga" quando um exercício vem ficando fácil demais.
//
// Regra: olha os últimos `streak` registros desse exercício (pelo nome).
// Se em todos eles o usuário completou todas as séries planejadas e bateu
// (ou passou) a meta de reps em cada série, sugere aumentar a carga.
import { db } from "./storage";

export function getExerciseHistory(exerciseName, limit = 10) {
  const logs = db.getWorkoutLogs();
  const history = [];
  for (const log of logs) {
    const ex = log.exercises?.find((e) => e.name === exerciseName);
    if (ex) history.push(ex);
    if (history.length >= limit) break;
  }
  return history;
}

export function shouldSuggestLoadIncrease(exerciseName, streak = 3) {
  if (!exerciseName) return false;
  const history = getExerciseHistory(exerciseName, streak);
  if (history.length < streak) return false;

  return history.every((ex) => {
    const plannedReps = Number(ex.reps) || 0;
    const plannedSets = Number(ex.setsPlanned) || 0;
    if (plannedReps <= 0 || plannedSets <= 0) return false;
    const setsOk = (ex.setsCompleted || 0) >= plannedSets;
    // Treinos registrados antes do controle de reps reais por série não
    // têm `repsUsed` — nesse caso não dá pra confirmar, então não sugere.
    if (!ex.repsUsed?.length) return false;
    const repsOk = ex.repsUsed.every((r) => Number(r) >= plannedReps);
    return setsOk && repsOk;
  });
}
