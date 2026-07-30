// Mapeia o nome de um exercício pra um grupo muscular (ícone + cor),
// usado como uma pequena "imagem de referência" ao lado do exercício.
//
// Obs.: o ambiente de geração não tem acesso à internet, então não é
// possível baixar fotos reais de cada exercício. Em vez de deixar sem
// nada, cada exercício ganha um selo colorido com ícone do grupo
// muscular + nome do grupo, pra pessoa identificar rápido do que se
// trata só de bater o olho. Se depois quiser fotos reais, dá pra trocar
// esse mapeamento por URLs de imagem sem mexer no resto do app.

export const MUSCLE_GROUPS = {
  peito: { label: "Peito", color: "#ff6f6f", icon: "chest" },
  costas: { label: "Costas", color: "#5b9dff", icon: "back" },
  perna: { label: "Perna", color: "#4fd6e8", icon: "legs" },
  ombro: { label: "Ombro", color: "#b58bff", icon: "shoulder" },
  braco: { label: "Braço", color: "#ffcf5c", icon: "arm" },
  core: { label: "Core", color: "#ff9b52", icon: "core" },
  cardio: { label: "Cardio", color: "#ff6fa5", icon: "cardio" },
  geral: { label: "Geral", color: "#c8f751", icon: "general" },
};

const KEYWORD_MAP = [
  [/supino|peitoral|crucifixo|cross.?over|peck.?deck|flexão|flexao/i, "peito"],
  [/remada|puxada|barra fixa|pull.?down|levantamento terra|face pull|encolhimento|shrug/i, "costas"],
  [/agachamento|leg press|extensora|flexora|cadeira|panturrilha|afund|passada|stiff|romen|hack/i, "perna"],
  [/desenvolvimento|elevação lateral|elevacao lateral|elevação frontal|arnold|ombro|manguito/i, "ombro"],
  [/rosca|tríceps|triceps|antebraço|antebraco/i, "braco"],
  [/abdominal|prancha|core|obliquo|oblíquo/i, "core"],
  [/corrida|esteira|bike|bicicleta|elíptico|eliptico|polichinelo|pular corda|hiit/i, "cardio"],
];

export function getMuscleGroup(exerciseName = "") {
  const match = KEYWORD_MAP.find(([regex]) => regex.test(exerciseName));
  return match ? match[1] : "geral";
}

export function getExerciseVisual(exerciseName) {
  const key = getMuscleGroup(exerciseName);
  return { key, ...MUSCLE_GROUPS[key] };
}
