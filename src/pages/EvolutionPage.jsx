import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, TrendingUp, TrendingDown, Minus as MinusIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { db } from "../lib/storage";
import { getAccentColor } from "../lib/theme";

// Métricas acompanhadas. Centralizar aqui significa que adicionar uma
// medida nova (panturrilha, quadril, etc.) é acrescentar uma linha —
// formulário, gráfico, cards e histórico se adaptam sozinhos.
const METRICS = [
  { key: "weight", label: "Peso", unit: "kg", short: "Peso" },
  { key: "chest", label: "Peito", unit: "cm", short: "Peito" },
  { key: "arm", label: "Braço", unit: "cm", short: "Braço" },
  { key: "waist", label: "Cintura", unit: "cm", short: "Cintura" },
  { key: "thigh", label: "Coxa", unit: "cm", short: "Coxa" },
];

// Métricas em que crescer é o resultado desejado. A cintura é a exceção
// clássica: para a maioria das pessoas, reduzir é o objetivo. O peso não
// entra em nenhum dos dois grupos porque depende do objetivo de cada um,
// então ele aparece sem julgamento de "bom" ou "ruim".
const GROWTH_IS_GOOD = ["chest", "arm", "thigh"];
const LOWER_IS_GOOD = ["waist"];

function emptyForm() {
  return { weight: "", waist: "", arm: "", chest: "", thigh: "" };
}

export default function EvolutionPage() {
  const [measurements, setMeasurements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [chartMetric, setChartMetric] = useState("weight");
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  function handleDelete(id) {
    setMeasurements(db.deleteMeasurement(id));
    setConfirmDelete(null);
  }

  const accentColor = getAccentColor();

  // Só métricas que têm ao menos um valor registrado aparecem — não faz
  // sentido mostrar um card de "Coxa —" para quem nunca mediu a coxa.
  const activeMetrics = useMemo(
    () => METRICS.filter((m) => measurements.some((r) => r[m.key])),
    [measurements]
  );

  const chartData = useMemo(() => {
    return [...measurements]
      .reverse()
      .filter((m) => m[chartMetric])
      .map((m) => ({
        date: new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        valor: Number(m[chartMetric]),
      }));
  }, [measurements, chartMetric]);

  // Valor atual, variação desde o registro anterior e desde o primeiro.
  function statsFor(key) {
    const comValor = measurements.filter((m) => m[key]);
    if (!comValor.length) return null;
    const atual = Number(comValor[0][key]);
    const anterior = comValor[1] ? Number(comValor[1][key]) : null;
    const primeiro = Number(comValor[comValor.length - 1][key]);
    return {
      atual,
      desdeAnterior: anterior !== null ? atual - anterior : null,
      desdeInicio: atual - primeiro,
      registros: comValor.length,
    };
  }

  const metricInfo = METRICS.find((m) => m.key === chartMetric);

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-semibold">Evolução</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-accent text-bg font-semibold text-sm px-3.5 py-2 rounded-full"
        >
          <Plus size={16} strokeWidth={2.5} />
          Registrar
        </motion.button>
      </div>

      {measurements.length === 0 ? (
        <div className="text-center mt-20 px-6">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={24} className="text-accent" />
          </div>
          <p className="font-display font-semibold mb-1.5">Nenhum registro ainda</p>
          <p className="text-textSecondary text-sm leading-relaxed">
            Registre peso e medidas de tempos em tempos. É assim que o progresso que não aparece no espelho toda
            semana fica visível.
          </p>
        </div>
      ) : (
        <>
          {/* Cards de resumo por medida */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {activeMetrics.map((m) => {
              const st = statsFor(m.key);
              if (!st) return null;
              return (
                <MetricCard
                  key={m.key}
                  metric={m}
                  stats={st}
                  active={chartMetric === m.key}
                  onSelect={() => setChartMetric(m.key)}
                />
              );
            })}
          </div>

          {/* Gráfico da métrica selecionada */}
          <div className="bg-surface border border-border rounded-xl2 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
                {metricInfo?.label} ao longo do tempo
              </span>
              <span className="num text-[10px] text-textSecondary">
                {chartData.length} {chartData.length === 1 ? "registro" : "registros"}
              </span>
            </div>

            {chartData.length > 1 ? (
              <div className="h-40 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="#2a2f2c" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#9aa39a", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#9aa39a", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={34}
                      domain={["dataMin - 1", "dataMax + 1"]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1e2220",
                        border: "1px solid #2a2f2c",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#9aa39a" }}
                      formatter={(v) => [`${v} ${metricInfo?.unit}`, metricInfo?.label]}
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke={accentColor}
                      strokeWidth={2.5}
                      dot={{ fill: accentColor, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-textSecondary/70 text-xs text-center py-8">
                Registre pelo menos duas vezes para ver o gráfico.
              </p>
            )}
          </div>

          {/* Histórico com exclusão */}
          <h2 className="font-display font-semibold text-sm text-textSecondary uppercase tracking-wide mb-3">
            Histórico
          </h2>
          <div className="flex flex-col gap-2 pb-4">
            <AnimatePresence initial={false}>
              {measurements.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-surface border border-border rounded-xl2 p-3.5 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="num font-semibold text-sm">{m.weight} kg</p>
                        <p className="text-textSecondary text-[11px]">
                          {new Date(m.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-textSecondary text-[11px]">
                        {METRICS.filter((x) => x.key !== "weight" && m[x.key]).map((x) => (
                          <span key={x.key} className="num">
                            {x.short}: {m[x.key]}
                            {x.unit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {confirmDelete === m.id ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-[11px] font-semibold text-red-400 px-2 py-1.5 rounded-md bg-red-500/10"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[11px] text-textSecondary px-1.5 py-1.5"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(m.id)}
                        className="text-textSecondary p-1.5 shrink-0"
                        aria-label="Excluir registro"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Formulário de novo registro */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end z-[70]"
          >
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface w-full max-w-[480px] mx-auto rounded-t-2xl p-5 pb-[max(2rem,env(safe-area-inset-bottom))] max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg">Novo registro</h3>
                <button onClick={() => setShowForm(false)} className="text-textSecondary">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <Field
                  label="Peso (kg)"
                  value={form.weight}
                  onChange={(v) => setForm((f) => ({ ...f, weight: v }))}
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                  {METRICS.filter((m) => m.key !== "weight").map((m) => (
                    <Field
                      key={m.key}
                      label={`${m.label} (${m.unit})`}
                      value={form[m.key]}
                      onChange={(v) => setForm((f) => ({ ...f, [m.key]: v }))}
                    />
                  ))}
                </div>
              </div>

              <p className="text-textSecondary/60 text-[11px] mt-3 leading-relaxed">
                Só o peso é obrigatório. Meça sempre no mesmo horário e nas mesmas condições — de manhã, em jejum, é o
                mais consistente.
              </p>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="w-full bg-accent text-bg font-semibold py-3.5 rounded-xl2 mt-4"
              >
                Salvar registro
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ metric, stats, active, onSelect }) {
  const delta = stats.desdeAnterior;
  const temDelta = delta !== null && Math.abs(delta) > 0.001;

  // Cor da variação segundo o objetivo típico daquela medida.
  let deltaColor = "text-textSecondary";
  if (temDelta) {
    if (GROWTH_IS_GOOD.includes(metric.key)) deltaColor = delta > 0 ? "text-accent" : "text-orange-400";
    else if (LOWER_IS_GOOD.includes(metric.key)) deltaColor = delta < 0 ? "text-accent" : "text-orange-400";
  }

  const Icon = !temDelta ? MinusIcon : delta > 0 ? TrendingUp : TrendingDown;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`text-left rounded-xl2 p-3.5 border transition-colors ${
        active ? "bg-accent/10 border-accent/50" : "bg-surface border-border"
      }`}
    >
      <p className="text-[10px] text-textSecondary uppercase tracking-wide mb-1">{metric.label}</p>
      <p className="num text-xl font-bold leading-none">
        {stats.atual}
        <span className="text-textSecondary text-xs font-medium"> {metric.unit}</span>
      </p>
      <div className={`flex items-center gap-1 mt-1.5 ${deltaColor}`}>
        <Icon size={11} strokeWidth={2.5} />
        <span className="num text-[10px] font-medium">
          {temDelta
            ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}${metric.unit} vs anterior`
            : "sem mudança"}
        </span>
      </div>
    </motion.button>
  );
}

function Field({ label, value, onChange, autoFocus }) {
  return (
    <div>
      <span className="text-xs text-textSecondary block mb-1.5">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="num w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
