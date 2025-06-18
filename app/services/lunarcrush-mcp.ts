/**
 * LunarCrush MCP Service
 *
 * This service handles all communication with the LunarCrush MCP server.
 * It demonstrates the power of the Model Context Protocol for transparent,
 * standardized data access compared to direct API integration.
 *
 * Key benefits of MCP vs Direct API:
 * - Standardized protocol for consistent error handling
 * - Type-safe request/response patterns
 * - Built-in session management and authentication
 * - Real-time streaming capabilities via SSE
 * - Full transparency of data flow
 */

import https from 'https';
import { URL } from 'url';

// Types for better developer experience
export interface CryptoData {
	symbol: string;
	name: string;
	price?: number;
	volume_24h?: number;
	galaxy_score?: number;
	alt_rank?: number;
	social_mentions?: number;
	social_engagements?: number;
	social_dominance?: number;
	market_cap?: number;
}

export interface TradingSignal {
	symbol: string;
	recommendation: 'BUY' | 'SELL' | 'HOLD';
	confidence: number;
	reasoning: string;
	social_sentiment: 'bullish' | 'bearish' | 'neutral';
	data: CryptoData;
}

class LunarCrushMCPService {
	private apiKey: string;
	private sessionId: string | null = null;
	private messageEndpoint: string | null = null;
	private sseConnection: any = null;
	private sseResponse: any = null;
	private pendingRequests = new Map();

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	/**
	 * Generate unique request ID for tracking MCP requests
	 */
	private generateId(): string {
		return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Initialize MCP connection using Server-Sent Events
	 * This demonstrates the real-time capabilities of MCP
	 */
	async initializeConnection(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.log('🔑 Connecting to LunarCrush MCP...');

			const sseUrl = `https://lunarcrush.ai/sse?key=${this.apiKey}`;
			const url = new URL(sseUrl);

			const options = {
				hostname: url.hostname,
				port: url.port || 443,
				path: url.pathname + url.search,
				method: 'GET',
				headers: {
					Accept: 'text/event-stream',
					'Cache-Control': 'no-cache',
				},
			};

			this.sseConnection = https.request(options, (res) => {
				if (res.statusCode !== 200) {
					reject(new Error(`SSE failed with status ${res.statusCode}`));
					return;
				}

				this.sessionId = res.headers['mcp-session-id'] as string;
				this.sseResponse = res;
				console.log(
					`✅ MCP Connected - Session: ${this.sessionId?.substring(0, 10)}...`
				);

				let buffer = '';
				let foundEndpoint = false;

				res.on('data', (chunk) => {
					buffer += chunk.toString();
					const lines = buffer.split('\n');

					for (let i = 0; i < lines.length - 1; i++) {
						const line = lines[i];

						if (line.startsWith('data: ') && line.includes('/sse/message')) {
							this.messageEndpoint = line.replace('data: ', '');
							console.log('✅ Message endpoint ready');
							foundEndpoint = true;
						} else if (
							line.startsWith('data: {') &&
							line.includes('"jsonrpc"')
						) {
							try {
								const jsonData = JSON.parse(line.replace('data: ', ''));
								this.handleResponse(jsonData);
							} catch (error) {
								console.log('❌ JSON parse error:', error);
							}
						}
					}

					buffer = lines[lines.length - 1];
					if (foundEndpoint) resolve();
				});

				res.on('error', reject);
				res.on('end', () => console.log('🔚 MCP Connection ended'));
			});

			this.sseConnection.on('error', reject);
			this.sseConnection.setTimeout(30000, () =>
				reject(new Error('Connection timeout'))
			);
			this.sseConnection.end();
		});
	}

	/**
	 * Handle MCP responses and resolve pending requests
	 */
	private handleResponse(jsonData: any): void {
		if (jsonData.id && this.pendingRequests.has(jsonData.id)) {
			const { resolve, reject } = this.pendingRequests.get(jsonData.id);
			this.pendingRequests.delete(jsonData.id);

			if (jsonData.error) {
				reject(new Error(`MCP Error: ${JSON.stringify(jsonData.error)}`));
			} else {
				resolve(jsonData.result || jsonData);
			}
		}
	}

	/**
	 * Generic MCP request method
	 * This shows the standardized request pattern of MCP
	 */
	private async makeRequest(method: string, params?: any): Promise<any> {
		if (!this.messageEndpoint) {
			throw new Error(
				'MCP not initialized. Call initializeConnection() first.'
			);
		}

		const requestId = this.generateId();

		return new Promise((resolve, reject) => {
			this.pendingRequests.set(requestId, { resolve, reject });

			const requestData = JSON.stringify({
				jsonrpc: '2.0',
				id: requestId,
				method,
				...(params && { params }),
			});

			const options = {
				hostname: 'lunarcrush.ai',
				port: 443,
				path: this.messageEndpoint,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(requestData),
				},
			};

			const req = https.request(options, (res) => {
				if (res.statusCode !== 202 && res.statusCode !== 200) {
					let errorData = '';
					res.on('data', (chunk) => (errorData += chunk));
					res.on('end', () => {
						this.pendingRequests.delete(requestId);
						reject(
							new Error(`Request failed: ${res.statusCode} - ${errorData}`)
						);
					});
				}
			});

			req.on('error', (err) => {
				this.pendingRequests.delete(requestId);
				reject(err);
			});

			req.write(requestData);
			req.end();

			// Timeout handling
			setTimeout(() => {
				if (this.pendingRequests.has(requestId)) {
					this.pendingRequests.delete(requestId);
					reject(new Error(`Request timeout: ${method}`));
				}
			}, 15000);
		});
	}

	/**
	 * Get cryptocurrency data using MCP Topic tool
	 * This demonstrates the transparency of MCP data access
	 */
	async getCryptocurrencyData(symbol: string): Promise<CryptoData> {
		try {
			console.log(`📊 Fetching data for ${symbol} via MCP...`);

			const result = await this.makeRequest('tools/call', {
				name: 'Topic',
				arguments: {
					topic: symbol.toLowerCase(),
				},
			});

			if (result.content && result.content[0]) {
				const data = result.content[0].text;
				const parsed = JSON.parse(data);

				return {
					symbol: symbol.toUpperCase(),
					name: parsed.name || symbol,
					price: parsed.price,
					volume_24h: parsed.volume_24h,
					galaxy_score: parsed.galaxy_score,
					alt_rank: parsed.alt_rank,
					social_mentions: parsed.social_mentions,
					social_engagements: parsed.social_engagements,
					social_dominance: parsed.social_dominance,
					market_cap: parsed.market_cap,
				};
			}

			throw new Error('No data returned from MCP');
		} catch (error) {
			console.error(`❌ Error fetching ${symbol}:`, error);
			throw error;
		}
	}

	/**
	 * Clean up MCP connections
	 */
	disconnect(): void {
		if (this.sseConnection) this.sseConnection.destroy();
		if (this.sseResponse) this.sseResponse.destroy();
		this.sessionId = null;
		this.messageEndpoint = null;
		this.pendingRequests.clear();
	}
}

export default LunarCrushMCPService;
