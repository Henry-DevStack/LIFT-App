import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Dumbbell, Utensils, TrendingUp, Sparkles } from "lucide-react";
import HomePage from "./pages/HomePage";
import WorkoutsPage from "./pages/WorkoutsPage";
import WorkoutEditorPage from "./pages/WorkoutEditorPage";
import WorkoutRunPage from "./pages/WorkoutRunPage";
import NutritionPage from "./pages/NutritionPage";
import EvolutionPage from "./pages/EvolutionPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import AccountSettings from "./pages/settings/AccountSettings";
import AppearanceSettings from "./pages/settings/AppearanceSettings";
import SupplementsSettings from "./pages/settings/SupplementsSettings";
import AssistantSettings from "./pages/settings/AssistantSettings";
import BackupSettings from "./pages/settings/BackupSettings";
import ActiveWorkoutBar from "./components/ActiveWorkoutBar";
import OfflineIndicator from "./components/OfflineIndicator";
import WelcomeTour from "./components/WelcomeTour";
import { auth } from "./lib/auth";
import { db } from "./lib/storage";
import { initTheme } from "./lib/theme";

const tabs = [
  { to: "/", icon: Home, label: "Início", end: true },
  { to: "/treinos", icon: Dumbbell, label: "Treinos" },
  { to: "/alimentacao", icon: Utensils, label: "Alimentação" },
  { to: "/evolucao", icon: TrendingUp, label: "Evolução" },
  { to: "/assistente", icon: Sparkles, label: "Assistente" },
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
            className="relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl2 active:scale-95 transition-transform duration-100"
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-surface2 rounded-xl2 -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <motion.div
              animate={isActive ? { scale: [1, 1.22, 1.08], y: [0, -2, 0] } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
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
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
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
        <Route path="/assistente" element={<Page><ChatPage /></Page>} />
        <Route path="/perfil" element={<Page><ProfilePage /></Page>} />
        <Route path="/config" element={<Page><SettingsPage /></Page>} />
        <Route path="/config/conta" element={<Page><AccountSettings /></Page>} />
        <Route path="/config/aparencia" element={<Page><AppearanceSettings /></Page>} />
        <Route path="/config/suplementos" element={<Page><SupplementsSettings /></Page>} />
        <Route path="/config/assistente" element={<Page><AssistantSettings /></Page>} />
        <Route path="/config/backup" element={<Page><BackupSettings /></Page>} />
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

// A barra de navegação inferior é `fixed`, então sem isso ela ficava por
// cima de tudo em qualquer rota — inclusive em cima do botão "Concluir
// série" na execução do treino. Aqui ela some nessa tela específica.
function Shell() {
  const location = useLocation();
  // A barra inferior some na execução do treino (onde cobria o botão de
  // ação) e nas telas de configuração, que têm navegação própria de voltar.
  const hideTabBar =
    /^\/treinos\/[^/]+\/executar$/.test(location.pathname) ||
    location.pathname.startsWith("/config") ||
    location.pathname === "/perfil";
  return (
    <div className={`min-h-screen bg-bg text-textPrimary font-body ${hideTabBar ? "" : "pb-24"}`}>
      <AnimatedRoutes />
      {!hideTabBar && (
        <>
          <ActiveWorkoutBar />
          <TabBar />
        </>
      )}
    </div>
  );
}

export default function AppRoutes() {
  const [loggedIn, setLoggedIn] = useState(auth.isLoggedIn());
  const [showTour, setShowTour] = useState(() => auth.isLoggedIn() && !db.hasSeenTour());

  useEffect(() => {
    initTheme();
  }, []);

  function finishTour() {
    db.markTourSeen();
    setShowTour(false);
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-bg text-textPrimary font-body">
        <LoginPage
          onLogin={() => {
            setLoggedIn(true);
            // Quem acabou de entrar pela primeira vez vê o tour em seguida.
            if (!db.hasSeenTour()) setShowTour(true);
          }}
        />
      </div>
    );
  }

  return (
    <HashRouter>
      <OfflineIndicator />
      {showTour && <WelcomeTour onFinish={finishTour} />}
      <Shell />
    </HashRouter>
  );
}
