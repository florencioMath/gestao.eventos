# 🗺️ Guia de Rotas

Este guia explica como funciona o sistema de rotas do projeto usando React Router v6.

## 🎯 Visão Geral

O projeto utiliza uma arquitetura modular de rotas baseada em **features**. Cada feature gerencia suas próprias rotas, facilitando a manutenção e escalabilidade.

## ⚡ Início Rápido

Quer criar uma nova página ou feature? Use os **geradores Gulp**:

```bash
# Criar nova feature completa
npm run generate:feature

# Adicionar página a feature existente
npm run generate:page

# Listar todas as features
npm run list:features
```

> 💡 **Os geradores automatizam toda a criação de rotas, garantindo consistência e seguindo as convenções do projeto.**
>
> 📚 Veja mais detalhes na seção [🚀 Adicionar Nova Rota](#-adicionar-nova-rota)

## 📁 Estrutura de Rotas

```
src/
├── routes/
│   ├── index.tsx           # Configuração central do router
│   └── README.md           # Documentação de rotas
├── layouts/
│   ├── public-layout.tsx   # Layout para páginas públicas
│   └── private-layout.tsx  # Layout para páginas privadas (autenticadas)
└── features/
    ├── auth/
    │   └── routes/
    │       ├── routes.tsx  # Exporta rotas da feature auth
    │       ├── sign-in/
    │       │   ├── page.tsx
    │       │   └── route.tsx
    │       └── sign-up/
    │           ├── page.tsx
    │           └── route.tsx
    └── home/
        └── routes/
            ├── routes.ts   # Exporta rotas da feature home
            └── home/
                ├── page.tsx
                └── route.tsx
```

## 🔧 Como Funciona

### 1. Configuração Central (src/routes/index.tsx)

Este é o arquivo principal que configura o React Router:

```typescript
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@/layouts/public-layout';
import { PrivateLayout } from '@/layouts/private-layout';
import { authRoutes } from '@/features/auth';
import { homeRoutes } from '@/features/home';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [...authRoutes],
  },
  {
    element: <PrivateLayout />,
    children: [...homeRoutes],
  },
]);
```

### 2. Layouts

#### PublicLayout (Páginas Públicas)

Usado para páginas que **não** requerem autenticação:

```tsx
// src/layouts/public-layout.tsx
import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
	return (
		<div>
			{/* Header público (se houver) */}
			<Outlet /> {/* Páginas públicas renderizam aqui */}
			{/* Footer público (se houver) */}
		</div>
	);
};
```

**Páginas que usam PublicLayout:**

- Login
- Cadastro
- Recuperação de senha
- Landing pages

#### PrivateLayout (Páginas Privadas)

Usado para páginas que **requerem** autenticação:

```tsx
// src/layouts/private-layout.tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const PrivateLayout = () => {
	return (
		<div>
			<Navbar />
			<main>
				<Outlet /> {/* Páginas privadas renderizam aqui */}
			</main>
			<Footer />
		</div>
	);
};
```

**Páginas que usam PrivateLayout:**

- Dashboard
- Perfil
- Configurações
- Funcionalidades internas

### 3. Estrutura de uma Feature

Cada feature possui sua própria estrutura de rotas:

```
features/produtos/
├── index.ts                    # Exporta as rotas
├── routes/
│   ├── routes.tsx              # Define array de rotas
│   ├── listar-produtos/
│   │   ├── page.tsx            # Componente da página
│   │   └── route.tsx           # Configuração da rota
│   └── editar-produto/
│       ├── page.tsx
│       └── route.tsx
└── components/                 # Componentes da feature (opcional)
    └── product-card.tsx
```

#### index.ts (Ponto de Entrada)

```typescript
// features/produtos/index.ts
export { produtosRoutes } from './routes/routes';
```

#### routes.tsx (Configuração de Rotas)

```typescript
// features/produtos/routes/routes.tsx
import type { RouteObject } from 'react-router-dom';
import { listarProdutosRoute } from './listar-produtos/route';
import { editarProdutoRoute } from './editar-produto/route';

export const produtosRoutes: RouteObject[] = [listarProdutosRoute, editarProdutoRoute];
```

#### route.tsx (Definição Individual)

```typescript
// features/produtos/routes/listar-produtos/route.tsx
import type { RouteObject } from 'react-router-dom';
import { ListarProdutosPage } from './page';

export const listarProdutosPath = '/produtos';
export const listarProdutosRoute: RouteObject = {
  path: listarProdutosPath,
  element: <ListarProdutosPage />,
};
```

#### page.tsx (Componente da Página)

```typescript
// features/produtos/routes/listar-produtos/page.tsx
export const ListarProdutosPage = () => {
  return (
    <div>
      <h1>Listagem de Produtos</h1>
      {/* Conteúdo da página */}
    </div>
  );
};
```

## 🚀 Adicionar Nova Rota

> 💡 **Recomendação:** Use sempre os geradores Gulp para criar features e páginas. Eles garantem consistência, seguem as convenções do projeto e automatizam tarefas repetitivas.

### Opção 1: Usando Gulp (⭐ Recomendado)

O projeto possui geradores automatizados via **Gulp** que criam toda a estrutura necessária para você.

#### Criar Nova Feature

```bash
npm run generate:feature
```

**O gerador irá:**

- ✅ Criar a estrutura completa da feature
- ✅ Gerar arquivo `index.ts` com exportações
- ✅ Criar pasta de rotas (`routes/`)
- ✅ Gerar página principal com `page.tsx` e `route.tsx`
- ✅ Configurar o arquivo `routes.tsx` da feature
- ✅ Aplicar convenções de nomenclatura automaticamente

**Exemplo de uso:**

```bash
$ npm run generate:feature

? Nome da feature (kebab-case): produtos
? Caminho da rota principal: /produtos
? Título da página principal: Produtos

✓ Feature 'produtos' criada com sucesso!
```

#### Adicionar Página a Feature Existente

```bash
npm run generate:page
```

**O gerador irá:**

- ✅ Listar features existentes para você escolher
- ✅ Criar componente da página (`page.tsx`)
- ✅ Criar configuração da rota (`route.tsx`)
- ✅ Organizar tudo na estrutura correta
- ✅ Aplicar convenções de nomenclatura

**Exemplo de uso:**

```bash
$ npm run generate:page

? Selecione a feature: produtos
? Nome da página (kebab-case): editar-produto
? Caminho da rota: /produtos/:id/editar
? Título da página: Editar Produto

✓ Página 'editar-produto' criada na feature 'produtos'!
```

#### Listar Features e Páginas

Para visualizar a estrutura atual:

```bash
npm run list:features
```

**Vantagens de usar os geradores:**

- 🚀 **Rápido:** Cria tudo em segundos
- ✅ **Consistente:** Segue sempre o mesmo padrão
- 🎯 **Sem erros:** Evita typos e arquivos esquecidos
- 📝 **Convenções:** Aplica automaticamente as boas práticas
- 🔧 **Manutenível:** Facilita futuras alterações na estrutura

> 📚 Para mais detalhes sobre os geradores, consulte o [Guia de Scripts](./SCRIPTS.md)

---

### Opção 2: Manualmente (Apenas se necessário)

> ⚠️ **Atenção:** A criação manual é propensa a erros e inconsistências. **Recomendamos fortemente usar os geradores Gulp**. Use este método apenas em casos específicos onde a automação não atende suas necessidades.

#### 1. Criar a Estrutura

```
features/produtos/routes/criar-produto/
├── page.tsx
└── route.tsx
```

#### 2. Criar page.tsx

```tsx
// features/produtos/routes/criar-produto/page.tsx
export const CriarProdutoPage = () => {
	return (
		<div className='container mx-auto py-8'>
			<h1 className='text-3xl font-bold'>Criar Produto</h1>
			{/* Formulário */}
		</div>
	);
};
```

#### 3. Criar route.tsx

```tsx
// features/produtos/routes/criar-produto/route.tsx
import type { RouteObject } from 'react-router-dom';
import { CriarProdutoPage } from './page';

export const criarProdutoPath = '/produtos/criar';
export const criarProdutoRoute: RouteObject = {
	path: criarProdutoPath,
	element: <CriarProdutoPage />,
};
```

#### 4. Adicionar ao routes.tsx

```tsx
// features/produtos/routes/routes.tsx
import type { RouteObject } from 'react-router-dom';
import { listarProdutosRoute } from './listar-produtos/route';
import { criarProdutoRoute } from './criar-produto/route'; // ← Importar

export const produtosRoutes: RouteObject[] = [
	listarProdutosRoute,
	criarProdutoRoute, // ← Adicionar
];
```

#### 5. Registrar no Router Central (se for nova feature)

```tsx
// src/routes/index.tsx
import { produtosRoutes } from '@/features/produtos'; // ← Importar

export const router = createBrowserRouter([
	{
		element: <PrivateLayout />,
		children: [
			...homeRoutes,
			...produtosRoutes, // ← Adicionar
		],
	},
]);
```

## 🔗 Navegação Entre Rotas

### Usando Link

```tsx
import { Link } from 'react-router-dom';

<Link to="/produtos">Ver Produtos</Link>
<Link to="/produtos/criar">Criar Produto</Link>
```

### Usando Navigate (Programático)

```tsx
import { useNavigate } from 'react-router-dom';

export const MyComponent = () => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate('/produtos');
	};

	return <button onClick={handleClick}>Ir para Produtos</button>;
};
```

### Com Parâmetros

```tsx
// Navegar com parâmetro
navigate(`/produtos/${produtoId}`);

// Em uma rota
<Link to={`/produtos/${produto.id}`}>Ver Detalhes</Link>;
```

## 📌 Rotas com Parâmetros

### Definir Rota com Parâmetro

```tsx
// route.tsx
export const editarProdutoRoute: RouteObject = {
	path: '/produtos/:id/editar', // ← Parâmetro :id
	element: <EditarProdutoPage />,
};
```

### Acessar Parâmetros na Página

```tsx
// page.tsx
import { useParams } from 'react-router-dom';

export const EditarProdutoPage = () => {
	const { id } = useParams(); // ← Pegar parâmetro

	return (
		<div>
			<h1>Editar Produto #{id}</h1>
		</div>
	);
};
```

## 🎯 Rotas Aninhadas (Nested Routes)

Para criar sub-rotas com um layout específico:

```tsx
// features/dashboard/routes/routes.tsx
import type { RouteObject } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard-layout';
import { overviewRoute } from './overview/route';
import { analyticsRoute } from './analytics/route';

export const dashboardRoutes: RouteObject[] = [
	{
		path: '/dashboard',
		element: <DashboardLayout />,
		children: [
			{
				index: true, // Rota padrão: /dashboard
				element: <OverviewPage />,
			},
			overviewRoute, // /dashboard/overview
			analyticsRoute, // /dashboard/analytics
		],
	},
];
```

### Layout de Rota Aninhada

```tsx
// features/dashboard/components/dashboard-layout.tsx
import { Outlet, Link } from 'react-router-dom';

export const DashboardLayout = () => {
	return (
		<div className='flex'>
			{/* Sidebar */}
			<aside className='w-64 border-r'>
				<nav>
					<Link to='/dashboard'>Overview</Link>
					<Link to='/dashboard/analytics'>Analytics</Link>
				</nav>
			</aside>

			{/* Conteúdo */}
			<main className='flex-1'>
				<Outlet /> {/* Sub-rotas renderizam aqui */}
			</main>
		</div>
	);
};
```

## 🔐 Proteção de Rotas

### Proteger Rota Manualmente

```tsx
// components/protected-route.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	return <>{children}</>;
};
```

**Uso:**

```tsx
export const myRoute: RouteObject = {
	path: '/admin',
	element: (
		<ProtectedRoute>
			<AdminPage />
		</ProtectedRoute>
	),
};
```

### Proteção via Layout

Uma forma mais elegante é proteger no layout:

```tsx
// layouts/private-layout.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export const PrivateLayout = () => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	return (
		<div>
			<Navbar />
			<Outlet />
			<Footer />
		</div>
	);
};
```

## 🔍 Query Parameters

### Ler Query Parameters

```tsx
import { useSearchParams } from 'react-router-dom';

export const ProdutosPage = () => {
	const [searchParams] = useSearchParams();

	const categoria = searchParams.get('categoria');
	const ordem = searchParams.get('ordem');

	// URL: /produtos?categoria=eletronicos&ordem=preco
	// categoria = "eletronicos"
	// ordem = "preco"

	return <div>{/* usar os parâmetros */}</div>;
};
```

### Atualizar Query Parameters

```tsx
import { useSearchParams } from 'react-router-dom';

export const ProdutosPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const handleFilter = (categoria: string) => {
		setSearchParams({ categoria });
		// URL fica: /produtos?categoria=eletronicos
	};

	return <button onClick={() => handleFilter('eletronicos')}>Filtrar</button>;
};
```

## 🎨 Rota Ativa (Active Link)

### NavLink com Estilo Ativo

```tsx
import { NavLink } from 'react-router-dom';

<NavLink
	to='/produtos'
	className={({ isActive }) =>
		isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
	}>
	Produtos
</NavLink>;
```

## 📋 Convenções e Boas Práticas

> 💡 **Importante:** Os geradores Gulp (`npm run generate:feature` e `npm run generate:page`) **aplicam automaticamente** todas essas convenções. Use-os para evitar inconsistências!

### Nomenclatura

| Item            | Convenção  | Exemplo               |
| --------------- | ---------- | --------------------- |
| Pasta da página | kebab-case | `listar-produtos`     |
| Componente      | PascalCase | `ListarProdutosPage`  |
| Rota (variável) | camelCase  | `listarProdutosRoute` |
| Path (variável) | camelCase  | `listarProdutosPath`  |

### Estrutura de Arquivos

```
✅ RECOMENDADO
features/produtos/routes/listar-produtos/
├── page.tsx              # Componente da página
└── route.tsx             # Configuração da rota

❌ EVITE
features/produtos/
├── listar-produtos.tsx   # Tudo junto
```

### Exportações

```tsx
// ✅ Exporte o path e a route
export const listarProdutosPath = '/produtos';
export const listarProdutosRoute: RouteObject = { ... };

// ✅ Use o path em Links
<Link to={listarProdutosPath}>Produtos</Link>

// ❌ Não use strings hardcoded
<Link to="/produtos">Produtos</Link>
```

## 🚨 Solução de Problemas

### Rota não funciona

> 💡 **Dica:** Se você criou a rota manualmente, considere usar os geradores Gulp (`npm run generate:feature` ou `npm run generate:page`) para evitar erros comuns de configuração.

**Verificar:**

1. ✅ Rota está importada em `routes.tsx` da feature?
2. ✅ Feature está importada em `src/routes/index.tsx`?
3. ✅ Feature está no array do layout correto?
4. ✅ Path está correto (começa com `/`)?

### Página em branco

**Verificar:**

1. ✅ Componente está sendo exportado corretamente?
2. ✅ Não há erros no console?
3. ✅ `<Outlet />` está no layout?

### Redirect loop

**Causa comum:** Rota protegida redireciona para login, que redireciona de volta.

**Solução:** Verifique a lógica de autenticação.

## 📚 Recursos Úteis

- [React Router v6 Docs](https://reactrouter.com/)
- [Tutorial Oficial](https://reactrouter.com/docs/en/v6/getting-started/tutorial)
- [Migration Guide v5 → v6](https://reactrouter.com/docs/en/v6/upgrading/v5)

## 📚 Próximos Passos

- [📜 Guia de Scripts](./SCRIPTS.md) - **Conheça todos os geradores Gulp disponíveis**
- [📖 Guia de Páginas](./PAGES.md) - Crie novas páginas com Gulp
- [🧩 Guia de Componentes](./COMPONENTS.md) - Crie componentes reutilizáveis
- [🎨 Guia de Estilização](./STYLING.md) - Estilize suas páginas
