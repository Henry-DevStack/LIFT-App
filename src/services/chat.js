// Comunicação com a API da Anthropic para o assistente de treino.
//
// IMPORTANTE sobre a chave de API: como o app não tem backend, a chave
// fica salva no localStorage do navegador e a chamada sai direto do
// browser. Isso é aceitável pra um app pessoal rodando no seu próprio
// dispositivo, mas NÃO é seguro se você publicar o app pra outras
// pessoas — qualquer um com acesso ao navegador (ou às ferramentas de
// desenvolvedor) consegue ler a chave. Pra uso público, o certo é criar
// um backend pequeno que guarde a chave no servidor e faça a chamada.

import { db } from "./storage";
import { getTrainingStatsForDate, todayStr } from "../utils/stats";

const API_URL = "https://api.anthropic.com/v1/messages";

// Monta um resumo do perfil e dos treinos recentes pra dar contexto ao
// assistente, assim ele responde com base na realidade do usuário em vez
// de dar conselhos genéricos.
export function buildUserContext() {
  const profile = db.getProfile();
  const logs = db.getWorkoutLogs().slice(0, 8);
  const workouts = db.getWorkouts();
  const measurements = db.getMeasurements().slice(0, 3);
  const today = getTrainingStatsForDate(todayStr());

  const lines = [];
  lines.push("=== PERFIL ===");
  if (profile.name) lines.push(`Nome: ${profile.name}`);
  if (profile.age) lines.push(`Idade: ${profile.age}`);
  if (profile.height) lines.push(`Altura: ${profile.height} cm`);
  lines.push(`Objetivo: ${profile.goal || "não definido"}`);
  lines.push(`Meta de calorias: ${profile.dailyCalorieGoal} kcal/dia`);
  lines.push(
    `Metas de macros: ${profile.proteinGoal}g proteína, ${profile.carbGoal}g carbo, ${profile.fatGoal}g gordura`
  );

  if (measurements.length) {
    lines.push("\n=== PESO RECENTE ===");
    measurements.forEach((m) => {
      lines.push(`${new Date(m.date).toLocaleDateString("pt-BR")}: ${m.weight} kg`);
    });
  }

  if (workouts.length) {
    lines.push("\n=== TREINOS CADASTRADOS ===");
    workouts.forEach((w) => {
      const exs = w.exercises.map((e) => `${e.name} ${e.sets}x${e.reps}`).join("; ");
      lines.push(`${w.name} (${(w.days || []).join(", ") || "sem dia fixo"}): ${exs}`);
    });
  }

  if (logs.length) {
    lines.push("\n=== ÚLTIMOS TREINOS REALIZADOS ===");
    logs.forEach((log) => {
      const date = new Date(log.date).toLocaleDateString("pt-BR");
      const exs = log.exercises
        .filter((e) => e.setsCompleted > 0)
        .map((e) => {
          const loads = (e.loadsUsed || []).filter(Boolean).join("/");
          return `${e.name} ${e.setsCompleted} séries${loads ? ` @ ${loads}kg` : ""}`;
        })
        .join("; ");
      lines.push(`${date} — ${log.workoutName}: ${exs}`);
    });
  }

  lines.push("\n=== HOJE ===");
  lines.push(`Séries: ${today.sets} · Volume: ${today.volume} kg · Calorias no treino: ${today.calories}`);

  return lines.join("\n");
}

const SYSTEM_PROMPT = `Você é o assistente de treino do Lift, um app pessoal de academia. Seu papel é ser um parceiro de treino direto, prático e motivador — como um amigo experiente de academia, não como um manual técnico.

Regras:
- Responda SEMPRE em português do Brasil, em tom informal e direto.
- Seja conciso. Respostas curtas e acionáveis valem mais que textões.
- Use os dados reais do usuário (fornecidos abaixo) pra personalizar as respostas. Cite números concretos do histórico dele quando fizer sentido.
- Dê sugestões práticas de execução, progressão de carga, substituição de exercícios e organização de treino.
- Sobre nutrição, fique em orientações gerais e amplamente aceitas.
- Você NÃO é médico, nutricionista nem personal trainer registrado. Para lesões, dores persistentes, condições de saúde, uso de medicamentos ou dietas restritivas, recomende procurar um profissional de verdade — sem drama, mas sem enrolar.
- Se não tiver dados suficientes no histórico pra responder algo específico, diga isso em vez de inventar.

Aqui estão os dados atuais do usuário:`;

export async function sendChatMessage({ messages, apiKey, model = "claude-sonnet-4-6" }) {
  if (!apiKey) {
    throw new Error("Nenhuma chave de API configurada. Vá em Ajustes para adicionar a sua.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // Necessário pra chamar a API direto do navegador, sem backend.
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: `${SYSTEM_PROMPT}\n\n${buildUserContext()}`,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const err = await response.json();
      detail = err?.error?.message || "";
    } catch {
      detail = "";
    }
    if (response.status === 401) {
      throw new Error("Chave de API inválida. Confira em Ajustes.");
    }
    if (response.status === 429) {
      throw new Error("Limite de uso atingido. Tente de novo em alguns instantes.");
    }
    throw new Error(detail || `Erro na requisição (${response.status}).`);
  }

  const data = await response.json();
  return (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

// Perguntas prontas mostradas quando o chat está vazio.
export const QUICK_PROMPTS = [
  "Como está minha evolução nas últimas semanas?",
  "Monte um treino de costas pra mim",
  "Estou estagnado no supino, o que faço?",
  "Quanto de proteína eu deveria comer por dia?",
];
