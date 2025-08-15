/**
 * Wait for DOM element to be available
 */
export function waitForElement(selector, timeout = 10000, root = document) {
    return new Promise((resolve, reject) => {
        const element = root.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        const observer = new MutationObserver(() => {
            const element = root.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        observer.observe(root, {
            childList: true,
            subtree: true,
        });
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}
/**
 * Safe DOM manipulation with error handling
 */
export function safelyManipulateDOM(operation, fallback, errorMessage) {
    try {
        return operation();
    }
    catch (error) {
        console.warn(`[MCP-B] DOM operation failed: ${errorMessage || 'Unknown error'}`, error);
        return fallback;
    }
}
/**
 * Create a delay promise
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry an operation with exponential backoff
 */
export async function retry(operation, maxAttempts = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxAttempts) {
                throw lastError;
            }
            const delayMs = baseDelay * 2 ** (attempt - 1);
            await delay(delayMs);
        }
    }
    throw lastError;
}
/**
 * Log with timestamp and MCP-B prefix
 */
export function log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[MCP-B ${timestamp}]`;
    switch (level) {
        case 'info':
            console.log(prefix, message, ...args);
            break;
        case 'warn':
            console.warn(prefix, message, ...args);
            break;
        case 'error':
            console.error(prefix, message, ...args);
            break;
    }
}
//# sourceMappingURL=utils.js.map