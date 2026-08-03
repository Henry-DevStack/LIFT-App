import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Info,
  Flame,
  Repeat,
  TrendingUp,
  Timer,
  Play,
  Pause,
  SkipForward,
  GripHorizontal,
  ChevronDown,
  Trophy,
  Dumbbell,
  Layers,
} from "lucide-react";
import { db } from "../lib/storage";
import { estimateWorkoutCaloriesSimple } from "../lib/calories";
import { getMuscleGroup } from "../data/exerciseVisuals";
import { EQUIPMENT_LABELS, suggestAlternatives } from "../data/exerciseDatabase";
import { shouldSuggestLoadIncrease } from "../lib/gymBro";
import { getMotivationalMessage } from "../lib/motivation";
import ExerciseIcon from "../components/ExerciseIcon";

// Constrói o estado inicial das séries a partir do treino salvo.
// Cada série vira uma linha editável { load, reps, done }.
function buildSetRows(exercises) {
  const rows = {};
  exercises.forEach((ex) => {
    const n = Math.max(1, Number(ex.sets) || 1);
    rows[ex.id] = Array.from({ length: n }, (_, i) => ({
      load: ex.loads?.[i] ?? "",
      reps: ex.repsPerSet?.[i] ?? ex.reps ?? "",
      done: false,
    }));
  });
  return rows;
}

// Avisa que o descanso acabou: vibra o aparelho e toca um bipe curto.
// Ambos são "melhor esforço" — se o navegador ou o dispositivo não
// suportar (iOS não expõe a API de vibração, por exemplo), simplesmente
// não acontece nada, sem quebrar o app.
function notifyRestOver() {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      // Padrão curto-pausa-curto: chama atenção sem assustar.
      navigator.vibrate([180, 90, 180]);
    }
  } catch {
    // dispositivo sem suporte a vibração
  }

  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    // Sobe e desce o volume pra não estalar no início e no fim.
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
    osc.onended = () => ctx.close();
  } catch {
    // navegador bloqueou áudio sem interação — tudo bem, a vibração já avisou
  }
}

export default function WorkoutRunPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [sessionExercises, setSessionExercises] = useState([]); // trocas valem só pra hoje
  const [setRows, setSetRows] = useState({}); // { exId: [{ load, reps, done }] }
  const [startedAt, setStartedAt] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Cronômetro de descanso (flutuante e arrastável)
  const [restActive, setRestActive] = useState(false);
  const [restPaused, setRestPaused] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(0);

  const [swapForExId, setSwapForExId] = useState(null); // modal de troca (Gym Bro)
  const [equipmentFilter, setEquipmentFilter] = useState([]);
  const [openNotes, setOpenNotes] = useState({}); // { exId: bool }
  const [review, setReview] = useState(null); // tela de review final

  const restoredRef = useRef(false);

  // ---- Carrega o treino e restaura sessão em andamento (se houver) ----
  useEffect(() => {
    const w = db.getWorkouts().find((w) => w.id === id);
    if (!w) {
      setWorkout(null);
      return;
    }
    setWorkout(w);

    const saved = db.getActiveSession();
    if (saved && saved.workoutId === id && saved.setRows) {
      setSessionExercises(saved.exercises || w.exercises.map((ex) => ({ ...ex })));
      setSetRows(saved.setRows);
      setStartedAt(saved.startedAt || Date.now());
    } else {
      const exs = w.exercises.map((ex) => ({ ...ex }));
      setSessionExercises(exs);
      setSetRows(buildSetRows(exs));
      setStartedAt(Date.now());
    }
    restoredRef.current = true;
  }, [id]);

  // ---- Persiste o progresso a cada mudança (sair não perde nada) ----
  useEffect(() => {
    if (!restoredRef.current || !workout || review) return;
    db.saveActiveSession({
      workoutId: workout.id,
      workoutName: workout.name,
      exercises: sessionExercises,
      setRows,
      startedAt,
    });
  }, [workout, sessionExercises, setRows, startedAt, review]);

  // ---- Duração total do treino ----
  useEffect(() => {
    if (review) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startedAt, review]);

  // ---- Cronômetro de descanso ----
  useEffect(() => {
    if (!restActive || restPaused) return;
    if (restLeft <= 0) {
      setRestActive(false);
      notifyRestOver();
      return;
    }
    const t = setTimeout(() => setRestLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restActive, restPaused, restLeft]);

  // ---- Helpers de edição de série ----
  const updateSet = useCallback((exId, index, field, value) => {
    setSetRows((prev) => {
      const rows = [...(prev[exId] || [])];
      if (!rows[index]) return prev;
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, [exId]: rows };
    });
  }, []);

  function toggleSetDone(exId, index) {
    const rows = setRows[exId] || [];
    const row = rows[index];
    if (!row) return;
    const nextDone = !row.done;
    updateSet(exId, index, "done", nextDone);

    // Ao marcar uma série como feita, dispara o descanso automaticamente.
    if (nextDone) {
      const ex = sessionExercises.find((e) => e.id === exId);
      const rest = Number(ex?.rest) || 60;
      if (rest > 0) {
        setRestTotal(rest);
        setRestLeft(rest);
        setRestPaused(false);
        setRestActive(true);
      }
    }
  }

  function swapExercise(exId, altName) {
    setSessionExercises((prev) => prev.map((ex) => (ex.id === exId ? { ...ex, name: altName } : ex)));
    setSwapForExId(null);
    setEquipmentFilter([]);
  }

  function toggleEquipmentFilter(key) {
    setEquipmentFilter((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  // ---- Dados de histórico por exercício ----
  // Calculado só quando a lista de exercícios muda. Antes isso rodava a
  // cada tecla digitada nos campos de carga/reps, lendo o localStorage
  // inteiro e deixando a digitação travada.
  const historyByExercise = useMemo(() => {
    const map = {};
    sessionExercises.forEach((ex) => {
      map[ex.id] = {
        previous: db.getLastPerformance(ex.name),
        loadTip: shouldSuggestLoadIncrease(ex.name),
      };
    });
    return map;
  }, [sessionExercises]);

  // ---- Progresso ----
  const { totalSets, doneSets } = useMemo(() => {
    let total = 0;
    let done = 0;
    Object.values(setRows).forEach((rows) => {
      rows.forEach((r) => {
        total += 1;
        if (r.done) done += 1;
      });
    });
    return { totalSets: total, doneSets: done };
  }, [setRows]);

  const allDone = totalSets > 0 && doneSets === totalSets;

  // ---- Finalizar: monta o review completo ----
  function openReview() {
    const durationMin = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    let volume = 0;
    let reps = 0;
    let sets = 0;
    const perExercise = [];
    const exerciseNames = [];

    sessionExercises.forEach((ex) => {
      const rows = (setRows[ex.id] || []).filter((r) => r.done);
      if (!rows.length) return;
      exerciseNames.push(ex.name);
      let exVolume = 0;
      let exReps = 0;
      let best = 0;
      rows.forEach((r) => {
        const load = Number(r.load) || 0;
        const rp = Number(r.reps) || 0;
        exVolume += load * rp;
        exReps += rp;
        if (load > best) best = load;
      });
      sets += rows.length;
      volume += exVolume;
      reps += exReps;
      perExercise.push({
        name: ex.name,
        sets: rows.length,
        reps: exReps,
        volume: Math.round(exVolume),
        bestLoad: best,
      });
    });

    const lastMeasurement = db.getMeasurements()[0];
    const calories = estimateWorkoutCaloriesSimple({
      exerciseNames,
      durationMinutes: durationMin,
      weightKg: lastMeasurement?.weight,
    });

    // Recorde de volume: compara com treinos anteriores do mesmo modelo.
    const previousBest = db
      .getWorkoutLogs()
      .filter((l) => l.workoutId === workout.id)
      .reduce((max, l) => Math.max(max, Number(l.totalVolume) || 0), 0);
    const isVolumeRecord = previousBest > 0 && volume > previousBest;

    const completionRate = totalSets ? doneSets / totalSets : 0;
    const message = getMotivationalMessage({ completionRate, isVolumeRecord });

    setReview({
      durationMin,
      sets,
      reps,
      volume: Math.round(volume),
      calories,
      perExercise,
      isVolumeRecord,
      previousBest,
      completionRate,
      message,
    });
  }

  // ---- Grava o log e volta ----
  function confirmFinish() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    db.markTrainingDay(todayStr);
    db.addWorkoutLog({
      workoutId: workout.id,
      workoutName: workout.name,
      durationMin: review.durationMin,
      caloriesBurned: review.calories,
      totalVolume: review.volume,
      exercises: sessionExercises.map((ex) => {
        const rows = (setRows[ex.id] || []).filter((r) => r.done);
        return {
          name: ex.name,
          setsCompleted: rows.length,
          setsPlanned: (setRows[ex.id] || []).length,
          reps: Number(ex.reps) || 0,
          loadsUsed: rows.map((r) => r.load),
          repsUsed: rows.map((r) => r.reps),
        };
      }),
    });

    // Salva as cargas usadas de volta no treino, pra que da próxima vez os
    // campos já venham preenchidos com o que foi feito hoje.
    const updated = {
      ...workout,
      exercises: workout.exercises.map((ex) => {
        const rows = setRows[ex.id];
        if (!rows?.length) return ex;
        return {
          ...ex,
          loads: rows.map((r) => r.load),
          repsPerSet: rows.map((r) => r.reps),
          sets: rows.length,
        };
      }),
    };
    db.saveWorkout(updated);
    db.clearActiveSession();
    navigate("/treinos");
  }

  function handleExit() {
    // Sair NÃO interrompe o treino: o progresso e o horário de início já
    // estão salvos, então o cronômetro continua contando normalmente. Uma
    // barra flutuante (ActiveWorkoutBar) fica visível no resto do app pra
    // voltar pra cá a qualquer momento.
    navigate("/");
  }

  function discardSession() {
    if (confirm("Descartar esse treino? Todo o progresso de hoje será perdido.")) {
      db.clearActiveSession();
      navigate("/treinos");
    }
  }

  if (!workout) {
    return <div className="px-5 pt-6 text-textSecondary text-sm">Treino não encontrado.</div>;
  }

  // ===================== TELA DE REVIEW =====================
  if (review) {
    return (
      <div className="px-5 pt-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-3 mb-6"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
            className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center"
          >
            {review.isVolumeRecord ? (
              <Trophy size={28} className="text-accent" />
            ) : (
              <Check size={28} className="text-accent" />
            )}
          </motion.div>
          <p className="text-[11px] text-textSecondary uppercase tracking-wide font-medium">Treino concluído</p>
          <h1 className="font-display text-2xl font-semibold text-center leading-tight">{workout.name}</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-accent/10 border border-accent/30 rounded-xl2 p-4 mb-5"
        >
          <p className="text-sm leading-relaxed text-center">{review.message}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon={<Timer size={14} />} label="Duração" value={`${review.durationMin} min`} />
          <StatCard icon={<Layers size={14} />} label="Séries" value={review.sets} />
          <StatCard icon={<Dumbbell size={14} />} label="Volume total" value={`${review.volume} kg`} />
          <StatCard icon={<Flame size={14} />} label="Calorias" value={`~${review.calories}`} />
        </div>

        {review.isVolumeRecord && (
          <div className="bg-surface border border-accent/40 rounded-xl2 p-3.5 mb-5 flex items-center gap-2.5">
            <Trophy size={16} className="text-accent shrink-0" />
            <p className="text-xs leading-relaxed">
              <span className="font-semibold">Novo recorde de volume!</span> Antes seu melhor nesse treino era{" "}
              <span className="num">{review.previousBest} kg</span>.
            </p>
          </div>
        )}

        <p className="text-[11px] text-textSecondary uppercase tracking-wide font-medium mb-2.5">
          Detalhe por exercício
        </p>
        <div className="flex flex-col gap-2 mb-6">
          {review.perExercise.map((ex, i) => (
            <motion.div
              key={ex.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-surface border border-border rounded-xl2 p-3.5 flex items-center gap-3"
            >
              <ExerciseIcon name={ex.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{ex.name}</p>
                <p className="text-textSecondary text-[11px] num mt-0.5">
                  {ex.sets} séries · {ex.reps} reps · {ex.volume} kg de volume
                </p>
              </div>
              {ex.bestLoad > 0 && (
                <div className="text-right shrink-0">
                  <p className="num text-sm font-bold text-accent">{ex.bestLoad}kg</p>
                  <p className="text-textSecondary text-[9px] uppercase">Melhor</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={confirmFinish}
          className="w-full bg-accent text-bg font-semibold py-4 rounded-xl2"
        >
          Salvar e voltar
        </motion.button>
      </div>
    );
  }

  // ===================== TELA DE EXECUÇÃO (LISTA) =====================
  const swapExercise_ = sessionExercises.find((e) => e.id === swapForExId);
  const swapAlternatives = swapExercise_
    ? suggestAlternatives(
        swapExercise_.name,
        getMuscleGroup(swapExercise_.name),
        3,
        equipmentFilter.length ? equipmentFilter : null
      )
    : [];

  return (
    <div className="pb-32">
      {/* Cabeçalho fixo com duração e progresso */}
      <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur px-5 pt-6 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleExit}
            className="text-textSecondary flex items-center gap-1"
            title="Voltar ao app — o treino continua rodando"
          >
            <ChevronDown size={22} />
          </motion.button>
          <div className="text-center">
            <p className="font-display font-semibold text-sm leading-tight truncate max-w-[200px]">{workout.name}</p>
            <p className="num text-[11px] text-textSecondary">{formatClock(elapsed)}</p>
          </div>
          <button onClick={discardSession} className="text-textSecondary text-[11px] font-medium">
            Descartar
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={false}
              animate={{ width: totalSets ? `${(doneSets / totalSets) * 100}%` : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="num text-[11px] text-textSecondary shrink-0">
            {doneSets}/{totalSets}
          </span>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">
        {sessionExercises.map((ex) => {
          const rows = setRows[ex.id] || [];
          const { previous, loadTip } = historyByExercise[ex.id] || {};
          const exDone = rows.length > 0 && rows.every((r) => r.done);

          return (
            <motion.div
              key={ex.id}
              layout
              className={`bg-surface border rounded-xl2 p-4 transition-colors ${
                exDone ? "border-accent/40" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ExerciseIcon name={ex.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm leading-tight truncate">{ex.name}</p>
                    <p className="text-textSecondary text-[10px] num mt-0.5">
                      {rows.length} séries · descanso {ex.rest || 60}s
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSwapForExId(ex.id)}
                    className="text-textSecondary"
                    title="Trocar exercício"
                  >
                    <Repeat size={17} />
                  </motion.button>
                  {ex.notes && (
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setOpenNotes((p) => ({ ...p, [ex.id]: !p[ex.id] }))}
                      className="text-accent"
                    >
                      <Info size={17} />
                    </motion.button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {openNotes[ex.id] && ex.notes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-surface2 rounded-lg p-2.5 mb-3 text-[11px] text-textSecondary leading-relaxed overflow-hidden"
                  >
                    {ex.notes}
                  </motion.div>
                )}
              </AnimatePresence>

              {loadTip && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-2.5 mb-3 flex items-start gap-2">
                  <TrendingUp size={14} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <span className="font-semibold">Hora de subir a carga!</span> Você vem batendo as reps com folga
                    nos últimos treinos.
                  </p>
                </div>
              )}

              {/* Cabeçalho da tabela de séries */}
              <div className="grid grid-cols-[28px_1fr_1fr_1fr_32px] gap-1.5 items-center mb-1.5 px-0.5">
                <span className="text-[9px] text-textSecondary uppercase">Sér</span>
                <span className="text-[9px] text-textSecondary uppercase text-center">Anterior</span>
                <span className="text-[9px] text-textSecondary uppercase text-center">Kg</span>
                <span className="text-[9px] text-textSecondary uppercase text-center">Reps</span>
                <span />
              </div>

              <div className="flex flex-col gap-1.5">
                {rows.map((row, si) => {
                  const prevLoad = previous?.loads?.[si];
                  const prevReps = previous?.reps?.[si];
                  const prevLabel =
                    prevLoad || prevReps ? `${prevLoad || 0}kg×${prevReps || 0}` : "—";
                  return (
                    <motion.div
                      key={si}
                      layout
                      className={`grid grid-cols-[28px_1fr_1fr_1fr_32px] gap-1.5 items-center rounded-lg px-0.5 py-1 transition-colors ${
                        row.done ? "bg-accent/10" : ""
                      }`}
                    >
                      <span className="num text-xs font-semibold text-center">{si + 1}</span>
                      <span className="num text-[10px] text-textSecondary text-center truncate">{prevLabel}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={row.load}
                        onChange={(e) => updateSet(ex.id, si, "load", e.target.value)}
                        placeholder={prevLoad ? String(prevLoad) : "0"}
                        className="num w-full bg-surface2 rounded-md px-1 py-2 text-sm text-center placeholder:text-textSecondary/40 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        value={row.reps}
                        onChange={(e) => updateSet(ex.id, si, "reps", e.target.value)}
                        placeholder={prevReps ? String(prevReps) : "0"}
                        className="num w-full bg-surface2 rounded-md px-1 py-2 text-sm text-center placeholder:text-textSecondary/40 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => toggleSetDone(ex.id, si)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors ${
                          row.done
                            ? "bg-accent border-accent text-bg"
                            : "bg-surface2 border-border text-textSecondary"
                        }`}
                        aria-label={row.done ? "Desmarcar série" : "Marcar série como feita"}
                      >
                        <Check size={15} strokeWidth={3} />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Botão de finalizar — aparece quando tudo está preenchido */}
      <div className="px-5 pt-5">
        <AnimatePresence>
          {allDone ? (
            <motion.button
              key="finish"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              whileTap={{ scale: 0.98 }}
              onClick={openReview}
              className="w-full bg-accent text-bg font-semibold py-4 rounded-xl2 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Finalizar treino
            </motion.button>
          ) : (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2"
            >
              <p className="text-textSecondary/70 text-[11px] text-center">
                Marque todas as séries pra liberar o botão de finalizar.
              </p>
              {doneSets > 0 && (
                <button
                  onClick={openReview}
                  className="w-full border border-border text-textSecondary font-medium py-3 rounded-xl2 text-sm"
                >
                  Finalizar mesmo assim ({doneSets} de {totalSets})
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Cronômetro de descanso flutuante e arrastável ---- */}
      <AnimatePresence>
        {restActive && (
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.08}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="fixed bottom-28 right-4 z-50 cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="bg-surface border border-accent/40 rounded-xl2 shadow-xl shadow-black/40 px-3 pt-2 pb-3 w-[148px]">
              <div className="flex items-center justify-center text-textSecondary/50 mb-1">
                <GripHorizontal size={14} />
              </div>
              <div className="relative flex items-center justify-center mb-2">
                <svg viewBox="0 0 100 100" className="w-16 h-16 -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 44}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 44 * (1 - (restTotal ? restLeft / restTotal : 0)),
                    }}
                    transition={{ duration: 0.9, ease: "linear" }}
                  />
                </svg>
                <span className="absolute num text-lg font-bold text-accent">{restLeft}s</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={() => setRestPaused((p) => !p)}
                  className="w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center text-textPrimary"
                  aria-label={restPaused ? "Retomar" : "Pausar"}
                >
                  {restPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
                </button>
                <button
                  onClick={() => setRestLeft((s) => s + 15)}
                  className="h-8 px-2 rounded-lg bg-surface2 flex items-center justify-center text-[10px] num font-semibold"
                >
                  +15s
                </button>
                <button
                  onClick={() => setRestActive(false)}
                  className="w-8 h-8 rounded-lg bg-accent text-bg flex items-center justify-center"
                  aria-label="Pular descanso"
                >
                  <SkipForward size={13} fill="currentColor" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Modal de troca de exercício (Gym Bro) ---- */}
      <AnimatePresence>
        {swapForExId && swapExercise_ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSwapForExId(null)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border-t border-border rounded-t-xl2 p-5 w-full max-w-[480px] max-h-[80vh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-lg font-semibold">Trocar exercício</h2>
                <button onClick={() => setSwapForExId(null)} className="text-textSecondary">
                  <X size={20} />
                </button>
              </div>
              <p className="text-textSecondary text-xs mb-4">
                Alternativas pro mesmo grupo muscular. A troca vale só pra esse treino de hoje.
              </p>

              <p className="text-[10px] text-textSecondary uppercase tracking-wide font-medium mb-2">
                Filtrar por equipamento
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => {
                  const active = equipmentFilter.includes(key);
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => toggleEquipmentFilter(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active ? "bg-accent text-bg border-accent" : "bg-surface2 text-textSecondary border-border"
                      }`}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                {swapAlternatives.length ? (
                  swapAlternatives.map((alt) => (
                    <motion.button
                      key={alt.name}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => swapExercise(swapForExId, alt.name)}
                      className="flex items-center gap-3 bg-surface2 rounded-xl2 p-3 text-left"
                    >
                      <ExerciseIcon name={alt.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{alt.name}</p>
                        <p className="text-textSecondary text-[10px]">{EQUIPMENT_LABELS[alt.equipment]}</p>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <p className="text-textSecondary text-xs text-center py-4">
                    Nenhuma alternativa encontrada com esse filtro.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-surface border border-border rounded-xl2 p-4 flex flex-col items-center gap-1">
      <span className="text-accent">{icon}</span>
      <span className="num text-xl font-bold">{value}</span>
      <span className="text-[10px] text-textSecondary uppercase tracking-wide text-center">{label}</span>
    </div>
  );
}
