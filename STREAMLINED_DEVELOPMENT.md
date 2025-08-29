# Streamlined WebMCP Userscript Development

## Overview

This repository now includes a streamlined development workflow with:
- **Shared library** for common MCP server setup and DOM utilities
- **Generator tool** for scaffolding new userscripts
- **@testing-library/user-event** for robust DOM interactions

## Quick Start

### Generate a New Userscript

```bash
npx @webmcp-userscripts/generator

# Or install globally:
pnpm install -g @webmcp-userscripts/generator
create-webmcp-script
```

The generator will prompt you for:
- Site name (e.g., `github`, `twitter`)
- URL pattern (e.g., `https://github.com/*`)
- Display name and description
- Author name

It creates a complete project structure with all dependencies configured.

### Project Structure

```
scripts/your-site/
├── package.json         # Pre-configured dependencies
├── vite.config.ts      # Userscript build configuration
├── tsconfig.json       # TypeScript configuration
└── src/
    └── index.ts        # Main script file with example tools
```

## Writing Userscripts

### Simple Server Setup

```typescript
/// <reference types="vite-plugin-monkey/client" />
import { createServer, formatSuccess, formatError } from '@webmcp-userscripts/shared/server';
import { z } from 'zod';

const server = await createServer({
  name: 'My Site MCP Server',
  version: '1.0.0',
  description: 'MCP tools for My Site',
});

// Register tools with clean, unindented syntax
server.registerTool(
  'my_tool',
  {
    description: 'Does something useful',
    inputSchema: z.object({
      param: z.string(),
    }),
  },
  async ({ param }) => {
    try {
      // Tool implementation
      return formatSuccess('Success!', { data: 'result' });
    } catch (error) {
      return formatError('Failed', error);
    }
  }
);
```

### DOM Interactions with @testing-library/user-event

The shared library includes @testing-library/user-event for realistic user interactions:

```typescript
import {
  clickElement,
  typeText,
  selectOption,
  waitForSelector,
  getAllElements,
  getElementText
} from '@webmcp-userscripts/shared/dom';

// Click an element
await clickElement('#submit-button');

// Type text (handles React/Vue inputs correctly)
await typeText('#search-input', 'search query');

// Select dropdown option
await selectOption('#country-select', 'USA');

// Wait for element to appear
const element = await waitForSelector('.dynamic-content');

// Get all matching elements
const items = getAllElements('.list-item');

// Get element text content
const text = getElementText(element);
```

## Shared Library API

### Server Module (`@webmcp-userscripts/shared/server`)

- `createServer(config)` - Creates and connects MCP server
- `formatSuccess(message, data?)` - Format successful response
- `formatError(message, error?)` - Format error response

### DOM Module (`@webmcp-userscripts/shared/dom`)

#### Element Selection
- `waitForSelector(selector, timeout?)` - Wait for element to appear
- `waitForElement(predicate, timeout?)` - Wait using custom predicate
- `getAllElements(selector)` - Get all matching elements

#### User Interactions
- `clickElement(selector)` - Click an element
- `typeText(selector, text)` - Type text into input/textarea
- `selectOption(selector, value)` - Select dropdown option
- `pressKey(key)` - Press keyboard key
- `uploadFile(selector, file)` - Upload file to input

#### Element Utilities
- `isElementVisible(element)` - Check if element is visible
- `getElementText(element)` - Get text content or input value
- `scrollToElement(element)` - Scroll element into view

## Development Workflow

### 1. Generate Script
```bash
npx @webmcp-userscripts/generator
```

### 2. Install Dependencies
```bash
cd scripts/your-site
pnpm install
```

### 3. Development Mode
```bash
pnpm dev
```
This starts Vite in watch mode and opens your browser with the userscript installed.

### 4. Build for Production
```bash
pnpm build
```
Creates `dist/your-site.user.js` ready for distribution.

## Benefits of the New Structure

1. **Reduced Boilerplate**: Server setup is a single function call
2. **Robust DOM Interactions**: @testing-library/user-event handles framework quirks
3. **Type Safety**: Full TypeScript support with proper types
4. **Consistent Structure**: All scripts follow the same pattern
5. **Quick Scaffolding**: Generate new scripts in seconds
6. **Shared Utilities**: Common functions maintained in one place

## Example: Complete Script

```typescript
/// <reference types="vite-plugin-monkey/client" />
import { createServer, formatSuccess, formatError } from '@webmcp-userscripts/shared/server';
import { clickElement, typeText, getAllElements } from '@webmcp-userscripts/shared/dom';
import { z } from 'zod';

const server = await createServer({
  name: 'GitHub MCP Server',
  version: '1.0.0',
});

server.registerTool(
  'github_search',
  {
    description: 'Search GitHub repositories',
    inputSchema: z.object({
      query: z.string(),
    }),
  },
  async ({ query }) => {
    const typed = await typeText('[data-target="query-input"]', query);
    if (!typed) return formatError('Could not find search input');

    const clicked = await clickElement('[type="submit"]');
    if (!clicked) return formatError('Could not submit search');

    return formatSuccess('Search submitted');
  }
);

server.registerTool(
  'github_list_repos',
  {
    description: 'List repositories on current page',
    inputSchema: {},
  },
  async () => {
    const repos = getAllElements('.repo-list-item').map(el => ({
      name: el.querySelector('h3')?.textContent?.trim(),
      description: el.querySelector('p')?.textContent?.trim(),
    }));

    return formatSuccess('Repositories', repos);
  }
);
```

## Migration Guide

To migrate existing scripts to use the shared library:

1. Replace server initialization with `createServer()`
2. Replace custom DOM helpers with shared library functions
3. Use `formatSuccess()` and `formatError()` for responses
4. Remove redundant helper functions

See `scripts/chatgpt-refactored/` for a complete migration example.