import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

// Moldura das sub-páginas de configuração: cabeçalho com voltar, título
// e uma linha de contexto opcional. Centraliza o layout pra que todas as
// telas de ajuste tenham a mesma cara sem repetir marcação.
export default function SettingsLayout({ title, description, children }) {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-2 mb-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/config")}
          className="text-textSecondary -ml-1.5 p-1.5"
          aria-label="Voltar para configurações"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <h1 className="font-display text-xl font-semibold">{title}</h1>
      </div>
      {description && (
        <p className="text-textSecondary text-xs leading-relaxed mb-5 ml-1">{description}</p>
      )}
      <div className={description ? "" : "mt-4"}>{children}</div>
    </div>
  );
}
