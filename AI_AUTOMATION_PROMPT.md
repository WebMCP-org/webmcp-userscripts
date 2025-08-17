# WebMCP Userscript Development Guide

Create a WebMCP userscript for [WEBSITE_URL] following this streamlined workflow.

## 1. Project Setup (30s)
```bash
cd /path/to/WebMCP/webmcp-userscripts
turbo gen userscript --args [sitename] "[url_pattern]" "[Display Name]" "[Description]" "[Author]"
# Example: turbo gen userscript --args chatgpt "https://chatgpt.com/*" "ChatGPT MCP Server" "MCP tools for ChatGPT" "WebMCP"
# Then install and build:
cd scripts/[sitename]
pnpm install
pnpm run build
```

## 2. Reconnaissance
Navigate and discover selectors for BOTH actions AND results:
You should focus on clicking writing tools for the most important features of the website. Do not make too many tools for the first pass.

```javascript
mcp_playwright_browser_navigate(url: "[WEBSITE_URL]")
mcp_playwright_browser_snapshot()
mcp_playwright_browser_evaluate(function: `() => {
  return {
    inputs: Array.from(document.querySelectorAll('input, textarea')).map(el => ({
      selector: el.id ? \`#\${el.id}\` : \`[name="\${el.name}"]\`,
      nearbyOutput: el.parentElement?.querySelector('[role="status"], .result, .output')?.className
    })),
    buttons: Array.from(document.querySelectorAll('button')).map(el => ({
      selector: el.id ? \`#\${el.id}\` : \`button:contains("\${el.textContent?.trim()}")`,
      possibleResultSelectors: [/* find nearby result areas */]
    })),
    outputAreas: Array.from(document.querySelectorAll('[role="status"], .result, .output, .message')).map(el => ({
      selector: el.id ? \`#\${el.id}\` : \`.\${el.className.split(' ')[0]}\`
    }))
  };
}`)
```

## 3. Implementation Pattern

Edit `src/index.ts` - implement ONE tool at a time:

```typescript
import { createServer, formatSuccess, formatError } from '@webmcp-userscripts/shared/server';
import { clickElement, typeText, waitForSelector, getElementText, getAllElements } from '@webmcp-userscripts/shared/dom';
import { z } from 'zod';

const server = await createServer({
  name: '[SITENAME] MCP Server',
  version: '1.0.0',
});

// Start simple - test before adding next
server.registerTool(
  '[SITENAME]_get_info',
  {
    description: 'Get page info',
    inputSchema: {},
  },
  async () => {
    return formatSuccess('Page info', {
      title: document.title,
      url: window.location.href
    });
  }
);

// Action tools MUST capture results
server.registerTool(
  '[SITENAME]_click_button',
  {
    description: 'Click button and get result',
    inputSchema: {
      selector: z.string(),
    },
  },
  async ({ selector }) => {
    const clicked = await clickElement(selector);
    if (!clicked) return formatError('Button not found');

    // CRITICAL: Capture what happened
    await waitForSelector('[role="status"], .result', 2000);
    const results = {
      statusMessage: getElementText(document.querySelector('[role="status"]')),
      urlChanged: window.location.href !== originalUrl,
      newContent: getElementText(document.querySelector('.result')),
    };

    return formatSuccess('Clicked', results);
  }
);
```

## 4. Test Cycle (Per Tool)

**For EACH new tool:**

1. **Build**: `pnpm run build`
2. **Refresh tab**: `mcp_playwright_browser_navigate(url: "[WEBSITE_URL]")`
3. **Find tab**: `mcp_mcp-b_call_extension_tool(toolName: "extension_tool_list_active_tabs")`
4. **Inject script**:
   ```
   mcp_mcp-b_extension_tool_execute_user_script(
     filePath: "/path/to/dist/[SITENAME].user.js",
     tabId: [TAB_ID]
   )
   ```
5. **Wait 2-3s** for initialization
6. **Test tool**:
   ```
   mcp_mcp-b_call_website_tool(
     domain: "[DOMAIN]",
     toolName: "[SITENAME]_[TOOL_NAME]",
     arguments: {...}
   )
   ```

## 5. Common Tool Patterns

```typescript
// Form submission with result
server.registerTool('[SITENAME]_submit_form', {
    inputSchema: { field1: z.string() },
}, async ({ field1 }) => {
  await typeText('#field1', field1);
  await clickElement('[type="submit"]');
  await waitForSelector('.result', 2000);

  return formatSuccess('Submitted', {
    success: !!document.querySelector('.success'),
    message: getElementText(document.querySelector('[role="status"]')),
    redirected: window.location.href !== originalUrl
  });
});

// List items
server.registerTool('[SITENAME]_list_items', {
  inputSchema: z.object({}),
}, async () => {
  const items = getAllElements('.item').map(el => ({
    text: getElementText(el),
    id: el.id
  }));
  return formatSuccess(`${items.length} items`, items);
});
```

## 6. Debug Strategy

If tool fails:
1. Add `console.log()` debugging
2. Check console: `mcp_browsermcp_browser_get_console_logs()`
3. Screenshot: `mcp_browsermcp_browser_screenshot()`
4. Use `waitForSelector(selector, 5000)` for dynamic content

## 7. Shared Library Functions

**Server**: `createServer()`, `formatSuccess()`, `formatError()`
**DOM**: `waitForSelector()`, `clickElement()`, `typeText()`, `getAllElements()`, `getElementText()`, `selectOption()`, `pressKey()`, `scrollToElement()`, `isElementVisible()`

## 8. Critical Rules

1. **One tool at a time** - Build → Test → Fix → Next
2. **Always refresh** before re-injecting updated script
3. **Capture results** - Every action must return what happened
4. **Use shared library** - Don't reimplement helpers
5. **Handle errors** - Use formatError for all failures

## Success Criteria

- [ ] Read/get page state with comprehensive data
- [ ] Navigation with confirmation
- [ ] User interactions with result capture
- [ ] Content reading with structured output
- [ ] Site functions with outcome data

Start with project generation for [WEBSITE_URL].