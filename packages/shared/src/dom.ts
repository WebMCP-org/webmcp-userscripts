import userEvent from '@testing-library/user-event';

export const user = userEvent.setup();

export async function waitForSelector(
  selector: string,
  timeout = 10000
): Promise<Element | null> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return null;
}

export async function waitForElement(
  predicate: () => Element | null,
  timeout = 10000
): Promise<Element | null> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = predicate();
    if (element) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return null;
}

export async function clickElement(selector: string): Promise<boolean> {
  const element = await waitForSelector(selector);
  if (element && element instanceof HTMLElement) {
    await user.click(element);
    return true;
  }
  return false;
}

export async function typeText(selector: string, text: string): Promise<boolean> {
  const element = await waitForSelector(selector);
  if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    await user.clear(element);
    await user.type(element, text);
    return true;
  }
  return false;
}

export async function selectOption(selector: string, value: string): Promise<boolean> {
  const element = await waitForSelector(selector);
  if (element && element instanceof HTMLSelectElement) {
    await user.selectOptions(element, value);
    return true;
  }
  return false;
}

export async function pressKey(key: string): Promise<void> {
  await user.keyboard(key);
}

export async function uploadFile(selector: string, file: File): Promise<boolean> {
  const element = await waitForSelector(selector);
  if (element && element instanceof HTMLInputElement) {
    await user.upload(element, file);
    return true;
  }
  return false;
}

export function isElementVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    rect.width > 0 &&
    rect.height > 0
  );
}

export function getElementText(element: Element): string {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  return element.textContent || '';
}

export function getAllElements(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

export function scrollToElement(element: Element): void {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}