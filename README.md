<div align="center">

<div align="center">

<img src="./.github/assets/readme-banner.gif" alt="Lift — Treine. Registre. Evolua." width="100%">

</div>

# 🏋️ LIFT

**Seu treino, do planejamento ao progresso — em um app só, offline e sem conta.**

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

<img src="./.github/assets/readme-divider.gif" alt="" width="100%">

## Sobre

O **Lift** nasceu de um incômodo simples: apps de treino ou pedem assinatura, ou pedem conta, ou enchem a tela de coisa que ninguém usa no meio de uma série.

Aqui a proposta é outra. Você abre, registra, e pronto. Sem login, sem servidor, sem anúncio. Os dados ficam no seu aparelho e o app funciona **mesmo sem internet** — o que importa quando a academia fica no subsolo e o sinal não chega.

<img src="./.github/assets/readme-divider.gif" alt="" width="100%">

## ✨ Funcionalidades

### Treino

- **Biblioteca de modelos prontos** — PPL, Upper/Lower, Full Body e Core & Cardio, prontos para copiar e ajustar
- **Editor detalhado** — séries, repetições, carga e descanso configuráveis **individualmente por série**
- **Execução em lista** — todos os exercícios visíveis, cada série marcada conforme você a completa
- **Coluna "anterior"** — o que você levantou da última vez, ali do lado, para saber se está progredindo
- **Cronômetro flutuante** — arraste para onde quiser, pause, adicione 15s ou pule. Vibra e apita quando zera
- **Progresso preservado** — saiu do app no meio do treino? O cronômetro continua e nada se perde

### Inteligência

- **Substituição de exercício** — máquina ocupada? O app sugere alternativas do mesmo grupo muscular, filtráveis pelo equipamento disponível
- **Progressão de carga** — quando você bate as repetições com folga por três treinos seguidos, o app avisa que é hora de subir o peso
- **Estimativa de calorias** — calculada por MET e peso corporal, com base nos grupos musculares trabalhados
- **Assistente com IA** — um chat que conhece seu histórico real e ajuda com execução, progressão e organização de treino

### Acompanhamento

- **Resumo pós-treino** — duração, volume, séries, calorias e detalhe por exercício, com detecção de recorde de volume
- **Nutrição e macros** — registro de refeições com metas de calorias, proteína, carboidrato e gordura
- **Suplementos e hidratação** — marcação diária e controle de água
- **Evolução corporal** — peso e medidas em gráficos ao longo do tempo
- **Backup e restauração** — exporte tudo em um arquivo e recupere quando trocar de aparelho

<img src="./.github/assets/readme-divider.gif" alt="" width="100%">

## 📲 Instalação

O Lift é um **PWA**: instala como app nativo no celular, sem loja e sem download.

| Plataforma | Como instalar |
|---|---|
| 🤖 **Android (Chrome)** | Menu `⋮` → **Adicionar à tela inicial** |
| 🍎 **iPhone (Safari)** | Compartilhar `□↑` → **Adicionar à Tela de Início** |

Depois de instalado, abre pelo ícone, em tela cheia e **funciona offline**.

<img src="./.github/assets/readme-divider.gif" alt="" width="100%">

## 🔒 Privacidade

Todos os dados ficam no `localStorage` do seu navegador. Nada é enviado para servidor nenhum, porque não existe servidor.

Isso tem duas consequências que vale entender:

- **A favor:** ninguém além de você tem acesso ao seu histórico. Nem eu.
- **Contra:** limpar os dados do navegador ou trocar de aparelho apaga tudo. Por isso existe o backup em **Ajustes → Backup dos seus dados** — use de vez em quando.

O assistente de IA é a única parte que acessa a internet, e só quando você o utiliza. A chave de API fica salva apenas no seu dispositivo e **não é incluída no arquivo de backup**.

<img src="./.github/assets/readme-divider.gif" alt="" width="100%">

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Interface | React 19 · Tailwind CSS 3 |
| Build | Vite 8 · vite-plugin-pwa |
| Rotas | React Router 7 |
| Animação | Framer Motion |
| Gráficos | Recharts |
| Ícones | Lucide |
| Dados | `localStorage` |

<img src="./.github/assets/readme-divider.gif" alt="" width="100%">

## 💻 Rodando localmente

```bash
git clone https://github.com/Henry-DevStack/Fit-App.git
cd Fit-App
npm install
npm run dev
```

Abre em `http://localhost:5173`.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Pré-visualiza o build |
| `npm run lint` | Verificação de código |

### Variáveis de ambiente

| Variável | Valores | O que faz |
|---|---|---|
| `VITE_DEMO_PUBLIC` | `true` / `false` | Com `true`, o aplicativo abre normalmente. Com `false` (ou ausente), exibe apenas a página de acesso restrito. |

Copie `.env.example` para `.env` e ajuste conforme necessário. Na Vercel, defina a variável em **Settings → Environment Variables** e refaça o deploy.

> O modo offline só funciona no build de produção sobre HTTPS — service workers não são registrados em `localhost` durante o desenvolvimento.

<img src="./.github/assets/readme-divider.gif" alt="" width="100%">

## 🗂️ Estrutura

```
src/
├── pages/        # uma tela por arquivo
├── components/   # UI reaproveitada
├── lib/          # lógica pura, sem React
└── data/         # catálogos fixos (exercícios, modelos)
```

A separação é proposital: `lib/` não sabe que React existe, então a lógica de negócio pode mudar sem tocar em nenhuma tela — e vice-versa.

<img src="./.github/assets/readme-divider.gif" alt="" width="100%">

## 🗺️ Próximos passos

- [ ] Gráfico de progressão por exercício
- [ ] Recordes pessoais por movimento
- [ ] Lembrete automático de backup
- [ ] Nova identidade visual

<img src="./.github/assets/readme-divider.gif" alt="" width="100%">

## 📄 Licença

Todos os direitos reservados. O código está público para consulta e portfólio, mas não é livre para reuso — veja [LICENSE](./LICENSE).

<div align="center">
<sub>Feito por <a href="https://github.com/Henry-DevStack">Henry</a></sub>
</div>
