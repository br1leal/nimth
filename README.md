# Nimth

Ficha de cadastro do paciente, com personagens que acolhem cada emoção.
Feito com **Next.js 16 + React 19 + TypeScript**. Sem banco de dados por enquanto (o envio do form é simulado).

## Rodar no computador (localhost)

Precisa do **Node.js 20 ou mais novo** (https://nodejs.org).

```bash
npm install      # só na primeira vez ou quando package.json mudar
npm run dev      # abre em http://localhost:3000
```

Para testar no celular na mesma rede Wi-Fi: `npm run dev -- -H 0.0.0.0` e abra no celular `http://IP-DO-COMPUTADOR:3000`.

No computador o app aparece dentro de uma moldura de celular; no celular ocupa a tela toda.

## Estrutura

```
public/chars/                    PNGs dos personagens (fundo transparente)
src/app/layout.tsx               fontes (Young Serif, Inter, IBM Plex Mono, Caveat) e metadados
src/app/globals.css              tokens de cor, tipografia e todo o visual
src/app/page.tsx                 página inicial
src/app/icon.png                 ícone da aba
src/components/PatientForm.tsx   marcação da intro e do form
src/lib/nimbo/cast.ts            elenco: poses, rosto, cores e motivos de cada emoção
src/lib/nimbo/engine.ts          motor das animações (olhos, pálpebras, membros, reações, arraste)
```

## Fluxo de atualização

A cada alteração chega um `src.zip`. Substitua a pasta `src` inteira pelo conteúdo do zip.
Se a alteração mexer em personagens ou dependências, o aviso vem junto e o zip traz também `public/` ou `package.json`.

## Publicar (GitHub + Vercel)

1. Crie um repositório vazio no GitHub (`nimth`), sem README.
2. Na pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "Nimth: ficha de cadastro"
   git branch -M main
   git remote add origin https://github.com/br1leal/nimth.git
   git push -u origin main
   ```
3. Em https://vercel.com → **Add New… → Project** → importe o repositório. A Vercel detecta Next.js sozinha; é só clicar em **Deploy**.
4. Depois disso, cada `git push` publica uma nova versão automaticamente.

Para mandar uma atualização:

```bash
git add .
git commit -m "descrição da mudança"
git push
```
