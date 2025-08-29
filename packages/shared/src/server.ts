import { TabServerTransport } from '@mcp-b/transports';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerCapabilities } from '@modelcontextprotocol/sdk/types.js';

export interface ServerConfig {
  name: string;
  version: string;
  description?: string;
  instructions?: string;
  capabilities?: ServerCapabilities;
}

export function createServer(config: ServerConfig): McpServer {
  const server = new McpServer(
    {
      name: config.name,
      version: config.version,
    },
    {
      capabilities: {
        tools: { listChanged: true },
      },
    }
  );

  server.registerTool('ping',
    {
      description: 'Ping the server',
      inputSchema: {},
    },
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: `Pong from ${window.location.href}`,
          },
        ],
      };
    },
  );

  const transport = new TabServerTransport({
    allowedOrigins: ['*'],
  });

  try {
    server.connect(transport);
    console.log(`[${config.name}] MCP Server initialized`);
    return server;
  } catch (error) {
    console.error(`[${config.name}] Failed to initialize:`, error);
    throw error;
  }
}

export function formatSuccess(message: string, data?: any): any {
  return {
    content: [
      {
        type: 'text',
        text: data ? `${message}\n${JSON.stringify(data, null, 2)}` : message,
      },
    ],
  };
}

export function formatError(message: string, error?: any): any {
  return {
    content: [
      {
        type: 'text',
        text: error ? `${message}: ${error.message || error}` : message,
      },
    ],
    isError: true,
  };
}