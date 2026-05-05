# 🎨 Guia de Estilização

Este guia explica como trabalhar com estilos no projeto usando Tailwind CSS v4.

## 🎯 Visão Geral

O projeto utiliza **Tailwind CSS v4** como framework principal de estilização, combinado com:

- **CSS Variables** - Para temas e cores customizáveis
- **Tailwind Classes** - Para estilização utility-first
- **Dark Mode** - Suporte nativo a modo escuro
- **tw-animate-css** - Animações CSS integradas

## 📁 Arquivos de Estilo

### Arquivo Principal

```
src/index.css
```

Este é o arquivo principal de estilos onde estão:

- Configuração do Tailwind
- Variáveis CSS globais
- Tema de cores
- Estilos base

## 🎨 Sistema de Cores

### Estrutura de Cores

O projeto usa um sistema de cores baseado em variáveis CSS definidas em `src/index.css`:

```css
:root {
	--background: oklch(1 0 0); /* Fundo principal */
	--foreground: oklch(0.145 0 0); /* Texto principal */
	--primary: oklch(0.42 0.12 250); /* Cor primária */
	--secondary: oklch(0.97 0 0); /* Cor secundária */
	--muted: oklch(0.97 0 0); /* Elementos discretos */
	--accent: oklch(0.97 0 0); /* Elementos de destaque */
	--destructive: oklch(0.577 0.245 27); /* Ações destrutivas */
	--border: oklch(0.922 0 0); /* Bordas */
	/* ... mais cores */
}
```

### Cores Disponíveis

| Variável CSS           | Classe Tailwind           | Uso                              |
| ---------------------- | ------------------------- | -------------------------------- |
| `--background`         | `bg-background`           | Fundo principal da aplicação     |
| `--foreground`         | `text-foreground`         | Texto principal                  |
| `--primary`            | `bg-primary`              | Botões e elementos primários     |
| `--primary-foreground` | `text-primary-foreground` | Texto sobre fundo primário       |
| `--secondary`          | `bg-secondary`            | Elementos secundários            |
| `--muted`              | `bg-muted`                | Fundos discretos                 |
| `--accent`             | `bg-accent`               | Elementos de destaque            |
| `--destructive`        | `bg-destructive`          | Ações destrutivas (deletar, etc) |
| `--border`             | `border-border`           | Bordas                           |
| `--input`              | `bg-input`                | Fundos de inputs                 |
| `--ring`               | `ring-ring`               | Anéis de foco                    |

## 🖌️ Como Estilizar Componentes

### 1. Usando Classes Tailwind

A forma mais comum e recomendada:

```tsx
export const MeuComponente = () => {
	return (
		<div className='flex flex-col gap-4 p-6 rounded-lg bg-card shadow-md'>
			<h1 className='text-2xl font-bold text-foreground'>Título</h1>
			<p className='text-sm text-muted-foreground'>Descrição</p>
			<button className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'>
				Clique Aqui
			</button>
		</div>
	);
};
```

### 2. Usando a Função `cn()` do Lib Utils

Para combinar classes condicionalmente:

```tsx
import { cn } from '@/lib/utils';

export const MeuComponente = ({ variant = 'default', className }) => {
	return (
		<div
			className={cn(
				'p-4 rounded-md',
				variant === 'primary' && 'bg-primary text-primary-foreground',
				variant === 'secondary' && 'bg-secondary text-secondary-foreground',
				className
			)}>
			Conteúdo
		</div>
	);
};
```

### 3. Usando Class Variance Authority (CVA)

Para componentes com múltiplas variantes (como os componentes Shadcn):

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-lg border shadow-sm', {
	variants: {
		variant: {
			default: 'bg-card text-card-foreground',
			muted: 'bg-muted text-muted-foreground',
		},
		size: {
			sm: 'p-4',
			md: 'p-6',
			lg: 'p-8',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'md',
	},
});

interface CardProps extends VariantProps<typeof cardVariants> {
	className?: string;
	children: React.ReactNode;
}

export const Card = ({ variant, size, className, children }: CardProps) => {
	return <div className={cn(cardVariants({ variant, size }), className)}>{children}</div>;
};
```

## 🎭 Animações

O projeto inclui a biblioteca `tw-animate-css` com animações prontas.

### Animações Disponíveis

```tsx
// Fade
<div className="animate-fade-in">Aparece gradualmente</div>

// Slide
<div className="animate-slide-in-left">Entra pela esquerda</div>
<div className="animate-slide-in-right">Entra pela direita</div>

// Bounce
<div className="animate-bounce">Quica</div>

// Spin
<div className="animate-spin">Gira</div>
```

### Transições Customizadas

```tsx
// Transição suave
<button className="transition-colors hover:bg-primary">
  Hover me
</button>

// Transição rápida
<button className="transition-transform duration-200 hover:scale-105">
  Hover me
</button>

// Múltiplas propriedades
<button className="transition-all duration-300 hover:bg-primary hover:shadow-lg">
  Hover me
</button>
```

## 📱 Responsividade

Tailwind usa breakpoints para design responsivo:

| Breakpoint | Tamanho | Classe |
| ---------- | ------- | ------ |
| `sm`       | 640px   | `sm:`  |
| `md`       | 768px   | `md:`  |
| `lg`       | 1024px  | `lg:`  |
| `xl`       | 1280px  | `xl:`  |
| `2xl`      | 1536px  | `2xl:` |

### Exemplos

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 coluna em mobile, 2 em tablet, 3 em desktop */}
</div>

<div className="text-sm md:text-base lg:text-lg">
  {/* Texto cresce com o tamanho da tela */}
</div>

<div className="p-4 md:p-6 lg:p-8">
  {/* Padding aumenta com o tamanho da tela */}
</div>
```

## 🔧 Customizar o Tema

### Alterar a Cor Primária

Edite `src/index.css`:

```css
:root {
	--primary: oklch(0.5 0.2 200); /* Azul diferente */
}

.dark {
	--primary: oklch(0.6 0.2 200); /* Versão mais clara para dark mode */
}
```

### Adicionar Nova Cor

1. Adicione a variável CSS em `src/index.css`:

```css
:root {
	--color-brand: oklch(0.7 0.15 280);
}

@theme inline {
	--color-brand: var(--brand);
}
```

2. Use nas classes Tailwind:

```tsx
<div className='bg-brand text-white'>Usando cor customizada</div>
```

### Alterar o Border Radius Padrão

```css
:root {
	--radius: 0.5rem; /* Muda de 10px para 8px */
}
```

## 📚 Recursos Úteis

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [OKLCH Color Picker](https://oklch.com/)
- [Tailwind Play](https://play.tailwindcss.com/) - Playground online
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes prontos

## 💡 Dicas e Boas Práticas

### ✅ Faça

```tsx
// Use as cores do tema
<button className="bg-primary text-primary-foreground">

// Use classes utilitárias
<div className="flex items-center gap-2">

// Use a função cn() para classes condicionais
<div className={cn('base-class', isActive && 'active-class')}>
```

### ❌ Evite

```tsx
// Não use estilos inline
<button style={{ backgroundColor: '#3b82f6' }}>

// Não crie arquivos CSS separados desnecessários
// Prefira usar Tailwind

// Não use valores arbitrários sem necessidade
<div className="p-[13px]">  // Use p-3 ou p-4 ao invés
```

## 🔍 Exemplos Práticos

### Card Completo

```tsx
export const ProductCard = ({ title, description, price }) => {
	return (
		<div className='rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md'>
			<h3 className='text-lg font-semibold text-card-foreground'>{title}</h3>
			<p className='mt-2 text-sm text-muted-foreground'>{description}</p>
			<div className='mt-4 flex items-center justify-between'>
				<span className='text-xl font-bold text-primary'>R$ {price}</span>
				<button className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'>
					Adicionar
				</button>
			</div>
		</div>
	);
};
```

### Formulário Responsivo

```tsx
export const ContactForm = () => {
	return (
		<form className='mx-auto max-w-2xl space-y-6 p-6'>
			<div className='grid gap-6 md:grid-cols-2'>
				<div>
					<label className='block text-sm font-medium text-foreground'>Nome</label>
					<input
						type='text'
						className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium text-foreground'>Email</label>
					<input
						type='email'
						className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring'
					/>
				</div>
			</div>
			<button
				type='submit'
				className='w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'>
				Enviar
			</button>
		</form>
	);
};
```

## 📚 Próximos Passos

- [🧩 Guia de Componentes](./COMPONENTS.md) - Aprenda a criar componentes estilizados
- [📖 Guia de Páginas](./PAGES.md) - Crie novas páginas
- [🗺️ Guia de Rotas](./ROUTES.md) - Sistema de rotas
