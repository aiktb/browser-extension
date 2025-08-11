import { Page } from "@playwright/test";
import type { SupportedLocale } from "../../lib/i18n";

/**
 * Page Object for the extension options page
 */
export class OptionsPage {
  private readonly page: Page;
  private readonly extensionId: string;
  private language: SupportedLocale = "en";

  // Selectors
  private readonly selectors = {
    title: "h1",
    root: "#root",
    languageSelect: "[data-slot='select-trigger']",
    languageOption: (lang: string) =>
      `[data-slot='select-item'][data-value='${lang}']`,
    saveButton: "button:has-text('Save')",
    cancelButton: "button:has-text('Cancel')",
    savedMessage: "p:has-text('Settings saved')",
    languageSection: "section:has(h2)",
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

  async selectLanguage(language: SupportedLocale) {
    // Click the select trigger to open dropdown
    await this.page.locator(this.selectors.languageSelect).click();
    // Wait for the dropdown to be visible
    await this.page.waitForSelector("[data-slot='select-content']", {
      state: "visible",
      timeout: 5000,
    });
    // Click the language option using text selector
    const optionText = language === "ja" ? "日本語" : "English";
    await this.page
      .locator(`[data-slot='select-item']:has-text('${optionText}')`)
      .click();
  }

  async clickSave() {
    // Use more flexible selector for i18n
    const saveButton = this.page
      .getByRole("button")
      .filter({ hasText: /Save|保存/ });
    await saveButton.click();
  }

  async clickCancel() {
    // Use more flexible selector for i18n
    const cancelButton = this.page
      .getByRole("button")
      .filter({ hasText: /Cancel|キャンセル/ });
    await cancelButton.click();
  }

  async isSavedMessageVisible() {
    // Check for either English or Japanese saved message
    const englishMessage = await this.page
      .locator("p:has-text('Settings saved')")
      .isVisible();
    const japaneseMessage = await this.page
      .locator("p:has-text('設定を保存')")
      .isVisible();
    return englishMessage || japaneseMessage;
  }

  async getSelectedLanguage() {
    const selectTrigger = this.page.locator(this.selectors.languageSelect);
    return selectTrigger.textContent();
  }

  async isLanguageSectionVisible() {
    return this.page.locator(this.selectors.languageSection).isVisible();
  }

  setLanguage(language: SupportedLocale) {
    this.language = language;
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
