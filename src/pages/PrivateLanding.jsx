import { motion } from "framer-motion";
import {
  Dumbbell,
  Code2,
  Send,
  Lock,
  Sparkles,
  Trophy,
  LineChart,
  CloudUpload,
  LayoutDashboard,
} from "lucide-react";

const GITHUB_URL = "https://github.com/Henry-DevStack/Fit-App";
const LINKEDIN_URL = "https://www.linkedin.com/in/henrysdev";

const UPCOMING = [
  { icon: Sparkles, label: "Assistente com IA" },
  { icon: Trophy, label: "Recordes pessoais" },
  { icon: LineChart, label: "Gráficos de evolução" },
  { icon: CloudUpload, label: "Sincronização em nuvem" },
  { icon: LayoutDashboard, label: "Dashboard de desempenho" },
];

export default function PrivateLanding() {
  return (
    <div className="relative min-h-screen bg-bg text-textPrimary font-body flex items-center justify-center px-5 py-16 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 55% at 50% 0%, var(--accent-dim) 0%, transparent 65%)",
          opacity: 0.18,
        }}
      />

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6"
        >
          <Dumbbell size={28} className="text-accent" />
        </motion.div>

        <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight mb-4">LIFT</h1>

        <p className="text-textSecondary text-sm sm:text-base leading-relaxed max-w-md mb-8">
          Aplicativo de treino desenvolvido para registrar exercícios, acompanhar evolução e transformar dados em
          insights.
        </p>

        <div className="w-full bg-surface border border-border rounded-xl2 p-5 mb-8 flex items-start gap-3 text-left">
          <div className="w-9 h-9 rounded-xl2 bg-surface2 flex items-center justify-center shrink-0">
            <Lock size={16} className="text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Demonstração fechada</p>
            <p className="text-textSecondary text-xs sm:text-sm leading-relaxed">
              A demonstração pública está temporariamente fechada enquanto novas funcionalidades estão sendo
              desenvolvidas.
            </p>
          </div>
        </div>

        <section className="w-full mb-9">
          <h2 className="text-[11px] font-medium text-textSecondary uppercase tracking-wider mb-3">
            Próximas funcionalidades
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {UPCOMING.map(({ icon: Icon, label }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex items-center gap-2.5 bg-surface border border-border rounded-xl2 px-3.5 py-3 text-left"
              >
                <Icon size={15} className="text-accent shrink-0" />
                <span className="text-xs sm:text-sm text-textPrimary">{label}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        <div className="w-full flex flex-col sm:flex-row gap-2.5">
          <motion.a
            whileTap={{ scale: 0.98 }}
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-accent text-bg font-semibold py-3.5 rounded-xl2 flex items-center justify-center gap-2 text-sm"
          >
            <Code2 size={17} />
            Ver no GitHub
          </motion.a>
          <motion.a
            whileTap={{ scale: 0.98 }}
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-border text-textPrimary font-medium py-3.5 rounded-xl2 flex items-center justify-center gap-2 text-sm"
          >
            <Send size={17} />
            Entrar em contato
          </motion.a>
        </div>

        <footer className="mt-12">
          <p className="text-textSecondary/60 text-xs">Desenvolvido por Henry</p>
        </footer>
      </motion.main>
    </div>
  );
}
