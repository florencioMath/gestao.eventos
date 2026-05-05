# 📜 Scripts Disponíveis

Lista completa de todos os comandos NPM disponíveis no projeto.

## 🚀 Desenvolvimento

### `npm run dev`

Inicia o servidor de desenvolvimento com Hot Module Replacement (HMR).

```bash
npm run dev
```

**Características:**

- ⚡ Vite dev server ultra-rápido
- 🔥 Hot Module Replacement (HMR)
- 🔄 Recarregamento automático ao salvar arquivos
- 🌐 Geralmente roda em `http://localhost:5173`

**Quando usar:**

- Desenvolvimento diário
- Testar alterações em tempo real

---

### `npm run build`

Cria a build de produção otimizada.

```bash
npm run build
```

**Processo:**

1. Verifica tipos TypeScript (`tsc -b`)
2. Cria bundle otimizado com Vite
3. Gera arquivos na pasta `dist/`

**Otimizações incluídas:**

- ✂️ Tree shaking
- 📦 Code splitting
- 🗜️ Minificação
- 🖼️ Otimização de assets

**Quando usar:**

- Antes de fazer deploy
- Para testar performance de produção

---

### `npm run preview`

Visualiza a build de produção localmente.

```bash
npm run preview
```

**Pré-requisito:** Execute `npm run build` antes.

**Quando usar:**

- Testar a build de produção localmente
- Verificar se tudo funciona após o build

---

## 🎨 Geradores (Gulp)

### `npm run generate:feature`

Cria uma nova feature completa com estrutura de rotas.

```bash
npm run generate:feature
```

**O que faz:**

- 📁 Cria pasta da feature em `src/features/`
- 📄 Cria arquivo `index.ts` com exportações
- 🔧 Cria `api/service.ts` com métodos CRUD
- 📝 Cria `types/index.d.ts` com tipos TypeScript
- 🎨 Cria `components/[feature]-card.tsx` (opcional)
- 🗺️ Cria estrutura de rotas
- 📄 Cria página principal
- ⚙️ Configura rota principal

**Interativo:** Faz perguntas sobre nome, rota, título, tipo de API e componente.

**Documentação:** [Guia de Páginas](./PAGES.md)

---

### `npm run generate:page`

Adiciona uma nova página a uma feature existente.

```bash
npm run generate:page
```

**O que faz:**

- 📄 Cria componente da página (`page.tsx`)
- ⚙️ Cria configuração da rota (`route.tsx`)
- 📁 Organiza na estrutura da feature

**Interativo:** Permite escolher a feature e configurar a página.

**Documentação:** [Guia de Páginas](./PAGES.md)

---

### `npm run list:features`

Lista todas as features e páginas existentes.

```bash
npm run list:features
```

**Exemplo de saída:**

```
📦 Features disponíveis:

   • auth
     └─ sign-in
     └─ sign-up
   • home
     └─ home
   • produtos
     └─ produtos
     └─ listar-produtos
```

**Quando usar:**

- Ver estrutura do projeto
- Verificar features existentes antes de criar novas

---

### `npm run generate`

Exibe ajuda dos geradores.

```bash
npm run generate
```

**Mostra:**

- Lista de comandos disponíveis
- Descrição de cada gerador

---

## 🧹 Qualidade de Código

### `npm run lint`

Executa o ESLint para verificar problemas no código.

```bash
npm run lint
```

**Verifica:**

- ❌ Erros de sintaxe
- ⚠️ Problemas de estilo
- 🔍 Más práticas
- 📏 Conformidade com regras

**Arquivos verificados:**

- `**/*.{js,jsx,ts,tsx}`

**Quando usar:**

- Antes de commitar
- Verificar qualidade do código
- Durante code review

---

### `npm run lint:fix`

Executa o ESLint e **corrige** problemas automaticamente.

```bash
npm run lint:fix
```

**O que faz:**

- 🔧 Corrige problemas de formatação
- 🔧 Aplica regras de estilo
- 🔧 Organiza imports
- ⚠️ Avisa sobre problemas que não podem ser corrigidos automaticamente

**Quando usar:**

- Antes de commitar
- Depois de escrever muito código

---

### `npm run format`

Formata todo o código com Prettier.

```bash
npm run format
```

**Formata:**

- JavaScript/TypeScript
- JSON
- CSS
- Markdown

**Arquivos:** `**/*.{js,jsx,ts,tsx,json,css,md}`

**O que faz:**

- ✨ Aplica formatação consistente
- 📏 Ajusta indentação
- 🔧 Organiza código
- 📝 Formata strings e comentários

**Quando usar:**

- Antes de commitar
- Periodicamente para manter consistência

---

### `npm run format:check`

Verifica se o código está formatado corretamente (sem modificar).

```bash
npm run format:check
```

**Útil para:**

- ✅ CI/CD pipelines
- ✅ Pre-commit hooks
- ✅ Validação antes de push

**Retorna:**

- ✅ Exit code 0 se tudo OK
- ❌ Exit code 1 se há arquivos não formatados

---

### `npm run type-check`

Verifica tipos TypeScript sem gerar build.

```bash
npm run type-check
```

**O que verifica:**

- 🔍 Erros de tipo
- 🔍 Incompatibilidades de interface
- 🔍 Propriedades faltando
- 🔍 Tipos incorretos

**Quando usar:**

- Verificar tipos sem fazer build
- CI/CD pipelines
- Antes de commitar

---

## 🔄 Workflow Recomendado

### Desenvolvimento Diário

```bash
# 1. Iniciar dev server
npm run dev

# 2. Durante desenvolvimento, periodicamente:
npm run lint:fix
npm run format

# 3. Antes de commitar:
npm run type-check
npm run lint
npm run format:check
```

### Criar Nova Feature

```bash
# 1. Criar feature
npm run generate:feature

# 2. Adicionar páginas
npm run generate:page

# 3. Ver estrutura
npm run list:features

# 4. Desenvolver
npm run dev
```

### Antes de Deploy

```bash
# 1. Verificar tipos
npm run type-check

# 2. Verificar lint
npm run lint

# 3. Verificar formatação
npm run format:check

# 4. Build
npm run build

# 5. Testar build
npm run preview
```

---

## ⚙️ Scripts Personalizados

Você pode adicionar scripts personalizados no `package.json`:

```json
{
	"scripts": {
		"test": "vitest",
		"test:ui": "vitest --ui",
		"analyze": "vite-bundle-visualizer"
	}
}
```

## 📝 Aliases

Você pode criar aliases no seu terminal para comandos frequentes:

### Bash/Zsh

```bash
# Adicione ao ~/.bashrc ou ~/.zshrc
alias nrd="npm run dev"
alias nrb="npm run build"
alias nrl="npm run lint:fix"
alias nrf="npm run format"
alias nrgf="npm run generate:feature"
alias nrgp="npm run generate:page"
```

### PowerShell

```powershell
# Adicione ao $PROFILE
function nrd { npm run dev }
function nrb { npm run build }
function nrl { npm run lint:fix }
function nrf { npm run format }
function nrgf { npm run generate:feature }
function nrgp { npm run generate:page }
```

---

## 🚨 Solução de Problemas

### "command not found"

**Problema:** NPM não encontrado.

**Solução:**

```bash
# Verificar se Node.js está instalado
node --version

# Reinstalar dependências
npm install
```

### Build falha

**Problema:** Erros durante build.

**Solução:**

```bash
# Limpar cache
rm -rf node_modules dist
npm install

# Verificar tipos
npm run type-check

# Verificar lint
npm run lint
```

### Dev server não inicia

**Problema:** Porta já em uso.

**Solução:**

```bash
# Usar porta diferente
PORT=3001 npm run dev

# Ou matar processo na porta 5173
# Linux/Mac
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 📚 Recursos Úteis

- [NPM Docs](https://docs.npmjs.com/)
- [Vite Docs](https://vitejs.dev/)
- [ESLint Docs](https://eslint.org/)
- [Prettier Docs](https://prettier.io/)
- [TypeScript Docs](https://www.typescriptlang.org/)

---

## 📚 Próximos Passos

- [📖 Guia de Páginas](./PAGES.md) - Crie novas páginas
- [🧩 Guia de Componentes](./COMPONENTS.md) - Crie componentes
- [🎨 Guia de Estilização](./STYLING.md) - Estilize sua aplicação
- [🗺️ Guia de Rotas](./ROUTES.md) - Configure rotas
