import { useEffect, useState } from "react";
import { Check, Sparkles, Eye, EyeOff } from "lucide-react";
import { db } from "../../lib/storage";
import SettingsLayout from "../../components/SettingsLayout";

export default function AssistantSettings() {
  const [chatConfig, setChatConfig] = useState(db.getChatConfig());
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (keySaved) {
      const t = setTimeout(() => setKeySaved(false), 1500);
      return () => clearTimeout(t);
    }
  }, [keySaved]);

  function handleSaveChatConfig() {
    db.saveChatConfig(chatConfig);
    setKeySaved(true);
  }

  return (
    <SettingsLayout
      title="Assistente de treino"
      description="Um chat que conhece seu histórico. Precisa de uma chave da API da Anthropic para funcionar."
    >
      {/* Assistente de IA */}
      <div className="bg-surface border border-border rounded-xl2 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-accent" />
          <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
            Assistente de treino
          </span>
        </div>

        <label className="text-xs text-textSecondary block mb-1.5">Chave da API Anthropic</label>
        <div className="flex gap-2 mb-2">
          <input
            type={showKey ? "text" : "password"}
            value={chatConfig.apiKey}
            onChange={(e) => setChatConfig((c) => ({ ...c, apiKey: e.target.value }))}
            placeholder="sk-ant-..."
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-surface2 border border-border rounded-xl2 px-4 py-3 text-sm placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={() => setShowKey((v) => !v)}
            className="shrink-0 w-11 rounded-xl2 bg-surface2 border border-border flex items-center justify-center text-textSecondary"
            aria-label={showKey ? "Ocultar chave" : "Mostrar chave"}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <label className="text-xs text-textSecondary block mb-1.5">Modelo</label>
        <input
          value={chatConfig.model}
          onChange={(e) => setChatConfig((c) => ({ ...c, model: e.target.value }))}
          placeholder="claude-sonnet-4-6"
          className="w-full bg-surface2 border border-border rounded-xl2 px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <button
          onClick={handleSaveChatConfig}
          className="w-full bg-accent text-bg font-semibold py-3 rounded-xl2 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-3"
        >
          {keySaved ? (
            <>
              <Check size={16} />
              Salvo!
            </>
          ) : (
            "Salvar chave"
          )}
        </button>

        <p className="text-textSecondary/70 text-[11px] leading-relaxed">
          <span className="text-red-400/90 font-medium">Atenção:</span> como o app não tem servidor próprio, a chave
          fica salva no navegador deste dispositivo e é enviada direto para a API. Isso é seguro o bastante para uso
          pessoal, mas não publique o app com sua chave configurada — qualquer pessoa com acesso ao aparelho
          conseguiria lê-la.
        </p>
      </div>
    </SettingsLayout>
  );
}
