import { z } from 'zod';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { formatSuccess, formatError } from '@webmcp-userscripts/shared/server';

export function setupGlobalTools() {
  console.log('[Gmail MCP] Setting up global tools');

  // Initialize global tools set if not exists
  if (!window._registeredTools.has('global')) {
    window._registeredTools.set('global', new Set());
  }
  const globalTools = window._registeredTools.get('global')!;

  // Go to Inbox
  const homeTool = window.server.registerTool(
    'gmail_go_home',
    {
      title: 'Go to Inbox',
      description: 'Navigate to the inbox',
      inputSchema: {},
    },
    async () => {
      try {
        const inboxLink = document.querySelector('a[href*="#inbox"]') as HTMLElement;
        if (inboxLink) {
          inboxLink.click();
          return formatSuccess('Navigated to inbox');
        }
        
        // Fallback to URL navigation
        window.location.hash = '#inbox';
        return formatSuccess('Navigated to inbox');
      } catch (error) {
        return formatError('Failed to navigate to inbox', error);
      }
    }
  );
  globalTools.add(homeTool);

  // Search
  const searchTool = window.server.registerTool(
    'gmail_search',
    {
      title: 'Search Emails',
      description: 'Search for emails',
      inputSchema: {
        query: z.string().describe('Search query')
      },
    },
    async ({ query }) => {
      try {
        const searchBox = document.querySelector('input[aria-label*="Search"]') as HTMLInputElement;
        if (!searchBox) {
          return formatError('Search box not found');
        }

        searchBox.value = query;
        searchBox.focus();
        
        // Trigger search
        const event = new KeyboardEvent('keypress', { key: 'Enter', keyCode: 13 });
        searchBox.dispatchEvent(event);

        return formatSuccess('Search performed', { query });
      } catch (error) {
        return formatError('Failed to perform search', error);
      }
    }
  );
  globalTools.add(searchTool);

  // Refresh
  const refreshTool = window.server.registerTool(
    'gmail_refresh',
    {
      title: 'Refresh',
      description: 'Refresh the current view',
      inputSchema: {},
    },
    async () => {
      try {
        const refreshButton = document.querySelector('[aria-label*="Refresh"]') as HTMLElement;
        if (refreshButton) {
          refreshButton.click();
          return formatSuccess('Refreshed');
        }
        
        // Fallback to page reload
        window.location.reload();
        return formatSuccess('Page refreshed');
      } catch (error) {
        return formatError('Failed to refresh', error);
      }
    }
  );
  globalTools.add(refreshTool);

  // Go Back
  const backTool = window.server.registerTool(
    'gmail_go_back',
    {
      title: 'Go Back',
      description: 'Navigate back to the previous view',
      inputSchema: {},
    },
    async () => {
      try {
        // Try to find back button
        const backButton = document.querySelector('[aria-label*="Back"]') as HTMLElement;
        if (backButton) {
          backButton.click();
          return formatSuccess('Navigated back');
        }

        // Fallback to browser back
        window.history.back();
        return formatSuccess('Navigated back');
      } catch (error) {
        return formatError('Failed to navigate back', error);
      }
    }
  );
  globalTools.add(backTool);

  // Get Current Context Info
  const contextTool = window.server.registerTool(
    'gmail_get_context',
    {
      title: 'Get Current Context',
      description: 'Get information about the current Gmail view',
      inputSchema: {},
    },
    async () => {
      try {
        const page = window.gmail.get.current_page();
        const userEmail = window.gmail.get.user_email();
        const unreadCounts = window.gmail.get.unread_emails();
        
        return formatSuccess('Current context retrieved', {
          currentPage: page,
          userEmail: userEmail,
          isInsideEmail: window.gmail.check.is_inside_email(),
          composeWindows: window.gmail.dom.composes().length,
          unreadCounts: unreadCounts
        });
      } catch (error) {
        return formatError('Failed to get context', error);
      }
    }
  );
  globalTools.add(contextTool);
}

// Clean up function (though global tools typically don't need cleanup)
export function cleanupGlobalTools() {
  const globalTools = window._registeredTools.get('global');
  if (globalTools) {
    globalTools.forEach(tool => tool.remove());
    globalTools.clear();
  }
}