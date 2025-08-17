import { createServer, formatSuccess, formatError } from '@webmcp-userscripts/shared/server';
import {
  clickElement,
  typeText,
  waitForSelector,
  getElementText,
  getAllElements,
  isElementVisible,
  pressKey
} from '@webmcp-userscripts/shared/dom';
import { z } from 'zod';

const server = await createServer({
  name: 'ChatGPT MCP Server',
  version: '1.0.0',
});

// Get current page info
server.registerTool(
  'chatgpt_get_info',
  {
    description: 'Get current ChatGPT page information',
    inputSchema: {},
  },
  async () => {
    return formatSuccess('Page info retrieved', {
      title: document.title,
      url: window.location.href,
      isLoggedIn: !!document.querySelector('[data-testid="profile-button"]'),
      hasActiveChat: !!document.querySelector('[data-testid="conversation-content"]')
    });
  }
);

// Send a message to ChatGPT
server.registerTool(
  'chatgpt_send_message',
  {
    description: 'Send a message to ChatGPT',
    inputSchema: {
      message: z.string().describe('The message to send to ChatGPT'),
    },
  },
  async ({ message }) => {
    // Find the message input field - ChatGPT uses a contenteditable div
    const messageInput = document.querySelector('#prompt-textarea, [contenteditable="true"]') as HTMLElement;
    
    if (!messageInput) {
      return formatError('Message input field not found');
    }

    // Clear existing content and type the message
    messageInput.focus();
    messageInput.textContent = message;
    
    // Trigger input event to update ChatGPT's internal state
    const inputEvent = new Event('input', { bubbles: true });
    messageInput.dispatchEvent(inputEvent);
    
    // Find and click the send button
    const sendButton = document.querySelector('[data-testid="send-button"], button[aria-label*="Send"], button svg[class*="h-4 w-4"]')?.closest('button');
    
    if (!sendButton) {
      // Try pressing Enter as fallback
      await pressKey('Enter');
    } else {
      (sendButton as HTMLElement).click();
    }
    
    // Wait for response to start appearing
    await waitForSelector('[data-testid="conversation-content"], .group.w-full', 3000);
    
    return formatSuccess('Message sent', {
      messageSent: message,
      timestamp: new Date().toISOString()
    });
  }
);

// Get the current conversation
server.registerTool(
  'chatgpt_get_conversation',
  {
    description: 'Get the current conversation messages',
    inputSchema: {},
  },
  async () => {
    const messages = [];
    
    // Look for message containers
    const messageElements = document.querySelectorAll('[data-message-author-role], .group.w-full');
    
    for (const element of messageElements) {
      const role = element.getAttribute('data-message-author-role') || 
                   (element.textContent?.includes('ChatGPT') ? 'assistant' : 'user');
      const content = getElementText(element);
      
      if (content) {
        messages.push({
          role,
          content: content.substring(0, 500) // Limit content length
        });
      }
    }
    
    return formatSuccess(`Found ${messages.length} messages`, messages);
  }
);

// Start a new chat
server.registerTool(
  'chatgpt_new_chat',
  {
    description: 'Start a new chat conversation',
    inputSchema: {},
  },
  async () => {
    const newChatButton = document.querySelector('[href="/"], a[aria-label*="New chat"], button[aria-label*="New chat"]');
    
    if (!newChatButton) {
      return formatError('New chat button not found');
    }
    
    (newChatButton as HTMLElement).click();
    
    // Wait for page to update
    await waitForSelector('#prompt-textarea, [contenteditable="true"]', 2000);
    
    return formatSuccess('New chat started', {
      url: window.location.href
    });
  }
);

// Get available models
server.registerTool(
  'chatgpt_get_models',
  {
    description: 'Get list of available ChatGPT models',
    inputSchema: {},
  },
  async () => {
    // Click on model selector if it exists
    const modelSelector = document.querySelector('[data-testid="model-selector"], button[aria-haspopup="menu"]');
    
    if (!modelSelector) {
      return formatSuccess('Model selector not found', {
        currentModel: document.querySelector('[data-testid="model-name"]')?.textContent || 'Unknown'
      });
    }
    
    (modelSelector as HTMLElement).click();
    await waitForSelector('[role="menu"], [data-radix-menu-content]', 1000);
    
    const models = [];
    const modelOptions = document.querySelectorAll('[role="menuitem"], [data-radix-collection-item]');
    
    for (const option of modelOptions) {
      const modelName = getElementText(option);
      if (modelName) {
        models.push(modelName);
      }
    }
    
    // Close the menu
    pressKey('Escape');
    
    return formatSuccess(`Found ${models.length} models`, models);
  }
);

console.log('ChatGPT MCP Server initialized successfully');
