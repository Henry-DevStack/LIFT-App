import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Pill, Check, Droplets, Plus, Minus, Settings2 } from "lucide-react";
import { db } from "../../services/storage";
import useToday from "../../hooks/useToday";

const WATER_STEP = 250;

export default function SupplementsWidget() {
  // `today` se mantém correto mesmo com o app aberto de um dia pro outro.
  const today = useToday();
  const [supplements] = useState(() => db.getSupplements());
  const [logs, setLogs] = useState(() => db.getSupplementLogs());
  const [profile] = useState(() => db.getProfile());
  const [water, setWater] = useState(() => db.getWaterForDate(today));

  // Quando a data vira, os dados exibidos precisam vir do novo dia —
  // senão o widget continuaria mostrando a água e os checks de ontem.
  useEffect(() => {
    setLogs(db.getSupplementLogs());
    setWater(db.getWaterForDate(today));
  }, [today]);

  const goal = profile.waterGoalMl || 2500;
  const waterPct = Math.min(100, Math.round((water / goal) * 100));

  function toggleSupplement(id) {
    setLogs(db.toggleSupplementLog(today, id));
  }

  function adjustWater(delta) {
    setWater(db.addWater(today, delta)[today] || 0);
  }

  const isTaken = (id) => logs.some((l) => l.date === today && l.supplementId === id);

  if (supplements.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl2 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Droplets size={16} className="text-accent" />
          <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">Água</span>
        </div>
        <WaterTracker water={water} goal={goal} pct={waterPct} onAdjust={adjustWater} />
        <Link
          to="/config/suplementos"
          className="flex items-center justify-center gap-1.5 text-accent text-xs font-medium mt-3 pt-3 border-t border-border"
        >
          <Plus size={13} />
          Adicionar lembretes de suplemento (creatina, whey…)
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl2 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Pill size={16} className="text-accent" />
          <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">Suplementos hoje</span>
        </div>
        <Link to="/config/suplementos" className="text-textSecondary">
          <Settings2 size={14} />
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {supplements.map((s) => {
          const taken = isTaken(s.id);
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSupplement(s.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl2 border text-left transition-colors ${
                taken ? "bg-accent/10 border-accent" : "bg-surface2 border-border"
              }`}
            >
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${taken ? "text-accent" : "text-textPrimary"}`}>{s.name}</p>
                {s.dose && <p className="text-textSecondary text-[10px]">{s.dose}</p>}
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  taken ? "bg-accent border-accent text-bg" : "border-border text-transparent"
                }`}
              >
                <Check size={12} />
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="pt-3 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <Droplets size={14} className="text-accent" />
          <span className="text-[11px] font-medium text-textSecondary uppercase tracking-wide">Água</span>
        </div>
        <WaterTracker water={water} goal={goal} pct={waterPct} onAdjust={adjustWater} />
      </div>
    </div>
  );
}

function WaterTracker({ water, goal, pct, onAdjust }) {
  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <p className="num text-xl font-bold">
          {water}
          <span className="text-textSecondary text-sm font-medium"> / {goal} ml</span>
        </p>
        <p className="num text-accent text-xs font-semibold">{pct}%</p>
      </div>
      <div className="h-2 bg-surface2 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onAdjust(-WATER_STEP)}
          className="flex-1 flex items-center justify-center gap-1 bg-surface2 rounded-lg py-2 text-textSecondary text-xs font-medium"
        >
          <Minus size={13} />
          {WATER_STEP}ml
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onAdjust(WATER_STEP)}
          className="flex-1 flex items-center justify-center gap-1 bg-accent text-bg rounded-lg py-2 text-xs font-semibold"
        >
          <Plus size={13} />
          {WATER_STEP}ml
        </motion.button>
      </div>
    </div>
  );
}
