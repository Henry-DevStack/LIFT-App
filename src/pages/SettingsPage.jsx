import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, LogOut, Palette, Pill, Plus, Trash2, Droplets, Sparkles, Eye, EyeOff, User } from "lucide-react";
import { db, uid } from "../lib/storage";
import { auth } from "../lib/auth";
import { ACCENT_PRESETS, setAccent } from "../lib/theme";

function emptySupplement() {
  return { name: "", dose: "" };
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(db.getProfile());
  const [theme, setTheme] = useState(db.getTheme());
  const [saved, setSaved] = useState(false);
  const [supplements, setSupplements] = useState(db.getSupplements());
  const [newSupplement, setNewSupplement] = useState(emptySupplement());
  const [chatConfig, setChatConfig] = useState(db.getChatConfig());
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (keySaved) {
      const t = setTimeout(() => setKeySaved(false), 1500);
      return () => clearTimeout(t);
    }
  }, [keySaved]);

  function handleSaveChatConfig() {
    db.saveChatConfig(chatConfig);
    setKeySaved(true);
  }

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(t);
    }
  }, [saved]);

  function handlePickColor(hex) {
    const next = setAccent(hex);
    setTheme(next);
  }

  function handleSaveName() {
    db.saveProfile(profile);
    setSaved(true);
  }

  function handleAddSupplement() {
    if (!newSupplement.name.trim()) return;
    setSupplements(db.saveSupplement({ id: uid(), ...newSupplement }));
    setNewSupplement(emptySupplement());
  }

  function handleDeleteSupplement(id) {
    setSupplements(db.deleteSupplement(id));
  }

  function handleLogout() {
    if (confirm("Sair do app? Seus dados continuam salvos neste dispositivo.")) {
      auth.logout();
      navigate("/", { replace: true });
      window.location.reload();
    }
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="font-display text-2xl font-semibold mb-5">Configurações</h1>

      <div className="flex flex-col gap-5">
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

        {/* Suplementos e lembretes */}
        <div className="bg-surface border border-border rounded-xl2 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Pill size={16} className="text-accent" />
            <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
              Suplementos e lembretes
            </span>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            <AnimatePresence initial={false}>
              {supplements.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between bg-surface2 rounded-xl2 px-3.5 py-2.5 overflow-hidden"
                >
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    {s.dose && <p className="text-textSecondary text-[10px]">{s.dose}</p>}
                  </div>
                  <button onClick={() => handleDeleteSupplement(s.id)} className="text-textSecondary hover:text-red-400 p-1">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {supplements.length === 0 && (
              <p className="text-textSecondary/60 text-[11px] leading-relaxed">
                Nenhum lembrete ainda. Adicione creatina, whey, vitaminas ou o que quiser acompanhar todo dia.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={newSupplement.name}
              onChange={(e) => setNewSupplement((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ex: Creatina"
              className="flex-1 min-w-0 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <input
              value={newSupplement.dose}
              onChange={(e) => setNewSupplement((s) => ({ ...s, dose: e.target.value }))}
              placeholder="Dose (opcional)"
              className="w-28 shrink-0 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddSupplement}
              className="shrink-0 w-10 h-10 rounded-lg bg-accent text-bg flex items-center justify-center"
            >
              <Plus size={16} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        {/* Meta de água */}
        <div className="bg-surface border border-border rounded-xl2 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Droplets size={16} className="text-accent" />
            <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
              Meta diária de água
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={profile.waterGoalMl}
              onChange={(e) => setProfile((p) => ({ ...p, waterGoalMl: e.target.value }))}
              className="num flex-1 bg-surface2 border border-border rounded-xl2 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="text-textSecondary text-sm">ml</span>
          </div>
        </div>

        {/* Assistente de IA */}
        <div className="bg-surface border border-border rounded-xl2 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-accent" />
            <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
              Assistente de treino
            </span>
          </div>

          <label className="text-xs text-textSecondary block mb-1.5">Chave da API Anthropic</label>
          <div className="flex gap-2 mb-2">
            <input
              type={showKey ? "text" : "password"}
              value={chatConfig.apiKey}
              onChange={(e) => setChatConfig((c) => ({ ...c, apiKey: e.target.value }))}
              placeholder="sk-ant-..."
              autoComplete="off"
              spellCheck={false}
              className="flex-1 min-w-0 bg-surface2 border border-border rounded-xl2 px-4 py-3 text-sm placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="shrink-0 w-11 rounded-xl2 bg-surface2 border border-border flex items-center justify-center text-textSecondary"
              aria-label={showKey ? "Ocultar chave" : "Mostrar chave"}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <label className="text-xs text-textSecondary block mb-1.5">Modelo</label>
          <input
            value={chatConfig.model}
            onChange={(e) => setChatConfig((c) => ({ ...c, model: e.target.value }))}
            placeholder="claude-sonnet-4-6"
            className="w-full bg-surface2 border border-border rounded-xl2 px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <button
            onClick={handleSaveChatConfig}
            className="w-full bg-accent text-bg font-semibold py-3 rounded-xl2 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-3"
          >
            {keySaved ? (
              <>
                <Check size={16} />
                Salvo!
              </>
            ) : (
              "Salvar chave"
            )}
          </button>

          <p className="text-textSecondary/70 text-[11px] leading-relaxed">
            <span className="text-red-400/90 font-medium">Atenção:</span> como o app não tem servidor próprio, a chave
            fica salva no navegador deste dispositivo e é enviada direto para a API. Isso é seguro o bastante para uso
            pessoal, mas não publique o app com sua chave configurada — qualquer pessoa com acesso ao aparelho
            conseguiria lê-la.
          </p>
        </div>

        {/* Conta */}
        <div className="bg-surface border border-border rounded-xl2 p-4">
          <span className="text-xs font-medium text-textSecondary uppercase tracking-wide block mb-3">
            Conta
          </span>
          <label className="text-xs text-textSecondary block mb-1.5">Seu nome</label>
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-surface2 border border-border rounded-xl2 px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleSaveName}
            className="w-full bg-accent text-bg font-semibold py-3 rounded-xl2 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-3"
          >
            {saved ? (
              <>
                <Check size={16} />
                Salvo!
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>

          <Link
            to="/perfil"
            className="w-full border border-border text-textSecondary font-medium py-3 rounded-xl2 flex items-center justify-center gap-2 text-sm"
          >
            <User size={15} />
            Perfil completo e metas
          </Link>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-border text-textSecondary font-medium py-3.5 rounded-xl2"
        >
          <LogOut size={16} />
          Sair
        </motion.button>
      </div>
    </div>
  );
}
