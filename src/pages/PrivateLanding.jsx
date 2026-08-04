import { useEffect } from "react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function PrivateLanding() {
  // O #root é limitado a 480px para o app parecer um aplicativo de celular
  // no desktop. A landing é uma página web comum, então libera essa trava.
  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.add("full-width");
    return () => root?.classList.remove("full-width");
  }, []);

  return (
    <div className="relative min-h-screen bg-bg text-textPrimary font-body overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(80% 50% at 50% 0%, var(--accent-dim) 0%, transparent 60%)",
          opacity: 0.16,
        }}
      />

      <div className="relative min-h-screen flex flex-col justify-center px-6 py-16 lg:px-12">
        <motion.main
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.08 }}
          className="w-full max-w-md lg:max-w-5xl mx-auto grid lg:grid-cols-2 lg:gap-20 gap-10 items-center"
        >
          {/* Coluna de identidade — centralizada no mobile, alinhada à esquerda no desktop */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6"
            >
              <Dumbbell size={26} className="text-accent" />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl lg:text-7xl font-bold tracking-tight mb-4"
            >
              LIFT
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-textSecondary text-sm lg:text-base leading-relaxed max-w-md mb-7"
            >
              Aplicativo de treino desenvolvido para registrar exercícios, acompanhar evolução e transformar dados em
              insights.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-surface border border-border rounded-xl2 p-4 lg:p-5 mb-7 flex items-start gap-3 text-left"
            >
              <div className="w-9 h-9 rounded-xl2 bg-surface2 flex items-center justify-center shrink-0">
                <Lock size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Demonstração fechada</p>
                <p className="text-textSecondary text-xs lg:text-sm leading-relaxed">
                  A demonstração pública está temporariamente fechada enquanto novas funcionalidades estão sendo
                  desenvolvidas.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex flex-col sm:flex-row gap-2.5"
            >
              <LinkButton href={GITHUB_URL} icon={Code2} primary>
                Ver no GitHub
              </LinkButton>
              <LinkButton href={LINKEDIN_URL} icon={Send}>
                Entrar em contato
              </LinkButton>
            </motion.div>
          </div>

          {/* Coluna das funcionalidades — no desktop vira um painel ao lado */}
          <motion.section
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:bg-surface lg:border lg:border-border lg:rounded-xl2 lg:p-7"
          >
            <h2 className="text-[11px] font-medium text-textSecondary uppercase tracking-wider mb-4">
              Próximas funcionalidades
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {UPCOMING.map(({ icon: Icon, label }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}
                  className="flex items-center gap-3 bg-surface lg:bg-surface2 border border-border lg:border-transparent rounded-xl2 px-4 py-3"
                >
                  <Icon size={16} className="text-accent shrink-0" />
                  <span className="text-sm">{label}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>
        </motion.main>

        <footer className="relative mt-14 lg:mt-20 text-center">
          <p className="text-textSecondary/60 text-xs">Desenvolvido por Henry</p>
        </footer>
      </div>
    </div>
  );
}

function LinkButton({ href, icon: Icon, primary, children }) {
  return (
    <motion.a
      whileTap={{ scale: 0.98 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex-1 py-3.5 rounded-xl2 flex items-center justify-center gap-2 text-sm transition-colors ${
        primary
          ? "bg-accent text-bg font-semibold"
          : "border border-border text-textPrimary font-medium hover:bg-surface"
      }`}
    >
      <Icon size={17} />
      {children}
    </motion.a>
  );
}
