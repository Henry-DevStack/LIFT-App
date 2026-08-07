// Backup e restauração de todos os dados do app.
//
// Como tudo é guardado no localStorage do navegador, limpar os dados do
// navegador, trocar de celular ou desinstalar o app apaga o histórico
// inteiro. Este módulo permite exportar tudo para um arquivo .json e
// restaurar depois — é a única rede de segurança do app.

const PREFIX = "fit:";
// O formato do arquivo mudou de nome junto com o app, mas backups antigos
// (gerados como "fit-app-backup") continuam sendo aceitos na restauração.
const FORMAT_ID = "lift-backup";
const LEGACY_FORMAT_IDS = ["fit-app-backup"];
const FORMAT_VERSION = 1;

// Chaves que NÃO entram no backup (nada sensível deve viajar no arquivo).
const EXCLUDED_KEYS = [
  "fit:chat_config", // contém a chave da API — não deve sair do dispositivo
  "fit:session", // flag de login, específica do dispositivo
  "fit:tour_seen", // se já viu o tour — específico do dispositivo
];

// Rótulos amigáveis pra mostrar o que o arquivo contém antes de restaurar.
const KEY_LABELS = {
  "fit:workouts": "Treinos cadastrados",
  "fit:workout_logs": "Histórico de treinos",
  "fit:meals": "Refeições",
  "fit:measurements": "Peso e medidas",
  "fit:profile": "Perfil e metas",
  "fit:training_days": "Dias treinados",
  "fit:theme": "Cor do app",
  "fit:supplements": "Suplementos",
  "fit:supplement_logs": "Registro de suplementos",
  "fit:water_logs": "Consumo de água",
  "fit:active_session": "Treino em andamento",
  "fit:chat_history": "Conversas com o assistente",
};

export function collectData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX) || EXCLUDED_KEYS.includes(key)) continue;
    try {
      data[key] = JSON.parse(localStorage.getItem(key));
    } catch {
      // Ignora chaves corrompidas em vez de quebrar o backup inteiro.
    }
  }
  return data;
}

export function buildBackup() {
  return {
    format: FORMAT_ID,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data: collectData(),
  };
}

// Gera o arquivo e dispara o download no navegador.
export function downloadBackup() {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const link = document.createElement("a");
  link.href = url;
  link.download = `lift-backup-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return backup;
}

// Lê um arquivo escolhido pelo usuário e valida o formato antes de aceitar.
export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const validFormat = parsed?.format === FORMAT_ID || LEGACY_FORMAT_IDS.includes(parsed?.format);
        if (!validFormat || typeof parsed.data !== "object") {
          reject(new Error("Esse arquivo não parece ser um backup do Lift."));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error("Não consegui ler esse arquivo. Ele pode estar corrompido."));
      }
    };
    reader.onerror = () => reject(new Error("Falha ao abrir o arquivo."));
    reader.readAsText(file);
  });
}

// Resumo legível do que existe dentro de um backup, pra mostrar antes de
// o usuário confirmar a restauração.
export function describeBackup(backup) {
  const items = [];
  Object.entries(backup.data || {}).forEach(([key, value]) => {
    const label = KEY_LABELS[key] || key;
    const count = Array.isArray(value) ? value.length : null;
    items.push(count !== null ? `${label}: ${count}` : label);
  });
  return items;
}

// Restaura os dados. `mode` pode ser:
//  - "replace": apaga os dados atuais e usa só os do arquivo
//  - "merge":   mantém o que existe e adiciona só as chaves ausentes
export function restoreBackup(backup, mode = "replace") {
  if (backup?.format !== FORMAT_ID && !LEGACY_FORMAT_IDS.includes(backup?.format)) {
    throw new Error("Arquivo de backup inválido.");
  }

  if (mode === "replace") {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX) && !EXCLUDED_KEYS.includes(key)) toRemove.push(key);
    }
    toRemove.forEach((key) => localStorage.removeItem(key));
  }

  Object.entries(backup.data).forEach(([key, value]) => {
    if (!key.startsWith(PREFIX) || EXCLUDED_KEYS.includes(key)) return;
    if (mode === "merge" && localStorage.getItem(key) !== null) return;
    localStorage.setItem(key, JSON.stringify(value));
  });
}
