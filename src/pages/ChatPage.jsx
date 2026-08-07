import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Sparkles, KeyRound, AlertCircle } from "lucide-react";
import { db } from "../services/storage";
import { sendChatMessage, QUICK_PROMPTS } from "../services/chat";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState(db.getChatConfig());
  const endRef = useRef(null);

  useEffect(() => {
    setMessages(db.getChatHistory());
    setConfig(db.getChatConfig());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setError("");
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    db.saveChatHistory(next);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage({
        messages: next,
        apiKey: config.apiKey,
        model: config.model,
      });
      const withReply = [...next, { role: "assistant", content: reply }];
      setMessages(withReply);
      db.saveChatHistory(withReply);
    } catch (err) {
      setError(err.message || "Não consegui responder agora. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    if (confirm("Limpar todo o histórico da conversa?")) {
      db.clearChatHistory();
      setMessages([]);
      setError("");
    }
  }

  const hasKey = Boolean(config.apiKey);

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur px-5 pt-6 pb-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl2 bg-accent/15 flex items-center justify-center">
            <Sparkles size={17} className="text-accent" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight">Assistente</h1>
            <p className="text-textSecondary text-[10px]">Conhece seu histórico de treinos</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} className="text-textSecondary p-1.5">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Aviso quando não há chave configurada */}
      {!hasKey && (
        <div className="mx-5 mt-4 bg-surface border border-border rounded-xl2 p-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound size={15} className="text-accent" />
            <p className="font-display font-semibold text-sm">Configure sua chave de API</p>
          </div>
          <p className="text-textSecondary text-xs leading-relaxed mb-3">
            O assistente usa a API da Anthropic. Adicione sua chave em Ajustes para começar a conversar.
          </p>
          <Link
            to="/config/assistente"
            className="inline-flex items-center gap-1.5 bg-accent text-bg text-xs font-semibold px-3.5 py-2 rounded-lg"
          >
            Ir para Ajustes
          </Link>
        </div>
      )}

      {/* Mensagens */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-3">
        {messages.length === 0 && hasKey && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-textSecondary text-xs mb-1">Comece por aqui:</p>
            {QUICK_PROMPTS.map((prompt) => (
              <motion.button
                key={prompt}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSend(prompt)}
                className="text-left bg-surface border border-border rounded-xl2 px-4 py-3 text-sm text-textSecondary"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] rounded-xl2 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-accent text-bg self-end rounded-br-md"
                  : "bg-surface border border-border self-start rounded-bl-md"
              }`}
            >
              {m.content}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface border border-border rounded-xl2 rounded-bl-md px-4 py-3 self-start flex gap-1.5"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-textSecondary"
              />
            ))}
          </motion.div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl2 px-4 py-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{error}</p>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Campo de envio */}
      <div className="sticky bottom-0 bg-bg/95 backdrop-blur px-5 py-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={hasKey ? "Pergunte alguma coisa..." : "Configure a chave em Ajustes"}
          disabled={!hasKey || loading}
          className="flex-1 min-w-0 bg-surface border border-border rounded-xl2 px-4 py-3 text-sm placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSend()}
          disabled={!hasKey || loading || !input.trim()}
          className="shrink-0 w-12 h-12 rounded-xl2 bg-accent text-bg flex items-center justify-center disabled:opacity-40"
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
}
