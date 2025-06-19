// src/hooks/useGeminiMcp.js
import { useMcp } from 'use-mcp/react';

const useMcpServer = ({ url, clientName, autoReconnect = true, config }) => {
	// MCP connection via use-mcp
	const {
		state, // Connection state: 'discovering' | 'authenticating' | 'connecting' | 'loading' | 'ready' | 'failed'
		tools, // Available tools from MCP server
		callTool, // Function to call tools on the MCP server
	} = useMcp({
		url,
		clientName,
		autoReconnect,
		...config,
	});

	return {
		tools,
		callTool,
		state,
	};
};

export default useMcpServer;
