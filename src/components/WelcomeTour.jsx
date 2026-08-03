import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Library, ListChecks, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

// Tour rápido mostrado na primeira vez que a pessoa entra. A ideia é só
// avisar que essas áreas existem — quatro cartões, deslizando, com
// "pular" sempre visível. Nada de setas apontando pra botões nem de
// travar a navegação: quem já entendeu sai em um toque.
const STEPS = [
  {
    icon: Library,
    title: "Comece com um treino pronto",
    text: "Na biblioteca tem modelos montados (Push/Pull/Legs, Full Body e outros). Escolha um e edite do seu jeito — ou crie o seu do zero.",
  },
  {
    icon: ListChecks,
    title: "Registre série a série",
    text: "Durante o treino, anote peso e repetições de cada série. O app mostra o que você fez da última vez, pra você saber se está evoluindo.",
  },
  {
    icon: TrendingUp,
    title: "Acompanhe sua evolução",
    text: "Peso, medidas e volume de treino viram gráficos ao longo do tempo. É onde dá pra ver o progresso que não aparece no espelho toda semana.",
  },
  {
    icon: Sparkles,
    title: "Tire dúvidas no assistente",
    text: "Um chat que conhece seu histórico e ajuda com execução, troca de exercício e progressão de carga.",
  },
];

export default function WelcomeTour({ onFinish }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] bg-bg flex flex-col px-6 pt-10 pb-8">
      <div className="flex justify-end">
        <button onClick={onFinish} className="text-textSecondary text-sm px-2 py-1">
          Pular
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center max-w-[320px]"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.05 }}
              className="w-20 h-20 rounded-3xl bg-accent/15 flex items-center justify-center mb-7"
            >
              <Icon size={34} className="text-accent" />
            </motion.div>
            <h2 className="font-display text-2xl font-semibold mb-3 leading-tight">{current.title}</h2>
            <p className="text-textSecondary text-sm leading-relaxed">{current.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicador de passo */}
      <div className="flex justify-center gap-1.5 mb-6">
        {STEPS.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setStep(i)}
            animate={{ width: i === step ? 20 : 6 }}
            className={`h-1.5 rounded-full ${i === step ? "bg-accent" : "bg-border"}`}
            aria-label={`Ir para o passo ${i + 1}`}
          />
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
        className="w-full bg-accent text-bg font-semibold py-4 rounded-xl2 flex items-center justify-center gap-2"
      >
        {isLast ? "Bora treinar" : "Próximo"}
        {!isLast && <ArrowRight size={17} />}
      </motion.button>
    </div>
  );
}
