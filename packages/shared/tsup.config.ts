import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    dom: 'src/dom.ts',
    server: 'src/server.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ['@modelcontextprotocol/sdk', '@mcp-b/transports', 'zod'],
});