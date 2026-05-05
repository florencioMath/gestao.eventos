# 🧩 Guia de Componentes

Este guia explica como criar e usar componentes no projeto.

## 🎯 Visão Geral

O projeto possui uma camada de componentes padronizados que devem ser utilizados em todo o código. Isso garante consistência e facilita manutenções futuras.

## 📁 Estrutura de Componentes

```
src/components/
├── base/                    # ⭐ Componentes padrão do projeto (USE ESTES!)
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── ui/                      # Componentes Shadcn/ui (NÃO importe diretamente)
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── layout/                  # Componentes de layout
│   ├── navbar.tsx
│   └── footer.tsx
├── providers/               # Context providers
│   └── toast-provider.tsx
└── [outros componentes]
```

## ⚠️ IMPORTANTE: Onde Importar Componentes

### ✅ CORRETO - Use componentes da pasta `base`

```tsx
import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
```

### ❌ INCORRETO - Não importe do Shadcn diretamente

```tsx
// ❌ NÃO FAÇA ISSO
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

### 💡 Por quê?

Os componentes em `components/base` são uma camada de abstração sobre o Shadcn/ui. Isso permite:

- ✅ Personalizar comportamentos globalmente
- ✅ Adicionar estilos padrão do projeto
- ✅ Facilitar mudanças futuras
- ✅ Manter consistência em toda aplicação

## 🏗️ Criar Componentes Customizados

### 1. Componente Simples

```tsx
// src/components/greeting.tsx
type GreetingProps {
	name: string;
}

export const Greeting = ({ name }: GreetingProps) => {
	return (
		<div className='rounded-lg bg-card p-4'>
			<h2 className='text-lg font-semibold'>Olá, {name}!</h2>
		</div>
	);
};
```

**Uso:**

```tsx
import { Greeting } from '@/components/greeting';

<Greeting name='João' />;
```

### 2. Componente com Props e Children

```tsx
// src/components/card.tsx
import { cn } from '@/lib/utils';

interface CardProps {
	title: string;
	description?: string;
	className?: string;
	children: React.ReactNode;
}

export const Card = ({ title, description, className, children }: CardProps) => {
	return (
		<div className={cn('rounded-lg border border-border bg-card p-6 shadow-sm', className)}>
			<h3 className='text-lg font-semibold text-card-foreground'>{title}</h3>
			{description && <p className='mt-2 text-sm text-muted-foreground'>{description}</p>}
			<div className='mt-4'>{children}</div>
		</div>
	);
};
```

**Uso:**

```tsx
<Card title='Meu Card' description='Descrição do card'>
	<p>Conteúdo do card</p>
</Card>
```

---

## 🔄 Componentes de Formulário

### Input com Label e Erro

```tsx
// src/components/form/text-input.tsx
import { Input } from '@/components/base/input';

interface TextInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
}

export const TextInput = ({
	label,
	value,
	onChange,
	placeholder,
	error,
	required,
}: TextInputProps) => {
	return (
		<div className='space-y-2'>
			<label className='block text-sm font-medium text-foreground'>
				{label}
				{required && <span className='text-destructive'> *</span>}
			</label>
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={error ? 'border-destructive' : ''}
			/>
			{error && <p className='text-sm text-destructive'>{error}</p>}
		</div>
	);
};
```

---

## 🎭 Ícones

O projeto usa **Lucide React** para ícones.

### Como Usar

```tsx
import { Home, User, Settings, ChevronRight, Search } from 'lucide-react';

export const Example = () => {
	return (
		<div className='flex items-center gap-2'>
			<Home className='h-5 w-5' />
			<User className='h-5 w-5 text-primary' />
			<Settings className='h-6 w-6 text-muted-foreground' />
		</div>
	);
};
```

### Ícones em Botões

```tsx
import { Button } from '@/components/base/button';
import { Plus, Edit, Trash } from 'lucide-react';

<Button>
	<Plus className='h-4 w-4' />
	Adicionar
</Button>

<Button variant='outline' size='icon'>
	<Edit className='h-4 w-4' />
</Button>

<Button variant='destructive' size='icon'>
	<Trash className='h-4 w-4' />
</Button>
```

📚 **Lista completa:** [Lucide Icons](https://lucide.dev/)

## 🎯 Onde Criar Componentes

### Componentes Globais (Reutilizáveis)

```
src/components/
└── seu-componente.tsx
```

Use para componentes que serão usados em várias features.

**Exemplos:**

- Card personalizado
- Modal customizado
- Badge
- Alert

---

### Componentes Específicos de Feature

```
src/features/[feature]/components/
└── seu-componente.tsx
```

Use para componentes que só serão usados naquela feature específica.

**Exemplo:**

```
src/features/produtos/
├── components/
│   ├── product-card.tsx
│   └── product-filters.tsx
└── routes/
    └── listar-produtos/
        └── page.tsx
```

---

## 🛠️ Adicionar Novos Componentes Base

Quando precisar de um novo componente do Shadcn/ui:

### 1. Instalar o Componente Shadcn

```bash
npx shadcn@latest add [nome-do-componente]
```

Exemplos:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add card
```

### 2. Criar Wrapper em `components/base`

Crie um arquivo em `src/components/base/` que envolve o componente Shadcn:

```tsx
// src/components/base/dialog.tsx
import {
	Dialog as DialogBase,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

// Re-exporte os componentes necessários
export const Dialog = DialogBase;
export const DialogContent = DialogContent;
export const DialogDescription = DialogDescription;
export const DialogHeader = DialogHeader;
export const DialogTitle = DialogTitle;
export const DialogTrigger = DialogTrigger;
```

### 3. Use o Componente Base

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/base/dialog';
```

---

## 💡 Boas Práticas

### ✅ Faça

```tsx
// Use TypeScript para tipar props
interface Props {
	name: string;
	age: number;
}

// Importe de components/base
import { Button } from '@/components/base/button';

// Use a função cn() para classes condicionais
import { cn } from '@/lib/utils';
<div className={cn('base-class', isActive && 'active-class')} />;

// Componentes pequenos e focados
const Header = () => <header>...</header>;
const Content = () => <main>...</main>;
```

### ❌ Evite

```tsx
// Não use any
interface Props {
	data: any; // ❌
}

// Não importe diretamente do Shadcn
import { Button } from '@/components/ui/button'; // ❌
import { Button } from '@/components/base/button'; // ✅

// Não crie componentes muito grandes
export const HugeComponent = () => {
	// 500+ linhas de código ❌
};

// Não use inline styles desnecessariamente
<div style={{ color: 'red' }}>; // ❌
<div className='text-red-500'>; // ✅
```

---

## 🔍 Exemplo Completo: Card de Produto

```tsx
// src/components/product-card.tsx
import { Button } from '@/components/base/button';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
	id: string;
	name: string;
	description: string;
	price: number;
	imageUrl: string;
	onAddToCart: (id: string) => void;
}

export const ProductCard = ({
	id,
	name,
	description,
	price,
	imageUrl,
	onAddToCart,
}: ProductCardProps) => {
	return (
		<div className='group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md'>
			<div className='aspect-square overflow-hidden'>
				<img
					src={imageUrl}
					alt={name}
					className='h-full w-full object-cover transition-transform group-hover:scale-105'
				/>
			</div>
			<div className='p-4'>
				<h3 className='text-lg font-semibold text-card-foreground'>{name}</h3>
				<p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>{description}</p>
				<div className='mt-4 flex items-center justify-between'>
					<span className='text-xl font-bold text-primary'>R$ {price.toFixed(2)}</span>
					<Button size='sm' onClick={() => onAddToCart(id)}>
						<ShoppingCart className='h-4 w-4' />
						Adicionar
					</Button>
				</div>
			</div>
		</div>
	);
};
```

---

## 📚 Resumo

### Principais Pontos

1. **Sempre importe de `@/components/base`** para componentes padrão
2. **Nunca importe diretamente de `@/components/ui`**
3. Use TypeScript para tipar props
4. Mantenha componentes pequenos e focados
5. Crie componentes globais em `src/components/`
6. Crie componentes específicos em `src/features/[feature]/components/`

### Quando Criar Novo Componente Base

- Quando precisar de um novo componente Shadcn
- Quando quiser personalizar comportamento padrão
- Quando precisar adicionar estilos globais

### Estrutura de Importações

```tsx
// ✅ Componentes padrão do projeto
import { Button, Input } from '@/components/base/button';

// ✅ Ícones
import { Plus, Edit } from 'lucide-react';

// ✅ Utilitários
import { cn } from '@/lib/utils';

// ✅ Componentes globais customizados
import { ProductCard } from '@/components/product-card';

// ✅ Componentes específicos da feature
import { ProductFilters } from '../components/product-filters';
```

---

## 📚 Próximos Passos

- [🎨 Guia de Estilização](./STYLING.md) - Aprenda a estilizar componentes
- [📖 Guia de Páginas](./PAGES.md) - Crie novas páginas
- [🗺️ Guia de Rotas](./ROUTES.md) - Sistema de rotas
