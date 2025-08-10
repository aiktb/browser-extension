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

    // Check if the title is displayed
    const titleText = await options.getTitleText();
    expect(titleText).toEqual("Default Option Title");
  });

  test("should have the correct page title", async ({ page, extensionId }) => {
    const options = await openOptions(page, extensionId);

    // Check the document title
    const pageTitle = await options.getPageTitle();
    expect(pageTitle).toEqual("Default Option Title");
  });

  test("should navigate to the correct URL", async ({ page, extensionId }) => {
    const options = await openOptions(page, extensionId);

    // Check the URL contains options.html
    const url = await options.getUrl();
    expect(url).toContain(`chrome-extension://${extensionId}/options.html`);
  });

  test("should render the React app", async ({ page, extensionId }) => {
    const options = await openOptions(page, extensionId);

    // Check if the React root element exists and is visible
    const rootElement = page.locator("#root");
    expect(await rootElement.isVisible()).toBeTruthy();

    // Check if the h1 element is rendered by React
    const title = await options.getTitle();
    expect(await title.isVisible()).toBeTruthy();
  });
});
