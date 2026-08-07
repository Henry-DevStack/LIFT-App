import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Library, ListChecks, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

// Tour rápido mostrado na primeira vez que a pessoa entra. A ideia é só
// avisar que essas áreas existem — quatro cartões, deslizando, com
// "pular" sempre visível. Nada de setas apontando pra botões nem de
// travar a navegação: quem já entendeu sai em um toque.
//
// Cada passo tem uma cor própria, e o fundo do tour usa um degradê dessa
// cor. Isso tira o tour do preto do resto do app (que ficava chapado e
// sem contraste) e dá uma sensação de progressão conforme se avança.
const STEPS = [
  {
    icon: Library,
    color: "#c8f751",
    title: "Comece com um treino pronto",
    text: "Na biblioteca tem modelos montados (Push/Pull/Legs, Full Body e outros). Escolha um e edite do seu jeito — ou crie o seu do zero.",
  },
  {
    icon: ListChecks,
    color: "#5ec8f7",
    title: "Registre série a série",
    text: "Durante o treino, anote peso e repetições de cada série. O app mostra o que você fez da última vez, pra você saber se está evoluindo.",
  },
  {
    icon: TrendingUp,
    color: "#f79e5e",
    title: "Acompanhe sua evolução",
    text: "Peso, medidas e volume de treino viram gráficos ao longo do tempo. É onde dá pra ver o progresso que não aparece no espelho toda semana.",
  },
  {
    icon: Sparkles,
    color: "#b98cf7",
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
    <div className="fixed inset-0 z-[60] flex flex-col px-6 pt-10 pb-8 overflow-hidden bg-surface">
      {/* Fundo com o degradê da cor do passo atual, trocando suavemente */}
      <AnimatePresence>
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(120% 80% at 50% 0%, ${current.color}26 0%, ${current.color}0a 45%, transparent 75%)`,
          }}
        />
      </AnimatePresence>

      {/* Brilho suave que respira atrás do ícone */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${current.color}20` }}
      />

      <div className="relative flex justify-end">
        <button onClick={onFinish} className="text-textSecondary text-sm px-2 py-1">
          Pular
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center max-w-[320px]"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.06 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-7"
              style={{ backgroundColor: `${current.color}26`, border: `1px solid ${current.color}40` }}
            >
              <Icon size={34} style={{ color: current.color }} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="font-display text-2xl font-semibold mb-3 leading-tight"
            >
              {current.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-textSecondary text-sm leading-relaxed"
            >
              {current.text}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicador de passo */}
      <div className="relative flex justify-center gap-1.5 mb-6">
        {STEPS.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => setStep(i)}
            animate={{ width: i === step ? 22 : 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="h-1.5 rounded-full"
            style={{ backgroundColor: i === step ? s.color : "#2a2f2c" }}
            aria-label={`Ir para o passo ${i + 1}`}
          />
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
        animate={{ backgroundColor: current.color }}
        transition={{ duration: 0.4 }}
        className="relative w-full text-bg font-semibold py-4 rounded-xl2 flex items-center justify-center gap-2"
      >
        {isLast ? "Bora treinar" : "Próximo"}
        {!isLast && (
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight size={17} />
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
