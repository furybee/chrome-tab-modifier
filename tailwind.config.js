export default {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx,html}'],
	theme: {
		extend: {},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			'dim',
			'light',
			'dark',
			'cupcake',
			'valentine',
			'halloween',
			{
				tabee: {
					primary: '#fbbf24', // Amber-400 - Jaune d'abeille
					'primary-content': '#0a0a0a', // Texte foncé sur jaune
					secondary: '#f59e0b', // Amber-500 - Orange miel
					'secondary-content': '#0a0a0a', // Texte foncé sur orange
					accent: '#fde047', // Yellow-300 - Jaune clair
					'accent-content': '#0a0a0a', // Texte foncé
					neutral: '#1f1f1f', // Gris très foncé
					'neutral-content': '#e5e7eb', // Texte clair
					'base-100': '#0a0a0a', // Fond presque noir
					'base-200': '#141414', // Fond très sombre
					'base-300': '#1e1e1e', // Fond sombre
					'base-content': '#e5e7eb', // Texte principal clair
					info: '#3b82f6', // Bleu info
					'info-content': '#ffffff', // Texte blanc sur bleu
					success: '#10b981', // Vert succès
					'success-content': '#ffffff', // Texte blanc sur vert
					warning: '#f59e0b', // Orange warning (miel)
					'warning-content': '#0a0a0a', // Texte foncé sur orange
					error: '#ef4444', // Rouge erreur
					'error-content': '#ffffff', // Texte blanc sur rouge
				},
			},
		],
		base: true, // applies background color and foreground color for root element by default
		styled: true, // include daisyUI colors and design decisions for all components
		utils: true, // adds responsive and modifier utility classes
		prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
		logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
		themeRoot: ':root', // The element that receives theme color CSS variables
	},
};
