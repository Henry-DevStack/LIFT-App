import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { db } from "../../services/storage";
import { ACCENT_PRESETS, setAccent } from "../../services/theme";
import SettingsLayout from "../../components/layout/SettingsLayout";

export default function AppearanceSettings() {
  const [theme, setTheme] = useState(db.getTheme());

  function handlePickColor(hex) {
    setTheme(setAccent(hex));
  }

  return (
    <SettingsLayout
      title="Aparência"
      description="A cor escolhida vale para todo o app: botões, gráficos, anéis de progresso e destaques."
    >
      {/* Tema */}
      <div className="bg-surface border border-border rounded-xl2 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-accent" />
          <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
            Cor do app
          </span>
        </div>
        <div className="flex flex-wrap gap-3 mb-3">
          {ACCENT_PRESETS.map((preset) => (
            <motion.button
              key={preset.hex}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePickColor(preset.hex)}
              className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors"
              style={{
                backgroundColor: preset.hex,
                borderColor: theme.accent === preset.hex ? "#fff" : "transparent",
              }}
              aria-label={preset.name}
            >
              {theme.accent === preset.hex && <Check size={16} className="text-black/70" />}
            </motion.button>
          ))}
          <label className="w-9 h-9 rounded-full border border-dashed border-border flex items-center justify-center text-textSecondary text-[9px] cursor-pointer overflow-hidden relative">
            +
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => handlePickColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
        <p className="text-textSecondary/60 text-[11px] leading-relaxed">
          Escolha a cor de destaque usada nos botões, gráficos e ícones ativos do app.
        </p>
      </div>
    </SettingsLayout>
  );
}
