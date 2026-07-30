// Modelos de treino pré-programados, sugeridos na tela inicial.
// Ao "usar" um modelo, ele é copiado como treino(s) normal(is) do usuário
// (via db.saveWorkout), então depois podem ser editados livremente como
// qualquer outro treino — nada aqui é fixo ou travado.

function ex(name, sets, reps, rest = 60, notes = "") {
  return { name, sets, reps, rest, notes, loads: Array(sets).fill("") };
}

export const WORKOUT_TEMPLATES = [
  {
    key: "ppl",
    title: "PPL — Push, Pull, Legs",
    tagline: "3 treinos, ideal pra quem treina 5–6x por semana",
    description:
      "Divide os exercícios por padrão de movimento: empurrar (peito, ombro, tríceps), puxar (costas, bíceps) e pernas. Permite treinar cada grupo com mais frequência e volume, ótimo pra hipertrofia com boa recuperação.",
    days: [
      {
        name: "Push (Peito, Ombro, Tríceps)",
        tag: "peito",
        exercises: [
          ex("Supino reto com barra", 4, 8, 90, "Desça a barra até o peito de forma controlada."),
          ex("Desenvolvimento com halteres", 3, 10, 75),
          ex("Supino inclinado com halteres", 3, 10, 75),
          ex("Elevação lateral", 3, 15, 45),
          ex("Tríceps corda", 3, 12, 60),
        ],
      },
      {
        name: "Pull (Costas e Bíceps)",
        tag: "costas",
        exercises: [
          ex("Barra fixa ou puxada frontal", 4, 8, 90, "Foque em puxar com as costas, não com o braço."),
          ex("Remada curvada com barra", 3, 10, 75),
          ex("Remada unilateral com halter", 3, 10, 75),
          ex("Rosca direta com barra", 3, 12, 60),
          ex("Face pull", 3, 15, 45, "Ajuda na postura e saúde do ombro."),
        ],
      },
      {
        name: "Legs (Pernas)",
        tag: "perna",
        exercises: [
          ex("Agachamento livre", 4, 8, 120, "Desça até pelo menos 90 graus, mantendo o core firme."),
          ex("Leg press", 3, 10, 90),
          ex("Cadeira extensora", 3, 12, 60),
          ex("Mesa flexora", 3, 12, 60),
          ex("Panturrilha em pé", 4, 15, 45),
        ],
      },
    ],
  },
  {
    key: "upper_lower",
    title: "Upper / Lower",
    tagline: "2 treinos, ideal pra quem treina 4x por semana",
    description:
      "Alterna entre treino de membros superiores e inferiores. Cada grupo muscular é trabalhado duas vezes por semana, um bom equilíbrio entre volume, frequência e tempo de recuperação — funciona bem pra rotinas mais corridas.",
    days: [
      {
        name: "Upper (Superiores)",
        tag: "peito",
        exercises: [
          ex("Supino reto com barra", 4, 8, 90),
          ex("Remada curvada com barra", 4, 8, 90),
          ex("Desenvolvimento com halteres", 3, 10, 75),
          ex("Puxada frontal", 3, 10, 75),
          ex("Rosca direta", 3, 12, 60),
          ex("Tríceps corda", 3, 12, 60),
        ],
      },
      {
        name: "Lower (Inferiores)",
        tag: "perna",
        exercises: [
          ex("Agachamento livre", 4, 8, 120, "Desça até pelo menos 90 graus, mantendo o core firme."),
          ex("Levantamento terra romeno", 3, 10, 90, "Mantenha a coluna neutra, sinta o alongamento no posterior."),
          ex("Leg press", 3, 12, 90),
          ex("Mesa flexora", 3, 12, 60),
          ex("Panturrilha em pé", 4, 15, 45),
          ex("Abdominal", 3, 15, 45),
        ],
      },
    ],
  },
  {
    key: "full_body",
    title: "Full Body",
    tagline: "1 treino completo, ideal pra quem treina 2–3x por semana",
    description:
      "Trabalha o corpo inteiro em cada sessão, com foco nos principais movimentos compostos. Bom pra quem tem rotina mais apertada e quer eficiência sem abrir mão dos grandes grupos musculares.",
    days: [
      {
        name: "Full Body A",
        tag: "geral",
        exercises: [
          ex("Agachamento livre", 3, 10, 90, "Desça até pelo menos 90 graus, mantendo o core firme."),
          ex("Supino reto com barra", 3, 10, 90),
          ex("Remada curvada com barra", 3, 10, 90),
          ex("Desenvolvimento com halteres", 3, 12, 60),
          ex("Rosca direta", 2, 12, 45),
          ex("Abdominal", 3, 15, 45),
        ],
      },
    ],
  },
  {
    key: "core_cardio",
    title: "Core & Cardio",
    tagline: "1 treino, ótimo pra complementar qualquer plano",
    description:
      "Sessão curta focada em core e condicionamento — boa pra intercalar entre os dias de treino de força ou pra quem quer adicionar mais queima calórica na semana.",
    days: [
      {
        name: "Core & Cardio",
        tag: "cardio",
        exercises: [
          ex("Corrida ou esteira", 1, 1, 0, "15–20 minutos em ritmo moderado."),
          ex("Prancha", 3, 1, 45, "Segure de 30 a 60 segundos por série."),
          ex("Abdominal", 3, 20, 45),
          ex("Polichinelo", 3, 30, 30),
        ],
      },
    ],
  },
];

// Lista achatada de todos os "dias" de todos os modelos, cada um marcado
// com o template de origem — usada na biblioteca de treinos, onde o
// usuário escolhe dias individuais (não o modelo inteiro) pra combinar
// com o plano dele.
export const ALL_TEMPLATE_DAYS = WORKOUT_TEMPLATES.flatMap((template) =>
  template.days.map((day) => ({
    ...day,
    templateKey: template.key,
    templateTitle: template.title,
    id: `${template.key}__${day.name}`,
  }))
);
