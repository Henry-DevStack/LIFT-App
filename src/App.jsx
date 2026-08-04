import AppRoutes from "./AppRoutes";
import PrivateLanding from "./pages/PrivateLanding";

// A demo pública é liberada pela variável de ambiente VITE_DEMO_PUBLIC.
// Qualquer valor diferente de "true" mantém a landing page — inclusive a
// variável ausente, para que o padrão seja fechado.
const demoPublic = import.meta.env.VITE_DEMO_PUBLIC === "true";

export default function App() {
  return demoPublic ? <AppRoutes /> : <PrivateLanding />;
}
