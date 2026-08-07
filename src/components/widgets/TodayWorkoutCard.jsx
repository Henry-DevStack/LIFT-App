import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Check, RotateCcw } from "lucide-react";
import { db } from "../../services/storage";
import { DAY_KEYS, getTrainingStatsForDate } from "../../utils/stats";
import useToday from "../../hooks/useToday";
import ExerciseIcon from "../ui/ExerciseIcon";

// Card do treino agendado para hoje, no topo da tela inicial.
//
// Regra de exibição: se nenhum treino tem o dia de hoje marcado, o card
// simplesmente não aparece — nada de card vazio dizendo "sem treino hoje",
// que só ocuparia espaço. Dias de descanso deixam a Home mais limpa.
export default function TodayWorkoutCard() {
  const today = useToday();

  const { workout, alreadyDone } = useMemo(() => {
    // Deriva o dia da semana a partir de `today` (e não de um new Date()
    // solto), pra que o card acompanhe a virada de dia com o app aberto.
    const todayKey = DAY_KEYS[new Date(today + "T00:00:00").getDay()];
    const found = db.getWorkouts().find((w) => w.days?.includes(todayKey));
    if (!found) return { workout: null, alreadyDone: false };

    // Já treinou hoje? Muda o tom do card de "bora" para "feito".
    const logs = getTrainingStatsForDate(today).logs;
    const done = logs.some((l) => l.workoutId === found.id);
    return { workout: found, alreadyDone: done };
  }, [today]);

  if (!workout) return null;

  const exercises = workout.exercises || [];
  const preview = exercises.slice(0, 4);
  const rest = exercises.length - preview.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl2 p-4 border ${
        alreadyDone ? "bg-surface border-border" : "bg-accent/10 border-accent/40"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-medium text-textSecondary uppercase tracking-wide">
          {alreadyDone ? "Treino de hoje — concluído" : "Treino de hoje"}
        </span>
        {alreadyDone && <Check size={14} className="text-accent" />}
      </div>

      <p className="font-display text-lg font-semibold leading-tight mb-1">{workout.name}</p>
      <p className="text-textSecondary text-xs mb-3">
        {exercises.length} {exercises.length === 1 ? "exercício" : "exercícios"}
      </p>

      {/* Prévia dos exercícios, pra saber o que vem sem precisar abrir */}
      {preview.length > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          {preview.map((ex) => (
            <div key={ex.id} title={ex.name}>
              <ExerciseIcon name={ex.name} size="sm" />
            </div>
          ))}
          {rest > 0 && (
            <span className="num text-[10px] text-textSecondary ml-0.5">+{rest}</span>
          )}
        </div>
      )}

      <Link to={`/treinos/${workout.id}/executar`}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className={`w-full font-semibold py-3 rounded-xl2 flex items-center justify-center gap-2 text-sm ${
            alreadyDone ? "border border-border text-textSecondary" : "bg-accent text-bg"
          }`}
        >
          {alreadyDone ? (
            <>
              <RotateCcw size={15} />
              Treinar de novo
            </>
          ) : (
            <>
              <Play size={15} fill="currentColor" />
              Começar treino
            </>
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
}
