import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";

// Aviso discreto de que o app está sem internet. Como todos os dados são
// locais, tudo continua funcionando normalmente — a única coisa que
// realmente precisa de rede é o assistente. A mensagem existe pra que a
// pessoa entenda a situação em vez de achar que o app quebrou.
export default function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-surface2 border border-border rounded-b-xl2 px-3.5 py-1.5 flex items-center gap-2"
        >
          <WifiOff size={13} className="text-textSecondary" />
          <span className="text-[11px] text-textSecondary">Sem internet — seus treinos funcionam normal</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
