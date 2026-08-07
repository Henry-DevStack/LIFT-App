import { useEffect, useRef, useState } from "react";

// Número que conta até o valor final em vez de simplesmente aparecer.
// Usado nas estatísticas do resumo de treino e da tela inicial — dá uma
// sensação de "apuração" que combina com números conquistados.
//
// Respeita a preferência de sistema por menos animação: quem tem isso
// ligado vê o valor final direto, sem contagem.
export default function CountUp({ value, duration = 900, decimals = 0, className = "" }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const frameRef = useRef();

  useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || duration <= 0) {
      setDisplay(target);
      return;
    }

    const start = performance.now();
    const from = 0;

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutCubic: rápido no início, desacelerando no fim.
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
}
