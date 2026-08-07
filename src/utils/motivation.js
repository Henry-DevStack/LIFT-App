// Mensagens motivacionais mostradas na tela de review ao finalizar o
// treino. A escolha leva em conta o desempenho da sessão (se completou
// tudo, se bateu recorde de volume etc.) pra não soar genérico.

const MESSAGES = {
  perfeito: [
    "Treino completo, sem desculpa nenhuma. É assim que se constrói.",
    "100% das séries fechadas. Consistência hoje, resultado amanhã.",
    "Você não negociou com a preguiça hoje. Respeito.",
  ],
  recorde: [
    "Volume recorde! Seu corpo acabou de descobrir um novo patamar.",
    "Mais peso movimentado do que nunca. Progressão de verdade é isso.",
    "Recorde batido. Guarda esse número, porque ele vai cair de novo.",
  ],
  bom: [
    "Treino feito é treino que conta. Amanhã você agradece.",
    "Nem todo treino precisa ser o melhor — precisa ser feito. E foi.",
    "Mais um tijolo na parede. Continua.",
  ],
  parcial: [
    "Não deu pra fechar tudo hoje, e tudo bem. Apareceu, treinou, valeu.",
    "Treino parcial ainda é infinitamente melhor que treino nenhum.",
    "O importante foi não zerar o dia. Semana que vem a gente fecha.",
  ],
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function getMotivationalMessage({ completionRate = 0, isVolumeRecord = false }) {
  if (isVolumeRecord) return pick(MESSAGES.recorde);
  if (completionRate >= 1) return pick(MESSAGES.perfeito);
  if (completionRate >= 0.6) return pick(MESSAGES.bom);
  return pick(MESSAGES.parcial);
}
