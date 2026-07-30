import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { db } from "../lib/storage";

const WEEK_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// Grade de semanas do mês, incluindo dias de preenchimento (null) antes/depois.
function buildMonthGrid(reference) {
  const first = startOfMonth(reference);
  const daysInMonth = new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
  const startWeekday = first.getDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(reference.getFullYear(), reference.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function TrainingCalendar() {
  const [reference, setReference] = useState(new Date());
  const [trainingDays, setTrainingDays] = useState(db.getTrainingDays());

  const cells = buildMonthGrid(reference);
  const todayStr = toDateStr(new Date());
  const monthLabel = reference.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const countThisMonth = cells.filter(
    (d) => d && trainingDays.includes(toDateStr(d))
  ).length;

  function changeMonth(delta) {
    setReference((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function handleDayTap(date) {
    const dateStr = toDateStr(date);
    // Não deixa marcar dias futuros, só passado e hoje.
    if (dateStr > todayStr) return;
    setTrainingDays(db.toggleTrainingDay(dateStr));
  }

  return (
    <div className="bg-surface border border-border rounded-xl2 p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Dumbbell size={16} className="text-accent" />
          <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
            Dias de treino
          </span>
        </div>
        <span className="num text-xs text-textSecondary">{countThisMonth} este mês</span>
      </div>

      <div className="flex items-center justify-between mt-2 mb-3">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => changeMonth(-1)} className="text-textSecondary p-1">
          <ChevronLeft size={16} />
        </motion.button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => changeMonth(1)} className="text-textSecondary p-1">
          <ChevronRight size={16} />
        </motion.button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[10px] text-textSecondary/60 font-medium py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const dateStr = toDateStr(date);
          const trained = trainingDays.includes(dateStr);
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;

          return (
            <motion.button
              key={i}
              whileTap={!isFuture ? { scale: 0.85 } : {}}
              onClick={() => handleDayTap(date)}
              disabled={isFuture}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] num font-medium transition-colors ${
                trained
                  ? "bg-accent text-bg"
                  : isFuture
                  ? "text-textSecondary/30"
                  : "text-textSecondary hover:bg-surface2"
              } ${isToday && !trained ? "ring-1 ring-accent" : ""}`}
            >
              {date.getDate()}
            </motion.button>
          );
        })}
      </div>

      <p className="text-textSecondary/60 text-[10px] mt-2 leading-relaxed">
        Toque em um dia pra marcar ou desmarcar que treinou.
      </p>
    </div>
  );
}
