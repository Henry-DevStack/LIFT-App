import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Upload, ShieldCheck, AlertTriangle } from "lucide-react";
import { downloadBackup, parseBackupFile, restoreBackup, describeBackup } from "../../lib/backup";
import SettingsLayout from "../../components/SettingsLayout";

export default function BackupSettings() {
  const [pendingBackup, setPendingBackup] = useState(null);
  const [backupMsg, setBackupMsg] = useState(null);
  const fileInputRef = useRef(null);

  function handleExport() {
    try {
      downloadBackup();
      setBackupMsg({ type: "ok", text: "Backup baixado! Guarde esse arquivo em um lugar seguro." });
    } catch {
      setBackupMsg({ type: "erro", text: "Não consegui gerar o backup." });
    }
  }

  async function handlePickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = await parseBackupFile(file);
      setPendingBackup(parsed);
      setBackupMsg(null);
    } catch (err) {
      setPendingBackup(null);
      setBackupMsg({ type: "erro", text: err.message });
    }
  }

  function handleRestore(mode) {
    const aviso =
      mode === "replace"
        ? "Isso vai APAGAR os dados atuais deste dispositivo e colocar os do arquivo no lugar. Continuar?"
        : "Isso vai manter seus dados atuais e preencher só o que estiver faltando. Continuar?";
    if (!confirm(aviso)) return;
    try {
      restoreBackup(pendingBackup, mode);
      setPendingBackup(null);
      alert("Dados restaurados! O app vai recarregar.");
      window.location.reload();
    } catch (err) {
      setBackupMsg({ type: "erro", text: err.message });
    }
  }

  return (
    <SettingsLayout
      title="Backup dos dados"
      description="Seus treinos e medidas ficam só neste aparelho. Um backup é a única forma de não perder tudo."
    >
      {/* Backup dos dados */}
      <div className="bg-surface border border-border rounded-xl2 p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-accent" />
          <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
            Backup dos seus dados
          </span>
        </div>

        <div className="bg-surface2 rounded-xl2 p-3 mb-3 flex items-start gap-2">
          <AlertTriangle size={14} className="text-accent shrink-0 mt-0.5" />
          <p className="text-textSecondary text-[11px] leading-relaxed">
            Seus treinos, histórico e medidas ficam salvos apenas neste navegador. Limpar os dados do navegador,
            trocar de aparelho ou reinstalar o app apaga tudo. Baixe um backup de vez em quando.
          </p>
        </div>

        <div className="flex gap-2 mb-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="flex-1 bg-accent text-bg font-semibold py-3 rounded-xl2 flex items-center justify-center gap-2 text-sm"
          >
            <Download size={16} />
            Baixar backup
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border border-border text-textPrimary font-medium py-3 rounded-xl2 flex items-center justify-center gap-2 text-sm"
          >
            <Upload size={16} />
            Restaurar
          </motion.button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handlePickFile}
          className="hidden"
        />

        {/* Prévia do arquivo escolhido, antes de confirmar */}
        <AnimatePresence>
          {pendingBackup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-surface2 rounded-xl2 p-3 mb-3 overflow-hidden"
            >
              <p className="text-xs font-medium mb-1">Backup encontrado</p>
              <p className="text-textSecondary text-[10px] mb-2">
                Gerado em {new Date(pendingBackup.exportedAt).toLocaleString("pt-BR")}
              </p>
              <ul className="text-textSecondary text-[10px] leading-relaxed mb-3 list-disc list-inside">
                {describeBackup(pendingBackup).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore("replace")}
                  className="flex-1 bg-accent text-bg text-xs font-semibold py-2.5 rounded-lg"
                >
                  Substituir tudo
                </button>
                <button
                  onClick={() => handleRestore("merge")}
                  className="flex-1 border border-border text-textSecondary text-xs font-medium py-2.5 rounded-lg"
                >
                  Só completar
                </button>
                <button
                  onClick={() => setPendingBackup(null)}
                  className="px-3 text-textSecondary text-xs"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {backupMsg && (
          <p
            className={`text-[11px] leading-relaxed ${
              backupMsg.type === "erro" ? "text-red-400" : "text-accent"
            }`}
          >
            {backupMsg.text}
          </p>
        )}

        <p className="text-textSecondary/60 text-[10px] leading-relaxed mt-2">
          O arquivo de backup não inclui a chave da API — ela nunca sai deste dispositivo.
        </p>
      </div>
    </SettingsLayout>
  );
}
