import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { db } from "../services/storage";

const GOALS = [
  { key: "emagrecimento", label: "Emagrecimento" },
  { key: "hipertrofia", label: "Hipertrofia" },
  { key: "manutencao", label: "Manutenção" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(db.getProfile());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(t);
    }
  }, [saved]);

  function update(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  function handleSave() {
    db.saveProfile(profile);
    setSaved(true);
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="font-display text-2xl font-semibold mb-5">Perfil</h1>

      <div className="flex flex-col gap-4">
        <Field label="Nome" value={profile.name} onChange={(v) => update("name", v)} />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Idade"
            type="number"
            value={profile.age}
            onChange={(v) => update("age", v)}
          />
          <Field
            label="Altura (cm)"
            type="number"
            value={profile.height}
            onChange={(v) => update("height", v)}
          />
        </div>

        <div>
          <span className="text-xs text-textSecondary block mb-2">Objetivo</span>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g.key}
                onClick={() => update("goal", g.key)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium border ${
                  profile.goal === g.key
                    ? "bg-accent text-bg border-accent"
                    : "bg-surface text-textSecondary border-border"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <Field
          label="Meta de calorias diárias (kcal)"
          type="number"
          value={profile.dailyCalorieGoal}
          onChange={(v) => update("dailyCalorieGoal", v)}
        />

        <div>
          <span className="text-xs text-textSecondary block mb-2">Metas diárias de macros (g)</span>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Proteína" type="number" value={profile.proteinGoal} onChange={(v) => update("proteinGoal", v)} />
            <Field label="Carboidrato" type="number" value={profile.carbGoal} onChange={(v) => update("carbGoal", v)} />
            <Field label="Gordura" type="number" value={profile.fatGoal} onChange={(v) => update("fatGoal", v)} />
          </div>
        </div>

        <div>
          <span className="text-xs text-textSecondary block mb-2">Unidades</span>
          <div className="flex gap-2">
            <button
              onClick={() => update("units", "metric")}
              className={`flex-1 py-2.5 rounded-xl2 text-sm font-medium border ${
                profile.units === "metric"
                  ? "bg-accent text-bg border-accent"
                  : "bg-surface text-textSecondary border-border"
              }`}
            >
              kg / cm
            </button>
            <button
              onClick={() => update("units", "imperial")}
              className={`flex-1 py-2.5 rounded-xl2 text-sm font-medium border ${
                profile.units === "imperial"
                  ? "bg-accent text-bg border-accent"
                  : "bg-surface text-textSecondary border-border"
              }`}
            >
              lb / in
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-accent text-bg font-semibold py-3.5 rounded-xl2 mt-2 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          {saved ? (
            <>
              <Check size={18} />
              Salvo!
            </>
          ) : (
            "Salvar alterações"
          )}
        </button>

        <p className="text-textSecondary text-[11px] text-center leading-relaxed mt-2">
          Seus dados ficam salvos apenas neste dispositivo, no seu navegador.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <span className="text-xs text-textSecondary block mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-xl2 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}
