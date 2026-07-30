import { motion } from "framer-motion";

// Anel de progresso circular pequeno, com valor numérico no centro e
// label embaixo — usado em conjuntos de 3 pra formar os "rings" de
// treino/nutrição na agenda semanal (estilo Fitfolio).
export default function ProgressRing({ value, max, label, color, size = 64, stroke = 6, suffix = "" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, value / max) : 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--tw-color-surface2, #1e2220)"
            className="text-surface2"
            strokeWidth={stroke}
            style={{ stroke: "currentColor" }}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct) }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="num font-bold text-textPrimary" style={{ fontSize: size * 0.22 }}>
            {value}
            {suffix && <span className="text-[0.55em] text-textSecondary">{suffix}</span>}
          </span>
        </div>
      </div>
      <span className="text-[9px] text-textSecondary font-medium uppercase tracking-wide text-center">
        {label}
      </span>
    </div>
  );
}
