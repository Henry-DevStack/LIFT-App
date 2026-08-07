import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { db } from "../services/storage";

const MEAL_TYPES = [
  { key: "cafe", label: "Café da manhã" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
  { key: "extra", label: "Extra" },
];

function emptyForm() {
  return { type: "cafe", name: "", calories: "", protein: "", carbs: "", fat: "" };
}

export default function NutritionPage() {
  const [meals, setMeals] = useState([]);
  const [profile, setProfile] = useState(db.getProfile());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    setMeals(db.getMeals());
  }, []);

  const todayMeals = meals.filter(
    (m) => new Date(m.date).toDateString() === new Date().toDateString()
  );
  const totals = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + (Number(m.calories) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const goal = profile.dailyCalorieGoal || 2200;
  const pct = Math.min(100, Math.round((totals.calories / goal) * 100));

  function handleAdd() {
    if (!form.name.trim() || !form.calories) {
      alert("Preencha ao menos o nome e as calorias.");
      return;
    }
    setMeals(db.addMeal(form));
    setForm(emptyForm());
    setShowForm(false);
  }

  function handleDelete(id) {
    setMeals(db.deleteMeal(id));
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="font-display text-2xl font-semibold mb-5">Alimentação</h1>

      {/* Resumo do dia */}
      <div className="bg-surface border border-border rounded-xl2 p-4 mb-5">
        <div className="flex items-end justify-between mb-2">
          <p className="num text-3xl font-bold">
            {totals.calories}
            <span className="text-textSecondary text-base font-medium"> / {goal} kcal</span>
          </p>
          <p className="num text-accent text-sm font-semibold">{pct}%</p>
        </div>
        <div className="h-2 bg-surface2 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Macro label="Proteína" value={totals.protein} />
          <Macro label="Carbo" value={totals.carbs} />
          <Macro label="Gordura" value={totals.fat} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-sm text-textSecondary uppercase tracking-wide">
          Refeições de hoje
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-accent text-bg font-semibold text-sm px-3.5 py-2 rounded-full active:scale-95 transition-transform"
        >
          <Plus size={16} strokeWidth={2.5} />
          Adicionar
        </button>
      </div>

      {todayMeals.length === 0 ? (
        <p className="text-textSecondary text-sm text-center mt-10">
          Nenhuma refeição registrada hoje.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {todayMeals.map((m) => (
            <div
              key={m.id}
              className="bg-surface border border-border rounded-xl2 p-3.5 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-textSecondary text-xs mt-0.5">
                  {MEAL_TYPES.find((t) => t.key === m.type)?.label} · {m.calories} kcal
                </p>
              </div>
              <button onClick={() => handleDelete(m.id)} className="text-textSecondary hover:text-red-400">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-[70]">
          <div className="bg-surface w-full max-w-[480px] mx-auto rounded-t-2xl p-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Nova refeição</h3>
              <button onClick={() => setShowForm(false)} className="text-textSecondary">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {MEAL_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setForm((f) => ({ ...f, type: t.key }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                    form.type === t.key
                      ? "bg-accent text-bg border-accent"
                      : "bg-surface2 text-textSecondary border-border"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome do alimento"
              className="w-full bg-surface2 rounded-lg px-3 py-2.5 text-sm mb-2 placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
            />

            <div className="grid grid-cols-4 gap-2">
              <MiniField
                label="Kcal"
                value={form.calories}
                onChange={(v) => setForm((f) => ({ ...f, calories: v }))}
              />
              <MiniField
                label="Prot (g)"
                value={form.protein}
                onChange={(v) => setForm((f) => ({ ...f, protein: v }))}
              />
              <MiniField
                label="Carb (g)"
                value={form.carbs}
                onChange={(v) => setForm((f) => ({ ...f, carbs: v }))}
              />
              <MiniField
                label="Gord (g)"
                value={form.fat}
                onChange={(v) => setForm((f) => ({ ...f, fat: v }))}
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-accent text-bg font-semibold py-3 rounded-xl2 mt-4 active:scale-[0.98] transition-transform"
            >
              Adicionar refeição
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Macro({ label, value }) {
  return (
    <div>
      <p className="num text-base font-semibold">{value}g</p>
      <p className="text-textSecondary text-[10px]">{label}</p>
    </div>
  );
}

function MiniField({ label, value, onChange }) {
  return (
    <div>
      <span className="text-[10px] text-textSecondary block mb-1 text-center">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="num w-full bg-surface2 border border-border rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
