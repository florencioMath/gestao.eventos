# 📚 Documentação do Portal Base

Bem-vindo à documentação do projeto! Esta pasta contém guias detalhados para todos os aspectos do desenvolvimento.

## 📖 Índice Completo

👉 **[Veja o Índice Completo](./INDEX.md)** - Navegação completa com tutoriais e busca rápida

## 📑 Guias Disponíveis

### 🚀 Início Rápido

- **[README Principal](../README.md)** - Visão geral do projeto

### 📘 Guias de Desenvolvimento

1. **[📜 Scripts Disponíveis](./SCRIPTS.md)**
    - Todos os comandos NPM
    - Desenvolvimento, build, qualidade de código
    - Geradores Gulp

2. **[📖 Guia de Páginas](./PAGES.md)**
    - Criar features com Gulp
    - Adicionar páginas a features
    - Estrutura de arquivos
    - Convenções de nomenclatura

3. **[🗺️ Guia de Rotas](./ROUTES.md)**
    - Sistema de rotas React Router v6
    - Layouts públicos e privados
    - Rotas com parâmetros
    - Navegação e proteção de rotas

4. **[🧩 Guia de Componentes](./COMPONENTS.md)**
    - Componentes Shadcn/ui
    - Criar componentes customizados
    - Usar ícones Lucide
    - Organização de componentes

5. **[🎨 Guia de Estilização](./STYLING.md)**
    - Tailwind CSS v4
    - Sistema de cores e tema
    - Dark mode
    - Responsividade

6. **[🔐 Sistema de Claims](./CLAIMS.md)**
    - Controle de acesso por permissões
    - Proteger rotas com ClaimGuard
    - Mostrar/esconder UI com `<Can>`
    - Hook `useClaims()` para verificações programáticas

## 🎯 Acesso Rápido

### Preciso fazer algo específico:

| O que fazer              | Onde encontrar                                         |
| ------------------------ | ------------------------------------------------------ |
| Criar nova página        | [Guia de Páginas](./PAGES.md) → Criar uma Nova Feature |
| Adicionar rota           | [Guia de Rotas](./ROUTES.md) → Adicionar Nova Rota     |
| Proteger rota por claim  | [Sistema de Claims](./CLAIMS.md) → Como proteger uma rota |
| Esconder botão por claim | [Sistema de Claims](./CLAIMS.md) → Como esconder um botão |
| Estilizar componente     | [Guia de Estilização](./STYLING.md) → Como Estilizar   |
| Usar componente Shadcn   | [Guia de Componentes](./COMPONENTS.md) → Shadcn/ui     |
| Ver comandos disponíveis | [Scripts](./SCRIPTS.md)                                |
| Configurar dark mode     | [Guia de Estilização](./STYLING.md) → Dark Mode        |

## 🚀 Fluxo de Trabalho Comum

### 1. Criar nova funcionalidade

```bash
# Criar feature
npm run generate:feature

# Adicionar mais páginas
npm run generate:page

# Ver estrutura
npm run list:features
```

📚 **Documentação:** [Guia de Páginas](./PAGES.md)

### 2. Estilizar páginas

```bash
# Adicionar componente Shadcn se necessário
npx shadcn@latest add button

# Usar classes Tailwind
# Consultar guia de estilização
```

📚 **Documentação:** [Guia de Estilização](./STYLING.md)

### 3. Criar componentes

📚 **Documentação:** [Guia de Componentes](./COMPONENTS.md)

### 4. Configurar rotas

📚 **Documentação:** [Guia de Rotas](./ROUTES.md)

## 📋 Estrutura dos Arquivos

Cada guia contém:

- ✅ **Visão Geral** - Explicação do conceito
- ✅ **Exemplos Práticos** - Código real com explicações
- ✅ **Passo a Passo** - Instruções detalhadas
- ✅ **Boas Práticas** - O que fazer e evitar
- ✅ **Solução de Problemas** - Erros comuns e soluções
- ✅ **Recursos Úteis** - Links para documentação externa

## 💡 Dicas de Uso

### Primeiro Acesso

1. Leia o [README Principal](../README.md)
2. Configure o ambiente
3. Execute `npm run dev`
4. Explore os [Scripts Disponíveis](./SCRIPTS.md)
5. Consulte os guias conforme necessário

### Desenvolvimento Diário

- Use os geradores Gulp para criar páginas
- Consulte [Guia de Estilização](./STYLING.md) ao estilizar
- Verifique [Guia de Componentes](./COMPONENTS.md) antes de criar novos

### Antes de Commitar

```bash
npm run lint:fix
npm run format
npm run type-check
```

## 🔗 Links Úteis

### Documentação Externa

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)

### Ferramentas

- [Tailwind Play](https://play.tailwindcss.com/)
- [OKLCH Color Picker](https://oklch.com/)
- [Lucide Icons](https://lucide.dev/)

## 🆘 Precisa de Ajuda?

1. 🔍 **Busque no Índice**: [INDEX.md](./INDEX.md)
2. 📖 **Leia o guia específico**
3. 💻 **Veja exemplos no código**
4. 🤝 **Pergunte ao time**

---

**Mantenha esta documentação atualizada!** ✨
