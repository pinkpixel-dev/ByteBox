// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'ByteBox Docs',
			description: 'Official documentation for ByteBox: setup, operation, concepts, and API behavior.',
			logo: {
				src: './src/assets/logo_banner.png',
				alt: 'ByteBox',
				replacesTitle: true,
			},
			favicon: '/favicon.png',
			customCss: ['./src/styles/bytebox-docs.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/pinkpixel-dev/bytebox' }],
			components: {
				Sidebar: './src/components/starlight/Sidebar.astro',
				Footer: './src/components/starlight/Footer.astro',
				MobileMenuFooter: './src/components/starlight/MobileMenuFooter.astro',
				SocialIcons: './src/components/starlight/SocialIcons.astro',
			},
			sidebar: [
				{
					label: 'Foundations',
					items: [
						{ label: 'Getting Started', slug: 'getting-started' },
						{ label: 'Running ByteBox', slug: 'running-bytebox' },
						{ label: 'Architecture', slug: 'architecture' },
						{ label: 'Core Concepts', slug: 'core-concepts' },
						{ label: 'Data Model', slug: 'data-model' },
						{ label: 'Theming & Appearance', slug: 'theming-and-appearance' },
					],
				},
				{
					label: 'Integrations',
					items: [
						{ label: 'API Overview', slug: 'api-overview' },
						{ label: 'Backup & Portability', slug: 'backup-and-portability' },
						{ label: 'Docker Deployment', slug: 'docker-deployment' },
						{ label: 'Electron Desktop', slug: 'electron-desktop' },
						{ label: 'Cloudflare Pages', slug: 'cloudflare-pages' },
					],
				},
				{
					label: 'Development',
					items: [
						{ label: 'Developer Guide', slug: 'developer-guide' },
						{ label: 'Contributing', slug: 'contributing' },
						{ label: 'Troubleshooting', slug: 'troubleshooting' },
						{ label: 'Changelog Highlights', slug: 'changelog' },
					],
				},
			],
		}),
	],
});
