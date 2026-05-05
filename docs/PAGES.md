# 📖 Guia de Criação de Páginas

Este guia explica como criar novas páginas no projeto utilizando o sistema de geradores Gulp.

## 🎯 Visão Geral

O projeto possui um sistema automatizado para criar páginas de forma consistente e rápida. Existem dois tipos de geradores:

1. **Gerador de Features** - Cria uma nova funcionalidade completa com estrutura de rotas
2. **Gerador de Páginas** - Adiciona novas páginas a features existentes

## 🚀 Criar uma Nova Feature

Uma feature é um módulo completo com suas próprias rotas e páginas.

### Comando

```bash
npm run generate:feature
```

### Processo Interativo

O comando irá fazer as seguintes perguntas:

```
? Nome da feature (ex: produtos, usuarios):
→ Digite o nome da feature

? Caminho da rota principal (ex: /produtos, /dashboard):
→ Será sugerido automaticamente baseado no nome

? Título da página principal:
→ Será sugerido automaticamente baseado no nome

? Tipo de API para o serviço:
→ API Privada (requer autenticação) ou API Pública

? Incluir componente de exemplo (Card)?
→ Sim (padrão) ou Não

? Registrar rotas e navbar automaticamente?
→ Sim (padrão) ou Não

? Proteger rotas por claim (permissão)?
→ Sim (padrão para API Privada) ou Não

? Nome do recurso para claims (ex: users, products):
→ Será sugerido automaticamente baseado no nome da feature
```

> **Auto-registro:** Quando habilitado, o gerador adiciona automaticamente:
> - O import e o spread das rotas em `src/routes/index.tsx`
> - O link na navbar em `src/layouts/private-layout.tsx` (para rotas privadas)
>
> Isso funciona através de **marcadores de comentário** nos arquivos. Não remova os comentários `// [generate:...]`.

### Exemplo Prático

```bash
npm run generate:feature

? Nome da feature: produtos
? Caminho da rota principal: /produtos
? Título da página principal: Produtos
? Tipo de API: API Privada
? Incluir componente de exemplo: Sim
? Registrar rotas e navbar automaticamente: Sim
? Proteger rotas por claim: Sim
? Nome do recurso para claims: produtos
```

### Estrutura Gerada

```
src/features/produtos/
├── index.ts                      # Exporta rotas, service e tipos
├── api/
│   └── service.ts               # Serviço de API (CRUD)
├── types/
│   └── index.d.ts               # Tipos TypeScript
├── components/                   # (opcional)
│   └── produtos-card.tsx        # Componente Card de exemplo
└── routes/
    ├── routes.tsx               # Configura as rotas da feature
    └── produtos/
        ├── page.tsx             # Componente da página
        └── route.tsx            # Configuração da rota
```

### Arquivos Criados

**1. index.ts**

```typescript
import { produtosRoutes } from './routes/routes';

export { produtosRoutes };
export { ProdutosService } from './api/service';
export type * from './types';
export { ProdutosCard } from './components/produtos-card'; // Se incluído
```

**2. api/service.ts**

```typescript
import { api } from '@/lib/api';

export class ProdutosService {
	static async list() {
		const response = await api.get('/produtos');
		return response.data;
	}

	static async getById(id: string | number) {
		const response = await api.get(`/produtos/${id}`);
		return response.data;
	}

	static async create(data: unknown) {
		const response = await api.post('/produtos', data);
		return response.data;
	}

	static async update(id: string | number, data: unknown) {
		const response = await api.put(`/produtos/${id}`, data);
		return response.data;
	}

	static async delete(id: string | number) {
		const response = await api.delete(`/produtos/${id}`);
		return response.data;
	}
}
```

**3. types/index.d.ts**

```typescript
export type Produtos = {
	id: string | number;
	createdAt?: string;
	updatedAt?: string;
};

export type CreateProdutosRequest = {
	// Campos para criação
};

export type UpdateProdutosRequest = {
	// Campos para atualização
};
```

**4. routes/routes.tsx**

```typescript
import type { RouteObject } from 'react-router-dom';
import { produtosRoute } from './produtos/route';

export const produtosRoutes: RouteObject[] = [produtosRoute];
```

**5. routes/produtos/page.tsx**

```typescript
export const ProdutosPage = () => {
  return <div>Produtos</div>;
};
```

**6. routes/produtos/route.tsx**

Sem proteção por claim:

```typescript
import type { RouteObject } from 'react-router-dom';
import { ProdutosPage } from './page';

export const produtosPath = '/produtos';
export const produtosRoute: RouteObject = {
  path: produtosPath,
  element: <ProdutosPage />,
};
```

Com proteção por claim (quando "Proteger rotas por claim" = Sim):

```typescript
import type { RouteObject } from 'react-router-dom';
import { ClaimGuard } from '@/components/claim-guard';
import { ProdutosPage } from './page';

export const produtosPath = '/produtos';
export const produtosRoute: RouteObject = {
  path: produtosPath,
  element: (
    <ClaimGuard claim='produtos.view'>
      <ProdutosPage />
    </ClaimGuard>
  ),
};
```

> 📖 Veja mais sobre claims em [Sistema de Claims](./CLAIMS.md)

## ➕ Adicionar Nova Página a uma Feature

Após criar uma feature, você pode adicionar mais páginas a ela.

### Comando

```bash
npm run generate:page
```

### Processo Interativo

```
? Selecione a feature:
→ Escolha uma das features existentes

? Nome da página (ex: listar-produtos, editar-usuario):
→ Digite o nome da página

? Caminho da rota (ex: /produtos, /usuario/editar):
→ Digite o caminho da rota

? Título da página:
→ Será sugerido automaticamente baseado no nome

? Proteger rota por claim (permissão)?
→ Sim ou Não (padrão: Não)

? Claim necessária (ex: users.view, products.edit):
→ Será sugerido automaticamente baseado na feature
```

### Exemplo Prático

```bash
npm run generate:page

? Selecione a feature: produtos
? Nome da página: listar-produtos
? Caminho da rota: /produtos/listar
? Título da página: Listagem de Produtos
```

### Estrutura Após Adicionar Página

```
src/features/produtos/
├── index.ts
├── routes/
│   ├── routes.tsx
│   ├── produtos/
│   │   ├── page.tsx
│   │   └── route.tsx
│   └── listar-produtos/          # Nova página
│       ├── page.tsx
│       └── route.tsx
```

## 🔗 Registrar as Rotas

### Registro Automático (Recomendado)

Ao criar uma feature com `npm run generate:feature`, responda **Sim** à pergunta:

```
? Registrar rotas e navbar automaticamente? Sim
```

O gerador irá automaticamente:
- Adicionar o import das rotas em `src/routes/index.tsx`
- Adicionar o spread das rotas no layout correto (privado ou público)
- Adicionar o link na navbar em `src/layouts/private-layout.tsx` (para rotas privadas)
- Se protegido por claim, o link já inclui a propriedade `claim`

> **Importante:** O auto-registro funciona através de marcadores de comentário nos arquivos.
> Não remova os comentários `// [generate:import]`, `// [generate:private-route]`, `// [generate:public-route]` e `// [generate:nav-link]`.

### Registro Manual

Se preferir registrar manualmente (ou se os marcadores não existirem):

#### 1. Importar a Feature

Abra `src/routes/index.tsx` e importe as rotas:

```typescript
import { produtosRoutes } from '@/features/produtos';
```

#### 2. Adicionar ao Layout Apropriado

**Para Rotas Privadas (Requer Autenticação):**

```typescript
children: [
    ...homeRoutes,
    ...produtosRoutes, // 👈 Adicione aqui
    // [generate:private-route]
],
```

**Para Rotas Públicas (Não Requer Autenticação):**

```typescript
children: [
    ...authRoutes,
    ...produtosRoutes, // 👈 Adicione aqui
    // [generate:public-route]
],
```

#### 3. Adicionar Link na Navbar

Em `src/layouts/private-layout.tsx`:

```typescript
import { produtosPath } from '@/features/produtos/routes/produtos/route';

const links = [
    { path: homePath, label: 'Home' },
    { path: produtosPath, label: 'Produtos', claim: 'produtos.view' },
    // [generate:nav-link]
];
```

### 4. Atualizar Arquivo de Rotas da Feature

Se você adicionou uma nova página com `npm run generate:page`, atualize o arquivo `routes.tsx` da feature:

```typescript
// src/features/produtos/routes/routes.tsx
import type { RouteObject } from 'react-router-dom';
import { produtosRoute } from './produtos/route';
import { listarProdutosRoute } from './listar-produtos/route'; // 👈 Importar

export const produtosRoutes: RouteObject[] = [
	produtosRoute,
	listarProdutosRoute, // 👈 Adicionar
];
```

## 📋 Listar Features e Páginas

Para visualizar todas as features e páginas existentes:

```bash
npm run list:features
```

### Exemplo de Saída

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

## 🎨 Convenções de Nomenclatura

O gerador aplica automaticamente as seguintes transformações:

| Entrada         | Formato    | Uso                        | Exemplo         |
| --------------- | ---------- | -------------------------- | --------------- |
| `minha-feature` | kebab-case | Nomes de pastas e arquivos | `produtos`      |
| `MinhaFeature`  | PascalCase | Nomes de componentes React | `ProdutosPage`  |
| `minhaFeature`  | camelCase  | Variáveis e funções        | `produtosRoute` |

## ⚙️ Templates Personalizados

Os arquivos gerados são baseados em templates localizados em:

```
templates/
├── feature/
│   ├── index.ts.template                # Index da feature
│   ├── routes.tsx.template              # Rotas
│   ├── service.ts.template              # API Service
│   ├── types.d.ts.template              # Tipos TypeScript
│   ├── component.tsx.template           # Componente Card (sem claims)
│   └── component-with-claims.tsx.template # Componente Card (com <Can>)
└── page/
    ├── page.tsx.template                # Componente da página
    ├── route.tsx.template               # Rota (sem claims)
    └── route-with-claim.tsx.template    # Rota (com ClaimGuard)
```

Você pode modificar estes templates para personalizar a estrutura gerada.

Para mais detalhes, consulte [templates/README.md](../templates/README.md).

## 🔍 Exemplos de Uso Comum

### Criar um CRUD Completo

```bash
# 1. Criar a feature
npm run generate:feature
# Nome: produtos

# 2. Adicionar página de listagem
npm run generate:page
# Feature: produtos
# Nome: listar-produtos
# Rota: /produtos

# 3. Adicionar página de criação
npm run generate:page
# Feature: produtos
# Nome: criar-produto
# Rota: /produtos/criar

# 4. Adicionar página de edição
npm run generate:page
# Feature: produtos
# Nome: editar-produto
# Rota: /produtos/:id/editar

# 5. Adicionar página de detalhes
npm run generate:page
# Feature: produtos
# Nome: detalhes-produto
# Rota: /produtos/:id
```

### Criar um Dashboard com Sub-páginas

```bash
# 1. Criar a feature principal
npm run generate:feature
# Nome: dashboard

# 2. Adicionar página de analytics
npm run generate:page
# Feature: dashboard
# Nome: analytics
# Rota: /dashboard/analytics

# 3. Adicionar página de relatórios
npm run generate:page
# Feature: dashboard
# Nome: relatorios
# Rota: /dashboard/relatorios
```

## 🚨 Solução de Problemas

### Erro: Feature já existe

```
❌ A feature "produtos" já existe!
```

**Solução:** Escolha outro nome ou delete a feature existente.

### Erro: Página já existe

```
❌ A página "listar-produtos" já existe nesta feature!
```

**Solução:** Escolha outro nome ou delete a página existente.

### Rota não aparece no navegador

**Possíveis causas:**

1. Esqueceu de importar as rotas em `src/routes/index.tsx`
2. Esqueceu de adicionar a rota ao array de rotas da feature
3. Esqueceu de adicionar ao layout apropriado

**Solução:** Siga o passo "Registrar as Rotas" acima.

## 📚 Próximos Passos

Após criar suas páginas:

- [🎨 Guia de Estilização](./STYLING.md) - Aprenda a estilizar suas páginas
- [🧩 Guia de Componentes](./COMPONENTS.md) - Crie componentes reutilizáveis
- [🗺️ Guia de Rotas](./ROUTES.md) - Entenda o sistema de rotas completo
