# Gmail MCP Refactoring Summary

## Problem Statement
The original implementation had tools registering other tools, which could cause the UI state and tool state to get out of sync when users took actions on the screen.

## Solution: State-Driven Tool Registration

### Key Principles

1. **UI State as Single Source of Truth**: Tools are registered/unregistered purely based on Gmail UI state changes detected by Gmail.js observers.

2. **No Nested Registrations**: Tools never register other tools - they only trigger UI actions.

3. **Clear Context Boundaries**: Each context (inbox, email-view, compose) manages its own tools independently.

4. **Stateless Tool Actions**: Tools only perform actions and return results, they don't manage state.

### Architecture Changes

#### Compose Observer (`compose.ts`)
- **Before**: Tools would clean up after themselves (e.g., `gmail_send_email` would call `window._cleanupTools()`)
- **After**: 
  - Tracks active compose windows in a Map
  - `compose_cancelled` observer handles all cleanup
  - `reevaluateContext()` function determines what tools to register based on current UI state
  - Tools just perform actions and let observers handle state

#### Email View Observer (`email-view.ts`)
- **Before**: 
  - Used custom events to restore state
  - Tools mentioned what other tools would be registered
- **After**:
  - Tracks current email view
  - Listens for `gmail:email_view_active` custom event for re-activation
  - Consolidated `registerEmailViewTools()` function
  - Tools have simplified descriptions without mentioning other tools

#### Inbox Observer (`inbox.ts`)
- **Before**: 
  - `gmail_select_emails` would directly call `registerBulkActionTools()`
  - Bulk action tools would clean up after themselves
- **After**:
  - MutationObserver monitors checkbox selection state
  - Bulk tools are registered/unregistered automatically based on selection state
  - Tools don't manage their own lifecycle

### Benefits

1. **Consistent State**: UI state and tool state are always in sync
2. **Simpler Tools**: Tools focus only on their action, not on state management
3. **Better Separation of Concerns**: Observers handle state, tools handle actions
4. **More Maintainable**: Clear boundaries between contexts
5. **Predictable Behavior**: Tool availability is determined by Gmail UI state, not by other tools

### How It Works

1. Gmail.js observers detect UI changes (e.g., compose window opens, email selected)
2. Observers clean up previous context tools and register new ones
3. Tools perform actions when called but don't manage state
4. When UI changes again, observers handle the transition
5. Custom events allow contexts to communicate without tight coupling

### Example Flow

1. User is viewing an email → `view_email` observer registers email tools
2. User clicks reply → Reply button tool triggers UI action
3. Gmail opens compose window → `compose` observer detects this
4. `compose` observer cleans up email tools and registers reply tools
5. User sends reply → Send tool triggers send action
6. Compose window closes → `compose_cancelled` observer detects this
7. `reevaluateContext()` determines we're back in email view
8. Custom event triggers email view tool registration

This approach ensures tools are always appropriate for the current Gmail UI state, preventing desynchronization issues.