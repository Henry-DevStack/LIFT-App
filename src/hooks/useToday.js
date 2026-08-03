import { useEffect, useState } from "react";
import { todayStr } from "../lib/stats";

// Mantém a data de hoje sempre atualizada.
//
// Por que isso é necessário: num PWA (ou numa aba deixada aberta) o app
// praticamente nunca é fechado — só vai pra segundo plano. Como os
// componentes não remontam nesse ciclo, qualquer `const hoje = todayStr()`
// calculado na montagem congela na data daquele momento.
//
// O sintoma disso era: marcar creatina hoje, voltar amanhã e ver o check
// ainda ativo — porque o widget continuava perguntando "tomou em <ontem>?".
// E desmarcar apagava o registro de ontem, dando a impressão de que o
// check valia para todos os dias.
//
// Aqui a data é recalculada em três momentos:
//  - quando o app volta a ficar visível (voltar do segundo plano)
//  - quando a janela recebe foco
//  - automaticamente na virada da meia-noite, se o app ficar aberto
export default function useToday() {
  const [today, setToday] = useState(todayStr);

  useEffect(() => {
    let midnightTimer;

    function sync() {
      const atual = todayStr();
      // Só atualiza o estado se a data realmente mudou, pra não provocar
      // re-render desnecessário a cada troca de aba.
      setToday((anterior) => (anterior === atual ? anterior : atual));
      agendarViradaDeDia();
    }

    function agendarViradaDeDia() {
      clearTimeout(midnightTimer);
      const agora = new Date();
      const meiaNoite = new Date(agora);
      meiaNoite.setHours(24, 0, 0, 0);
      // +1s de folga pra garantir que já passou da virada quando disparar.
      midnightTimer = setTimeout(sync, meiaNoite - agora + 1000);
    }

    function onVisibility() {
      if (document.visibilityState === "visible") sync();
    }

    agendarViradaDeDia();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", sync);

    return () => {
      clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return today;
}
