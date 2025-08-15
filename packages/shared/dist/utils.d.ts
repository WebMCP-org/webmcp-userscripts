/**
 * Wait for DOM element to be available
 */
export declare function waitForElement(selector: string, timeout?: number, root?: Document | Element): Promise<Element>;
/**
 * Safe DOM manipulation with error handling
 */
export declare function safelyManipulateDOM<T>(operation: () => T, fallback?: T, errorMessage?: string): T | undefined;
/**
 * Create a delay promise
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Retry an operation with exponential backoff
 */
export declare function retry<T>(operation: () => Promise<T>, maxAttempts?: number, baseDelay?: number): Promise<T>;
/**
 * Log with timestamp and MCP-B prefix
 */
export declare function log(level: 'info' | 'warn' | 'error', message: string, ...args: any[]): void;
//# sourceMappingURL=utils.d.ts.map