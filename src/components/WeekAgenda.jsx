import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell, Utensils, Play } from "lucide-react";
import { db } from "../lib/storage";
import {
  DAY_KEYS,
  DAY_LABELS_SHORT,
  buildWeek,
  toDateStr,
  getTrainingStatsForDate,
  getNutritionStatsForDate,
} from "../lib/stats";
import useToday from "../hooks/useToday";
import ProgressRing from "./ProgressRing";
import ExerciseIcon from "./ExerciseIcon";

const RING_TARGETS = { sets: 20, volume: 2500, reps: 100 };

// `showNutrition` controla o bloco de alimentação (anéis de macros e
// lista de refeições). Fica desligado por padrão porque na tela inicial
// ele ocupava bastante espaço sem ser usado — mas basta passar
// `showNutrition` para trazer de volta, sem precisar reescrever nada.
export default function WeekAgenda({ showNutrition = false }) {
  const today = useToday();
  const [weekRef, setWeekRef] = useState(new Date());
  const [selected, setSelected] = useState(today);
  const [workouts] = useState(() => db.getWorkouts());
  const [profile] = useState(() => db.getProfile());

  const week = useMemo(() => buildWeek(weekRef), [weekRef]);

  const training = getTrainingStatsForDate(selected);
  const nutrition = showNutrition ? getNutritionStatsForDate(selected) : null;

  const selectedDateObj = new Date(selected + "T00:00:00");
  const weekdayKey = DAY_KEYS[selectedDateObj.getDay()];
  const scheduledWorkout = workouts.find((w) => w.days?.includes(weekdayKey));
  const hasLog = training.logs.length > 0;

  const rangeLabel = `${week[0].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${week[6].toLocaleDateString(
    "pt-BR",
    { day: "numeric", month: "short" }
  )}`;

  function changeWeek(delta) {
    setWeekRef((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta * 7);
      return d;
    });
  }

  return (
    <div className="bg-surface border border-border rounded-xl2 p-4">
      {/* Navegação de semana */}
      <div className="flex items-center justify-between mb-3">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => changeWeek(-1)} className="text-textSecondary p-1">
          <ChevronLeft size={16} />
        </motion.button>
        <span className="text-xs font-medium text-textSecondary capitalize">{rangeLabel}</span>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => changeWeek(1)} className="text-textSecondary p-1">
          <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* Faixa de dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-5">
        {week.map((d) => {
          const dStr = toDateStr(d);
          const isSelected = dStr === selected;
          const isToday = dStr === today;
          const dayStats = getTrainingStatsForDate(dStr);
          const trained = dayStats.logs.length > 0;
          return (
            <motion.button
              key={dStr}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelected(dStr)}
              className="flex flex-col items-center gap-1 py-1"
            >
              <span className="text-[9px] text-textSecondary/70 font-medium uppercase">
                {DAY_LABELS_SHORT[d.getDay()]}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs num font-semibold transition-colors ${
                  isSelected
                    ? "bg-accent text-bg"
                    : isToday
                    ? "ring-1 ring-accent text-textPrimary"
                    : "text-textSecondary"
                }`}
              >
                {d.getDate()}
              </div>
              <div className={`w-1 h-1 rounded-full ${trained ? "bg-accent" : "bg-transparent"}`} />
            </motion.button>
          );
        })}
      </div>

      {/* Anéis de treino */}
      <div className="flex items-center gap-2 mb-2.5">
        <Dumbbell size={14} className="text-accent" />
        <span className="text-[11px] font-medium text-textSecondary uppercase tracking-wide">Treino</span>
      </div>
      <div className="flex justify-around mb-4">
        <ProgressRing value={training.sets} max={RING_TARGETS.sets} label="Séries" color="var(--accent)" size={62} />
        <ProgressRing value={training.volume} max={RING_TARGETS.volume} label="Volume (kg)" color="#4fd6e8" size={62} />
        <ProgressRing value={training.reps} max={RING_TARGETS.reps} label="Repetições" color="#ff9b52" size={62} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected + "-training"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {hasLog ? (
            <div className="flex flex-col gap-2 mb-5">
              {training.logs.map((log, li) => (
                <div key={li} className="bg-surface2 rounded-xl2 p-3">
                  <p className="font-medium text-sm mb-2">{log.workoutName}</p>
                  <div className="flex flex-col gap-2">
                    {log.exercises.map((ex, ei) => (
                      <div key={ei} className="flex items-center gap-2.5">
                        <ExerciseIcon name={ex.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate">{ex.name}</p>
                          <p className="text-textSecondary text-[10px] num">
                            {ex.setsCompleted}x{ex.reps || "?"} · {(ex.loadsUsed || []).filter(Boolean).join("/") || "peso corporal"}kg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : scheduledWorkout ? (
            <div className="bg-surface2 rounded-xl2 p-3 mb-5">
              <p className="font-medium text-sm mb-2">{scheduledWorkout.name}</p>
              <div className="flex flex-col gap-2 mb-3">
                {scheduledWorkout.exercises.slice(0, 4).map((ex, ei) => (
                  <div key={ei} className="flex items-center gap-2.5">
                    <ExerciseIcon name={ex.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate">{ex.name}</p>
                      <p className="text-textSecondary text-[10px] num">
                        {ex.sets}x{ex.reps}
                      </p>
                    </div>
                  </div>
                ))}
                {scheduledWorkout.exercises.length > 4 && (
                  <p className="text-textSecondary/60 text-[10px]">
                    +{scheduledWorkout.exercises.length - 4} exercício(s)
                  </p>
                )}
              </div>
              {selected === today && (
                <Link
                  to={`/treinos/${scheduledWorkout.id}/executar`}
                  className="flex items-center justify-center gap-1.5 bg-accent text-bg text-xs font-semibold py-2 rounded-lg"
                >
                  <Play size={12} fill="currentColor" />
                  Iniciar treino
                </Link>
              )}
            </div>
          ) : (
            <p className="text-textSecondary/60 text-xs text-center mb-5 py-2">
              Nenhum treino planejado ou registrado nesse dia.
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {showNutrition && (
        <>
        {/* Anéis de nutrição */}
        <div className="flex items-center gap-2 mb-2.5">
          <Utensils size={14} className="text-accent" />
          <span className="text-[11px] font-medium text-textSecondary uppercase tracking-wide">Alimentação</span>
        </div>
        <div className="flex justify-around mb-4">
          <ProgressRing
            value={nutrition.calories}
            max={profile.dailyCalorieGoal || 2200}
            label="Calorias"
            color="#ff6fa5"
            size={62}
          />
          <ProgressRing
            value={nutrition.protein}
            max={profile.proteinGoal || 150}
            label="Proteína (g)"
            color="#c8f751"
            size={62}
          />
          <ProgressRing
            value={nutrition.carbs}
            max={profile.carbGoal || 220}
            label="Carbo (g)"
            color="#5b9dff"
            size={62}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={selected + "-nutrition"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {nutrition.meals.length > 0 ? (
              <div className="flex flex-col gap-2">
                {nutrition.meals.map((m) => (
                  <div key={m.id} className="bg-surface2 rounded-xl2 p-3 flex items-center justify-between">
                    <p className="text-xs font-medium">{m.name}</p>
                    <p className="text-textSecondary text-[10px] num">
                      {m.calories}kcal · {m.protein || 0}P {m.carbs || 0}C {m.fat || 0}F
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-textSecondary/60 text-xs text-center py-2">
                {selected === today ? (
                  <Link to="/alimentacao" className="text-accent font-medium">
                    Registrar primeira refeição do dia →
                  </Link>
                ) : (
                  "Nenhuma refeição registrada nesse dia."
                )}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
        </>
      )}

    </div>
  );
}
