# 📄 Templates - Gerador de Features

Este diretório contém os templates utilizados pelo gerador Gulp para criar features e páginas automaticamente.

## 📁 Estrutura

```
templates/
├── feature/
│   ├── index.ts.template                # Template para o index da feature
│   ├── routes.tsx.template              # Template para o arquivo de rotas da feature
│   ├── service.ts.template              # Template para o serviço de API
│   ├── types.d.ts.template              # Template para tipos TypeScript
│   ├── component.tsx.template           # Template para componente Card (sem claims)
│   └── component-with-claims.tsx.template # Template para componente Card (com <Can>)
└── page/
    ├── page.tsx.template                # Template para o componente da página
    ├── route.tsx.template               # Template para a rota (sem claims)
    └── route-with-claim.tsx.template    # Template para a rota (com ClaimGuard)
```

## 🔧 Como Funcionam os Templates

Os templates usam a sintaxe `<%= variavel %>` para substituição de valores dinâmicos durante a geração.

### Variáveis Disponíveis

#### Templates de Feature

**index.ts.template**

- `<%= featureName %>` - Nome da feature em camelCase (ex: `produtosRoutes`)
- `<%= FeatureName %>` - Nome da feature em PascalCase (ex: `Produtos`)

**routes.tsx.template**

- `<%= featureName %>` - Nome da feature em camelCase (ex: `produtosRoutes`)

**service.ts.template**

- `<%= featureName %>` - Nome da feature em kebab-case (ex: `produtos`)
- `<%= FeatureName %>` - Nome da feature em PascalCase (ex: `Produtos`)
- `<%= apiPath %>` - Caminho da rota da API (ex: `/produtos`)
- `<%= apiType %>` - Tipo de API: `api` ou `apiPublic`

**types.d.ts.template**

- `<%= featureName %>` - Nome da feature em kebab-case (ex: `produtos`)
- `<%= FeatureName %>` - Nome da feature em PascalCase (ex: `Produtos`)

**component.tsx.template**

- `<%= featureName %>` - Nome da feature em kebab-case (ex: `produtos`)
- `<%= FeatureName %>` - Nome da feature em PascalCase (ex: `Produtos`)

**component-with-claims.tsx.template**

- `<%= featureName %>` - Nome da feature em kebab-case (ex: `produtos`)
- `<%= FeatureName %>` - Nome da feature em PascalCase (ex: `Produtos`)
- `<%= claimEdit %>` - Claim para editar (ex: `produtos.edit`)
- `<%= claimDelete %>` - Claim para deletar (ex: `produtos.delete`)

#### Templates de Page

**page.tsx.template**

- `<%= pageName %>` - Nome da página em PascalCase (ex: `ListarProdutos`)
- `<%= pageTitle %>` - Título da página (ex: `Listagem de Produtos`)

**route.tsx.template**

- `<%= pageName %>` - Nome da página em PascalCase (ex: `ListarProdutos`)
- `<%= pageNameLower %>` - Nome da página em camelCase (ex: `listarProdutos`)
- `<%= routePath %>` - Caminho da rota (ex: `/produtos`)

**route-with-claim.tsx.template**

- `<%= pageName %>` - Nome da página em PascalCase (ex: `ListarProdutos`)
- `<%= pageNameLower %>` - Nome da página em camelCase (ex: `listarProdutos`)
- `<%= routePath %>` - Caminho da rota (ex: `/produtos`)
- `<%= claimName %>` - Claim necessária para acessar a rota (ex: `produtos.view`)

## 📝 Exemplo de Uso

### Criar Feature

```bash
npm run generate:feature

? Nome da feature: produtos
? Caminho da rota principal: /produtos
? Título da página principal: Produtos
? Tipo de API: API Privada (requer autenticação)
? Incluir componente de exemplo (Card)? Sim
? Proteger rotas por claim (permissão)? Sim
? Nome do recurso para claims: produtos
```

**Arquivos gerados:**

- `produtos/index.ts` - Exportações
- `produtos/api/service.ts` - Serviço CRUD
- `produtos/types/index.d.ts` - Tipos TypeScript
- `produtos/components/produtos-card.tsx` - Componente Card (com `<Can>`)
- `produtos/routes/routes.tsx` - Rotas
- `produtos/routes/produtos/page.tsx` - Página
- `produtos/routes/produtos/route.tsx` - Rota (com `ClaimGuard`)

### Criar Página

```bash
npm run generate:page

? Feature: produtos
? Nome da página: listar-produtos
? Caminho da rota: /produtos/listar
? Título: Listagem de Produtos
? Proteger rota por claim (permissão)? Sim
? Claim necessária: produtos.view
```

**Arquivos gerados:**

- `produtos/routes/listar-produtos/page.tsx` - Página
- `produtos/routes/listar-produtos/route.tsx` - Rota (com `ClaimGuard`)

### Transformações

| Variável               | Valor Gerado           |
| ---------------------- | ---------------------- |
| `<%= pageName %>`      | `ListarProdutos`       |
| `<%= pageNameLower %>` | `listarProdutos`       |
| `<%= routePath %>`     | `/produtos`            |
| `<%= pageTitle %>`     | `Listagem de Produtos` |

### Resultado - page.tsx

```typescript
export const ListarProdutosPage = () => {
	return <div>Listagem de Produtos</div>;
};
```

### Resultado - route.tsx

```typescript
import type { RouteObject } from 'react-router-dom';
import { ListarProdutosPage } from './page';

export const listarProdutosPath = '/produtos';
export const listarProdutosRoute: RouteObject = {
	path: listarProdutosPath,
	element: <ListarProdutosPage />,
};
```

## 🎨 Personalizando Templates

Você pode modificar os templates para atender às suas necessidades específicas:

### Exemplo: Adicionar comentário de autor

**page.tsx.template**

```typescript
/**
 * <%= pageName %>Page
 * @description <%= pageTitle %>
 * @author Your Name
 */
export const <%= pageName %>Page = () => {
	return <div><%= pageTitle %></div>;
};
```

### Exemplo: Adicionar estrutura de componente

**page.tsx.template**

```typescript
import { useState } from 'react';

export const <%= pageName %>Page = () => {
	const [loading, setLoading] = useState(false);

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6"><%= pageTitle %></h1>
			{/* Seu conteúdo aqui */}
		</div>
	);
};
```

### Exemplo: Adicionar metadata à rota

**route.tsx.template**

```typescript
import type { RouteObject } from 'react-router-dom';
import { <%= pageName %>Page } from './page';

export const <%= pageNameLower %>Path = '<%= routePath %>';
export const <%= pageNameLower %>Route: RouteObject = {
	path: <%= pageNameLower %>Path,
	element: <<%= pageName %>Page />,
	// Adicione metadata customizada
	handle: {
		title: '<%= pageTitle %>',
		breadcrumb: '<%= pageTitle %>',
	},
};
```

## 🔄 Convenções de Nomenclatura

O gerador aplica automaticamente as seguintes conversões:

### kebab-case

- **Uso:** Nomes de arquivos e diretórios
- **Exemplo:** `listar-produtos`, `editar-usuario`

### camelCase

- **Uso:** Nomes de variáveis e funções
- **Exemplo:** `listarProdutos`, `editarUsuario`

### PascalCase

- **Uso:** Nomes de componentes React
- **Exemplo:** `ListarProdutos`, `EditarUsuario`

## 🔗 Sistema de Auto-Registro (Marcadores)

O gerador pode registrar automaticamente rotas e links na navbar. Isso funciona através de **marcadores de comentário** nos arquivos:

| Marcador | Arquivo | Função |
| --- | --- | --- |
| `// [generate:import]` | `src/routes/index.tsx` | Inserir imports de rotas |
| `// [generate:private-route]` | `src/routes/index.tsx` | Inserir spread de rotas privadas |
| `// [generate:public-route]` | `src/routes/index.tsx` | Inserir spread de rotas públicas |
| `// [generate:import]` | `src/layouts/private-layout.tsx` | Inserir imports de paths |
| `// [generate:nav-link]` | `src/layouts/private-layout.tsx` | Inserir links na navbar |

> **Importante:** Não remova esses marcadores! Eles são usados pelo gerador para saber onde inserir código.

Se os marcadores forem removidos, o gerador irá exibir instruções para registro manual.

## 📚 Referências

- [gulpfile.js](../gulpfile.js) - Implementação das tasks Gulp

## ⚠️ Importante

- **NÃO delete este diretório** - Ele é necessário para o funcionamento dos geradores
- **NÃO remova os marcadores** `// [generate:...]` dos arquivos de rotas e layout
- **Faça backup** antes de modificar templates existentes
- **Teste suas alterações** criando features/páginas de teste
- Os templates são versionados no Git junto com o projeto
