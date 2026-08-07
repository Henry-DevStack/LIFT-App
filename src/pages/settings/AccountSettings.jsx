import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, User, PlayCircle, LogOut } from "lucide-react";
import { db } from "../../services/storage";
import { auth } from "../../services/auth";
import SettingsLayout from "../../components/layout/SettingsLayout";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(db.getProfile());
  const [saved, setSaved] = useState(false);

  function handleSaveName() {
    db.saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleLogout() {
    if (confirm("Sair do app? Seus dados continuam salvos neste dispositivo.")) {
      auth.logout();
      navigate("/", { replace: true });
      window.location.reload();
    }
  }

  return (
    <SettingsLayout title="Conta" description="Seu nome, metas e acesso ao app.">
      <div className="flex flex-col gap-5">
        <div className="bg-surface border border-border rounded-xl2 p-4">
          <label className="text-xs text-textSecondary block mb-1.5">Seu nome</label>
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-surface2 border border-border rounded-xl2 px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveName}
            className="w-full bg-accent text-bg font-semibold py-3 rounded-xl2 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check size={16} />
                Salvo!
              </>
            ) : (
              "Salvar alterações"
            )}
          </motion.button>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            to="/perfil"
            className="w-full bg-surface border border-border text-textPrimary font-medium py-3.5 rounded-xl2 flex items-center justify-center gap-2 text-sm"
          >
            <User size={15} />
            Perfil completo e metas
          </Link>

          <button
            onClick={() => {
              db.resetTour();
              window.location.reload();
            }}
            className="w-full bg-surface border border-border text-textSecondary font-medium py-3.5 rounded-xl2 flex items-center justify-center gap-2 text-sm"
          >
            <PlayCircle size={15} />
            Rever apresentação do app
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-border text-textSecondary font-medium py-3.5 rounded-xl2"
        >
          <LogOut size={16} />
          Sair
        </motion.button>
      </div>
    </SettingsLayout>
  );
}
