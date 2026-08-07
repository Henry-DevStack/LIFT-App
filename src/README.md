# Estrutura do código

Guia rápido de onde fica cada coisa. A regra geral: **cada pasta tem uma
responsabilidade só**, e a dúvida "onde eu coloco isso?" deve ter uma
resposta óbvia.

```
src/
├── App.jsx           decide entre a landing e a aplicação
├── AppRoutes.jsx     rotas e navegação inferior
├── main.jsx          ponto de entrada
│
├── pages/            uma tela por arquivo
│   └── settings/     sub-telas de configuração
│
├── components/
│   ├── ui/           elementos visuais genéricos, sem regra de negócio
│   ├── layout/       estrutura e navegação da tela
│   └── widgets/      blocos de funcionalidade completos
│
├── hooks/            lógica de estado reutilizável
├── services/         tudo que fala com o "mundo externo"
├── utils/            funções puras de cálculo e regra de negócio
├── data/             catálogos fixos
└── assets/           imagens
```

## A distinção mais importante: services × utils

**services/** = a função lê ou escreve algo fora dela: `localStorage`,
rede, DOM. Trocar a implementação afeta o resto do app.

| Arquivo | O que faz |
|---|---|
| `storage.js` | Toda leitura e escrita de dados. Nenhuma tela acessa o `localStorage` direto. |
| `chat.js` | Integração com APIs de LLM e montagem do contexto do usuário. |
| `backup.js` | Exportação e restauração de dados em JSON. |
| `auth.js` | Sessão local (sem senha, sem servidor). |
| `theme.js` | Cor de destaque, aplicada em variáveis CSS. |

**utils/** = a função recebe dados e devolve resultado. Sem efeito
colateral, fácil de testar isoladamente.

| Arquivo | O que faz |
|---|---|
| `stats.js` | Agregações: séries, volume, repetições e calorias por data. |
| `calories.js` | Estimativa de gasto calórico por MET. |
| `gymBro.js` | Decide quando sugerir aumento de carga. |
| `motivation.js` | Escolhe a mensagem do resumo conforme o desempenho. |

## Como decidir onde colocar um arquivo novo

1. É uma tela inteira? → `pages/`
2. É um pedaço de tela usado em mais de um lugar?
   - Só visual, sem regra de negócio? → `components/ui/`
   - Estrutura ou navegação? → `components/layout/`
   - Bloco de funcionalidade? → `components/widgets/`
3. É lógica de estado com `useState`/`useEffect` reaproveitável? → `hooks/`
4. É função que acessa armazenamento, rede ou DOM? → `services/`
5. É função pura de cálculo? → `utils/`
6. É uma lista fixa que não muda em execução? → `data/`

## Onde mexer para cada tipo de mudança

| Se você quiser… | Vá em |
|---|---|
| Mudar cores, fontes ou arredondamento | `tailwind.config.js` |
| Adicionar uma tela nova | criar em `pages/` e registrar em `AppRoutes.jsx` |
| Mudar o cálculo de calorias | `utils/calories.js` |
| Ajustar quando a dica de carga aparece | `utils/gymBro.js` |
| Adicionar exercícios às sugestões de troca | `data/exerciseDatabase.js` |
| Corrigir classificação de grupo muscular | `data/exerciseVisuals.js` |
| Mudar a personalidade do assistente | `services/chat.js` (`SYSTEM_PROMPT`) |
| Adicionar um provedor de IA | `services/chat.js` (catálogo `PROVIDERS`) |
| Guardar um novo tipo de dado | `services/storage.js` |
| Adicionar modelos de treino prontos | `data/workoutTemplates.js` |
| Adicionar uma medida corporal | `pages/EvolutionPage.jsx` (lista `METRICS`) |
