# Sistema de Claims (Permissões)

## O que são Claims?

Claims são **permissões** que definem o que um usuário pode fazer no sistema. Cada claim é uma string simples no formato `recurso.ação`.

**Exemplos:**

| Claim             | Significado                |
| ----------------- | -------------------------- |
| `users.view`      | Visualizar usuários        |
| `users.create`    | Criar usuários             |
| `users.edit`      | Editar usuários            |
| `users.delete`    | Deletar usuários           |
| `products.view`   | Visualizar produtos        |
| `products.edit`   | Editar produtos            |
| `reports.view`    | Acessar relatórios         |
| `reports.export`  | Exportar relatórios        |
| `settings.manage` | Gerenciar configurações    |

## Como funciona?

```
Perfil "Administrador"          Perfil "Operador"
  ├── users.view                  ├── users.view
  ├── users.create                ├── products.view
  ├── users.edit                  ├── products.edit
  ├── users.delete                └── reports.view
  ├── products.view
  ├── products.edit
  ├── reports.view
  ├── reports.export
  └── settings.manage
```

1. O **backend** mantém perfis e suas claims
2. O **usuário** recebe um perfil e herda as claims daquele perfil
3. No **login**, o backend envia o perfil (informativo) e a lista de claims (funcional)
4. O **frontend** valida acesso **somente por claims**, nunca pelo nome do perfil

> **Regra de ouro:** "O usuário pode fazer X?" → verificar se tem a claim X.

---

## Guia Rápido

O sistema oferece **3 ferramentas** para controlar acesso. Todas fazem a mesma pergunta: _"o usuário tem essa claim?"_

| Ferramenta     | Quando usar                            | Exemplo                                    |
| -------------- | -------------------------------------- | ------------------------------------------ |
| `ClaimGuard`   | Proteger uma **rota inteira**          | Bloquear acesso a `/usuarios`              |
| `<Can>`        | Mostrar/esconder **parte da UI**       | Esconder botão "Excluir"                   |
| `useClaims()`  | Verificar permissão **no código**      | `if (hasClaim('x')) { ... }`               |

---

## Como proteger uma rota

Use o componente `ClaimGuard` no arquivo `route.tsx` da rota:

### Claim única

```tsx
import { ClaimGuard } from '@/components/claim-guard';
import { UsersPage } from './page';

export const usersRoute = {
  path: '/usuarios',
  element: (
    <ClaimGuard claim="users.view">
      <UsersPage />
    </ClaimGuard>
  ),
};
```

### Múltiplas claims (pelo menos uma)

```tsx
<ClaimGuard claims={["products.view", "products.edit"]}>
  <ProductsPage />
</ClaimGuard>
```

### Múltiplas claims (todas obrigatórias)

```tsx
<ClaimGuard claims={["reports.view", "reports.export"]} requireAll>
  <ReportsPage />
</ClaimGuard>
```

### Com fallback customizado

```tsx
<ClaimGuard claim="admin.panel" fallback={<p>Sem acesso ao painel.</p>}>
  <AdminPanel />
</ClaimGuard>
```

**Comportamento padrão:** sem permissão → exibe página "Acesso Negado".

---

## Como esconder um botão ou seção

Use o componente `<Can>`:

### Esconder um botão

```tsx
import { Can } from '@/components/can';

export const UserActions = () => {
  return (
    <div>
      <Can claim="users.edit">
        <button>Editar Usuário</button>
      </Can>

      <Can claim="users.delete">
        <button>Excluir Usuário</button>
      </Can>
    </div>
  );
};
```

### Com mensagem alternativa

```tsx
<Can claim="reports.export" fallback={<span>Você não pode exportar.</span>}>
  <button>Exportar Relatório</button>
</Can>
```

### Múltiplas claims

```tsx
<Can claims={["products.edit", "products.delete"]}>
  <ActionsMenu />
</Can>
```

---

## Como verificar permissão no código

Use o hook `useClaims()`:

```tsx
import { useClaims } from '@/hooks/use-claims';

export const MyComponent = () => {
  const { hasClaim, hasAnyClaim, hasAllClaims, claims } = useClaims();

  // Verificar claim única
  if (hasClaim('users.delete')) {
    // pode deletar
  }

  // Verificar se tem pelo menos uma
  if (hasAnyClaim(['products.edit', 'products.delete'])) {
    // pode editar OU deletar
  }

  // Verificar se tem todas
  if (hasAllClaims(['reports.view', 'reports.export'])) {
    // pode ver E exportar
  }

  // Listar todas as claims do usuário
  console.log(claims); // ["users.view", "users.create", ...]

  return <div>...</div>;
};
```

---

## Como adicionar links protegidos na Navbar

No arquivo `src/layouts/private-layout.tsx`, adicione o campo `claim` ao link:

```tsx
const links = [
  { path: homePath, label: 'Home' },                                   // todos veem
  { path: '/usuarios', label: 'Usuários', claim: 'users.view' },       // só quem pode
  { path: '/produtos', label: 'Produtos', claim: 'products.view' },    // só quem pode
  { path: '/relatorios', label: 'Relatórios', claim: 'reports.view' }, // só quem pode
];
```

Links **sem** `claim` aparecem para todos. Links **com** `claim` aparecem somente se o usuário tiver a claim informada.

---

## Contrato com o Backend

A resposta de login deve incluir `profile` e `claims`:

```json
{
  "token": "jwt-token-aqui",
  "user": {
    "id": "user-123",
    "name": "João Silva",
    "email": "joao@example.com",
    "profile": {
      "id": "profile-1",
      "name": "Administrador"
    },
    "claims": [
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "products.view",
      "products.edit",
      "reports.view",
      "reports.export",
      "settings.manage"
    ]
  }
}
```

- `profile` → informativo (exibir nome do perfil na UI)
- `claims` → funcional (controlar acesso)

O backend resolve "perfil → claims" e envia a lista pronta. O frontend nunca precisa saber a lógica de mapeamento.

---

## Convenção de nomenclatura

**Formato:** `recurso.ação`

- **recurso:** nome no plural, em inglês (ex: `users`, `products`, `reports`)
- **ação:** verbo no infinitivo, em inglês (ex: `view`, `create`, `edit`, `delete`, `manage`, `export`)

**Exemplos válidos:**

- `users.view`, `users.create`, `users.edit`, `users.delete`
- `products.view`, `products.edit`
- `reports.view`, `reports.export`
- `settings.manage`

---

## Estrutura de Arquivos

```
src/
├── hooks/
│   └── use-claims/
│       ├── index.ts                 # Barrel export
│       ├── use-claims.ts            # Hook de verificação de claims
│       └── resolve-permission.ts    # Utilitário compartilhado
├── components/
│   ├── claim-guard.tsx              # Guard de rotas por claim
│   └── can.tsx                      # Controle de visibilidade UI
└── features/
    └── auth/
        └── routes/
            └── access-denied/
                └── page.tsx         # Página de acesso negado
```

---

## FAQ / Erros Comuns

### O link aparece na navbar mas a rota bloqueia o acesso

**Causa:** o link na navbar não tem o campo `claim` configurado, mas a rota tem `ClaimGuard`.

**Solução:** adicione o mesmo `claim` no link da navbar:

```tsx
{ path: '/usuarios', label: 'Usuários', claim: 'users.view' }
```

### O usuário logou mas todas as claims estão vazias

**Causa:** o backend não está retornando o campo `claims` na resposta de login.

**Solução:** verifique se o endpoint de login retorna `user.claims` como array de strings.

### Usuários antigos (logados antes da implementação) não têm claims

**Causa:** o localStorage contém dados antigos sem o campo `claims`.

**Solução:** o `AuthProvider` já trata isso automaticamente — se `claims` não existir, usa array vazio `[]`. Para obter as claims, o usuário precisa fazer logout e login novamente.

### Preciso verificar o perfil do usuário, não a claim

**Não faça isso.** Toda verificação de acesso deve ser por claims. Se precisar de uma nova permissão, crie uma nova claim e adicione ao perfil correspondente no backend.

O campo `profile.name` existe apenas para **exibição** (ex: mostrar "Administrador" no header).
