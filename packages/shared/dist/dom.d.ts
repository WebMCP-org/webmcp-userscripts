import * as _testing_library_user_event from '@testing-library/user-event';

declare const user: _testing_library_user_event.UserEvent;
declare function waitForSelector(selector: string, timeout?: number): Promise<Element | null>;
declare function waitForElement(predicate: () => Element | null, timeout?: number): Promise<Element | null>;
declare function clickElement(selector: string): Promise<boolean>;
declare function typeText(selector: string, text: string): Promise<boolean>;
declare function selectOption(selector: string, value: string): Promise<boolean>;
declare function pressKey(key: string): Promise<void>;
declare function uploadFile(selector: string, file: File): Promise<boolean>;
declare function isElementVisible(element: Element): boolean;
declare function getElementText(element: Element): string;
declare function getAllElements(selector: string): Element[];
declare function scrollToElement(element: Element): void;

export { clickElement, getAllElements, getElementText, isElementVisible, pressKey, scrollToElement, selectOption, typeText, uploadFile, user, waitForElement, waitForSelector };
