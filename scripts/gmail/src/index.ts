/// <reference types="vite-plugin-monkey/client" />

const log = (level: 'info' | 'warn' | 'error', message: string, ...args: any[]) => {
  console.log(`[Gmail MCP Server] ${level}: ${message}`, ...args);
};

import { createServer } from '@webmcp-userscripts/shared/server';
import 'gmail-js';
import $ from 'jquery';

// Import observer modules
import { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { setupComposeObserver } from './observers/compose.js';
import { setupEmailViewObserver } from './observers/email-view.js';
import { setupGlobalTools } from './observers/global.js';
import { setupInboxObserver } from './observers/inbox.js';

declare global {
  interface Window {
    gmail: Gmail;
    server: import('@modelcontextprotocol/sdk/server/mcp.js').McpServer;
    $: typeof $;
    jQuery: typeof jQuery;
    _registeredTools: Map<Context, Set<RegisteredTool>>;
    _cleanupTools: (contextsToClean?: Context[]) => void;
  }
}

type Context = 'inbox' | 'email-view' | 'compose' | 'global';

(window).$ = window.$ || $;
(window).jQuery = window.jQuery || $;

// Initialize Gmail.js
// @ts-ignore: gmail-js has module resolution issues but works at runtime
const GmailFactory = await import('gmail-js');
window.gmail = window.gmail || new (GmailFactory as { Gmail: new () => Gmail }).Gmail();

// Create MCP server
window.server = window.server || createServer({
  name: 'Gmail MCP Server',
  version: '2.0.0',
});

window._registeredTools = new Map<Context, Set<RegisteredTool>>();
window._cleanupTools = (contextsToClean?: Context[]) => {
  // If specific contexts are provided, only clean those
  // Otherwise, clean all non-global contexts
  const contextList = contextsToClean || ['inbox', 'email-view', 'compose'];
  
  contextList.forEach(context => {
    if (context !== 'global') {
      const tools = window._registeredTools.get(context);
      if (tools) {
        tools.forEach(tool => tool.remove());
        window._registeredTools.delete(context);
      }
    }
  });
};


// Initialize when Gmail loads
window.gmail.observe.on('load', () => {
  log('info', 'Gmail.js loaded and interface ready');

  // Set up global tools that are always available
  setupGlobalTools();

  // Set up observer modules - they handle their own context and tool lifecycle
  setupEmailViewObserver();
  setupComposeObserver();
  setupInboxObserver();

  log('info', 'Gmail MCP Server initialized with observer-based architecture');
});

log('info', 'Gmail MCP Server v2.0 loaded');