import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight, Info } from "lucide-react";
import { db } from "../lib/storage";
import ExerciseIcon from "../components/ExerciseIcon";

export default function WorkoutRunPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [exIndex, setExIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState({}); // { exId: count }
  const [actualLoads, setActualLoads] = useState({}); // { exId: [loads used] }
  const [resting, setResting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const w = db.getWorkouts().find((w) => w.id === id);
    setWorkout(w || null);
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

  if (!workout) {
    return <div className="px-5 pt-6 text-textSecondary text-sm">Treino não encontrado.</div>;
  }

  const exercise = workout.exercises[exIndex];
  const doneSets = completedSets[exercise.id] || 0;
  const isLastExercise = exIndex === workout.exercises.length - 1;
  const exerciseFinished = doneSets >= Number(exercise.sets);
  const plannedLoad = exercise.loads?.[doneSets] ?? exercise.loads?.[exercise.loads.length - 1] ?? "";

  function completeSet() {
    setActualLoads((prev) => {
      const arr = prev[exercise.id] ? [...prev[exercise.id]] : [];
      arr[doneSets] = plannedLoad;
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
      finishWorkout();
    } else {
      setExIndex((i) => i + 1);
      setShowInfo(false);
      setResting(false);
    }
  }

  function finishWorkout() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    db.markTrainingDay(todayStr);
    db.addWorkoutLog({
      workoutId: workout.id,
      workoutName: workout.name,
      exercises: workout.exercises.map((ex) => ({
        name: ex.name,
        setsCompleted: completedSets[ex.id] || 0,
        setsPlanned: Number(ex.sets),
        reps: Number(ex.reps) || 0,
        loadsUsed: actualLoads[ex.id] || [],
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
                <p className="num text-5xl font-bold">{exercise.reps} reps</p>
                {plannedLoad !== "" && (
                  <p className="num text-accent text-lg font-semibold -mt-2">{plannedLoad} kg</p>
                )}
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
