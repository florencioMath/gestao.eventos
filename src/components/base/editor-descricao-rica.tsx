import { Button } from "@/components/base/button";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style/text-style-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Heading2,
	Heading3,
	Italic,
	Link2,
	List,
	ListOrdered,
	Minus,
	Palette,
	Quote,
	RemoveFormatting,
	Strikethrough,
	Type,
	Underline,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

const TAMANHOS_FONTE = [
	{ value: "", label: "Tamanho" },
	{ value: "12px", label: "12 px" },
	{ value: "14px", label: "14 px" },
	{ value: "16px", label: "16 px" },
	{ value: "18px", label: "18 px" },
	{ value: "24px", label: "24 px" },
];

const CORES = [
	{ hex: "", label: "Padrão" },
	{ hex: "#18181b", label: "Preto" },
	{ hex: "#dc2626", label: "Vermelho" },
	{ hex: "#ea580c", label: "Laranja" },
	{ hex: "#16a34a", label: "Verde" },
	{ hex: "#2563eb", label: "Azul" },
	{ hex: "#7c3aed", label: "Roxo" },
	{ hex: "#db2777", label: "Rosa" },
];

type Props = {
	value: string;
	onChange: (html: string) => void;
	disabled?: boolean;
	placeholder?: string;
	/** Liga o rótulo ao campo editável (ProseMirror). */
	id?: string;
	className?: string;
};

function BarraFerramentas({ editor, disabled }: { editor: Editor | null; disabled: boolean }) {
	if (!editor) return null;

	const inativo = disabled;

	const btn = (opts: { onClick: () => void; active?: boolean; title: string; children: ReactNode }) => (
		<Button
			type='button'
			variant={opts.active ? "secondary" : "ghost"}
			size='icon'
			className='h-8 w-8 shrink-0'
			disabled={inativo}
			title={opts.title}
			onClick={opts.onClick}>
			{opts.children}
		</Button>
	);

	const inserirLink = () => {
		const prev = editor.getAttributes("link").href as string | undefined;
		const url = window.prompt("Endereço do link (https://…)", prev ?? "https://");
		if (url === null) return;
		const t = url.trim();
		if (t === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange("link").setLink({ href: t }).run();
	};

	return (
		<div className='flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1'>
			{btn({
				title: "Negrito",
				active: editor.isActive("bold"),
				onClick: () => editor.chain().focus().toggleBold().run(),
				children: <Bold className='h-4 w-4' />,
			})}
			{btn({
				title: "Itálico",
				active: editor.isActive("italic"),
				onClick: () => editor.chain().focus().toggleItalic().run(),
				children: <Italic className='h-4 w-4' />,
			})}
			{btn({
				title: "Sublinhado",
				active: editor.isActive("underline"),
				onClick: () => editor.chain().focus().toggleUnderline().run(),
				children: <Underline className='h-4 w-4' />,
			})}
			{btn({
				title: "Riscado",
				active: editor.isActive("strike"),
				onClick: () => editor.chain().focus().toggleStrike().run(),
				children: <Strikethrough className='h-4 w-4' />,
			})}
			<span className='mx-0.5 h-6 w-px bg-border' aria-hidden />
			{btn({
				title: "Parágrafo",
				active: !editor.isActive("heading"),
				onClick: () => editor.chain().focus().setParagraph().run(),
				children: <Type className='h-4 w-4' />,
			})}
			{btn({
				title: "Título nível 2",
				active: editor.isActive("heading", { level: 2 }),
				onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
				children: <Heading2 className='h-4 w-4' />,
			})}
			{btn({
				title: "Título nível 3",
				active: editor.isActive("heading", { level: 3 }),
				onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
				children: <Heading3 className='h-4 w-4' />,
			})}
			<span className='mx-0.5 h-6 w-px bg-border' aria-hidden />
			{btn({
				title: "Lista com marcadores",
				active: editor.isActive("bulletList"),
				onClick: () => editor.chain().focus().toggleBulletList().run(),
				children: <List className='h-4 w-4' />,
			})}
			{btn({
				title: "Lista numerada",
				active: editor.isActive("orderedList"),
				onClick: () => editor.chain().focus().toggleOrderedList().run(),
				children: <ListOrdered className='h-4 w-4' />,
			})}
			{btn({
				title: "Citação",
				active: editor.isActive("blockquote"),
				onClick: () => editor.chain().focus().toggleBlockquote().run(),
				children: <Quote className='h-4 w-4' />,
			})}
			{btn({
				title: "Linha horizontal",
				active: false,
				onClick: () => editor.chain().focus().setHorizontalRule().run(),
				children: <Minus className='h-4 w-4' />,
			})}
			<span className='mx-0.5 h-6 w-px bg-border' aria-hidden />
			{btn({
				title: "Alinhar à esquerda",
				active: editor.isActive({ textAlign: "left" }),
				onClick: () => editor.chain().focus().setTextAlign("left").run(),
				children: <AlignLeft className='h-4 w-4' />,
			})}
			{btn({
				title: "Centralizar",
				active: editor.isActive({ textAlign: "center" }),
				onClick: () => editor.chain().focus().setTextAlign("center").run(),
				children: <AlignCenter className='h-4 w-4' />,
			})}
			{btn({
				title: "Alinhar à direita",
				active: editor.isActive({ textAlign: "right" }),
				onClick: () => editor.chain().focus().setTextAlign("right").run(),
				children: <AlignRight className='h-4 w-4' />,
			})}
			<span className='mx-0.5 h-6 w-px bg-border' aria-hidden />
			{btn({
				title: "Inserir ou editar link",
				active: editor.isActive("link"),
				onClick: inserirLink,
				children: <Link2 className='h-4 w-4' />,
			})}
			{btn({
				title: "Remover formatação do trecho",
				active: false,
				onClick: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
				children: <RemoveFormatting className='h-4 w-4' />,
			})}
			<span className='mx-0.5 h-6 w-px bg-border' aria-hidden />
			<label className='flex h-8 items-center gap-1 px-1'>
				<Palette className='h-3.5 w-3.5 text-muted-foreground' aria-hidden />
				<select
					className='h-7 max-w-[7.5rem] rounded-md border border-input bg-background text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
					disabled={inativo}
					aria-label='Cor do texto'
					value={(editor.getAttributes("textStyle").color as string | undefined) ?? ""}
					onChange={(e) => {
						const v = e.target.value;
						if (!v) editor.chain().focus().unsetColor().run();
						else editor.chain().focus().setColor(v).run();
					}}>
					{CORES.map((c) => (
						<option key={c.label} value={c.hex}>
							{c.label}
						</option>
					))}
				</select>
			</label>
			<label className='flex h-8 items-center gap-1 px-1'>
				<span className='text-xs text-muted-foreground'>Tam.</span>
				<select
					className='h-7 max-w-[5.5rem] rounded-md border border-input bg-background text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
					disabled={inativo}
					aria-label='Tamanho da fonte'
					value={(editor.getAttributes("textStyle").fontSize as string | undefined) ?? ""}
					onChange={(e) => {
						const v = e.target.value;
						if (!v) editor.chain().focus().unsetFontSize().run();
						else editor.chain().focus().setFontSize(v).run();
					}}>
					{TAMANHOS_FONTE.map((t) => (
						<option key={t.label} value={t.value}>
							{t.label}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}

export function EditorDescricaoRica({ value, onChange, disabled, placeholder, id, className }: Props) {
	const editor = useEditor(
		{
			immediatelyRender: false,
			extensions: [
				StarterKit.configure({
					codeBlock: false,
					link: {
						openOnClick: false,
						autolink: true,
						HTMLAttributes: {
							class: "text-primary underline underline-offset-2",
							rel: "noopener noreferrer",
							target: "_blank",
						},
					},
					heading: { levels: [2, 3] },
				}),
				TextStyleKit.configure({
					fontFamily: false,
					lineHeight: false,
					backgroundColor: false,
				}),
				TextAlign.configure({ types: ["heading", "paragraph"] }),
				Placeholder.configure({
					placeholder: placeholder ?? "Descreva o evento…",
				}),
			],
			content: value?.trim() ? value : "<p></p>",
			editable: !disabled,
			editorProps: {
				attributes: {
					id: id ?? "evento-descricao-editor",
					"aria-multiline": "true",
					class: cn(
						"prose-descricao min-h-[180px] max-w-none px-3 py-2 text-sm outline-none",
						"focus-visible:outline-none",
						"[&.is-editor-empty::before]:pointer-events-none [&.is-editor-empty::before]:float-left [&.is-editor-empty::before]:h-0 [&.is-editor-empty::before]:text-muted-foreground [&.is-editor-empty::before]:content-[attr(data-placeholder)]",
						"[&_p.is-empty::before]:pointer-events-none [&_p.is-empty::before]:float-left [&_p.is-empty::before]:h-0 [&_p.is-empty::before]:text-muted-foreground [&_p.is-empty::before]:content-[attr(data-placeholder)]",
						"[&_a]:text-primary [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
					),
				},
			},
			onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
		},
		[]
	);

	useEffect(() => {
		editor?.setEditable(!disabled);
	}, [disabled, editor]);

	useEffect(() => {
		if (!editor) return;
		const next = value?.trim() ? value : "<p></p>";
		if (editor.getHTML() !== next) {
			editor.commands.setContent(next, { emitUpdate: false });
		}
	}, [value, editor]);

	return (
		<div
			className={cn(
				"overflow-hidden rounded-md border border-input bg-background ring-offset-background",
				"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
				disabled && "pointer-events-none opacity-60",
				className
			)}>
			<BarraFerramentas editor={editor} disabled={Boolean(disabled)} />
			<EditorContent editor={editor} className='max-h-[min(420px,55vh)] overflow-y-auto' />
		</div>
	);
}
