import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Palette,
  Pill,
  ShieldCheck,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { db } from "../lib/storage";

// Menu de configurações. Antes tudo vivia numa página só, que ficou longa
// demais pra encontrar qualquer coisa. Agora cada assunto tem sua própria
// tela e aqui fica só a porta de entrada.
const ITEMS = [
  {
    to: "/config/conta",
    icon: UserCircle,
    title: "Conta",
    desc: "Nome, metas e sair do app",
  },
  {
    to: "/config/aparencia",
    icon: Palette,
    title: "Aparência",
    desc: "Cor de destaque do app",
  },
  {
    to: "/config/suplementos",
    icon: Pill,
    title: "Suplementos e água",
    desc: "Lembretes diários e meta de hidratação",
  },
  {
    to: "/config/assistente",
    icon: Sparkles,
    title: "Assistente de treino",
    desc: "Chave da API e modelo",
  },
  {
    to: "/config/backup",
    icon: ShieldCheck,
    title: "Backup dos dados",
    desc: "Exportar e restaurar seu histórico",
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const profile = db.getProfile();

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-2 mb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/")}
          className="text-textSecondary -ml-1.5 p-1.5"
          aria-label="Voltar para o início"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <h1 className="font-display text-2xl font-semibold">Configurações</h1>
      </div>

      {profile.name && (
        <div className="flex items-center gap-3 bg-surface border border-border rounded-xl2 p-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-accent text-lg">
              {profile.name.trim()[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm truncate">{profile.name}</p>
            <p className="text-textSecondary text-[11px]">Dados salvos neste dispositivo</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {ITEMS.map(({ to, icon: Icon, title, desc }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={to}
              className="flex items-center gap-3 bg-surface border border-border rounded-xl2 p-4"
            >
              <div className="w-9 h-9 rounded-xl2 bg-surface2 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{title}</p>
                <p className="text-textSecondary text-[11px] mt-0.5 truncate">{desc}</p>
              </div>
              <ChevronRight size={17} className="text-textSecondary shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="text-textSecondary/50 text-[11px] text-center mt-8">Lift</p>
    </div>
  );
}
