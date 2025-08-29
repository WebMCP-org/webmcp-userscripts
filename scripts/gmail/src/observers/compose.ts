import { formatError, formatSuccess } from '@webmcp-userscripts/shared/server';
import { z } from 'zod';
import type { GmailDomCompose } from '../core/types.js';

// This module sets up the compose observer and manages all compose-related tools
// IMPORTANT: Tools are only registered based on Gmail UI state, never by other tools
export function setupComposeObserver() {
  // Track active compose windows to maintain state
  const activeComposes = new Map<string, { compose: GmailDomCompose, type: string }>();
  let composeCheckInterval: NodeJS.Timeout | null = null;

  // Function to check if compose windows are still open
  function checkComposeWindowsClosed() {
    const currentComposes = window.gmail.dom.composes();
    const currentIds = new Set(currentComposes.map(c => c.id()));
    
    // Check if any tracked compose windows have been closed
    let hasClosedWindows = false;
    activeComposes.forEach((value, id) => {
      if (!currentIds.has(id)) {
        console.log('[Gmail MCP] Compose window closed:', id);
        activeComposes.delete(id);
        hasClosedWindows = true;
      }
    });
    
    // If all compose windows are closed, clean up compose tools
    if (hasClosedWindows && activeComposes.size === 0) {
      console.log('[Gmail MCP] All compose windows closed, cleaning up compose tools');
      window._cleanupTools(['compose']);
      
      // Stop checking if no compose windows remain
      if (composeCheckInterval) {
        clearInterval(composeCheckInterval);
        composeCheckInterval = null;
      }
      
      // Re-evaluate context
      reevaluateContext();
    }
  }

  window.gmail.observe.on('compose', (compose: GmailDomCompose, type: string) => {
    console.log('[Gmail MCP] Compose opened:', type, compose.id());

    // Store compose reference for state tracking
    activeComposes.set(compose.id(), { compose, type });

    // Only clean up compose tools (to replace with new ones)
    // Don't clean up inbox or email-view tools since we might still be in those contexts
    window._cleanupTools(['compose']);

    // Initialize compose context
    if (!window._registeredTools.has('compose')) {
      window._registeredTools.set('compose', new Set());
    }

    // Register compose tools based on type
    if (type === 'compose') {
      registerNewComposeTools(compose);
    } else if (type === 'reply') {
      console.log('[Gmail MCP] Reply compose detected');
      registerReplyTools(compose);
    } else if (type === 'forward') {
      console.log('[Gmail MCP] Forward compose detected');
      registerForwardTools(compose);
    }
    
    // Start checking for closed compose windows if not already checking
    if (!composeCheckInterval) {
      composeCheckInterval = setInterval(checkComposeWindowsClosed, 500);
    }
  });

  // Clean up when compose is cancelled
  window.gmail.observe.on('compose_cancelled', () => {
    console.log('[Gmail MCP] Compose cancelled event triggered');
    // The interval will handle the actual cleanup
    // This event might fire before the DOM is actually updated
    checkComposeWindowsClosed();
  });

  // Helper function to re-evaluate context based on current UI state
  function reevaluateContext() {
    console.log('[Gmail MCP] Re-evaluating context after compose close');

    // Check if we're still in an email view
    if (window.gmail.check.is_inside_email()) {
      console.log('[Gmail MCP] Still in email view, triggering email view setup');
      // Let the email view observer handle tool registration
      // Find and trigger for the current email
      const emailElement = document.querySelector('div.adn.ads') as HTMLElement;
      if (emailElement) {
        try {
          const domEmail = window.gmail.dom.email(emailElement);
          // Dispatch custom event to trigger email view setup
          const event = new CustomEvent('gmail:email_view_active', { detail: { domEmail } });
          window.dispatchEvent(event);
        } catch (err) {
          console.error('[Gmail MCP] Could not identify email element:', err);
        }
      }
    } else {
      // Check if we're in inbox/list view
      const currentPage = window.gmail.get.current_page();
      console.log('[Gmail MCP] Current page:', currentPage);

      if (['inbox', 'sent', 'starred', 'drafts', 'all', 'spam', 'trash'].includes(currentPage)) {
        // Dispatch event to trigger inbox setup
        const event = new CustomEvent('gmail:inbox_view_active', { detail: { page: currentPage } });
        window.dispatchEvent(event);
      }
    }
  }
}

function registerNewComposeTools(compose: GmailDomCompose) {
  const composeTools = window._registeredTools.get('compose')!;

  // Send Email Tool
  const sendTool = window.server.registerTool(
    'gmail_send_email',
    {
      title: 'Send Email',
      description: 'Send the composed email',
      inputSchema: {
        to: z.string().describe('Recipients (comma-separated email addresses)'),
        subject: z.string().describe('Email subject'),
        body: z.string().describe('Email body'),
        cc: z.string().optional().describe('CC recipients (comma-separated email addresses)'),
        bcc: z.string().optional().describe('BCC recipients (comma-separated email addresses)')
      },
    },
    async ({ to, subject, body, cc, bcc }) => {
      try {
        // Set recipients (already in string format)
        compose.to(to);
        if (cc && cc.trim()) {
          compose.cc(cc);
        }
        if (bcc && bcc.trim()) {
          compose.bcc(bcc);
        }

        // Set subject and body
        compose.subject(subject);
        compose.body(body);

        // Small delay for DOM update if needed
        await new Promise(resolve => setTimeout(resolve, 50));

        // Send the email
        compose.send();

        // Note: Compose cancelled observer will handle cleanup

        return formatSuccess('Email sent');
      } catch (error) {
        return formatError('Failed to send email', error);
      }
    }
  );
  composeTools.add(sendTool);

  // Update Draft Tool
  const updateTool = window.server.registerTool(
    'gmail_update_draft',
    {
      title: 'Update Draft',
      description: 'Update the current email draft',
      inputSchema: {
        to: z.string().optional().describe('Recipients (comma-separated email addresses)'),
        subject: z.string().optional().describe('Email subject'),
        body: z.string().optional().describe('Email body'),
        cc: z.string().optional().describe('CC recipients (comma-separated email addresses)'),
        bcc: z.string().optional().describe('BCC recipients (comma-separated email addresses)'),
        append: z.boolean().optional().describe('Append to body instead of replacing')
      },
    },
    async ({ to, subject, body, cc, bcc, append = false }) => {
      try {
        if (to) compose.to(to);
        if (cc) compose.cc(cc);
        if (bcc) compose.bcc(bcc);
        if (subject !== undefined) compose.subject(subject);

        if (body !== undefined) {
          if (append) {
            compose.body(compose.body() + '\n\n' + body);
          } else {
            compose.body(body);
          }
        }

        return formatSuccess('Draft updated', {
          current: {
            to: compose.to(),
            cc: compose.cc(),
            bcc: compose.bcc(),
            subject: compose.subject(),
            bodyLength: compose.body().length
          }
        });
      } catch (error) {
        return formatError('Failed to update draft', error);
      }
    }
  );
  composeTools.add(updateTool);

  // Add Attachment Tool (placeholder - would need file handling)
  const attachTool = window.server.registerTool(
    'gmail_add_attachment',
    {
      title: 'Add Attachment',
      description: 'Add an attachment to the email (placeholder)',
      inputSchema: {
        fileName: z.string().describe('File name')
      },
    },
    async ({ fileName }) => {
      // This would need actual file handling implementation
      return formatError('Attachment functionality not yet implemented', { fileName });
    }
  );
  composeTools.add(attachTool);

  // Discard Draft Tool
  const discardTool = window.server.registerTool(
    'gmail_discard_draft',
    {
      title: 'Discard Draft',
      description: 'Close and discard the current compose window',
      inputSchema: {},
    },
    async () => {
      try {
        // Try to close using the compose object method
        if (compose.close) {
          compose.close();
        } else {
          // Fallback: Try to find and click the close/discard button
          const composeEl = compose.$el;
          if (composeEl) {
            // Look for the discard draft button (trash icon)
            const discardBtn = composeEl.find('[aria-label*="Discard draft"], [aria-label*="discard"], [data-tooltip*="Discard"]')[0] as HTMLElement;
            if (discardBtn) {
              discardBtn.click();
            } else {
              // Try the X close button
              const closeBtn = composeEl.find('.Ha, .close')[0] as HTMLElement;
              if (closeBtn) {
                closeBtn.click();
              } else {
                return formatError('Could not find close or discard button');
              }
            }
          }
        }

        // Note: Compose cancelled observer will handle cleanup

        return formatSuccess('Draft discarded');
      } catch (error) {
        return formatError('Failed to discard draft', error);
      }
    }
  );
  composeTools.add(discardTool);
}

function registerReplyTools(compose: GmailDomCompose) {
  const composeTools = window._registeredTools.get('compose')!;

  // Send Reply Tool
  const sendTool = window.server.registerTool(
    'gmail_send_reply',
    {
      title: 'Send Reply',
      description: 'Send the reply email',
      inputSchema: {
        body: z.string().describe('Reply message body'),
        cc: z.string().optional().describe('CC recipients (comma-separated email addresses)'),
        bcc: z.string().optional().describe('BCC recipients (comma-separated email addresses)')
      },
    },
    async ({ body, cc, bcc }) => {
      try {
        // Set the reply body
        compose.body(body);

        // Add CC/BCC if provided
        if (cc && cc.trim()) {
          compose.cc(cc);
        }
        if (bcc && bcc.trim()) {
          compose.bcc(bcc);
        }

        // Wait a moment for DOM updates
        // Small delay for DOM update if needed
        await new Promise(resolve => setTimeout(resolve, 50));

        // Send the reply
        compose.send();

        // Note: Compose cancelled observer will handle cleanup

        // Verify the email was sent by checking if compose window closed
        await new Promise(resolve => setTimeout(resolve, 100));
        const composes = window.gmail.dom.composes();
        const stillOpen = composes.some(c => c.id() === compose.id());

        if (stillOpen) {
          return formatError('Reply may not have been sent - compose window still open');
        }

        return formatSuccess('Reply sent successfully', {
          to: compose.recipients().to,
          cc: cc ? cc.split(',').map(e => e.trim()) : [],
          bcc: bcc ? bcc.split(',').map(e => e.trim()) : [],
          subject: compose.subject()
        });
      } catch (error) {
        return formatError('Failed to send reply', error);
      }
    }
  );
  composeTools.add(sendTool);

  // Update Reply Draft Tool
  const updateTool = window.server.registerTool(
    'gmail_update_reply_draft',
    {
      title: 'Update Reply Draft',
      description: 'Update the current reply draft',
      inputSchema: {
        body: z.string().optional().describe('Reply message body'),
        cc: z.string().optional().describe('CC recipients (comma-separated email addresses)'),
        bcc: z.string().optional().describe('BCC recipients (comma-separated email addresses)'),
        append: z.boolean().optional().describe('Append to body instead of replacing')
      },
    },
    async ({ body, cc, bcc, append = false }) => {
      try {
        if (cc) compose.cc(cc);
        if (bcc) compose.bcc(bcc);

        if (body !== undefined) {
          if (append) {
            const currentBody = compose.body();
            compose.body(currentBody + '\n\n' + body);
          } else {
            compose.body(body);
          }
        }

        return formatSuccess('Reply draft updated', {
          to: compose.recipients().to,
          cc: compose.recipients().cc,
          bcc: compose.recipients().bcc,
          subject: compose.subject(),
          bodyLength: compose.body().length
        });
      } catch (error) {
        return formatError('Failed to update reply draft', error);
      }
    }
  );
  composeTools.add(updateTool);

  // Discard Reply Tool
  const discardTool = window.server.registerTool(
    'gmail_discard_reply',
    {
      title: 'Discard Reply',
      description: 'Close and discard the reply compose window',
      inputSchema: {},
    },
    async () => {
      try {
        // Try to close using the compose object method
        if (compose.close) {
          compose.close();
        } else {
          // Fallback: Try to find and click the close/discard button
          const composeEl = compose.$el;
          if (composeEl) {
            // Look for the discard draft button (trash icon)
            const discardBtn = composeEl.find('[aria-label*="Discard draft"], [aria-label*="discard"], [data-tooltip*="Discard"]')[0] as HTMLElement;
            if (discardBtn) {
              discardBtn.click();
            } else {
              // Try the X close button
              const closeBtn = composeEl.find('.Ha, .close')[0] as HTMLElement;
              if (closeBtn) {
                closeBtn.click();
              } else {
                return formatError('Could not find close or discard button');
              }
            }
          }
        }

        // Note: Compose cancelled observer will handle cleanup

        // Wait and verify close
        // Small delay for DOM update if needed
        await new Promise(resolve => setTimeout(resolve, 100));
        const composes = window.gmail.dom.composes();
        const stillOpen = composes.some((c: any) => c.id && compose.id && c.id() === compose.id());

        if (stillOpen) {
          // Try keyboard shortcut as last resort - dispatch on compose element instead of document
          if (compose.$el && compose.$el[0]) {
            const composeElement = compose.$el[0] as HTMLElement;
            const event = new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              which: 27,
              bubbles: true,
              cancelable: true
            });
            composeElement.dispatchEvent(event);
          } else {
            // Fallback to document dispatch
            const event = new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              which: 27,
              bubbles: true,
              cancelable: true
            });
            document.body.dispatchEvent(event);
          }

          // Check again
          await new Promise(resolve => setTimeout(resolve, 100));
          const composesAfterEsc = window.gmail.dom.composes();
          const stillOpenAfterEsc = composesAfterEsc.some((c: any) => c.id && compose.id && c.id() === compose.id());

          if (stillOpenAfterEsc) {
            return formatError('Failed to close reply window - tried all methods');
          }
        }

        return formatSuccess('Reply discarded and compose window closed');
      } catch (error) {
        return formatError('Failed to discard reply', error);
      }
    }
  );
  composeTools.add(discardTool);
}

function registerForwardTools(compose: GmailDomCompose) {
  const composeTools = window._registeredTools.get('compose')!;

  // Send Forward Tool
  const sendTool = window.server.registerTool(
    'gmail_send_forward',
    {
      title: 'Send Forward',
      description: 'Send the forwarded email',
      inputSchema: {
        to: z.string().describe('Recipients (comma-separated email addresses)'),
        message: z.string().optional().describe('Additional message to include')
      },
    },
    async ({ to, message }) => {
      try {
        compose.to(to);

        if (message) {
          // Prepend message to existing forward content
          const currentBody = compose.body();
          compose.body(message + '\n\n' + currentBody);
        }

        // Small delay for DOM update if needed
        await new Promise(resolve => setTimeout(resolve, 50));
        compose.send();

        // Note: Compose cancelled observer will handle cleanup

        // Verify the email was sent by checking if compose window closed
        await new Promise(resolve => setTimeout(resolve, 100));
        const composes = window.gmail.dom.composes();
        const stillOpen = composes.some(c => c.id() === compose.id());

        if (stillOpen) {
          return formatError('Forward may not have been sent - compose window still open');
        }

        return formatSuccess('Email forwarded successfully', {
          to: to.split(',').map(e => e.trim()),
          subject: compose.subject(),
          messageAdded: !!message
        });
      } catch (error) {
        return formatError('Failed to forward email', error);
      }
    }
  );
  composeTools.add(sendTool);

  // Cancel Forward Tool
  const cancelTool = window.server.registerTool(
    'gmail_cancel_forward',
    {
      title: 'Cancel Forward',
      description: 'Cancel the forward',
      inputSchema: {},
    },
    async () => {
      try {
        compose.close();

        // Note: Compose cancelled observer will handle cleanup

        return formatSuccess('Forward cancelled');
      } catch (error) {
        return formatError('Failed to cancel forward', error);
      }
    }
  );
  composeTools.add(cancelTool);
}