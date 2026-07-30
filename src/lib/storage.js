// Camada simples de "banco de dados" usando localStorage do navegador.
// Como o app é de uso pessoal e roda só na sua máquina, isso evita
// precisar de um backend (Python/FastAPI) ou banco de dados (MongoDB) separado.

const KEYS = {
  WORKOUTS: "fit:workouts",
  WORKOUT_LOGS: "fit:workout_logs",
  MEALS: "fit:meals",
  MEASUREMENTS: "fit:measurements",
  PROFILE: "fit:profile",
  TRAINING_DAYS: "fit:training_days",
  THEME: "fit:theme",
  SUPPLEMENTS: "fit:supplements",
  SUPPLEMENT_LOGS: "fit:supplement_logs",
  WATER_LOGS: "fit:water_logs",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const db = {
  // ---- Treinos (templates criados pelo usuário) ----
  getWorkouts: () => read(KEYS.WORKOUTS, []),
  saveWorkout: (workout) => {
    const all = db.getWorkouts();
    const idx = all.findIndex((w) => w.id === workout.id);
    if (idx >= 0) all[idx] = workout;
    else all.push({ ...workout, id: workout.id || uid() });
    write(KEYS.WORKOUTS, all);
    return all;
  },
  deleteWorkout: (id) => {
    const all = db.getWorkouts().filter((w) => w.id !== id);
    write(KEYS.WORKOUTS, all);
    return all;
  },

  // ---- Histórico de treinos executados ----
  getWorkoutLogs: () => read(KEYS.WORKOUT_LOGS, []),
  addWorkoutLog: (log) => {
    const all = db.getWorkoutLogs();
    all.unshift({ ...log, id: uid(), date: new Date().toISOString() });
    write(KEYS.WORKOUT_LOGS, all);
    return all;
  },

  // ---- Alimentação ----
  getMeals: () => read(KEYS.MEALS, []),
  addMeal: (meal) => {
    const all = db.getMeals();
    all.unshift({ ...meal, id: uid(), date: new Date().toISOString() });
    write(KEYS.MEALS, all);
    return all;
  },
  deleteMeal: (id) => {
    const all = db.getMeals().filter((m) => m.id !== id);
    write(KEYS.MEALS, all);
    return all;
  },

  // ---- Medidas corporais / peso ----
  getMeasurements: () => read(KEYS.MEASUREMENTS, []),
  addMeasurement: (entry) => {
    const all = db.getMeasurements();
    all.unshift({ ...entry, id: uid(), date: new Date().toISOString() });
    write(KEYS.MEASUREMENTS, all);
    return all;
  },

  // ---- Perfil ----
  getProfile: () =>
    read(KEYS.PROFILE, {
      name: "",
      age: "",
      height: "",
      goal: "manutencao",
      dailyCalorieGoal: 2200,
      proteinGoal: 150,
      carbGoal: 220,
      fatGoal: 70,
      waterGoalMl: 2500,
      units: "metric",
    }),
  saveProfile: (profile) => {
    write(KEYS.PROFILE, profile);
    return profile;
  },

  // ---- Dias de treino marcados no calendário (widget da tela inicial) ----
  // Guardado como lista de datas "YYYY-MM-DD".
  getTrainingDays: () => read(KEYS.TRAINING_DAYS, []),
  toggleTrainingDay: (dateStr) => {
    const all = db.getTrainingDays();
    const exists = all.includes(dateStr);
    const next = exists ? all.filter((d) => d !== dateStr) : [...all, dateStr];
    write(KEYS.TRAINING_DAYS, next);
    return next;
  },
  markTrainingDay: (dateStr) => {
    const all = db.getTrainingDays();
    if (all.includes(dateStr)) return all;
    const next = [...all, dateStr];
    write(KEYS.TRAINING_DAYS, next);
    return next;
  },

  // ---- Tema do app (cor de destaque escolhida pelo usuário) ----
  getTheme: () => read(KEYS.THEME, { accent: "#c8f751", accentDim: "#a3d43e" }),
  saveTheme: (theme) => {
    write(KEYS.THEME, theme);
    return theme;
  },

  // ---- Suplementos / lembretes (creatina, whey, vitaminas etc.) ----
  getSupplements: () => read(KEYS.SUPPLEMENTS, []),
  saveSupplement: (supplement) => {
    const all = db.getSupplements();
    const idx = all.findIndex((s) => s.id === supplement.id);
    if (idx >= 0) all[idx] = supplement;
    else all.push({ ...supplement, id: supplement.id || uid() });
    write(KEYS.SUPPLEMENTS, all);
    return all;
  },
  deleteSupplement: (id) => {
    const all = db.getSupplements().filter((s) => s.id !== id);
    write(KEYS.SUPPLEMENTS, all);
    // Também limpa os registros de "tomado" desse suplemento.
    const logs = db.getSupplementLogs().filter((l) => l.supplementId !== id);
    write(KEYS.SUPPLEMENT_LOGS, logs);
    return all;
  },

  // Registro de "tomei hoje" por suplemento e data ("YYYY-MM-DD").
  getSupplementLogs: () => read(KEYS.SUPPLEMENT_LOGS, []),
  toggleSupplementLog: (dateStr, supplementId) => {
    const all = db.getSupplementLogs();
    const exists = all.some((l) => l.date === dateStr && l.supplementId === supplementId);
    const next = exists
      ? all.filter((l) => !(l.date === dateStr && l.supplementId === supplementId))
      : [...all, { date: dateStr, supplementId }];
    write(KEYS.SUPPLEMENT_LOGS, next);
    return next;
  },
  isSupplementTaken: (dateStr, supplementId) =>
    db.getSupplementLogs().some((l) => l.date === dateStr && l.supplementId === supplementId),

  // ---- Ingestão de água (ml por dia) ----
  getWaterLogs: () => read(KEYS.WATER_LOGS, {}),
  getWaterForDate: (dateStr) => db.getWaterLogs()[dateStr] || 0,
  addWater: (dateStr, ml) => {
    const all = db.getWaterLogs();
    const next = { ...all, [dateStr]: Math.max(0, (all[dateStr] || 0) + ml) };
    write(KEYS.WATER_LOGS, next);
    return next;
  },
};

export { uid };
