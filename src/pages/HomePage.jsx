import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Library, ChevronRight } from "lucide-react";
import { db } from "../lib/storage";
import WeekAgenda from "../components/WeekAgenda";
import SupplementsWidget from "../components/SupplementsWidget";
import TrainingCalendar from "../components/TrainingCalendar";

export default function HomePage() {
  const [profile, setProfile] = useState(db.getProfile());
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    setProfile(db.getProfile());
    setMeasurements(db.getMeasurements());
  }, []);

  const lastMeasurement = measurements[0];

  return (
    <div className="px-5 pt-6">
      <p className="text-textSecondary text-sm">
        {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      <h1 className="font-display text-2xl font-semibold mt-1 mb-6">
        {profile.name ? `Olá, ${profile.name.split(" ")[0]}` : "Olá 👋"}
      </h1>

      {/* Agenda semanal com anéis de treino e alimentação */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mb-4"
      >
        <WeekAgenda />
      </motion.div>

      {/* Suplementos e água */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-4"
      >
        <SupplementsWidget />
      </motion.div>

      {/* Atalho pra biblioteca de treinos */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mb-4"
      >
        <Link
          to="/treinos"
          className="flex items-center justify-between bg-surface border border-border rounded-xl2 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl2 bg-accent/15 flex items-center justify-center">
              <Library size={18} className="text-accent" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm">Biblioteca de treinos</p>
              <p className="text-textSecondary text-xs mt-0.5">
                Escolha treinos prontos pra complementar seu plano
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-textSecondary" />
        </Link>
      </motion.div>

      {/* Última medida */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-surface border border-border rounded-xl2 p-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
            Último peso registrado
          </span>
          <Link to="/evolucao" className="text-accent text-xs font-medium">
            Ver evolução
          </Link>
        </div>
        <p className="num text-2xl font-bold mt-2">
          {lastMeasurement ? `${lastMeasurement.weight} kg` : "—"}
        </p>
      </motion.div>

      {/* Visão mensal de dias treinados */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="mb-4"
      >
        <TrainingCalendar />
      </motion.div>
    </div>
  );
}
