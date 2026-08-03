import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Plus, Trash2, Droplets, Check } from "lucide-react";
import { db, uid } from "../../lib/storage";
import SettingsLayout from "../../components/SettingsLayout";

function emptySupplement() {
  return { name: "", dose: "" };
}

export default function SupplementsSettings() {
  const [supplements, setSupplements] = useState(db.getSupplements());
  const [newSupplement, setNewSupplement] = useState(emptySupplement());
  const [profile, setProfile] = useState(db.getProfile());
  const [saved, setSaved] = useState(false);

  function handleAddSupplement() {
    if (!newSupplement.name.trim()) return;
    setSupplements(db.saveSupplement({ id: uid(), ...newSupplement }));
    setNewSupplement(emptySupplement());
  }

  function handleDeleteSupplement(id) {
    setSupplements(db.deleteSupplement(id));
  }

  function handleSaveGoal() {
    db.saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <SettingsLayout
      title="Suplementos e água"
      description="O que você marcar aqui aparece como lembrete diário na tela inicial."
    >
      <div className="flex flex-col gap-5">
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

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveGoal}
          className="w-full bg-accent text-bg font-semibold py-3 rounded-xl2 flex items-center justify-center gap-2"
        >
          {saved ? (<><Check size={16} />Salvo!</>) : "Salvar meta de água"}
        </motion.button>
      </div>
    </SettingsLayout>
  );
}
