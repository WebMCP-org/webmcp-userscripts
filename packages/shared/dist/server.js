import { TabServerTransport } from '@mcp-b/transports';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// src/server.ts
async function createServer(config) {
  const server = new McpServer(
    {
      name: config.name,
      version: config.version
    },
    {
      capabilities: config.capabilities || {
        tools: { listChanged: true }
      },
      ...config.instructions && { instructions: config.instructions }
    }
  );
  const transport = new TabServerTransport({
    allowedOrigins: ["*"]
  });
  try {
    await server.connect(transport);
    console.log(`[${config.name}] MCP Server initialized`);
    return server;
  } catch (error) {
    console.error(`[${config.name}] Failed to initialize:`, error);
    throw error;
  }
}
function formatSuccess(message, data) {
  return {
    content: [
      {
        type: "text",
        text: data ? `${message}
${JSON.stringify(data, null, 2)}` : message
      }
    ]
  };
}
function formatError(message, error) {
  return {
    content: [
      {
        type: "text",
        text: error ? `${message}: ${error.message || error}` : message
      }
    ],
    isError: true
  };
}

export { createServer, formatError, formatSuccess };
