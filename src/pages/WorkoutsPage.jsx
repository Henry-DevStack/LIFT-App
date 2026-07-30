import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Dumbbell, ChevronRight, Trash2, Library, X, Check } from "lucide-react";
import { db, uid } from "../lib/storage";
import { ALL_TEMPLATE_DAYS } from "../data/workoutTemplates";
import { MUSCLE_GROUPS } from "../data/exerciseVisuals";
import ExerciseIcon from "../components/ExerciseIcon";

const DAYS_LABEL = { seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb", dom: "Dom" };

function daysText(w) {
  const days = w.days?.length ? w.days : [];
  if (!days.length) return "Sem dia fixo";
  return days.map((d) => DAYS_LABEL[d]).join(", ");
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    setWorkouts(db.getWorkouts());
  }, []);

  function handleDelete(id) {
    if (confirm("Excluir esse treino? Essa ação não pode ser desfeita.")) {
      setWorkouts(db.deleteWorkout(id));
    }
  }

  function toggleDaySelection(dayId) {
    setSelectedDays((prev) => (prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]));
  }

  function addSelectedDays() {
    const chosen = ALL_TEMPLATE_DAYS.filter((d) => selectedDays.includes(d.id));
    chosen.forEach((day) => {
      db.saveWorkout({
        id: uid(),
        name: day.name,
        days: [],
        exercises: day.exercises.map((ex) => ({ ...ex, id: uid() })),
      });
    });
    setWorkouts(db.getWorkouts());
    setSelectedDays([]);
    setShowLibrary(false);
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Treinos</h1>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-1.5 bg-surface border border-border text-textPrimary font-semibold text-sm px-3.5 py-2 rounded-full"
          >
            <Library size={16} strokeWidth={2.2} />
            Biblioteca
          </motion.button>
          <Link to="/treinos/novo">
            <motion.div
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-1.5 bg-accent text-bg font-semibold text-sm px-3.5 py-2 rounded-full"
            >
              <Plus size={16} strokeWidth={2.5} />
              Novo
            </motion.div>
          </Link>
        </div>
      </div>

      {workouts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center gap-3 mt-20 px-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center">
            <Dumbbell className="text-accent" size={28} />
          </div>
          <p className="text-textSecondary text-sm leading-relaxed">
            Você ainda não criou nenhum treino.
            <br />
            Toque em "Novo" pra montar do zero, ou em "Biblioteca" pra usar treinos prontos.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {workouts.map((w, i) => (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                whileTap={{ scale: 0.98 }}
                className="bg-surface border border-border rounded-xl2 p-4 flex items-center gap-3"
              >
                <Link to={`/treinos/${w.id}/executar`} className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-base truncate">{w.name}</p>
                  <p className="text-textSecondary text-xs mt-0.5">
                    {daysText(w)} · {w.exercises?.length || 0} exercícios
                  </p>
                </Link>
                <Link to={`/treinos/${w.id}/editar`} className="text-textSecondary p-2 -mr-1" onClick={(e) => e.stopPropagation()}>
                  <ChevronRight size={18} />
                </Link>
                <button onClick={() => handleDelete(w.id)} className="text-textSecondary p-2 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Biblioteca de treinos prontos */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end z-50"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-surface w-full max-w-[480px] mx-auto rounded-t-2xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-semibold text-lg">Biblioteca de treinos</h3>
                <button onClick={() => setShowLibrary(false)} className="text-textSecondary">
                  <X size={20} />
                </button>
              </div>
              <p className="text-textSecondary text-xs leading-relaxed mb-4">
                Selecione um ou mais treinos prontos pra complementar seu plano. Depois de adicionados, dá pra editar
                séries, reps, cargas e dias livremente — igual a qualquer treino seu.
              </p>

              <div className="flex flex-col gap-2.5 mb-5">
                {ALL_TEMPLATE_DAYS.map((day) => {
                  const selected = selectedDays.includes(day.id);
                  const group = MUSCLE_GROUPS[day.tag] || MUSCLE_GROUPS.geral;
                  return (
                    <motion.button
                      key={day.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleDaySelection(day.id)}
                      className={`text-left rounded-xl2 border p-3.5 transition-colors ${
                        selected ? "bg-accent/10 border-accent" : "bg-surface2 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{day.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="text-[9px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded"
                              style={{ color: group.color, backgroundColor: `${group.color}22` }}
                            >
                              {group.label}
                            </span>
                            <span className="text-textSecondary text-[10px]">
                              {day.exercises.length} exercícios · {day.templateTitle}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                            selected ? "bg-accent border-accent text-bg" : "border-border text-transparent"
                          }`}
                        >
                          <Check size={12} />
                        </div>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                        {day.exercises.map((ex, ei) => (
                          <ExerciseIcon key={ei} name={ex.name} size="sm" />
                        ))}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={selectedDays.length === 0}
                onClick={addSelectedDays}
                className={`w-full font-semibold py-3.5 rounded-xl2 transition-opacity ${
                  selectedDays.length === 0 ? "bg-accent/40 text-bg/70" : "bg-accent text-bg"
                }`}
              >
                {selectedDays.length === 0
                  ? "Selecione ao menos um treino"
                  : `Adicionar ${selectedDays.length} treino${selectedDays.length > 1 ? "s" : ""} selecionado${
                      selectedDays.length > 1 ? "s" : ""
                    }`}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
