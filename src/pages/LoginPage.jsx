import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { db } from "../lib/storage";
import { auth } from "../lib/auth";

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const profile = db.getProfile();
    db.saveProfile({ ...profile, name: trimmed });
    auth.login(trimmed);
    onLogin();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[340px] flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4"
        >
          <Dumbbell className="text-accent" size={30} />
        </motion.div>
        <h1 className="font-display text-3xl font-bold mb-1 text-center tracking-tight">Lift</h1>
        <p className="text-textSecondary text-sm text-center mb-8 leading-relaxed">
          Como podemos te chamar?
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full bg-surface border border-border rounded-xl2 px-4 py-3.5 text-sm text-center placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={!name.trim()}
            className="w-full bg-accent text-bg font-semibold py-3.5 rounded-xl2 disabled:opacity-40 transition-opacity"
          >
            Entrar
          </motion.button>
        </form>

        <p className="text-textSecondary/60 text-[11px] text-center leading-relaxed mt-6">
          Seus dados ficam salvos apenas neste dispositivo, no seu navegador.
        </p>
      </motion.div>
    </div>
  );
}
