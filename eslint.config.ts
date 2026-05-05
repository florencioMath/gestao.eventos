import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tsEsLint from 'typescript-eslint';

export default defineConfig([
	{
		ignores: [
			'node_modules/',
			'dist/',
			'build/',
			'.vite/',
			'*.local',
			'coverage/',
			'.nyc_output/',
			'*.min.js',
			'*.min.css',
			'.eslintcache',
			'*.log',
		],
	},
	js.configs.recommended,
	...tsEsLint.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginJsxA11y.flatConfigs.recommended,
	eslintConfigPrettier,
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
		},
		settings: {
			react: { version: 'detect' },
			'import/resolver': {
				typescript: true,
				node: true,
			},
		},
		plugins: {
			'react-hooks': pluginReactHooks,
			'react-refresh': pluginReactRefresh,
			import: pluginImport,
		},
		rules: {
			...pluginReactHooks.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-empty-interface': 'off',
			'react/react-in-jsx-scope': 'off',
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},
]);
