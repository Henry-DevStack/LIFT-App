// Base curada de exercícios por grupo muscular, usada pelo módulo
// "Gym Bro" pra sugerir substituições quando uma máquina/equipamento
// está ocupado. Não é um catálogo completo — cobre os exercícios mais
// comuns de academia dentro de cada grupo (mesmo mapeamento de grupo
// muscular usado em exerciseVisuals.js).

export const EQUIPMENT_LABELS = {
  barra: "Barra",
  halteres: "Halteres",
  maquina: "Máquina",
  polia: "Polia",
  peso_corporal: "Peso corporal",
};

export const EXERCISE_DATABASE = {
  peito: [
    { name: "Supino Reto (Barra)", equipment: "barra" },
    { name: "Supino Reto (Halteres)", equipment: "halteres" },
    { name: "Supino Inclinado (Halteres)", equipment: "halteres" },
    { name: "Supino Máquina", equipment: "maquina" },
    { name: "Crucifixo (Halteres)", equipment: "halteres" },
    { name: "Peck Deck (Máquina)", equipment: "maquina" },
    { name: "Cross Over (Polia)", equipment: "polia" },
    { name: "Flexão de Braço", equipment: "peso_corporal" },
  ],
  costas: [
    { name: "Puxada Alta na Polia (Máquina)", equipment: "polia" },
    { name: "Puxada Alta (Pegada Supinada)", equipment: "polia" },
    { name: "Remada Curvada (Barra)", equipment: "barra" },
    { name: "Remada Unilateral (Halter)", equipment: "halteres" },
    { name: "Remada Máquina", equipment: "maquina" },
    { name: "Barra Fixa", equipment: "peso_corporal" },
    { name: "Levantamento Terra", equipment: "barra" },
    { name: "Pulldown Reto (Polia)", equipment: "polia" },
  ],
  perna: [
    { name: "Agachamento Livre (Barra)", equipment: "barra" },
    { name: "Leg Press", equipment: "maquina" },
    { name: "Cadeira Extensora", equipment: "maquina" },
    { name: "Cadeira Flexora", equipment: "maquina" },
    { name: "Afundo (Halteres)", equipment: "halteres" },
    { name: "Stiff (Barra)", equipment: "barra" },
    { name: "Agachamento Búlgaro (Halteres)", equipment: "halteres" },
    { name: "Panturrilha em Pé (Máquina)", equipment: "maquina" },
  ],
  ombro: [
    { name: "Desenvolvimento (Halteres)", equipment: "halteres" },
    { name: "Desenvolvimento Máquina", equipment: "maquina" },
    { name: "Elevação Lateral (Halteres)", equipment: "halteres" },
    { name: "Elevação Frontal (Halteres)", equipment: "halteres" },
    { name: "Desenvolvimento Arnold (Halteres)", equipment: "halteres" },
    { name: "Face Pull (Polia)", equipment: "polia" },
    { name: "Remada Alta (Barra)", equipment: "barra" },
  ],
  braco: [
    { name: "Rosca Direta (Barra)", equipment: "barra" },
    { name: "Rosca Alternada (Halteres)", equipment: "halteres" },
    { name: "Rosca Scott (Máquina)", equipment: "maquina" },
    { name: "Tríceps Pulley (Polia)", equipment: "polia" },
    { name: "Tríceps Testa (Barra)", equipment: "barra" },
    { name: "Tríceps Francês (Halter)", equipment: "halteres" },
    { name: "Mergulho no Banco", equipment: "peso_corporal" },
  ],
  core: [
    { name: "Abdominal Reto (Solo)", equipment: "peso_corporal" },
    { name: "Prancha", equipment: "peso_corporal" },
    { name: "Abdominal na Polia", equipment: "polia" },
    { name: "Elevação de Pernas", equipment: "peso_corporal" },
    { name: "Abdominal Oblíquo", equipment: "peso_corporal" },
  ],
  cardio: [
    { name: "Esteira", equipment: "maquina" },
    { name: "Bike Ergométrica", equipment: "maquina" },
    { name: "Elíptico", equipment: "maquina" },
    { name: "Pular Corda", equipment: "peso_corporal" },
    { name: "Polichinelo", equipment: "peso_corporal" },
  ],
  geral: [],
};

// Sugere até `count` exercícios alternativos do mesmo grupo muscular,
// excluindo o exercício atual. Se `equipmentFilter` tiver itens, prioriza
// opções compatíveis com o equipamento disponível; se nada compatível
// sobrar, cai de volta pra lista completa do grupo.
export function suggestAlternatives(exerciseName, groupKey, count = 3, equipmentFilter = null) {
  const pool = (EXERCISE_DATABASE[groupKey] || []).filter(
    (e) => e.name.trim().toLowerCase() !== (exerciseName || "").trim().toLowerCase()
  );
  if (!pool.length) return [];
  let list = pool;
  if (equipmentFilter?.length) {
    const filtered = pool.filter((e) => equipmentFilter.includes(e.equipment));
    if (filtered.length) list = filtered;
  }
  return list.slice(0, count);
}
