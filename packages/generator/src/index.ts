#!/usr/bin/env node

import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

async function main() {
  console.log(chalk.blue.bold('\n🚀 WebMCP Userscript Generator\n'));

  const response = await prompts([
    {
      type: 'text',
      name: 'siteName',
      message: 'Site name (e.g., github, twitter):',
      validate: value => value.length > 0 || 'Site name is required',
    },
    {
      type: 'text',
      name: 'siteUrl',
      message: 'Site URL pattern (e.g., https://github.com/*):',
      validate: value => value.includes('http') || 'Please provide a valid URL pattern',
    },
    {
      type: 'text',
      name: 'displayName',
      message: 'Display name (e.g., GitHub MCP Server):',
      initial: (prev: string) => `${prev.charAt(0).toUpperCase() + prev.slice(1)} MCP Server`,
    },
    {
      type: 'text',
      name: 'description',
      message: 'Description:',
      initial: (_prev: string, values: any) => `MCP tools for ${values.siteName}`,
    },
    {
      type: 'text',
      name: 'author',
      message: 'Author name:',
      initial: 'Your Name',
    },
  ]);

  if (!response.siteName) {
    console.log(chalk.red('Cancelled'));
    return;
  }

  const scriptDir = path.join(process.cwd(), 'scripts', response.siteName);
  
  if (await fs.pathExists(scriptDir)) {
    const overwrite = await prompts({
      type: 'confirm',
      name: 'value',
      message: `Directory ${response.siteName} already exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite.value) {
      console.log(chalk.red('Cancelled'));
      return;
    }
  }

  console.log(chalk.gray('\n📁 Creating project structure...'));
  
  await fs.ensureDir(path.join(scriptDir, 'src'));

  // Create package.json
  await fs.writeJSON(
    path.join(scriptDir, 'package.json'),
    {
      name: `@webmcp-userscripts/${response.siteName}`,
      version: '1.0.0',
      type: 'module',
      scripts: {
        build: 'vite build',
        dev: 'vite build --watch',
      },
      dependencies: {
        '@webmcp-userscripts/shared': 'workspace:*',
        'zod': '^3.23.8',
      },
      devDependencies: {
        'vite': '^5.1.6',
        'vite-plugin-monkey': '^4.0.6',
        'typescript': '^5.4.3',
      },
    },
    { spaces: 2 }
  );

  // Create vite.config.ts
  await fs.writeFile(
    path.join(scriptDir, 'vite.config.ts'),
    `import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/index.ts',
      userscript: {
        name: '${response.displayName}',
        namespace: 'https://github.com/WebMCP-org/webmcp-userscripts',
        match: ['${response.siteUrl}'],
        version: '1.0.0',
        description: '${response.description}',
        author: '${response.author}',
        grant: [
          'GM.info',
          'GM.setValue',
          'GM.getValue',
          'GM.listValues',
          'GM.deleteValue',
          'unsafeWindow',
        ],
        license: 'MIT',
        homepageURL: 'https://github.com/WebMCP-org/webmcp-userscripts',
        supportURL: 'https://github.com/WebMCP-org/webmcp-userscripts/issues',
      },
      build: {
        fileName: '${response.siteName}.user.js',
        metaFileName: true,
        autoGrant: true,
      },
      server: {
        open: true,
        prefix: 'dev:',
      },
    }),
  ],
  build: {
    minify: false,
  },
});
`
  );

  // Create tsconfig.json
  await fs.writeJSON(
    path.join(scriptDir, 'tsconfig.json'),
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        types: ['vite-plugin-monkey/client'],
      },
      include: ['src/**/*'],
    },
    { spaces: 2 }
  );

  // Create main index.ts
  await fs.writeFile(
    path.join(scriptDir, 'src', 'index.ts'),
    `/// <reference types="vite-plugin-monkey/client" />
import { createServer, formatSuccess, formatError } from '@webmcp-userscripts/shared/server';
import { clickElement, typeText, waitForSelector } from '@webmcp-userscripts/shared/dom';
import { z } from 'zod';

// Initialize server
const server = await createServer({
  name: '${response.displayName}',
  version: '1.0.0',
  description: '${response.description}',
});

// Example: Simple navigation tool
server.registerTool(
  '${response.siteName}_navigate',
  {
    description: 'Navigate to a specific page on ${response.siteName}',
    inputSchema: z.object({
      path: z.string().describe('Path to navigate to (e.g., /about)'),
    }),
  },
  async ({ path }) => {
    try {
      window.location.href = new URL(path, window.location.origin).href;
      return formatSuccess(\`Navigated to \${path}\`);
    } catch (error) {
      return formatError('Navigation failed', error);
    }
  }
);

// Example: Click element tool
server.registerTool(
  '${response.siteName}_click',
  {
    description: 'Click an element by selector',
    inputSchema: z.object({
      selector: z.string().describe('CSS selector for element to click'),
    }),
  },
  async ({ selector }) => {
    const clicked = await clickElement(selector);
    if (clicked) {
      return formatSuccess(\`Clicked element: \${selector}\`);
    }
    return formatError(\`Could not find element: \${selector}\`);
  }
);

// Example: Type text tool
server.registerTool(
  '${response.siteName}_type',
  {
    description: 'Type text into an input field',
    inputSchema: z.object({
      selector: z.string().describe('CSS selector for input field'),
      text: z.string().describe('Text to type'),
    }),
  },
  async ({ selector, text }) => {
    const typed = await typeText(selector, text);
    if (typed) {
      return formatSuccess(\`Typed text into: \${selector}\`);
    }
    return formatError(\`Could not find input: \${selector}\`);
  }
);

// Example: Get page info tool
server.registerTool(
  '${response.siteName}_get_info',
  {
    description: 'Get current page information',
    inputSchema: z.object({}),
  },
  async () => {
    const info = {
      title: document.title,
      url: window.location.href,
      // Add more site-specific information here
    };
    return formatSuccess('Page information', info);
  }
);

console.log('${response.displayName} initialized with tools');
`
  );

  console.log(chalk.green.bold('\n✅ Userscript created successfully!\n'));
  console.log(chalk.gray('Next steps:'));
  console.log(chalk.cyan(`  cd scripts/${response.siteName}`));
  console.log(chalk.cyan('  pnpm install'));
  console.log(chalk.cyan('  pnpm dev'));
  console.log(chalk.gray('\nEdit src/index.ts to add your site-specific tools.\n'));
}

main().catch(console.error);