import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';

const WIDGET_URI = 'ui://flashcards-widget';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const server = new McpServer({
			name: 'Flashcards server',
			version: '1.0.0',
		});

		registerAppResource(server, 'Flashcards Widget', WIDGET_URI, { description: 'Flashcards Widget' }, async () => {
			const html = await env.ASSETS.fetch(new URL('http://dev-widgets.com/index.html'));
			return {
				contents: [
					{
						uri: WIDGET_URI,
						text: await html.text(),
						mimeType: RESOURCE_MIME_TYPE,
						_meta: {
							ui: {
								csp: {
									connectDomains: ['https://*.workers.dev'],
									resourceDomains: [
										'https://*.workers.dev',
										'https://fonts.googleapis.com',
										'https://fonts.gstatic.com',
										'https://image.tmdb.org',
									],
								},
							},
						},
					},
				],
			};
		});
		await env.FLASHCARDS_KV.put('hello', 'world');
		// create deck

		// list decks

		// open deck

		// mark card(private)

		// reset deck(private)

		// delete deck

		//@ts-ignore
		const hadler = createMcpHandler(server as unknown as Server);

		return hadler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
