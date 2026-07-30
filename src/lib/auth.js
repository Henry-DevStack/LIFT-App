// Sessão local simples: como o app não tem backend, "logar" aqui significa
// apenas identificar o usuário pelo nome e guardar uma flag de sessão no
// localStorage. Não é autenticação de verdade (sem senha), só uma forma de
// dar boas-vindas e travar a entrada até o usuário se identificar.

const SESSION_KEY = "fit:session";

export const auth = {
  isLoggedIn: () => localStorage.getItem(SESSION_KEY) === "1",

  login: (name) => {
    localStorage.setItem(SESSION_KEY, "1");
    return name;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },
};
