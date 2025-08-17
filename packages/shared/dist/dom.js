import userEvent from '@testing-library/user-event';

// src/dom.ts
var user = userEvent.setup();
async function waitForSelector(selector, timeout = 1e4) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}
async function waitForElement(predicate, timeout = 1e4) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = predicate();
    if (element) {
      return element;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}
async function clickElement(selector) {
  const element = await waitForSelector(selector);
  if (element && element instanceof HTMLElement) {
    await user.click(element);
    return true;
  }
  return false;
}
async function typeText(selector, text) {
  const element = await waitForSelector(selector);
  if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    await user.clear(element);
    await user.type(element, text);
    return true;
  }
  return false;
}
async function selectOption(selector, value) {
  const element = await waitForSelector(selector);
  if (element && element instanceof HTMLSelectElement) {
    await user.selectOptions(element, value);
    return true;
  }
  return false;
}
async function pressKey(key) {
  await user.keyboard(key);
}
async function uploadFile(selector, file) {
  const element = await waitForSelector(selector);
  if (element && element instanceof HTMLInputElement) {
    await user.upload(element, file);
    return true;
  }
  return false;
}
function isElementVisible(element) {
  if (!(element instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" && rect.width > 0 && rect.height > 0;
}
function getElementText(element) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  return element.textContent || "";
}
function getAllElements(selector) {
  return Array.from(document.querySelectorAll(selector));
}
function scrollToElement(element) {
  element.scrollIntoView({ behavior: "smooth", block: "center" });
}

export { clickElement, getAllElements, getElementText, isElementVisible, pressKey, scrollToElement, selectOption, typeText, uploadFile, user, waitForElement, waitForSelector };
