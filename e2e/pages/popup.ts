import { Page } from "@playwright/test";
import type { SupportedLocale } from "../../lib/i18n";

/**
 * Page Object for the extension popup
 */
export class PopupPage {
  private readonly page: Page;
  private readonly extensionId: string;
  private language: SupportedLocale = "en";

  // Selectors
  private readonly selectors = {
    counter: "#counter",
    settingsButton: "button[aria-label='Settings']",
    title: "h1",
    wxtLogo: "img[alt*='WXT']",
    reactLogo: "img[alt*='React']",
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

  async getCounterCount(): Promise<number> {
    const text = await this.getCounterText();
    if (!text) return 0;
    // Extract number from "Count: X" or "カウント: X" format
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async getTitle() {
    return this.page.locator(this.selectors.title);
  }

  async getTitleText() {
    const title = await this.getTitle();
    return title.textContent();
  }

  async clickSettingsButton() {
    await this.page.locator(this.selectors.settingsButton).click();
  }

  async isSettingsButtonVisible() {
    return this.page.locator(this.selectors.settingsButton).isVisible();
  }

  async areLogosVisible() {
    const wxtVisible = await this.page
      .locator(this.selectors.wxtLogo)
      .isVisible();
    const reactVisible = await this.page
      .locator(this.selectors.reactLogo)
      .isVisible();
    return wxtVisible && reactVisible;
  }

  setLanguage(language: SupportedLocale) {
    this.language = language;
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
