import { Page } from "@playwright/test";

/**
 * Page Object for the extension popup
 */
export class PopupPage {
  private readonly page: Page;
  private readonly extensionId: string;

  // Selectors
  private readonly selectors = {
    counter: "#counter",
  };

  constructor(page: Page, extensionId: string) {
    this.page = page;
    this.extensionId = extensionId;
  }

  async navigate() {
    await this.page.goto(`chrome-extension://${this.extensionId}/popup.html`);
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForSelector(this.selectors.counter, {
      state: "visible",
      timeout: 5000,
    });
  }

  async getCounter() {
    return this.page.locator(this.selectors.counter);
  }

  async clickCounter() {
    await this.getCounter().then((counter) => counter.click());
  }

  async getCounterText() {
    const counter = await this.getCounter();
    return counter.textContent();
  }
}

/**
 * Helper function to open the popup
 */
export async function openPopup(page: Page, extensionId: string) {
  const popup = new PopupPage(page, extensionId);
  await popup.navigate();
  await popup.waitForLoad();
  return popup;
}
