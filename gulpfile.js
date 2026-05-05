import fs from 'fs';
import gulp from 'gulp';
import inquirer from 'inquirer';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Utilitários
function toPascalCase(str) {
	return str
		.split(/[-_\s]+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('');
}

function toCamelCase(str) {
	const pascal = toPascalCase(str);
	return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(str) {
	return str
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase();
}

function replaceTemplateVars(content, vars) {
	let result = content;
	Object.keys(vars).forEach((key) => {
		const regex = new RegExp(`<%=\\s*${key}\\s*%>`, 'g');
		result = result.replace(regex, vars[key]);
	});
	return result;
}

function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

// ─── Auto-registro em arquivos existentes ───

/**
 * Insere uma linha antes de um marcador de comentário no arquivo.
 * Retorna true se o marcador foi encontrado e a inserção realizada.
 */
function insertBeforeMarker(filePath, marker, lineToInsert) {
	if (!fs.existsSync(filePath)) return false;

	const content = fs.readFileSync(filePath, 'utf8');
	if (!content.includes(marker)) return false;
	if (content.includes(lineToInsert.trim())) return false; // já existe

	const updated = content.replace(marker, `${lineToInsert}\n${marker}`);
	fs.writeFileSync(filePath, updated);
	return true;
}

/**
 * Registra as rotas de uma feature no router central (src/routes/index.tsx).
 * - Adiciona o import da feature
 * - Adiciona o spread das rotas no layout correto (privado ou público)
 */
function registerRouteInRouter({ featureName, featureNameCamel, isPrivate }) {
	const routerPath = path.join(__dirname, 'src', 'routes', 'index.tsx');
	const importLine = `import { ${featureNameCamel}Routes } from '@/features/${featureName}';`;
	const routeSpread = isPrivate
		? `\t\t\t...${featureNameCamel}Routes,`
		: `\t\t\t...${featureNameCamel}Routes,`;
	const routeMarker = isPrivate
		? '// [generate:private-route]'
		: '// [generate:public-route]';

	const importOk = insertBeforeMarker(routerPath, '// [generate:import]', importLine);
	const routeOk = insertBeforeMarker(routerPath, routeMarker, routeSpread);

	return { importOk, routeOk };
}

/**
 * Registra um link na navbar do layout privado (src/layouts/private-layout.tsx).
 * - Adiciona o import do path da feature
 * - Adiciona o objeto de link no array de links
 */
function registerNavLink({ featureName, featureNameCamel, featureNamePascal, routePath, claim }) {
	const layoutPath = path.join(__dirname, 'src', 'layouts', 'private-layout.tsx');
	const importLine = `import { ${featureNameCamel}Path } from '@/features/${featureName}/routes/${featureName}/route';`;

	let linkEntry;
	if (claim) {
		linkEntry = `\t\t{ path: ${featureNameCamel}Path, label: '${featureNamePascal}', claim: '${claim}' },`;
	} else {
		linkEntry = `\t\t{ path: ${featureNameCamel}Path, label: '${featureNamePascal}' },`;
	}

	const importOk = insertBeforeMarker(layoutPath, '// [generate:import]', importLine);
	const linkOk = insertBeforeMarker(layoutPath, '// [generate:nav-link]', linkEntry);

	return { importOk, linkOk };
}

// Task: Criar nova feature
gulp.task('generate:feature', async () => {
	const answers = await inquirer.prompt([
		{
			type: 'input',
			name: 'featureName',
			message: 'Nome da feature (ex: produtos, usuarios):',
			validate: (input) => {
				if (!input) return 'Nome da feature é obrigatório!';
				return true;
			},
		},
		{
			type: 'input',
			name: 'routePath',
			message: 'Caminho da rota principal (ex: /produtos, /dashboard):',
			validate: (input) => {
				if (!input) return 'Caminho da rota é obrigatório!';
				if (!input.startsWith('/')) return 'O caminho deve começar com /';
				return true;
			},
			default: (answers) => `/${toKebabCase(answers.featureName)}`,
		},
		{
			type: 'input',
			name: 'pageTitle',
			message: 'Título da página principal:',
			default: (answers) => toPascalCase(answers.featureName),
		},
		{
			type: 'list',
			name: 'apiType',
			message: 'Tipo de API para o serviço:',
			choices: [
				{ name: 'API Privada (requer autenticação)', value: 'api' },
				{ name: 'API Pública (sem autenticação)', value: 'apiPublic' },
			],
			default: 'api',
		},
		{
			type: 'confirm',
			name: 'includeComponent',
			message: 'Incluir componente de exemplo (Card)?',
			default: true,
		},
		{
			type: 'confirm',
			name: 'autoRegister',
			message: 'Registrar rotas e navbar automaticamente?',
			default: true,
		},
		{
			type: 'confirm',
			name: 'protectWithClaim',
			message: 'Proteger rotas por claim (permissão)?',
			default: (answers) => answers.apiType === 'api',
		},
		{
			type: 'input',
			name: 'claimResource',
			message: 'Nome do recurso para claims (ex: users, products):',
			when: (answers) => answers.protectWithClaim,
			default: (answers) => toKebabCase(answers.featureName),
			validate: (input) => {
				if (!input) return 'Nome do recurso é obrigatório!';
				if (input.includes('.'))
					return 'Informe apenas o nome do recurso (sem ação). Ex: users, products';
				return true;
			},
		},
	]);

	const featureName = toKebabCase(answers.featureName);
	const featureNamePascal = toPascalCase(answers.featureName);
	const featureNameCamel = toCamelCase(answers.featureName);
	const featurePath = path.join(__dirname, 'src', 'features', featureName);

	// Verificar se a feature já existe
	if (fs.existsSync(featurePath)) {
		console.error(`❌ A feature "${featureName}" já existe!`);
		return;
	}

	// Criar estrutura de diretórios
	const routesPath = path.join(featurePath, 'routes');
	const mainPagePath = path.join(routesPath, featureName);
	const apiPath = path.join(featurePath, 'api');
	const typesPath = path.join(featurePath, 'types');
	const componentsPath = path.join(featurePath, 'components');
	ensureDirectoryExists(featurePath);
	ensureDirectoryExists(routesPath);
	ensureDirectoryExists(mainPagePath);
	ensureDirectoryExists(apiPath);
	ensureDirectoryExists(typesPath);
	if (answers.includeComponent) {
		ensureDirectoryExists(componentsPath);
	}

	// Criar index.ts da feature (dinâmico baseado nas opções)
	let indexContent = `import { ${featureNameCamel}Routes } from './routes/routes';\n\n`;
	indexContent += `export { ${featureNameCamel}Routes };\n`;
	indexContent += `export { ${featureNamePascal}Service } from './api/service';\n`;
	indexContent += `export type * from './types';\n`;

	if (answers.includeComponent) {
		indexContent += `export { ${featureNamePascal}Card } from './components/${featureName}-card';\n`;
	}

	indexContent += '\n';
	fs.writeFileSync(path.join(featurePath, 'index.ts'), indexContent);

	// Criar api/service.ts
	const serviceTemplate = fs.readFileSync(
		path.join(__dirname, 'templates', 'feature', 'service.ts.template'),
		'utf8'
	);
	const serviceContent = replaceTemplateVars(serviceTemplate, {
		featureName: featureName,
		FeatureName: featureNamePascal,
		apiPath: answers.routePath,
		apiType: answers.apiType,
	});
	fs.writeFileSync(path.join(apiPath, 'service.ts'), serviceContent);

	// Criar types/index.d.ts
	const typesTemplate = fs.readFileSync(
		path.join(__dirname, 'templates', 'feature', 'types.d.ts.template'),
		'utf8'
	);
	const typesContent = replaceTemplateVars(typesTemplate, {
		featureName: featureName,
		FeatureName: featureNamePascal,
	});
	fs.writeFileSync(path.join(typesPath, 'index.d.ts'), typesContent);

	// Criar components/feature-card.tsx (se solicitado)
	if (answers.includeComponent) {
		const componentTemplateName = answers.protectWithClaim
			? 'component-with-claims.tsx.template'
			: 'component.tsx.template';
		const componentTemplate = fs.readFileSync(
			path.join(__dirname, 'templates', 'feature', componentTemplateName),
			'utf8'
		);
		const componentVars = {
			featureName: featureName,
			FeatureName: featureNamePascal,
		};
		if (answers.protectWithClaim) {
			componentVars.claimEdit = `${answers.claimResource}.edit`;
			componentVars.claimDelete = `${answers.claimResource}.delete`;
		}
		const componentContent = replaceTemplateVars(componentTemplate, componentVars);
		fs.writeFileSync(path.join(componentsPath, `${featureName}-card.tsx`), componentContent);
	}

	// Criar página principal - page.tsx
	const pageTemplate = fs.readFileSync(
		path.join(__dirname, 'templates', 'page', 'page.tsx.template'),
		'utf8'
	);
	const pageContent = replaceTemplateVars(pageTemplate, {
		pageName: featureNamePascal,
		pageTitle: answers.pageTitle,
	});
	fs.writeFileSync(path.join(mainPagePath, 'page.tsx'), pageContent);

	// Criar página principal - route.tsx
	const routeTemplateName = answers.protectWithClaim
		? 'route-with-claim.tsx.template'
		: 'route.tsx.template';
	const routeTemplate = fs.readFileSync(
		path.join(__dirname, 'templates', 'page', routeTemplateName),
		'utf8'
	);
	const routeVars = {
		pageName: featureNamePascal,
		pageNameLower: featureNameCamel,
		routePath: answers.routePath,
	};
	if (answers.protectWithClaim) {
		routeVars.claimName = `${answers.claimResource}.view`;
	}
	const routeContent = replaceTemplateVars(routeTemplate, routeVars);
	fs.writeFileSync(path.join(mainPagePath, 'route.tsx'), routeContent);

	// Criar routes.tsx com a página principal já importada
	const routesContent = `import type { RouteObject } from 'react-router-dom';
import { ${featureNameCamel}Route } from './${featureName}/route';

export const ${featureNameCamel}Routes: RouteObject[] = [${featureNameCamel}Route];
`;
	fs.writeFileSync(path.join(routesPath, 'routes.tsx'), routesContent);

	// ─── Auto-registro em rotas e navbar ───
	if (answers.autoRegister) {
		const isPrivate = answers.apiType === 'api';

		const routeResult = registerRouteInRouter({
			featureName,
			featureNameCamel,
			isPrivate,
		});

		if (routeResult.importOk && routeResult.routeOk) {
			console.log(`\n🔗 Rotas registradas automaticamente em src/routes/index.tsx`);
		} else if (!routeResult.importOk && !routeResult.routeOk) {
			console.log(`\n⚠️  Marcadores não encontrados em src/routes/index.tsx`);
			console.log(`   Registre manualmente: import { ${featureNameCamel}Routes } from '@/features/${featureName}';`);
		} else {
			console.log(`\n⚠️  Registro parcial em src/routes/index.tsx (verifique o arquivo)`);
		}

		// Registrar na navbar somente para rotas privadas
		if (isPrivate) {
			const claim = answers.protectWithClaim ? `${answers.claimResource}.view` : null;

			const navResult = registerNavLink({
				featureName,
				featureNameCamel,
				featureNamePascal,
				routePath: answers.routePath,
				claim,
			});

			if (navResult.importOk && navResult.linkOk) {
				console.log(`🗂️  Link adicionado automaticamente na navbar`);
			} else if (!navResult.importOk && !navResult.linkOk) {
				console.log(`⚠️  Marcadores não encontrados em src/layouts/private-layout.tsx`);
				console.log(`   Adicione manualmente o link na navbar.`);
			} else {
				console.log(`⚠️  Registro parcial na navbar (verifique o arquivo)`);
			}
		}
	}

	console.log(`\n✅ Feature "${featureName}" criada com sucesso!`);
	console.log(`📂 Localização: ${featurePath}`);
	console.log(`\n📦 Arquivos criados:`);
	console.log(`   • ${featureName}/index.ts`);
	console.log(`   • ${featureName}/api/service.ts`);
	console.log(`   • ${featureName}/types/index.d.ts`);
	if (answers.includeComponent) {
		console.log(`   • ${featureName}/components/${featureName}-card.tsx`);
	}
	console.log(`   • ${featureName}/routes/routes.tsx`);
	console.log(`   • ${featureName}/routes/${featureName}/page.tsx`);
	console.log(`   • ${featureName}/routes/${featureName}/route.tsx`);

	if (answers.autoRegister) {
		console.log(`   • src/routes/index.tsx (atualizado)`);
		if (answers.apiType === 'api') {
			console.log(`   • src/layouts/private-layout.tsx (atualizado)`);
		}
	}

	console.log(`\n📝 Próximos passos:`);
	console.log(`   1. Personalize os tipos em ${featureName}/types/index.d.ts`);
	console.log(`   2. Ajuste as chamadas de API em ${featureName}/api/service.ts`);
	console.log(`   3. Adicione mais páginas: npm run generate:page`);

	if (!answers.autoRegister) {
		console.log(
			`   4. Importe as rotas em src/routes/index.tsx:\n      import { ${featureNameCamel}Routes } from '@/features/${featureName}';`
		);
	}

	if (answers.protectWithClaim) {
		console.log(`\n🔐 Claims configuradas:`);
		console.log(`   • Rota protegida com claim: "${answers.claimResource}.view"`);
		if (answers.includeComponent) {
			console.log(`   • Botão Editar protegido com: "${answers.claimResource}.edit"`);
			console.log(`   • Botão Deletar protegido com: "${answers.claimResource}.delete"`);
		}
		if (!answers.autoRegister) {
			console.log(`\n   📌 Adicione o link na navbar (src/layouts/private-layout.tsx):`);
			console.log(
				`      { path: '${answers.routePath}', label: '${featureNamePascal}', claim: '${answers.claimResource}.view' }`
			);
		}
		console.log(`\n   📌 Certifique-se de que o backend envia as claims no login:`);
		console.log(`      "${answers.claimResource}.view", "${answers.claimResource}.edit", "${answers.claimResource}.delete"`);
	}
});

// Task: Criar nova página
gulp.task('generate:page', async () => {
	// Listar features disponíveis
	const featuresPath = path.join(__dirname, 'src', 'features');
	const features = fs
		.readdirSync(featuresPath, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	if (features.length === 0) {
		console.error(
			'❌ Nenhuma feature encontrada! Crie uma feature primeiro com: npm run generate:feature'
		);
		return;
	}

	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'feature',
			message: 'Selecione a feature:',
			choices: features,
		},
		{
			type: 'input',
			name: 'pageName',
			message: 'Nome da página (ex: listar-produtos, editar-usuario):',
			validate: (input) => {
				if (!input) return 'Nome da página é obrigatório!';
				return true;
			},
		},
		{
			type: 'input',
			name: 'routePath',
			message: 'Caminho da rota (ex: /produtos, /usuario/editar):',
			validate: (input) => {
				if (!input) return 'Caminho da rota é obrigatório!';
				if (!input.startsWith('/')) return 'O caminho deve começar com /';
				return true;
			},
		},
		{
			type: 'input',
			name: 'pageTitle',
			message: 'Título da página (ex: Listagem de Produtos):',
			default: (answers) => toPascalCase(answers.pageName),
		},
		{
			type: 'confirm',
			name: 'protectWithClaim',
			message: 'Proteger rota por claim (permissão)?',
			default: false,
		},
		{
			type: 'input',
			name: 'claimName',
			message: 'Claim necessária (ex: users.view, products.edit):',
			when: (answers) => answers.protectWithClaim,
			default: (answers) => `${toKebabCase(answers.feature)}.view`,
			validate: (input) => {
				if (!input) return 'A claim é obrigatória!';
				if (!input.includes('.'))
					return 'A claim deve seguir o formato recurso.ação (ex: users.view)';
				return true;
			},
		},
	]);

	const featurePath = path.join(featuresPath, answers.feature);
	const routesPath = path.join(featurePath, 'routes');
	const pageFolder = toKebabCase(answers.pageName);
	const pagePath = path.join(routesPath, pageFolder);

	// Verificar se a página já existe
	if (fs.existsSync(pagePath)) {
		console.error(`❌ A página "${pageFolder}" já existe nesta feature!`);
		return;
	}

	// Criar diretório da página
	ensureDirectoryExists(pagePath);

	const pageName = toPascalCase(answers.pageName);
	const pageNameCamel = toCamelCase(answers.pageName);

	// Criar page.tsx
	const pageTemplate = fs.readFileSync(
		path.join(__dirname, 'templates', 'page', 'page.tsx.template'),
		'utf8'
	);
	const pageContent = replaceTemplateVars(pageTemplate, {
		pageName: pageName,
		pageTitle: answers.pageTitle,
	});
	fs.writeFileSync(path.join(pagePath, 'page.tsx'), pageContent);

	// Criar route.tsx
	const routeTemplateName = answers.protectWithClaim
		? 'route-with-claim.tsx.template'
		: 'route.tsx.template';
	const routeTemplate = fs.readFileSync(
		path.join(__dirname, 'templates', 'page', routeTemplateName),
		'utf8'
	);
	const routeVars = {
		pageName: pageName,
		pageNameLower: pageNameCamel,
		routePath: answers.routePath,
	};
	if (answers.protectWithClaim) {
		routeVars.claimName = answers.claimName;
	}
	const routeContent = replaceTemplateVars(routeTemplate, routeVars);
	fs.writeFileSync(path.join(pagePath, 'route.tsx'), routeContent);

	console.log(`✅ Página "${pageFolder}" criada com sucesso!`);
	console.log(`📂 Localização: ${pagePath}`);
	if (answers.protectWithClaim) {
		console.log(`🔐 Rota protegida com claim: "${answers.claimName}"`);
	}
	console.log(`\n📝 Próximos passos:`);
	console.log(`   1. Importe a rota em ${path.join(routesPath, 'routes.tsx')}`);
	console.log(`      import { ${pageNameCamel}Route } from './${pageFolder}/route';`);
	console.log(
		`   2. Adicione à array de rotas: export const ${toCamelCase(answers.feature)}Routes: RouteObject[] = [${pageNameCamel}Route];`
	);
	if (answers.protectWithClaim) {
		console.log(`\n   📌 Certifique-se de que o backend envia a claim "${answers.claimName}" no login.`);
	}
});

// Task: Listar todas as features
gulp.task('list:features', (done) => {
	const featuresPath = path.join(__dirname, 'src', 'features');

	if (!fs.existsSync(featuresPath)) {
		console.log('📂 Nenhuma feature encontrada.');
		done();
		return;
	}

	const features = fs
		.readdirSync(featuresPath, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	if (features.length === 0) {
		console.log('📂 Nenhuma feature encontrada.');
	} else {
		console.log('\n📦 Features disponíveis:\n');
		features.forEach((feature) => {
			const featurePath = path.join(featuresPath, feature);
			const routesPath = path.join(featurePath, 'routes');

			console.log(`   • ${feature}`);

			if (fs.existsSync(routesPath)) {
				const pages = fs
					.readdirSync(routesPath, { withFileTypes: true })
					.filter((dirent) => dirent.isDirectory())
					.map((dirent) => dirent.name);

				if (pages.length > 0) {
					pages.forEach((page) => {
						console.log(`     └─ ${page}`);
					});
				}
			}
		});
		console.log('');
	}

	done();
});

// Task padrão - mostra ajuda
gulp.task('default', (done) => {
	console.log('\n🚀 Gerador de Features e Páginas\n');
	console.log('Comandos disponíveis:\n');
	console.log('  npm run generate:feature  - Criar nova feature');
	console.log('  npm run generate:page     - Criar nova página em uma feature');
	console.log('  npm run list:features     - Listar todas as features e páginas');
	console.log('');
	done();
});
