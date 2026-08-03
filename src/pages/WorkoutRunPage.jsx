import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight, Info, Plus, Minus, Flame } from "lucide-react";
import { db } from "../lib/storage";
import { estimateWorkoutCaloriesSimple } from "../lib/calories";
import ExerciseIcon from "../components/ExerciseIcon";

export default function WorkoutRunPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [exIndex, setExIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState({}); // { exId: count }
  const [actualLoads, setActualLoads] = useState({}); // { exId: [loads used] }
  const [actualReps, setActualReps] = useState({}); // { exId: [reps feitas] }
  const [resting, setResting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [currentLoad, setCurrentLoad] = useState(""); // carga da série que está sendo feita agora
  const [currentReps, setCurrentReps] = useState(0); // reps da série que está sendo feita agora
  const [finished, setFinished] = useState(false); // tela de resumo ao concluir o treino
  const [summary, setSummary] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const w = db.getWorkouts().find((w) => w.id === id);
    setWorkout(w || null);
    startTimeRef.current = Date.now();
  }, [id]);

  useEffect(() => {
    if (!resting) return;
    if (secondsLeft <= 0) {
      setResting(false);
      return;
    }
    timerRef.current = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [resting, secondsLeft]);

  // Sempre que muda de exercício ou conclui uma série, preenche a
  // carga/reps editáveis da próxima série com os valores planejados
  // no treino (mas continuam ajustáveis antes de concluir a série).
  useEffect(() => {
    if (!workout) return;
    const ex = workout.exercises[exIndex];
    if (!ex) return;
    const done = completedSets[ex.id] || 0;
    const pLoad = ex.loads?.[done] ?? ex.loads?.[ex.loads.length - 1] ?? "";
    const pReps = ex.repsPerSet?.[done] ?? ex.reps;
    setCurrentLoad(pLoad === "" ? "" : Number(pLoad));
    setCurrentReps(Number(pReps) || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout, exIndex, completedSets]);

  if (!workout) {
    return <div className="px-5 pt-6 text-textSecondary text-sm">Treino não encontrado.</div>;
  }

  if (finished && summary) {
    return (
      <div className="min-h-screen flex flex-col px-5 pt-6 pb-8">
        <p className="text-xs text-textSecondary font-medium uppercase tracking-wide text-center mb-8">
          Treino concluído
        </p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center gap-6"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center"
          >
            <Check size={28} className="text-accent" />
          </motion.div>
          <h1 className="font-display text-2xl font-semibold text-center">{workout.name}</h1>
          <div className="grid grid-cols-2 gap-3 w-full">
            <SummaryCard label="Duração" value={`${summary.durationMin} min`} />
            <SummaryCard label="Séries" value={summary.totalSets} />
            <SummaryCard label="Volume" value={`${summary.totalVolume} kg`} />
            <SummaryCard
              label="Calorias"
              value={`~${summary.calories} kcal`}
              icon={<Flame size={14} className="text-accent" />}
            />
          </div>
        </motion.div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={finishWorkout}
          className="w-full bg-accent text-bg font-semibold py-4 rounded-xl2 mt-4"
        >
          Concluir
        </motion.button>
      </div>
    );
  }

  const exercise = workout.exercises[exIndex];
  const doneSets = completedSets[exercise.id] || 0;
  const isLastExercise = exIndex === workout.exercises.length - 1;
  const exerciseFinished = doneSets >= Number(exercise.sets);

  // Ajuste rápido de carga (passo de 2.5kg, padrão de anilha) e reps
  // (um a um) da série atual, antes de confirmar que ela foi concluída.
  function adjustLoad(delta) {
    setCurrentLoad((v) => {
      const n = Math.max(0, (Number(v) || 0) + delta);
      return Math.round(n * 2) / 2;
    });
  }

  function adjustReps(delta) {
    setCurrentReps((v) => Math.max(0, (Number(v) || 0) + delta));
  }

  function completeSet() {
    setActualLoads((prev) => {
      const arr = prev[exercise.id] ? [...prev[exercise.id]] : [];
      arr[doneSets] = currentLoad;
      return { ...prev, [exercise.id]: arr };
    });
    setActualReps((prev) => {
      const arr = prev[exercise.id] ? [...prev[exercise.id]] : [];
      arr[doneSets] = currentReps;
      return { ...prev, [exercise.id]: arr };
    });
    setCompletedSets((prev) => ({ ...prev, [exercise.id]: doneSets + 1 }));

    // Descanso padrão: sempre conta após concluir uma série, inclusive na
    // última série de um exercício (pra descansar antes do próximo
    // exercício) — só não conta quando é a última série do treino inteiro.
    const isLastSetOfExercise = doneSets + 1 >= Number(exercise.sets);
    const isVeryLastSet = isLastExercise && isLastSetOfExercise;
    if (!isVeryLastSet) {
      setSecondsLeft(Number(exercise.rest) || 60);
      setResting(true);
    }
  }

  function goNextExercise() {
    if (isLastExercise) {
      openSummary();
    } else {
      setExIndex((i) => i + 1);
      setShowInfo(false);
      setResting(false);
    }
  }

  // Monta os números do resumo (duração, volume, séries, calorias) e
  // mostra a tela de resumo antes de gravar o treino como concluído.
  function openSummary() {
    const durationMin = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
    let totalSets = 0;
    let totalVolume = 0;
    const exerciseNames = [];
    workout.exercises.forEach((ex) => {
      totalSets += completedSets[ex.id] || 0;
      exerciseNames.push(ex.name);
      (actualLoads[ex.id] || []).forEach((load, i) => {
        const reps = Number((actualReps[ex.id] || [])[i] ?? ex.reps) || 0;
        const n = Number(load);
        if (!Number.isNaN(n) && n > 0) totalVolume += n * reps;
      });
    });
    const lastMeasurement = db.getMeasurements()[0];
    const calories = estimateWorkoutCaloriesSimple({
      exerciseNames,
      durationMinutes: durationMin,
      weightKg: lastMeasurement?.weight,
    });
    setSummary({ durationMin, totalSets, totalVolume: Math.round(totalVolume), calories });
    setFinished(true);
  }

  function finishWorkout() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    db.markTrainingDay(todayStr);
    db.addWorkoutLog({
      workoutId: workout.id,
      workoutName: workout.name,
      durationMin: summary?.durationMin || 0,
      caloriesBurned: summary?.calories || 0,
      exercises: workout.exercises.map((ex) => ({
        name: ex.name,
        setsCompleted: completedSets[ex.id] || 0,
        setsPlanned: Number(ex.sets),
        reps: Number(ex.reps) || 0,
        loadsUsed: actualLoads[ex.id] || [],
        repsUsed: actualReps[ex.id] || [],
      })),
    });
    navigate("/treinos");
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-6">
      <div className="flex items-center justify-between mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/treinos")} className="text-textSecondary">
          <X size={22} />
        </motion.button>
        <p className="text-xs text-textSecondary font-medium">
          Exercício {exIndex + 1} de {workout.exercises.length}
        </p>
        <div className="w-[22px]" />
      </div>

      <div className="flex gap-1.5 mb-8">
        {workout.exercises.map((_, i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full bg-border overflow-hidden"
          >
            <motion.div
              className="h-full bg-accent"
              initial={false}
              animate={{ width: i <= exIndex ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={exIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col"
        >
          <div className="flex items-start justify-between mb-1 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <ExerciseIcon name={exercise.name} size="md" />
              <h1 className="font-display text-2xl font-semibold leading-tight">{exercise.name}</h1>
            </div>
            {exercise.notes && (
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowInfo((v) => !v)} className="text-accent shrink-0 mt-1">
                <Info size={20} />
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showInfo && exercise.notes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-surface border border-border rounded-xl2 p-3 mb-3 text-xs text-textSecondary leading-relaxed overflow-hidden"
              >
                {exercise.notes}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {resting ? (
              <motion.div
                key="resting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex flex-col items-center justify-center gap-4"
              >
                <p className="text-textSecondary text-sm font-medium tracking-wide uppercase">Descanso</p>
                <motion.p key={secondsLeft} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="num text-7xl font-bold text-accent">
                  {secondsLeft}s
                </motion.p>
                <button onClick={() => setResting(false)} className="text-textSecondary text-sm underline underline-offset-4">
                  Pular descanso
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-5"
              >
                <div className="flex gap-2">
                  {Array.from({ length: Number(exercise.sets) }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={i < doneSets ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center num text-sm font-semibold border-2 transition-colors ${
                        i < doneSets ? "bg-accent border-accent text-bg" : "border-border text-textSecondary"
                      }`}
                    >
                      {i < doneSets ? <Check size={16} /> : i + 1}
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-6">
                  <Stepper label="Carga (kg)" value={currentLoad} onDec={() => adjustLoad(-2.5)} onInc={() => adjustLoad(2.5)} />
                  <Stepper label="Reps" value={currentReps} onDec={() => adjustReps(-1)} onInc={() => adjustReps(1)} />
                </div>
                <p className="text-textSecondary text-xs">
                  Série {Math.min(doneSets + 1, exercise.sets)} de {exercise.sets}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="pb-8 pt-4">
        <AnimatePresence mode="wait">
          {!resting && !exerciseFinished && (
            <motion.button
              key="complete"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              whileTap={{ scale: 0.97 }}
              onClick={completeSet}
              className="w-full bg-accent text-bg font-semibold py-4 rounded-xl2 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Concluir série
            </motion.button>
          )}
          {!resting && exerciseFinished && (
            <motion.button
              key="next"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              whileTap={{ scale: 0.97 }}
              onClick={goNextExercise}
              className="w-full bg-accent text-bg font-semibold py-4 rounded-xl2 flex items-center justify-center gap-2"
            >
              {isLastExercise ? "Finalizar treino" : "Próximo exercício"}
              <ChevronRight size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Controle de +/- pra ajustar carga ou reps da série atual, antes de
// concluí-la. Inspirado no fluxo do Hevy de editar peso/reps série a
// série durante o treino, mas com um visual próprio.
function Stepper({ label, value, onDec, onInc }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] text-textSecondary uppercase tracking-wide font-medium">{label}</span>
      <div className="flex items-center gap-2 bg-surface2 rounded-full px-1.5 py-1.5">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onDec}
          className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-textPrimary"
        >
          <Minus size={14} />
        </motion.button>
        <span className="num text-2xl font-bold w-14 text-center tabular-nums">{value === "" ? "—" : value}</span>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onInc}
          className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-textPrimary"
        >
          <Plus size={14} />
        </motion.button>
      </div>
    </div>
  );
}

// Card de estatística na tela de resumo do treino concluído.
function SummaryCard({ label, value, icon }) {
  return (
    <div className="bg-surface border border-border rounded-xl2 p-4 flex flex-col items-center gap-1.5">
      <span className="num text-xl font-bold flex items-center gap-1.5">
        {icon}
        {value}
      </span>
      <span className="text-[10px] text-textSecondary uppercase tracking-wide">{label}</span>
    </div>
  );
}
