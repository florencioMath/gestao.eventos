# 📚 Índice da Documentação

Bem-vindo à documentação completa do Portal Base! Aqui você encontrará todos os guias necessários para trabalhar no projeto.

## 🗂️ Estrutura da Documentação

### 🚀 Primeiros Passos

1. **[README Principal](../README.md)** - Visão geral e início rápido
2. **[Scripts Disponíveis](./SCRIPTS.md)** - Comandos NPM e suas funcionalidades

### 🎯 Desenvolvimento

3. **[Guia de Páginas](./PAGES.md)** - Como criar novas páginas com Gulp
4. **[Guia de Rotas](./ROUTES.md)** - Sistema de rotas e navegação
5. **[Guia de Componentes](./COMPONENTS.md)** - Como criar e usar componentes
6. **[Guia de Estilização](./STYLING.md)** - Trabalhar com Tailwind CSS

## 🗺️ Guia Rápido por Tarefa

### 📄 Preciso criar uma nova página

1. Use o gerador: `npm run generate:page`
2. Consulte: [Guia de Páginas](./PAGES.md)

### 🎨 Preciso estilizar um componente

1. Consulte: [Guia de Estilização](./STYLING.md)
2. Veja classes disponíveis do Tailwind
3. Use componentes Shadcn/ui quando possível

### 🧩 Preciso criar um componente reutilizável

1. Consulte: [Guia de Componentes](./COMPONENTS.md)
2. Verifique se já existe no Shadcn/ui
3. Siga as convenções de nomenclatura

### 🗺️ Preciso adicionar uma nova rota

1. Use o gerador: `npm run generate:feature` ou `npm run generate:page`
2. Consulte: [Guia de Rotas](./ROUTES.md)
3. Registre no router central

### 🔧 Preciso saber quais comandos usar

1. Consulte: [Scripts Disponíveis](./SCRIPTS.md)
2. Use `npm run` para ver lista completa

## 📖 Guias Detalhados

### [📖 Guia de Páginas](./PAGES.md)

**O que você aprenderá:**

- ✅ Criar features completas com Gulp
- ✅ Adicionar páginas a features existentes
- ✅ Entender a estrutura de arquivos gerada
- ✅ Registrar rotas no projeto
- ✅ Convenções de nomenclatura

**Comandos principais:**

- `npm run generate:feature`
- `npm run generate:page`
- `npm run list:features`

---

### [🗺️ Guia de Rotas](./ROUTES.md)

**O que você aprenderá:**

- ✅ Como funciona o React Router v6
- ✅ Diferença entre rotas públicas e privadas
- ✅ Layouts e como usá-los
- ✅ Rotas com parâmetros
- ✅ Rotas aninhadas
- ✅ Navegação programática
- ✅ Proteção de rotas

**Conceitos importantes:**

- PublicLayout vs PrivateLayout
- Estrutura de features e rotas
- Outlet e navegação

---

### [🧩 Guia de Componentes](./COMPONENTS.md)

**O que você aprenderá:**

- ✅ Usar componentes Shadcn/ui
- ✅ Adicionar novos componentes Shadcn
- ✅ Criar componentes customizados
- ✅ Componentes com variantes (CVA)
- ✅ Componentes de formulário
- ✅ Usar ícones Lucide
- ✅ Onde criar componentes (globais vs feature)

**Biblioteca de componentes:**

- Button, Input, Dialog, Select, etc.
- Ícones Lucide React
- Componentes de layout

---

### [🎨 Guia de Estilização](./STYLING.md)

**O que você aprenderá:**

- ✅ Sistema de cores do projeto
- ✅ Dark mode
- ✅ Classes utilitárias Tailwind
- ✅ Sistema de espaçamento
- ✅ Border radius customizado
- ✅ Animações
- ✅ Responsividade
- ✅ Customizar o tema

**Tecnologias:**

- Tailwind CSS v4
- CSS Variables
- OKLCH colors
- tw-animate-css

---

### [📜 Scripts Disponíveis](./SCRIPTS.md)

**Comandos por categoria:**

**Desenvolvimento:**

- `npm run dev` - Dev server
- `npm run build` - Build produção
- `npm run preview` - Preview build

**Geradores:**

- `npm run generate:feature` - Nova feature
- `npm run generate:page` - Nova página
- `npm run list:features` - Listar features

**Qualidade:**

- `npm run lint` - Verificar código
- `npm run lint:fix` - Corrigir automaticamente
- `npm run format` - Formatar código
- `npm run type-check` - Verificar tipos

---

## 🎓 Tutoriais Passo a Passo

### Tutorial 1: Criar um CRUD Completo

```bash
# 1. Criar feature
npm run generate:feature
# Nome: produtos

# 2. Criar página de listagem
npm run generate:page
# Feature: produtos, Nome: listar-produtos

# 3. Criar página de criação
npm run generate:page
# Feature: produtos, Nome: criar-produto

# 4. Criar página de edição
npm run generate:page
# Feature: produtos, Nome: editar-produto

# 5. Registrar rotas em src/routes/index.tsx
```

**Documentos relacionados:**

- [Guia de Páginas](./PAGES.md)
- [Guia de Rotas](./ROUTES.md)

---

### Tutorial 2: Estilizar uma Página

```bash
# 1. Abrir página gerada
# src/features/produtos/routes/listar-produtos/page.tsx

# 2. Adicionar estrutura com Tailwind
# Consultar Guia de Estilização

# 3. Adicionar componentes Shadcn se necessário
npx shadcn@latest add card

# 4. Usar componentes e classes
```

**Documentos relacionados:**

- [Guia de Estilização](./STYLING.md)
- [Guia de Componentes](./COMPONENTS.md)

---

### Tutorial 3: Criar um Componente Reutilizável

```bash
# 1. Criar arquivo do componente
# src/components/product-card.tsx

# 2. Implementar com TypeScript
# Tipar props, usar Tailwind

# 3. Exportar e usar em páginas
```

**Documentos relacionados:**

- [Guia de Componentes](./COMPONENTS.md)
- [Guia de Estilização](./STYLING.md)

---

## 🔍 Busca Rápida

### Como fazer X?

| Tarefa                      | Documento                      | Seção                       |
| --------------------------- | ------------------------------ | --------------------------- |
| Criar nova página           | [Páginas](./PAGES.md)          | Criar uma Nova Feature      |
| Adicionar rota              | [Rotas](./ROUTES.md)           | Adicionar Nova Rota         |
| Estilizar componente        | [Estilização](./STYLING.md)    | Como Estilizar Componentes  |
| Adicionar componente Shadcn | [Componentes](./COMPONENTS.md) | Componentes Shadcn/ui       |
| Usar ícones                 | [Componentes](./COMPONENTS.md) | Ícones                      |
| Configurar dark mode        | [Estilização](./STYLING.md)    | Dark Mode                   |
| Proteger rota               | [Rotas](./ROUTES.md)           | Proteção de Rotas           |
| Criar formulário            | [Componentes](./COMPONENTS.md) | Componentes com Formulários |
| Fazer build                 | [Scripts](./SCRIPTS.md)        | Desenvolvimento             |

---

## 📚 Recursos Externos

### Documentação Oficial

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

### Ferramentas Úteis

- [Tailwind Play](https://play.tailwindcss.com/) - Playground Tailwind
- [OKLCH Color Picker](https://oklch.com/) - Escolher cores
- [React DevTools](https://react.dev/learn/react-developer-tools) - Debug React
- [TypeScript Playground](https://www.typescriptlang.org/play) - Testar TypeScript

---

## 💡 Dicas e Boas Práticas

### ✅ Faça

- Use os geradores Gulp para criar páginas
- Siga as convenções de nomenclatura
- Use componentes Shadcn/ui quando disponível
- Consulte a documentação antes de perguntar
- Mantenha componentes pequenos e focados
- Use TypeScript corretamente (sem `any`)
- Formate o código antes de commitar

### ❌ Evite

- Criar arquivos manualmente sem necessidade
- Duplicar código entre componentes
- Usar estilos inline desnecessariamente
- Criar rotas hardcoded (use as constantes)
- Ignorar erros do TypeScript
- Commitar código não formatado

---

## 🆘 Precisa de Ajuda?

### Fluxo de Resolução

1. **Consulte a documentação**
    - Verifique o índice acima
    - Leia o guia específico

2. **Veja exemplos no código**
    - Features existentes: `auth`, `home`
    - Componentes em `src/components/`

3. **Verifique erros comuns**
    - Cada guia tem seção "Solução de Problemas"

4. **Consulte recursos externos**
    - Documentação oficial das bibliotecas

5. **Pergunte ao time**
    - Com contexto do que já tentou

---

## 🔄 Manter Documentação Atualizada

A documentação deve evoluir com o projeto:

- ✅ Adicione novos guias quando necessário
- ✅ Atualize exemplos quando mudar código
- ✅ Documente padrões específicos do projeto
- ✅ Mantenha screenshots atualizados

---

## 📋 Checklist do Desenvolvedor

### Ao Começar

- [ ] Li o README principal
- [ ] Entendi a estrutura do projeto
- [ ] Configurei meu ambiente
- [ ] Rodei `npm install`
- [ ] Testei `npm run dev`

### Antes de Desenvolver

- [ ] Consultei a documentação relevante
- [ ] Entendi a feature que vou trabalhar
- [ ] Verifiquei se componentes necessários existem

### Antes de Commitar

- [ ] Executei `npm run lint:fix`
- [ ] Executei `npm run format`
- [ ] Executei `npm run type-check`
- [ ] Testei minhas alterações
- [ ] Revisei o código

---

**Última atualização:** Dezembro 2024

**Versão da documentação:** 1.0.0
