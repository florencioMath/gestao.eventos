# Portal Base

> Portal base modular desenvolvido com React, TypeScript e Vite

## 📋 Acesso por Mocks

/**
 * Usuários mockados para teste do sistema de claims/funcionalidades.
 * As árvores `funcionalidadesAdministrador|Gestor|Operador` são reutilizadas
 * pelo mock da API de segurança (`seguranca-mock-api.ts`) nas telas de cadastro.
 *
 * | Login              | Senha  | Perfil          | Acesso resumido                                      |
 * |--------------------|--------|-----------------|------------------------------------------------------|
 * | admin@teste.com    | 123456 | Administrador   | Eventos (painel + eventos) + Segurança (completo)    |
 * | gestor@teste.com   | 123456 | Gestor          | Eventos (completo) + Segurança (usuários/perfis view)|
 * | operador@teste.com | 123456 | Operador        | Eventos (painel + eventos, sem excluir)              |
 */

## 📋 Visão Geral

Este é um projeto base para desenvolvimento de portais web, utilizando uma arquitetura modular baseada em features. Cada funcionalidade é organizada de forma independente, facilitando a manutenção e escalabilidade da aplicação.

## 🚀 Tecnologias Principais

- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server
- **React Router v6** - Gerenciamento de rotas
- **Tailwind CSS v4** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e não estilizados
- **Shadcn/ui** - Componentes prontos baseados em Radix UI

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── ui/          # Componentes Shadcn/ui
│   ├── layout/      # Componentes de layout (navbar, footer)
│   └── providers/   # Context providers
├── features/         # Features da aplicação (cada uma com suas rotas)
├── layouts/          # Layouts compartilhados (público e privado)
├── routes/           # Configuração central de rotas
├── lib/              # Utilitários e helpers
└── config/           # Configurações da aplicação
```

## 🏃 Início Rápido

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📚 Documentação Completa

A documentação está organizada em arquivos específicos para facilitar a consulta:

- **[📖 Guia de Páginas](./docs/PAGES.md)** - Como criar novas páginas com Gulp
- **[🎨 Guia de Estilização](./docs/STYLING.md)** - Como trabalhar com Tailwind CSS
- **[🧩 Guia de Componentes](./docs/COMPONENTS.md)** - Como criar e usar componentes
- **[🗺️ Guia de Rotas](./docs/ROUTES.md)** - Sistema de rotas e navegação
- **[📜 Scripts Disponíveis](./docs/SCRIPTS.md)** - Lista completa de comandos NPM

## 🎯 Comandos Mais Usados

```bash
# Desenvolvimento
npm run dev                 # Iniciar servidor de desenvolvimento

# Geradores (Gulp)
npm run generate:feature    # Criar nova feature completa
npm run generate:page       # Criar nova página em uma feature
npm run list:features       # Listar features e páginas existentes

# Qualidade de Código
npm run lint               # Verificar código
npm run format             # Formatar código
npm run type-check         # Verificar tipos TypeScript
```

## 🤝 Contribuindo

Este projeto segue padrões específicos de código e commits. Consulte a documentação para mais detalhes:

- Commits: [Conventional Commits](https://www.conventionalcommits.org/) em PT-BR
- Código: Seguindo as regras do ESLint e Prettier configurados

## 📝 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ pelo time de desenvolvimento**
