import { formatError, formatSuccess } from '@webmcp-userscripts/shared/server';
import { z } from 'zod';
import type { GmailDomEmail } from '../core/types.js';

// This module sets up the email view observer and manages all email-related tools
// IMPORTANT: Tools are only registered based on Gmail UI state, never by other tools
export function setupEmailViewObserver() {
  // Track current email view
  let currentEmail: GmailDomEmail | null = null;

  window.gmail.observe.on('view_email', (domEmail: GmailDomEmail) => {
    console.log('[Gmail MCP] Email view opened:', domEmail.id);
    currentEmail = domEmail;

    // When in email view, we're not in inbox, but compose might still be open
    // So only clean up inbox and email-view tools
    window._cleanupTools(['inbox', 'email-view']);

    // Initialize email-view context
    if (!window._registeredTools.has('email-view')) {
      window._registeredTools.set('email-view', new Set());
    }

    // Register email view tools
    registerEmailViewTools(domEmail);
  });

  // Listen for custom event when returning from compose to email view
  window.addEventListener('gmail:email_view_active', ((event: CustomEvent) => {
    const domEmail = event.detail.domEmail;
    if (domEmail) {
      console.log('[Gmail MCP] Email view re-activated:', domEmail.id);
      currentEmail = domEmail;

      // When in email view, we're not in inbox, but compose might still be open
      // So only clean up inbox and email-view tools
      window._cleanupTools(['inbox', 'email-view']);

      // Initialize email-view context
      if (!window._registeredTools.has('email-view')) {
        window._registeredTools.set('email-view', new Set());
      }

      // Register email view tools
      registerEmailViewTools(domEmail);
    }
  }) as EventListener);

  // Listen for navigation away from email view
  window.gmail.observe.on('view_thread', () => {
    if (currentEmail) {
      console.log('[Gmail MCP] Navigated away from email view');
      currentEmail = null;
    }
  });
}

// Consolidated function to register all email view tools
function registerEmailViewTools(domEmail: GmailDomEmail) {
  registerReadEmailTool(domEmail);
  registerDraftReplyTool(domEmail);
  registerForwardEmailTool(domEmail);
  // Future: registerDeleteEmailTool(domEmail);
  // Future: registerArchiveEmailTool(domEmail);
}

function registerReadEmailTool(domEmail: GmailDomEmail) {
  const emailTools = window._registeredTools.get('email-view')!;
  const tool = window.server.registerTool(
    'gmail_read_email',
    {
      title: 'Read Current Email',
      description: 'Read the currently opened email content',
      inputSchema: {},
    },
    async () => {
      try {
        // Use a combination of DOM methods and new API
        // The domEmail object itself has built-in methods for accessing email data

        // Get the body from the DOM directly
        const body = domEmail.body();
        const attachments = domEmail.attachments();

        // Try to get additional data from the new API
        let emailId = window.gmail.new.get.email_id(domEmail);

        if (!emailId) {
          // Fallback: try with the DOM element
          emailId = window.gmail.new.get.email_id(domEmail.$el[0]);
        }

        let emailData = null;
        if (emailId) {
          emailData = window.gmail.new.get.email_data(emailId);
        }

        // If we have cached email data, use it for complete info
        if (emailData) {
          return formatSuccess('Email content retrieved', {
            id: emailData.id,
            legacy_email_id: emailData.legacy_email_id,
            thread_id: emailData.thread_id,
            subject: emailData.subject,
            from: emailData.from.address,
            from_name: emailData.from.name,
            from_email: emailData.from.address,
            to: emailData.to.map(t => t.address),
            to_details: emailData.to,
            cc: emailData.cc.map(c => c.address),
            cc_details: emailData.cc,
            bcc: emailData.bcc.map(b => b.address),
            bcc_details: emailData.bcc,
            date: emailData.date.toISOString(),
            timestamp: emailData.timestamp,
            body: body,
            body_html: emailData.content_html,
            is_draft: emailData.is_draft
          });
        }

        // Fallback: Use DOM-only data if cache data is not available
        // According to docs, gmail.dom.email has a .data() method that fetches from server
        const domEmailWrapper = window.gmail.dom.email(domEmail.$el[0]);
        const serverData = domEmailWrapper.data();

        if (serverData) {
          return formatSuccess('Email content retrieved from server', {
            thread_id: serverData.thread_id,
            subject: serverData.subject,
            from: serverData.from_email,
            from_name: serverData.from,
            to: serverData.to || [],
            cc: serverData.cc || [],
            bcc: serverData.bcc || [],
            timestamp: serverData.timestamp,
            datetime: serverData.datetime,
            body: body,
            body_plain: serverData.content_plain,
            body_html: serverData.content_html,
            attachments: attachments && attachments.length > 0 ? attachments.map((a) => ({
              name: a.name,
              type: a.type,
              url: a.url,
              size: a.size
            })) : [],
            // attachment_details: serverData.attachments_details || []
          });
        }

        // Ultimate fallback: just return what we can get from DOM
        return formatSuccess('Email content retrieved from DOM', {
          body: body,
          attachments: attachments && attachments.length > 0 ? attachments.map((a) => ({
            name: a.name,
            type: a.type,
            url: a.url,
            size: a.size
          })) : []
        });
      } catch (error) {
        return formatError('Failed to read email', error);
      }
    }
  );

  emailTools.add(tool);
}

function registerDraftReplyTool(domEmail: GmailDomEmail) {
  const emailTools = window._registeredTools.get('email-view')!;
  const tool = window.server.registerTool(
    'gmail_draft_reply',
    {
      title: 'Draft Reply',
      description: 'Open a reply compose window',
      inputSchema: {
        replyAll: z.boolean().optional().describe('Reply to all recipients')
      },
    },
    async ({ replyAll = false }) => {
      try {
        // Validate domEmail.$el exists
        if (!domEmail.$el || !domEmail.$el.find) {
          return formatError('Email element not found or not ready');
        }

        // Try multiple methods to find and click the reply button
        let button: HTMLElement | null = null;

        // Method 1: Try the standard class selectors
        const buttonClass = replyAll ? '.aaq' : '.aar';
        const buttons = domEmail.$el.find(buttonClass) ?? [];
        if (buttons && buttons.length > 0) {
          button = buttons[0] as HTMLElement;
        }

        // Method 2: Look for button by aria-label
        if (!button) {
          const searchTerm = replyAll ? 'reply all' : 'reply';
          // jQuery doesn't support case-insensitive attribute selectors, check both cases
          const ariaButtons = domEmail.$el.find(`[aria-label*="${searchTerm}"], [aria-label*="${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)}"]`) ?? [];
          if (ariaButtons && ariaButtons.length > 0) {
            button = ariaButtons[0] as HTMLElement;
          }
        }

        // Method 3: Look for button by data-tooltip
        if (!button) {
          const searchTerm = replyAll ? 'Reply all' : 'Reply';
          const tooltipButtons = domEmail.$el.find(`[data-tooltip="${searchTerm}"]`) ?? [];
          if (tooltipButtons && tooltipButtons.length > 0) {
            button = tooltipButtons[0] as HTMLElement;
          }
        }

        // Method 4: Use keyboard shortcut as fallback
        if (!button && window.gmail.check.are_shortcuts_enabled()) {
          const event = new KeyboardEvent('keydown', {
            key: replyAll ? 'a' : 'r',
            code: replyAll ? 'KeyA' : 'KeyR',
            keyCode: replyAll ? 65 : 82,
            which: replyAll ? 65 : 82,
            bubbles: true
          });
          document.dispatchEvent(event);

          // Wait for compose window to open
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Verify the compose window opened
          const composes = window.gmail.dom.composes() ?? [];
          const composeObj = composes[composes.length - 1];

          if (!composeObj) {
            return formatError('Compose window did not open via keyboard shortcut');
          }

          // Compose observer will detect and register appropriate tools
          return formatSuccess(`Reply compose window opened via keyboard shortcut${replyAll ? ' (Reply All)' : ''}`, {
            type: replyAll ? 'reply_all' : 'reply',
            method: 'keyboard_shortcut',
            composeId: composeObj.id(),
            subject: composeObj.subject(),
            to: composeObj.recipients().to
          });
        }

        if (!button) {
          return formatError(`${replyAll ? 'Reply All' : 'Reply'} button not found`);
        }
        button.click();

        // Small delay for compose window to open
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify the compose window opened
        const composes = window.gmail.dom.composes() ?? [];
        const composeObj = composes[composes.length - 1];

        if (!composeObj) {
          return formatError('Compose window did not open');
        }

        // Compose observer will detect and register appropriate tools
        return formatSuccess(`Reply compose window opened${replyAll ? ' (Reply All)' : ''}`, {
          type: replyAll ? 'reply_all' : 'reply',
          composeId: composeObj.id(),
          subject: composeObj.subject(),
          to: composeObj.recipients().to
        });
      } catch (error) {
        return formatError('Failed to open reply compose', error);
      }
    }
  );

  emailTools.add(tool);
}

function registerForwardEmailTool(domEmail: GmailDomEmail) {
  const emailTools = window._registeredTools.get('email-view')!;
  const tool = window.server.registerTool(
    'gmail_forward_email',
    {
      title: 'Forward Email',
      description: 'Open a forward compose window',
      inputSchema: {},
    },
    async () => {
      try {
        // Validate domEmail.$el exists
        if (!domEmail.$el || !domEmail.$el.find) {
          return formatError('Email element not found or not ready');
        }

        // Try multiple methods to find and click the forward button
        let forwardButton: HTMLElement | null = null;

        // Method 1: Try the standard class selector
        const forwardButtons = domEmail.$el.find('.aaw') ?? [];
        if (forwardButtons && forwardButtons.length > 0) {
          forwardButton = forwardButtons[0] as HTMLElement;
        }

        // Method 2: Look for button by aria-label
        if (!forwardButton) {
          // jQuery doesn't support case-insensitive attribute selectors, check both cases
          const ariaButtons = domEmail.$el.find('[aria-label*="forward"], [aria-label*="Forward"]') ?? [];
          if (ariaButtons && ariaButtons.length > 0) {
            forwardButton = ariaButtons[0] as HTMLElement;
          }
        }

        // Method 3: Look for button by data-tooltip
        if (!forwardButton) {
          const tooltipButtons = domEmail.$el.find('[data-tooltip="Forward"]') ?? [];
          if (tooltipButtons && tooltipButtons.length > 0) {
            forwardButton = tooltipButtons[0] as HTMLElement;
          }
        }

        // Method 4: Use keyboard shortcut as fallback
        if (!forwardButton && window.gmail.check.are_shortcuts_enabled()) {
          const event = new KeyboardEvent('keydown', {
            key: 'f',
            code: 'KeyF',
            keyCode: 70,
            which: 70,
            bubbles: true
          });
          document.dispatchEvent(event);

          // Wait for compose window to open
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Verify the compose window opened
          const composes = window.gmail.dom.composes() ?? [];
          const composeObj = composes[composes.length - 1];

          if (!composeObj) {
            return formatError('Compose window did not open via keyboard shortcut');
          }

          // Compose observer will detect and register appropriate tools
          return formatSuccess('Forward compose window opened via keyboard shortcut', {
            type: 'forward',
            method: 'keyboard_shortcut',
            composeId: composeObj.id(),
            subject: composeObj.subject()
          });
        }

        if (!forwardButton) {
          return formatError('Forward button not found');
        }

        forwardButton.click();

        // Small delay for compose window to open
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify the compose window opened
        const composes = window.gmail.dom.composes() ?? [];
        const composeObj = composes[composes.length - 1];

        if (!composeObj) {
          return formatError('Compose window did not open');
        }

        // Compose observer will detect and register appropriate tools
        return formatSuccess('Forward compose window opened', {
          type: 'forward',
          composeId: composeObj.id(),
          subject: composeObj.subject()
        });
      } catch (error) {
        return formatError('Failed to forward email', error);
      }
    }
  );

  emailTools.add(tool);
}

// function registerDeleteEmailTool(domEmail: GmailDomEmail) {
//   const emailTools = window._registeredTools.get('email-view')!;
//   const tool = window.server.registerTool(
//     'gmail_delete_email',
//     {
//       title: 'Delete Email',
//       description: 'Delete the current email (uses keyboard shortcut)',
//       inputSchema: {},
//     },
//     async () => {
//       try {
//         // For now, just use keyboard shortcut which is more reliable
//         if (!window.gmail.check.are_shortcuts_enabled()) {
//           return formatError('Delete function requires keyboard shortcuts to be enabled in Gmail settings');
//         }

//         const emailId = domEmail.id;

//         // Use keyboard shortcut '#' for delete
//         const event = new KeyboardEvent('keydown', {
//           key: '#',
//           code: 'Digit3',
//           keyCode: 51,
//           which: 51,
//           shiftKey: true,
//           bubbles: true
//         });
//         document.dispatchEvent(event);

//         // Wait a moment for action to complete
//         await new Promise(resolve => setTimeout(resolve, 1000));

//         // Check if we're still in the email view or returned to inbox
//         const stillInEmail = window.gmail.check.is_inside_email();

//         // Clean up all email view tools since we're leaving this view
//         if (!stillInEmail) {
//           window._cleanupTools();
//         }

//         return formatSuccess('Email moved to trash', {
//           emailId: emailId,
//           action: 'trash',
//           method: 'keyboard_shortcut',
//           viewChanged: !stillInEmail,
//           currentPage: window.gmail.get.current_page()
//         });
//       } catch (error) {
//         return formatError('Failed to delete email', error);
//       }
//     }
//   );

//   emailTools.add(tool);
// }

// function registerArchiveEmailTool(domEmail: GmailDomEmail) {
//   const emailTools = window._registeredTools.get('email-view')!;
//   const tool = window.server.registerTool(
//     'gmail_archive_email',
//     {
//       title: 'Archive Email',
//       description: 'Archive the current email (uses keyboard shortcut)',
//       inputSchema: {},
//     },
//     async () => {
//       try {
//         // For now, just use keyboard shortcut which is more reliable
//         if (!window.gmail.check.are_shortcuts_enabled()) {
//           return formatError('Archive function requires keyboard shortcuts to be enabled in Gmail settings');
//         }

//         const emailId = domEmail.id;

//         // Use keyboard shortcut 'e' for archive
//         const event = new KeyboardEvent('keydown', {
//           key: 'e',
//           code: 'KeyE',
//           keyCode: 69,
//           which: 69,
//           bubbles: true
//         });
//         document.dispatchEvent(event);

//         // Wait a moment for action to complete
//         await new Promise(resolve => setTimeout(resolve, 1000));

//         // Check if we're still in the email view or returned to inbox
//         const stillInEmail = window.gmail.check.is_inside_email();

//         // Clean up all email view tools since we're leaving this view
//         if (!stillInEmail) {
//           window._cleanupTools();
//         }

//         return formatSuccess('Email archived', {
//           emailId: emailId,
//           action: 'archived',
//           method: 'keyboard_shortcut',
//           viewChanged: !stillInEmail,
//           currentPage: window.gmail.get.current_page()
//         });
//       } catch (error) {
//         return formatError('Failed to archive email', error);
//       }
//     }
//   );

//   emailTools.add(tool);
// }
