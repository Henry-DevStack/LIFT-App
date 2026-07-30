# Como colocar o Fit App no ar de graça (com link pro celular)

Esse app é 100% front-end (roda no navegador, guarda os dados no seu
aparelho), então dá pra hospedar de graça em qualquer serviço de sites
estáticos. Ele já usa `HashRouter` (os links têm um `#` no meio), então
não precisa de nenhuma configuração especial de servidor — evita o
problema clássico de "página não encontrada" ao recarregar uma rota.

Abaixo, o caminho mais simples: **Vercel**, importando direto do GitHub.
Totalmente gratuito pro seu uso.

## Passo 1 — Colocar o código no GitHub

1. Crie uma conta grátis em https://github.com (se ainda não tiver).
2. Clique em **New repository**, dê um nome (ex: `fit-app`), deixe como
   **Private** ou **Public** (tanto faz) e clique em **Create repository**.
3. Na página do repositório vazio, clique no link **uploading an existing
   file** (ou arraste os arquivos direto).
4. Extraia o `fit-app.zip` no seu computador e arraste **todo o conteúdo
   da pasta** (não o zip, o conteúdo já extraído) pra essa área do GitHub.
5. Clique em **Commit changes** lá embaixo.

## Passo 2 — Publicar na Vercel (grátis)

1. Vá em https://vercel.com e clique em **Sign Up** → entre com sua conta
   do GitHub (mais rápido, autoriza o acesso).
2. No painel, clique em **Add New → Project**.
3. Selecione o repositório `fit-app` que você acabou de criar e clique em
   **Import**.
4. A Vercel já detecta que é um projeto **Vite** automaticamente — não
   precisa mudar nada nas configurações de build.
5. Clique em **Deploy** e espere 1–2 minutinhos.
6. Pronto! Você recebe um link tipo `https://fit-app-seunome.vercel.app`
   — esse é o link que você abre no celular.

Toda vez que você (ou eu, te mandando os arquivos atualizados) subir uma
mudança nova pro GitHub, a Vercel republica sozinha automaticamente.

## Passo 3 — Deixar com cara de app no celular

O app já vem com ícone e configuração de "instalar na tela inicial"
prontos (manifest.json + ícones). Depois de abrir o link no celular:

**Android (Chrome):** toque nos 3 pontinhos → **Adicionar à tela
inicial** (ou vai aparecer um banner automático sugerindo instalar).

**iPhone (Safari):** toque no ícone de compartilhar (quadrado com seta
pra cima) → **Adicionar à Tela de Início**.

Isso cria um ícone igual a um app de verdade, abre em tela cheia sem a
barra do navegador, e os dados continuam salvos no aparelho normalmente.

## Alternativa ainda mais rápida (sem GitHub)

Se quiser algo pra testar rapidinho sem criar conta em lugar nenhum,
existe o **Netlify Drop** (https://app.netlify.com/drop) — mas ele exige
que a pasta já esteja "buildada" (a pasta `dist/` gerada por
`npm run build`), então você precisaria rodar isso no seu computador
primeiro:

```
npm install
npm run build
```

E depois arrastar a pasta `dist` gerada pro site do Netlify Drop. Ele te
dá um link na hora, sem precisar de conta. É ótimo pra um teste rápido,
mas o link muda toda vez que você arrasta de novo — pra algo permanente,
o caminho da Vercel (Passo 1 e 2) é melhor.
