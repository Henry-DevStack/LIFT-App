import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Dumbbell, Utensils, TrendingUp, User, Settings } from "lucide-react";
import HomePage from "./pages/HomePage";
import WorkoutsPage from "./pages/WorkoutsPage";
import WorkoutEditorPage from "./pages/WorkoutEditorPage";
import WorkoutRunPage from "./pages/WorkoutRunPage";
import NutritionPage from "./pages/NutritionPage";
import EvolutionPage from "./pages/EvolutionPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { auth } from "./lib/auth";
import { initTheme } from "./lib/theme";

const tabs = [
  { to: "/", icon: Home, label: "Início", end: true },
  { to: "/treinos", icon: Dumbbell, label: "Treinos" },
  { to: "/alimentacao", icon: Utensils, label: "Alimentação" },
  { to: "/evolucao", icon: TrendingUp, label: "Evolução" },
  { to: "/perfil", icon: User, label: "Perfil" },
  { to: "/config", icon: Settings, label: "Ajustes" },
];

function TabBar() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface/95 backdrop-blur border-t border-border px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 flex justify-around z-50">
      {tabs.map(({ to, icon: Icon, label, end }) => {
        const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl2"
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-surface2 rounded-xl2 -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <motion.div animate={{ scale: isActive ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Icon size={20} strokeWidth={2} className={isActive ? "text-accent" : "text-textSecondary"} />
            </motion.div>
            <span className={`text-[9px] font-medium tracking-wide ${isActive ? "text-accent" : "text-textSecondary"}`}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><HomePage /></Page>} />
        <Route path="/treinos" element={<Page><WorkoutsPage /></Page>} />
        <Route path="/treinos/novo" element={<Page><WorkoutEditorPage /></Page>} />
        <Route path="/treinos/:id/editar" element={<Page><WorkoutEditorPage /></Page>} />
        <Route path="/treinos/:id/executar" element={<Page fade><WorkoutRunPage /></Page>} />
        <Route path="/alimentacao" element={<Page><NutritionPage /></Page>} />
        <Route path="/evolucao" element={<Page><EvolutionPage /></Page>} />
        <Route path="/perfil" element={<Page><ProfilePage /></Page>} />
        <Route path="/config" element={<Page><SettingsPage /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

function Page({ children, fade }) {
  return (
    <motion.div
      initial={fade ? { opacity: 0 } : pageVariants.initial}
      animate={fade ? { opacity: 1 } : pageVariants.animate}
      exit={fade ? { opacity: 0 } : pageVariants.exit}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(auth.isLoggedIn());

  useEffect(() => {
    initTheme();
  }, []);

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-bg text-textPrimary font-body">
        <LoginPage onLogin={() => setLoggedIn(true)} />
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-bg text-textPrimary font-body pb-24">
        <AnimatedRoutes />
        <TabBar />
      </div>
    </HashRouter>
  );
}
