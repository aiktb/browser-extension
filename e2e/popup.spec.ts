import { expect, test } from "./extension-fixtures";
import { openPopup } from "./pages/popup";

test.describe("Popup", () => {
  test("Counter increments when clicked", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId);

    // Check initial counter value
    const initialCount = await popup.getCounterCount();
    expect(initialCount).toEqual(0);

    // Click and verify increment
    await popup.clickCounter();
    const count1 = await popup.getCounterCount();
    expect(count1).toEqual(1);

    // Click again and verify
    await popup.clickCounter();
    const count2 = await popup.getCounterCount();
    expect(count2).toEqual(2);
  });

  test("Has title and logos visible", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId);

    // Check title is visible
    const title = await popup.getTitle();
    expect(await title.isVisible()).toBeTruthy();

    // Check title text contains expected pattern
    const titleText = await popup.getTitleText();
    expect(titleText).toMatch(/WXT.*React/);

    // Check logos are visible
    expect(await popup.areLogosVisible()).toBeTruthy();
  });

  test("Settings button opens options page", async ({
    page,
    extensionId,
    context,
  }) => {
    const popup = await openPopup(page, extensionId);

    // Check settings button is visible
    expect(await popup.isSettingsButtonVisible()).toBeTruthy();

    // Listen for new page
    const pagePromise = context.waitForEvent("page");

    // Click settings button
    await popup.clickSettingsButton();

    // Wait for options page to open
    const optionsPage = await pagePromise;
    await optionsPage.waitForLoadState();

    // Verify options page URL
    const url = optionsPage.url();
    expect(url).toContain(`chrome-extension://${extensionId}/options.html`);
  });
});
