# Gmail MCP Logging Requirements

## Critical Logging Points for AI Context

### 1. UI State Transitions
- **Current View Detection**
  - Log when entering/leaving: inbox, email view, compose window
  - Log current page type (inbox, sent, drafts, spam, trash, etc.)
  - Log when view changes fail or timeout
  - Include timestamp and previous state

### 2. Tool Registration/Cleanup
- **Tool Lifecycle**
  - Log when tools are registered with their context (inbox, email-view, compose, global)
  - Log when tools are cleaned up and why (view change, error, manual)
  - Log if duplicate tools are detected
  - Log failed tool registrations with error details

### 3. Element Selection & DOM Queries
- **Selector Success/Failure**
  - Log which selectors were tried when finding elements
  - Log fallback selector attempts
  - Log final selector that worked (or all failed)
  - Include element count found
  - Log parent element context for debugging

### 4. User Actions & Results
- **Action Execution**
  - Log before attempting any action (click, type, send)
  - Log DOM element state before action
  - Log action result (success/failure)
  - Log any DOM changes after action
  - Log timing (how long action took)

### 5. Email Data Retrieval
- **Data Access**
  - Log which API method was used (new vs old Gmail.js API)
  - Log data structure received
  - Log missing fields or unexpected structure
  - Log fallback attempts
  - Include email ID/thread ID for correlation

### 6. Compose Window State
- **Compose Operations**
  - Log compose window type (new, reply, reply-all, forward)
  - Log compose ID for tracking
  - Log recipient parsing results
  - Log if send appears to succeed (window closes)
  - Log compose window count before/after operations

### 7. Error Context
- **Enhanced Error Information**
  - Log full error stack
  - Log last 3 successful operations before error
  - Log current Gmail.js state
  - Log current DOM state summary
  - Log which tools are currently registered

### 8. Keyboard Shortcuts
- **Shortcut Usage**
  - Log when falling back to keyboard shortcuts
  - Log if shortcuts are enabled/disabled
  - Log which shortcut was attempted
  - Log if shortcut appeared to work

### 9. Bulk Operations
- **Selection State**
  - Log number of emails selected
  - Log selection method used
  - Log available bulk action buttons found
  - Log bulk action results

### 10. Performance Metrics
- **Timing Information**
  - Log time taken for tool registration
  - Log time for DOM queries
  - Log time waiting for UI updates
  - Flag operations taking >1 second

## Suggested Log Format

```javascript
{
  timestamp: Date.now(),
  level: 'info|warn|error',
  context: 'inbox|email-view|compose|global',
  operation: 'specific-operation-name',
  details: {
    // Specific to operation
  },
  state: {
    currentPage: 'inbox',
    toolsRegistered: ['gmail_list_emails', ...],
    composeWindowsOpen: 0,
    emailsSelected: 0
  },
  performance: {
    duration: 123 // ms
  }
}
```

## Implementation Priority

### High Priority (Implement First)
1. View/context transitions
2. Tool registration/cleanup
3. Action success/failure
4. Error context with state

### Medium Priority
1. Element selector attempts
2. Compose window state
3. Data retrieval methods
4. Bulk operation state

### Low Priority (Nice to Have)
1. Performance metrics
2. Detailed DOM state
3. Gmail.js internal state

## AI Decision Helpers

### Key Questions Logs Should Answer:
1. "What view is the user currently in?"
2. "What tools are available right now?"
3. "Did my last action succeed?"
4. "Why did this selector/action fail?"
5. "What's the current state of the compose window?"
6. "Are there any emails selected?"
7. "What fallback methods are available?"
8. "How long should I wait for this operation?"

### State Indicators for AI:
- `isComposing`: boolean - compose window is open
- `hasSelection`: boolean - emails are selected
- `currentView`: string - current Gmail view
- `lastActionResult`: success/failure/timeout
- `availableTools`: string[] - currently registered tools
- `errorRecoveryOptions`: string[] - what to try next after failure