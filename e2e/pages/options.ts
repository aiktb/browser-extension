import { Page } from "@playwright/test";

/**
 * Page Object for the extension options page
 */
export class OptionsPage {
  private readonly page: Page;
  private readonly extensionId: string;

  // Selectors
  private readonly selectors = {
    title: "h1",
    root: "#root",
  };

  constructor(page: Page, extensionId: string) {
    this.page = page;
    this.extensionId = extensionId;
  }

  async navigate() {
    await this.page.goto(`chrome-extension://${this.extensionId}/options.html`);
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForSelector(this.selectors.root, {
      state: "visible",
      timeout: 5000,
    });
  }

  async getTitle() {
    return this.page.locator(this.selectors.title);
  }

  async getTitleText() {
    const title = await this.getTitle();
    return title.textContent();
  }

  async isVisible() {
    return this.page.locator(this.selectors.root).isVisible();
  }

  async getPageTitle() {
    return this.page.title();
  }

  async getUrl() {
    return this.page.url();
  }
}

/**
 * Helper function to open the options page
 */
export async function openOptions(page: Page, extensionId: string) {
  const options = new OptionsPage(page, extensionId);
  await options.navigate();
  await options.waitForLoad();
  return options;
}
