import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { db, uid } from "../lib/storage";
import ExerciseIcon from "../components/ExerciseIcon";

const DAYS = [
  { key: "seg", label: "Seg" }, { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" }, { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" }, { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

function emptyExercise() {
  return { id: uid(), name: "", sets: 3, reps: 12, loads: ["", "", ""], rest: 60, notes: "" };
}

function resizeLoads(loads, sets) {
  const n = Math.max(1, Number(sets) || 1);
  const arr = [...(loads || [])];
  while (arr.length < n) arr.push("");
  return arr.slice(0, n);
}

export default function WorkoutEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [days, setDays] = useState([]);
  const [exercises, setExercises] = useState([emptyExercise()]);

  useEffect(() => {
    if (id) {
      const existing = db.getWorkouts().find((w) => w.id === id);
      if (existing) {
        setName(existing.name);
        setDays(existing.days || (existing.day && existing.day !== "livre" ? [existing.day] : []));
        setExercises(
          existing.exercises?.length
            ? existing.exercises.map((ex) => ({
                ...ex,
                loads: ex.loads?.length ? ex.loads : resizeLoads(ex.load ? [ex.load] : [], ex.sets),
              }))
            : [emptyExercise()]
        );
      }
    }
  }, [id]);

  function toggleDay(key) {
    setDays((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
  }

  function updateExercise(exId, field, value) {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const updated = { ...ex, [field]: value };
        if (field === "sets") updated.loads = resizeLoads(ex.loads, value);
        return updated;
      })
    );
  }

  function updateLoad(exId, setIndex, value) {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const loads = [...ex.loads];
        loads[setIndex] = value;
        return { ...ex, loads };
      })
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(exId) {
    setExercises((prev) => prev.filter((ex) => ex.id !== exId));
  }

  function handleSave() {
    if (!name.trim()) {
      alert("Dê um nome para o treino antes de salvar.");
      return;
    }
    const valid = exercises.filter((ex) => ex.name.trim());
    if (valid.length === 0) {
      alert("Adicione pelo menos um exercício com nome.");
      return;
    }
    db.saveWorkout({ id, name: name.trim(), days, exercises: valid });
    navigate("/treinos");
  }

  return (
    <div className="pb-8">
      <div className="sticky top-0 bg-bg/95 backdrop-blur z-10 px-5 pt-6 pb-4 flex items-center gap-3 border-b border-border">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="text-textSecondary">
          <ArrowLeft size={22} />
        </motion.button>
        <h1 className="font-display text-lg font-semibold">
          {id ? "Editar treino" : "Novo treino"}
        </h1>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">
        <div>
          <label className="text-xs text-textSecondary font-medium block mb-2">
            Nome do treino
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Treino A — Peito e Tríceps"
            className="w-full bg-surface border border-border rounded-xl2 px-4 py-3 text-sm placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
          />
        </div>

        <div>
          <label className="text-xs text-textSecondary font-medium block mb-2">
            Dias da semana <span className="text-textSecondary/60">(pode marcar mais de um)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const active = days.includes(d.key);
              return (
                <motion.button
                  key={d.key}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => toggleDay(d.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 ${
                    active
                      ? "bg-accent text-bg border-accent"
                      : "bg-surface text-textSecondary border-border"
                  }`}
                >
                  {d.label}
                </motion.button>
              );
            })}
          </div>
          {days.length === 0 && (
            <p className="text-textSecondary/60 text-[11px] mt-1.5">Sem dia fixo, se não marcar nenhum.</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-textSecondary font-medium">Exercícios</label>
          </div>

          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {exercises.map((ex, i) => (
                <motion.div
                  key={ex.id}
                  layout
                  initial={{ opacity: 0, height: 0, scale: 0.96 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-surface border border-border rounded-xl2 p-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <GripVertical size={16} className="text-textSecondary shrink-0" />
                    {ex.name.trim() && <ExerciseIcon name={ex.name} size="sm" />}
                    <input
                      value={ex.name}
                      onChange={(e) => updateExercise(ex.id, "name", e.target.value)}
                      placeholder={`Exercício ${i + 1}`}
                      className="flex-1 bg-transparent font-display font-semibold text-sm placeholder:text-textSecondary focus:outline-none"
                    />
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => removeExercise(ex.id)}
                      className="text-textSecondary hover:text-red-400 shrink-0"
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <Field label="Séries">
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => updateExercise(ex.id, "sets", e.target.value)}
                        className="num w-full bg-surface2 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </Field>
                    <Field label="Reps">
                      <input
                        type="number"
                        value={ex.reps}
                        onChange={(e) => updateExercise(ex.id, "reps", e.target.value)}
                        className="num w-full bg-surface2 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </Field>
                    <Field label="Descanso (s)">
                      <input
                        type="number"
                        value={ex.rest}
                        onChange={(e) => updateExercise(ex.id, "rest", e.target.value)}
                        className="num w-full bg-surface2 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </Field>
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] text-textSecondary block mb-1.5">
                      Carga por série (kg) — pra comparar evolução entre séries
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      <AnimatePresence initial={false}>
                        {ex.loads.map((load, si) => (
                          <motion.div
                            key={si}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center"
                          >
                            <span className="text-[9px] text-textSecondary mb-1">Série {si + 1}</span>
                            <input
                              type="number"
                              value={load}
                              onChange={(e) => updateLoad(ex.id, si, e.target.value)}
                              placeholder="—"
                              className="num w-14 bg-surface2 rounded-lg px-1 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <textarea
                    value={ex.notes}
                    onChange={(e) => updateExercise(ex.id, "notes", e.target.value)}
                    placeholder="Explicação / dica de execução (opcional)"
                    rows={2}
                    className="w-full bg-surface2 rounded-lg px-3 py-2 text-xs placeholder:text-textSecondary resize-none focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={addExercise}
            className="w-full mt-3 flex items-center justify-center gap-1.5 border border-dashed border-border text-textSecondary rounded-xl2 py-3 text-sm font-medium"
          >
            <Plus size={16} />
            Adicionar exercício
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full bg-accent text-bg font-semibold py-3.5 rounded-xl2 mt-2"
        >
          Salvar treino
        </motion.button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <span className="text-[10px] text-textSecondary block mb-1 text-center">{label}</span>
      {children}
    </div>
  );
}
