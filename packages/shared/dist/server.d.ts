import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServerCapabilities } from '@modelcontextprotocol/sdk/types.js';

interface ServerConfig {
    name: string;
    version: string;
    description?: string;
    instructions?: string;
    capabilities?: ServerCapabilities;
}
declare function createServer(config: ServerConfig): McpServer;
declare function formatSuccess(message: string, data?: any): any;
declare function formatError(message: string, error?: any): any;

export { type ServerConfig, createServer, formatError, formatSuccess };
