import { expect, test } from "./extension-fixtures";
import { openOptions } from "./pages/options";

test.describe("Options Page", () => {
  test("should load and display the options page", async ({
    page,
    extensionId,
  }) => {
    const options = await openOptions(page, extensionId);

    // Check if the page is visible
    expect(await options.isVisible()).toBeTruthy();

    // Check if the title is displayed and visible
    const title = await options.getTitle();
    expect(await title.isVisible()).toBeTruthy();

    // Check title contains relevant text (language-agnostic)
    const titleText = await options.getTitleText();
    expect(titleText).toBeTruthy();
  });

  test("should navigate to the correct URL", async ({ page, extensionId }) => {
    const options = await openOptions(page, extensionId);

    // Check the URL contains options.html
    const url = await options.getUrl();
    expect(url).toContain(`chrome-extension://${extensionId}/options.html`);
  });

  test("should render the React app with language section", async ({
    page,
    extensionId,
  }) => {
    const options = await openOptions(page, extensionId);

    // Check if the React root element exists and is visible
    const rootElement = page.locator("#root");
    expect(await rootElement.isVisible()).toBeTruthy();

    // Check if language section is visible
    expect(await options.isLanguageSectionVisible()).toBeTruthy();
  });

  test("should allow language selection", async ({ page, extensionId }) => {
    const options = await openOptions(page, extensionId);

    // Get initial language
    const initialLanguage = await options.getSelectedLanguage();
    expect(initialLanguage).toBeTruthy();

    // Try to select Japanese
    await options.selectLanguage("ja");

    // Save the selection
    await options.clickSave();

    // Check for saved message
    await page.waitForTimeout(500); // Give time for message to appear
    const savedVisible = await options.isSavedMessageVisible();
    expect(savedVisible).toBeTruthy();
  });

  test("should cancel language selection", async ({ page, extensionId }) => {
    const options = await openOptions(page, extensionId);

    // Get initial language
    const initialLanguage = await options.getSelectedLanguage();

    // Select a different language but don't save
    if (initialLanguage?.includes("English")) {
      await options.selectLanguage("ja");
    } else {
      await options.selectLanguage("en");
    }

    // Click cancel
    await options.clickCancel();

    // Language should reset to initial value
    await page.waitForTimeout(200); // Give time for UI to update
    const currentLanguage = await options.getSelectedLanguage();
    expect(currentLanguage).toEqual(initialLanguage);
  });
});
