# Sistema de Rotas - React Router v6

## 📁 Estrutura

```
src/
├── routes/
│   └── index.tsx           # Configuração central do router
├── layouts/
│   ├── public-layout.tsx   # Layout para páginas públicas
│   └── private-layout.tsx  # Layout para páginas privadas
└── features/
    ├── auth/
    │   ├── routes.tsx      # Rotas da feature auth
    │   └── page.tsx
    └── home/
        ├── routes.tsx      # Rotas da feature home
        └── page.tsx
```

## 🚀 Como Adicionar uma Nova Tela

### Passo 1: Criar a estrutura da feature

Crie uma nova pasta em `src/features/` com o nome da sua feature:

```
src/features/minha-feature/
```

### Passo 2: Criar o componente da página

Crie o arquivo `page.tsx` dentro da pasta da feature:

```tsx
// src/features/minha-feature/page.tsx
export const MinhaFeaturePage = () => {
	return (
		<div>
			<h1>Minha Feature</h1>
			<p>Conteúdo da página aqui</p>
		</div>
	);
};
```

### Passo 3: Criar o arquivo de rotas

Crie o arquivo `routes.tsx` dentro da pasta da feature:

```tsx
// src/features/minha-feature/routes.tsx
import { RouteObject } from 'react-router-dom';
import { MinhaFeaturePage } from './page';

export const minhaFeatureRoutes: RouteObject[] = [
	{
		path: '/minha-feature',
		element: <MinhaFeaturePage />,
	},
];
```

### Passo 4: Registrar as rotas no router central

Abra o arquivo `src/routes/index.tsx` e:

1. Importe as rotas da sua feature:

```tsx
import { minhaFeatureRoutes } from '../features/minha-feature/routes';
```

2. Adicione as rotas no layout apropriado:
    - **Públicas** (não requer autenticação): adicione em `PublicLayout`
    - **Privadas** (requer autenticação): adicione em `PrivateLayout`

```tsx
// Para rotas privadas (exemplo mais comum):
{
  element: <PrivateLayout />,
  children: [
    ...homeRoutes,
    ...minhaFeatureRoutes, // 👈 Adicione aqui
  ],
}

// Para rotas públicas:
{
  element: <PublicLayout />,
  children: [
    ...authRoutes,
    ...minhaFeatureRoutes, // 👈 Ou adicione aqui
  ],
}
```

## 📋 Convenções e Boas Práticas

### Nomenclatura

- **Pasta da feature**: `kebab-case` (ex: `user-profile`, `order-management`)
- **Componente da página**: `PascalCase` + sufixo `Page` (ex: `UserProfilePage`)
- **Arquivo de rotas**: sempre `routes.tsx`
- **Export das rotas**: nome da feature + sufixo `Routes` (ex: `userProfileRoutes`)

### Organização de Rotas

**Use PublicLayout para:**

- ✅ Login
- ✅ Registro
- ✅ Recuperação de senha
- ✅ Páginas de erro públicas
- ✅ Landing pages

**Use PrivateLayout para:**

- ✅ Dashboard
- ✅ Perfil de usuário
- ✅ Configurações
- ✅ Funcionalidades que requerem autenticação

### Múltiplas Rotas na Mesma Feature

Você pode definir várias rotas no mesmo arquivo `routes.tsx`:

```tsx
export const userRoutes: RouteObject[] = [
	{
		path: '/users',
		element: <UsersListPage />,
	},
	{
		path: '/users/:id',
		element: <UserDetailsPage />,
	},
	{
		path: '/users/:id/edit',
		element: <UserEditPage />,
	},
];
```

### Rotas Aninhadas (Nested Routes)

Para criar sub-rotas com layouts específicos:

```tsx
export const dashboardRoutes: RouteObject[] = [
	{
		path: '/dashboard',
		element: <DashboardLayout />, // Layout específico do dashboard
		children: [
			{
				index: true, // Rota padrão: /dashboard
				element: <DashboardHomePage />,
			},
			{
				path: 'analytics', // Rota: /dashboard/analytics
				element: <AnalyticsPage />,
			},
			{
				path: 'settings', // Rota: /dashboard/settings
				element: <SettingsPage />,
			},
		],
	},
];
```

### Parâmetros de Rota

Use `:` para definir parâmetros dinâmicos:

```tsx
{
  path: '/products/:productId',
  element: <ProductDetailsPage />,
}
```

## 📚 Recursos Úteis

- [Documentação Oficial React Router v6](https://reactrouter.com/)
- [Guia de Migração v5 → v6](https://reactrouter.com/docs/en/v6/upgrading/v5)
- [Exemplos de Código](https://github.com/remix-run/react-router/tree/main/examples)
