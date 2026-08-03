import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Settings } from "lucide-react";
import { db } from "../lib/storage";
import { getTrainingStatsForDate } from "../lib/stats";
import useToday from "../hooks/useToday";
import WeekAgenda from "../components/WeekAgenda";
import SupplementsWidget from "../components/SupplementsWidget";
import TodayWorkoutCard from "../components/TodayWorkoutCard";

export default function HomePage() {
  const today = useToday();
  const [profile, setProfile] = useState(db.getProfile());
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    setProfile(db.getProfile());
    setMeasurements(db.getMeasurements());
  }, []);

  const lastMeasurement = measurements[0];
  const todayTraining = getTrainingStatsForDate(today);

  return (
    <div className="px-5 pt-6">
      {/* Ajustes saiu da barra inferior: fica só aqui, o que deixa a
          navegação principal com menos itens e mais respiro. */}
      <div className="flex items-start justify-between mb-6">
        <div className="min-w-0">
          <p className="text-textSecondary text-sm">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display text-2xl font-semibold mt-1">
            {profile.name ? `Olá, ${profile.name.split(" ")[0]}` : "Olá 👋"}
          </h1>
        </div>
        <motion.div whileTap={{ scale: 0.9 }} className="shrink-0 mt-1">
          <Link
            to="/config"
            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center"
            aria-label="Configurações"
          >
            <Settings size={18} className="text-textSecondary" />
          </Link>
        </motion.div>
      </div>

      {/* Treino de hoje — some sozinho em dias sem treino agendado */}
      <div className="mb-4">
        <TodayWorkoutCard />
      </div>

      {/* Agenda semanal */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mb-4"
      >
        {/* Alimentação fica só na aba própria — ocupava espaço aqui sem uso */}
        <WeekAgenda showNutrition={false} />
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

      {/* Calorias estimadas do treino de hoje (aparece só depois de um treino concluído) */}
      {todayTraining.calories > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.22 }}
          className="bg-surface border border-border rounded-xl2 p-4 mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-accent" />
            <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
              Calorias no treino de hoje
            </span>
          </div>
          <p className="num text-lg font-bold">~{todayTraining.calories} kcal</p>
        </motion.div>
      )}

    </div>
  );
}
