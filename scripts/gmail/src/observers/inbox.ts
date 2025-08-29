import { formatError, formatSuccess } from '@webmcp-userscripts/shared/server';
import { z } from 'zod';

// This module manages inbox/list view tools
// IMPORTANT: Tools are only registered based on Gmail UI state, never by other tools
export function setupInboxObserver() {
  // Track selection state
  let hasSelectedEmails = false;

  // Initial setup
  detectAndSetupInbox();

  // Use hashchange event
  window.addEventListener('hashchange', function () {
    const currentPage = window.gmail.get.current_page();
    
    // Check if we're in a list view
    if (['inbox', 'sent', 'starred', 'drafts', 'all', 'spam', 'trash'].includes(currentPage)) {
      detectAndSetupInbox();
    }
  });

  // Listen for custom event from compose observer
  window.addEventListener('gmail:inbox_view_active', ((event: CustomEvent) => {
    console.log('[Gmail MCP] Inbox view re-activated:', event.detail.page);
    detectAndSetupInbox();
  }) as EventListener);

  // Observe refresh action
  window.gmail.observe.on('refresh', () => {
    detectAndSetupInbox();
  });

  // Observe move to inbox action
  window.gmail.observe.on('move_to_inbox', () => {
    detectAndSetupInbox();
  });

  // Monitor selection state changes
  function monitorSelectionState() {
    const checkboxes = document.querySelectorAll('[role="checkbox"][aria-label*="Select"]:checked');
    const newHasSelection = checkboxes.length > 0;
    
    if (newHasSelection !== hasSelectedEmails) {
      hasSelectedEmails = newHasSelection;
      
      if (hasSelectedEmails) {
        // Register bulk action tools when emails are selected
        registerBulkActionTools();
      } else {
        // Clean up bulk action tools when no emails are selected
        cleanupBulkTools();
      }
    }
  }

  // Set up mutation observer to watch for selection changes
  const observer = new MutationObserver(() => {
    monitorSelectionState();
  });

  // Start observing when body is available
  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-checked'],
      subtree: true
    });
  }
}

function detectAndSetupInbox() {
  const currentPage = window.gmail.get.current_page();
  console.log('[Gmail MCP] Current page:', currentPage);
  
  // Check if we're in a list view (inbox, sent, etc.)
  if (['inbox', 'sent', 'starred', 'drafts', 'all', 'spam', 'trash'].includes(currentPage)) {
    console.log('[Gmail MCP] Inbox/list view detected:', currentPage);

    // When in inbox, we're not in email-view, but compose might still be open
    // So only clean up inbox and email-view tools
    window._cleanupTools(['inbox', 'email-view']);
    
    setupInboxTools();
  }
}

function cleanupInboxTools() {
  const inboxTools = window._registeredTools.get('inbox');
  if (inboxTools) {
    inboxTools.forEach(tool => tool.remove());
    inboxTools.clear();
  }
}

function setupInboxTools() {
  // Initialize inbox context
  if (!window._registeredTools.has('inbox')) {
    window._registeredTools.set('inbox', new Set());
  }
  const inboxTools = window._registeredTools.get('inbox')!;

  // List Emails Tool
  const listTool = window.server.registerTool(
    'gmail_list_emails',
    {
      title: 'List Emails',
      description: 'List visible emails in the current view',
      inputSchema: {
        limit: z.number().optional().describe('Maximum number of emails to return')
      },
    },
    async ({ limit = 50 }) => {
      try {
        const messages = window.gmail.dom.visible_messages();
        const limitedMessages = messages.slice(0, limit);

        return formatSuccess(`Listed ${limitedMessages.length} emails`, {
          count: limitedMessages.length,
          emails: limitedMessages.map(msg => ({
            id: msg.thread_id,
            summary: msg.summary,
            from: msg.from,
            threadId: msg.thread_id,
            // hasAttachments: msg.attachment ? true : false
          }))
        });
      } catch (error) {
        return formatError('Failed to list emails', error);
      }
    }
  );
  inboxTools.add(listTool);

  // Open Email Tool
  const openTool = window.server.registerTool(
    'gmail_open_email',
    {
      title: 'Open Email',
      description: 'Open a specific email by ID or index',
      inputSchema: {
        index: z.number().optional().describe('Index of email in list (0-based)'),
        id: z.string().optional().describe('Email ID')
      },
    },
    async ({ index, id }) => {
      try {
        if (index !== undefined) {
          const messages = window.gmail.dom.visible_messages();
          if (index < 0 || index >= messages.length) {
            return formatError(`Invalid index: ${index}`);
          }

          const message = messages[index];
          if (message.$el) {
            message.$el.trigger('click');
            return formatSuccess(`Opened email at index ${index}`, {
              emailId: message.thread_id
            });
          }
        }

        if (id) {
          // Try to find email by ID
          const messages = window.gmail.dom.visible_messages();
          const message = messages.find(m => m.thread_id === id);

          if (message && message.$el) {
            message.$el.trigger('click');
            return formatSuccess(`Opened email with ID ${id}`);
          }
        }

        return formatError('Email not found');
      } catch (error) {
        return formatError('Failed to open email', error);
      }
    }
  );
  inboxTools.add(openTool);

  // Select Emails Tool
  const selectTool = window.server.registerTool(
    'gmail_select_emails',
    {
      title: 'Select Emails',
      description: 'Select multiple emails for bulk actions',
      inputSchema: {
        indices: z.array(z.number()).optional().describe('Indices of emails to select'),
        all: z.boolean().optional().describe('Select all visible emails')
      },
    },
    async ({ indices, all = false }) => {
      try {
        // Try multiple selectors for checkboxes
        let checkboxes: HTMLElement[] = Array.from(document.querySelectorAll('[role="checkbox"][aria-label*="Select"]'));
        
        // Fallback: Try more general checkbox selector
        if (!checkboxes || checkboxes.length === 0) {
          const allCheckboxes = document.querySelectorAll('[role="checkbox"]');
          // Filter out the "select all" checkbox if present
          checkboxes = Array.from(allCheckboxes).filter(cb => {
            const label = cb.getAttribute('aria-label') || '';
            return !label.toLowerCase().includes('select all');
          }) as HTMLElement[];
        }
        
        // Another fallback: Try using Gmail DOM API
        if (!checkboxes || checkboxes.length === 0) {
          const messages = window.gmail.dom.visible_messages();
          if (messages && messages.length > 0) {
            // Try to find checkboxes within message elements
            const messageCheckboxes: HTMLElement[] = [];
            messages.forEach(msg => {
              if (msg.$el) {
                const checkbox = msg.$el.find('[role="checkbox"], input[type="checkbox"]')[0];
                if (checkbox) {
                  messageCheckboxes.push(checkbox as HTMLElement);
                }
              }
            });
            checkboxes = messageCheckboxes;
          }
        }

        if (!checkboxes || checkboxes.length === 0) {
          return formatError('Could not find email checkboxes. Gmail UI may have changed.');
        }

        if (all) {
          // Click the select all checkbox
          const selectAllBox = document.querySelector('[aria-label*="Select all"], [aria-label*="select all"]') as HTMLElement;
          if (selectAllBox) {
            selectAllBox.click();
            // Bulk action tools will be registered by selection state monitor
            return formatSuccess(`Selected all ${checkboxes.length} visible emails`);
          } else {
            // Fallback: Select each checkbox individually
            let selectedCount = 0;
            Array.from(checkboxes).forEach((checkbox) => {
              const cb = checkbox as HTMLElement;
              if (cb.getAttribute('aria-checked') !== 'true') {
                cb.click();
                selectedCount++;
              }
            });
            return formatSuccess(`Selected ${selectedCount} emails individually (select all button not found)`);
          }
        }

        if (indices && indices.length > 0) {
          let selectedCount = 0;
          indices.forEach(index => {
            if (index >= 0 && index < checkboxes.length) {
              const checkbox = checkboxes[index] as HTMLElement;
              // Only click if not already selected
              if (checkbox.getAttribute('aria-checked') !== 'true') {
                checkbox.click();
                selectedCount++;
              } else {
                selectedCount++; // Count it as selected even if already was
              }
            }
          });

          // Bulk action tools will be registered by selection state monitor
          return formatSuccess(`Selected ${selectedCount} emails (indices: ${indices.join(', ')})`);
        }

        return formatError('No indices provided for selection');
      } catch (error) {
        return formatError('Failed to select emails', error);
      }
    }
  );
  inboxTools.add(selectTool);

  // Compose New Email Tool
  const composeTool = window.server.registerTool(
    'gmail_compose_new',
    {
      title: 'Compose New Email',
      description: 'Open a new compose window',
      inputSchema: {},
    },
    async () => {
      try {
        window.gmail.compose.start_compose();
        return formatSuccess('Compose window opened');
      } catch (error) {
        return formatError('Failed to open compose window', error);
      }
    }
  );
  inboxTools.add(composeTool);
}

function registerBulkActionTools() {
  // These tools are only registered after emails are selected
  const inboxTools = window._registeredTools.get('inbox')!;

  // Bulk Archive Tool
  const archiveTool = window.server.registerTool(
    'gmail_bulk_archive',
    {
      title: 'Bulk Archive',
      description: 'Archive selected emails',
      inputSchema: {},
    },
    async () => {
      try {
        const archiveButton = document.querySelector('[aria-label*="Archive"]') as HTMLElement;
        if (archiveButton) {
          archiveButton.click();

          // Bulk tools will be cleaned up by selection state monitor
          return formatSuccess('Selected emails archived');
        }
        return formatError('Archive button not found');
      } catch (error) {
        return formatError('Failed to archive emails', error);
      }
    }
  );
  inboxTools.add(archiveTool);

  // Bulk Delete Tool
  const deleteTool = window.server.registerTool(
    'gmail_bulk_delete',
    {
      title: 'Bulk Delete',
      description: 'Delete selected emails',
      inputSchema: {},
    },
    async () => {
      try {
        const deleteButton = document.querySelector('[aria-label*="Delete"]') as HTMLElement;
        if (deleteButton) {
          deleteButton.click();

          // Bulk tools will be cleaned up by selection state monitor
          return formatSuccess('Selected emails deleted');
        }
        return formatError('Delete button not found');
      } catch (error) {
        return formatError('Failed to delete emails', error);
      }
    }
  );
  inboxTools.add(deleteTool);

  // Bulk Mark Read Tool
  const markReadTool = window.server.registerTool(
    'gmail_bulk_mark_read',
    {
      title: 'Mark as Read',
      description: 'Mark selected emails as read',
      inputSchema: {},
    },
    async () => {
      try {
        const markReadButton = document.querySelector('[aria-label*="Mark as read"]') as HTMLElement;
        if (markReadButton) {
          markReadButton.click();

          // Bulk tools will be cleaned up by selection state monitor
          return formatSuccess('Selected emails marked as read');
        }
        return formatError('Mark as read button not found');
      } catch (error) {
        return formatError('Failed to mark emails as read', error);
      }
    }
  );
  inboxTools.add(markReadTool);
}

function cleanupBulkTools() {
  // Remove bulk action tools but keep the main inbox tools
  const bulkToolNames = ['gmail_bulk_archive', 'gmail_bulk_delete', 'gmail_bulk_mark_read', 'gmail_bulk_mark_unread', 'gmail_bulk_add_label'];
  const inboxTools = window._registeredTools.get('inbox');

  if (inboxTools) {
    inboxTools.forEach(tool => {
      if (bulkToolNames.includes(tool.title ?? '')) {
        tool.remove();
        inboxTools.delete(tool);
      }
    });
  }
}