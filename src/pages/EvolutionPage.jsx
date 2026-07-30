import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { db } from "../lib/storage";
import { getAccentColor } from "../lib/theme";

function emptyForm() {
  return { weight: "", waist: "", arm: "", chest: "", thigh: "" };
}

export default function EvolutionPage() {
  const [measurements, setMeasurements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    setMeasurements(db.getMeasurements());
  }, []);

  function handleAdd() {
    if (!form.weight) {
      alert("Informe pelo menos o peso.");
      return;
    }
    setMeasurements(db.addMeasurement(form));
    setForm(emptyForm());
    setShowForm(false);
  }

  const chartData = [...measurements]
    .reverse()
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      peso: Number(m.weight),
    }));

  const first = measurements[measurements.length - 1];
  const last = measurements[0];
  const diff = first && last ? (Number(last.weight) - Number(first.weight)).toFixed(1) : null;
  const accentColor = getAccentColor();

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-semibold">Evolução</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-accent text-bg font-semibold text-sm px-3.5 py-2 rounded-full active:scale-95 transition-transform"
        >
          <Plus size={16} strokeWidth={2.5} />
          Registrar
        </button>
      </div>

      {measurements.length === 0 ? (
        <p className="text-textSecondary text-sm text-center mt-16">
          Nenhum registro ainda. Toque em "Registrar" para adicionar seu primeiro peso e medidas.
        </p>
      ) : (
        <>
          <div className="bg-surface border border-border rounded-xl2 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
                Peso
              </span>
              {diff !== null && (
                <span
                  className={`num text-xs font-semibold ${
                    Number(diff) <= 0 ? "text-accent" : "text-orange-400"
                  }`}
                >
                  {Number(diff) > 0 ? "+" : ""}
                  {diff} kg desde o início
                </span>
              )}
            </div>
            <p className="num text-3xl font-bold mb-3">{last.weight} kg</p>
            {chartData.length > 1 && (
              <div className="h-32 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#9aa39a", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip
                      contentStyle={{
                        background: "#1e2220",
                        border: "1px solid #2a2f2c",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke={accentColor}
                      strokeWidth={2.5}
                      dot={{ fill: accentColor, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <h2 className="font-display font-semibold text-sm text-textSecondary uppercase tracking-wide mb-3">
            Histórico
          </h2>
          <div className="flex flex-col gap-2">
            {measurements.map((m) => (
              <div key={m.id} className="bg-surface border border-border rounded-xl2 p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="num font-semibold text-sm">{m.weight} kg</p>
                  <p className="text-textSecondary text-xs">
                    {new Date(m.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-3 text-textSecondary text-[11px]">
                  {m.waist && <span>Cintura: {m.waist}cm</span>}
                  {m.arm && <span>Braço: {m.arm}cm</span>}
                  {m.chest && <span>Peito: {m.chest}cm</span>}
                  {m.thigh && <span>Coxa: {m.thigh}cm</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="bg-surface w-full max-w-[480px] mx-auto rounded-t-2xl p-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Novo registro</h3>
              <button onClick={() => setShowForm(false)} className="text-textSecondary">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Field label="Peso (kg)" value={form.weight} onChange={(v) => setForm((f) => ({ ...f, weight: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cintura (cm)" value={form.waist} onChange={(v) => setForm((f) => ({ ...f, waist: v }))} />
                <Field label="Braço (cm)" value={form.arm} onChange={(v) => setForm((f) => ({ ...f, arm: v }))} />
                <Field label="Peito (cm)" value={form.chest} onChange={(v) => setForm((f) => ({ ...f, chest: v }))} />
                <Field label="Coxa (cm)" value={form.thigh} onChange={(v) => setForm((f) => ({ ...f, thigh: v }))} />
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-accent text-bg font-semibold py-3 rounded-xl2 mt-5 active:scale-[0.98] transition-transform"
            >
              Salvar registro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <span className="text-xs text-textSecondary block mb-1.5">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="num w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
