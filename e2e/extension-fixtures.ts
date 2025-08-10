import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "path";

const pathToExtension = path.resolve(".output/chrome-mv3");

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  /**
   * Browser context fixture with extension loaded.
   * Extensions require a persistent context to function properly.
   * > Note the use of the `chromium` channel that allows to run extensions in headless mode.
   * @see {@link https://playwright.dev/docs/chrome-extensions}
   */
  context: async (
    // eslint-disable-next-line no-empty-pattern
    {},
    use,
  ) => {
    const context = await chromium.launchPersistentContext("", {
      /**
       * Must use 'chromium' channel for headless extension testing.
       * Chrome and Edge channels don't support extensions in headless mode.
       * > Extensions only work in Chrome / Chromium launched with a persistent context.
       * @see {@link https://playwright.dev/docs/chrome-extensions}
       */
      channel: "chromium",
      headless: true,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);
    await context.close();
  },

  /**
   * Extension ID fixture extracted from the service worker or background page URL.
   * Automatically detects manifest version and uses appropriate API.
   */
  extensionId: async ({ context }, use) => {
    let background: { url(): string };
    if (pathToExtension.endsWith("-mv3")) {
      [background] = context.serviceWorkers();
      if (!background) {
        background = await context.waitForEvent("serviceworker");
      }
    } else {
      [background] = context.backgroundPages();
      if (!background) {
        background = await context.waitForEvent("backgroundpage");
      }
    }

    const extensionId = background.url().split("/")[2];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(extensionId);
  },
});

export const expect = test.expect;
