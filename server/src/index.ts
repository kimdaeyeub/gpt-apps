import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';
import {
	fetchMovieByGenre,
	fetchMovieDetails,
	fetchMovieGenres,
	fetchMovieReviews,
	fetchNowPlayingMovies,
	fetchSimilarMovies,
	fetchUpcomingMovies,
} from './fetcher';

const WIDGET_URI = 'ui://movies-widget';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const API_KEY = env.API_KEY;
		const server = new McpServer({
			name: 'Movies',
			version: '1.0.0',
		});

		registerAppResource(server, 'Movies Widget', WIDGET_URI, { description: 'Movies Widget' }, async () => {
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

		registerAppTool(
			server,
			'get-upcoming-movies',
			{
				title: 'Get Upcoming Movies',
				description:
					'Use this when the user wants to get the movies that are going to be released soon or in the future. Do not use this for movies that are currently playing in theaters or available for streaming.',
				inputSchema: {},
				// tool이 readOnly로 인해 데이터를 읽기만 할 뿐 변형시키지 않는다는 것을 명시적으로 표시
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
					'openai/toolinvocation/invoking': 'Fetching upcoming movies...',
					'openai/toolinvocation/invoked': 'Upcoming movies fetched successfully.',
				},
			},
			async () => {
				// fetch movies from the API
				const movies = await fetchUpcomingMovies(API_KEY);
				return {
					content: [
						{
							text: 'Stuff',
							type: 'text',
						},
					],
					structuredContent: { movies },
				};
			},
		);

		registerAppTool(
			server,
			'get-now-playing-movies',
			{
				title: 'Get Now Playing Movies',
				description:
					'Use this when the user wants to get the movies that are playing right now in theaters. Do not use this for streaming movies or to check the availability of movies. Do not use this to find a specific movie.',
				inputSchema: {},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
					'openai/toolinvocation/invoking': 'Fetching now playing movies...',
					'openai/toolinvocation/invoked': 'Done',
				},
			},
			async () => {
				const movies = await fetchNowPlayingMovies(API_KEY);
				return {
					content: [
						{
							text: 'Stuff',
							type: 'text',
						},
					],
					structuredContent: { movies },
				};
			},
		);

		registerAppTool(
			server,
			'get-similar-movies',
			{
				title: 'Get Similar Movies',
				description:
					'Use this when the user wants to find similar movies to a specific movie. Requires a movie ID from a previous list. Do not use before identifying a specific movie.',
				inputSchema: {
					movieId: z
						.number()
						.positive()
						.describe(
							'The ID of the movie to find similar movies for. Obtained by calling other tools first like `get-upcoming-movies` or `get-now-playing-movies`.',
						),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
					'openai/toolInvocation/invoking': 'Fetching similar movies...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async ({ movieId }) => {
				const movies = await fetchSimilarMovies(movieId, API_KEY);
				return {
					content: [
						{
							text: 'Stuff',
							type: 'text',
						},
					],
					structuredContent: { movies },
				};
			},
		);

		registerAppTool(
			server,
			'get-movie-reviews',
			{
				title: 'Get Movie Reviews',
				description:
					'Use this when the user wants to find reviews about a specific movie. Requires a movie ID from a previous list. Do not use before identifying a specific movie.',
				inputSchema: {
					movieId: z
						.number()
						.positive()
						.describe(
							'The ID of the movie to find reviews for. Obtained by calling other tools first like `get-upcoming-movies` or `get-now-playing-movies`.',
						),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					'openai/toolInvocation/invoking': 'Fetching reviews...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async ({ movieId }) => {
				const reviews = await fetchMovieReviews(movieId, API_KEY);
				return {
					content: [
						{
							text: JSON.stringify(reviews),
							type: 'text',
						},
					],
				};
			},
		);

		registerAppTool(
			server,
			'get-movie-genres',
			{
				title: 'Get Movie Genres',
				description:
					'Use this to get the list of genres ID. This should be used before calling the `get-movies-by-genre` tool. Do not use this to search for movies directly.',
				inputSchema: {},
				annotations: { readOnlyHint: true },
				_meta: {
					'openai/toolInvocation/invoking': 'Fetching genres...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async () => {
				// fetchmovies from the api
				const genres = await fetchMovieGenres(API_KEY);
				return {
					content: [{ text: JSON.stringify(genres), type: 'text' }],
				};
			},
		);

		registerAppTool(
			server,
			'get-movies-by-genre',
			{
				title: 'Get Movies by Genre',
				description:
					'Use this when the user wants to find movies by a specific genre. Use `get-movie-genres` first to get the list of genre IDs first.',
				inputSchema: {
					genreId: z
						.number()
						.positive()
						.describe(
							'The ID of the genre to find movies for. Obtained by calling `get-movie-genres` tool. (example: 28 for Action, 99 for documentary)',
						),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
					'openai/toolInvocation/invoking': 'Fetching movies...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async ({ genreId }) => {
				// fetchmovies from the api
				const movies = await fetchMovieByGenre(genreId, API_KEY);
				return {
					content: [{ text: 'stuff', type: 'text' }],
					structuredContent: { movies },
				};
			},
		);

		registerAppTool(
			server,
			'get-movie-details',
			{
				title: 'Get Movie Details',
				description:
					'Use this when the user wants to see more details about a specific movie. Details like synopsis, cast, and production companies are available here. Requires a movie ID from a previous list. Do not use this tool before identifying the movie.',
				inputSchema: {
					movieId: z.number().positive().describe('The ID of the movie to find details for. Obtained by any of the list movie tools'),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
					'openai/toolInvocation/invoking': 'Fetching movie details...',
					'openai/toolInvocation/invoked': 'Done.',
				},
			},
			async ({ movieId }) => {
				// fetchmovies from the api
				const movie = await fetchMovieDetails(movieId, API_KEY);
				return {
					content: [{ text: 'stuff', type: 'text' }],
					structuredContent: { movie },
				};
			},
		);

		//@ts-ignore
		const hadler = createMcpHandler(server as unknown as Server);

		return hadler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
