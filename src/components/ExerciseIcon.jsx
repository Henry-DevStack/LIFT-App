import { Dumbbell, Footprints, HeartPulse, Hexagon, Zap, TrendingUp, Sparkles, ArrowUpFromLine } from "lucide-react";
import { getExerciseVisual } from "../data/exerciseVisuals";

const ICONS = {
  chest: Dumbbell,
  back: ArrowUpFromLine,
  legs: Footprints,
  shoulder: TrendingUp,
  arm: Zap,
  core: Hexagon,
  cardio: HeartPulse,
  general: Sparkles,
};

const SIZES = {
  sm: { box: "w-8 h-8", icon: 14, radius: "rounded-lg" },
  md: { box: "w-10 h-10", icon: 17, radius: "rounded-xl" },
  lg: { box: "w-14 h-14", icon: 22, radius: "rounded-2xl" },
};

// Pequeno selo visual "de referência" pro exercício: cor + ícone do grupo
// muscular, já que não é possível buscar fotos reais sem internet.
export default function ExerciseIcon({ name, size = "md", showLabel = false }) {
  const visual = getExerciseVisual(name);
  const Icon = ICONS[visual.icon] || Sparkles;
  const s = SIZES[size] || SIZES.md;

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div
        className={`${s.box} ${s.radius} flex items-center justify-center shrink-0`}
        style={{ backgroundColor: `${visual.color}22`, border: `1px solid ${visual.color}55` }}
      >
        <Icon size={s.icon} style={{ color: visual.color }} strokeWidth={2.2} />
      </div>
      {showLabel && (
        <span className="text-[8px] text-textSecondary/70 font-medium uppercase tracking-wide">
          {visual.label}
        </span>
      )}
    </div>
  );
}
