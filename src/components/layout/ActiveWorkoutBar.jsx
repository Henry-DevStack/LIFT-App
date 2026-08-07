import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { db } from "../../services/storage";

// Barra fina que fica visível no app inteiro enquanto existe um treino em
// andamento. Sair da tela de execução não interrompe nada: o cronômetro
// continua correndo a partir do horário de início salvo na sessão, e um
// toque aqui volta pro treino exatamente onde parou.
export default function ActiveWorkoutBar() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  // Relê a sessão periodicamente pra refletir início/fim de treino sem
  // depender de estado global.
  useEffect(() => {
    function sync() {
      const s = db.getActiveSession();
      setSession(s);
      if (s?.startedAt) setElapsed(Math.floor((Date.now() - s.startedAt) / 1000));
    }
    sync();
    const t = setInterval(sync, 1000);
    return () => clearInterval(t);
  }, []);

  if (!session) return null;

  const totals = Object.values(session.setRows || {}).reduce(
    (acc, rows) => {
      rows.forEach((r) => {
        acc.total += 1;
        if (r.done) acc.done += 1;
      });
      return acc;
    },
    { total: 0, done: 0 }
  );

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/treinos/${session.workoutId}/executar`)}
        className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[448px] z-40 bg-accent text-bg rounded-xl2 px-4 py-2.5 flex items-center gap-3 shadow-lg shadow-black/30"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute inline-flex h-full w-full rounded-full bg-bg"
          />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold truncate leading-tight">{session.workoutName}</p>
          <p className="num text-[10px] opacity-80 leading-tight">
            {minutes}:{seconds} · {totals.done}/{totals.total} séries
          </p>
        </div>
        <ChevronUp size={18} className="shrink-0" />
      </motion.button>
    </AnimatePresence>
  );
}
