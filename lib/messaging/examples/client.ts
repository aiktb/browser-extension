/**
 * Example: Client setup for popup or content script
 */

/// <reference types="chrome"/>

import { createTRPCClient } from "@trpc/client";
import superjson from "superjson";
import { createChromeAdapter } from "../adapters/chrome";
import { extensionLink } from "../trpc";
import type { AppRouter } from "./router";

// Create adapter for Chrome extension
const adapter = createChromeAdapter();

// Create tRPC client with extension link
export const trpc = createTRPCClient<AppRouter>({
  links: [
    extensionLink({
      adapter,
      transformer: {
        serialize: (data: unknown) => superjson.serialize(data),
        deserialize: (data: unknown) => {
          const result = superjson.deserialize(
            data as Parameters<typeof superjson.deserialize>[0],
          );
          return result;
        },
      },
      // Optional: Request timeout (default: 30000ms)
      timeout: 60000,
      // Optional: Debug configuration
      debug: {
        enabled: import.meta.env?.DEV ?? false,
        logPerformance: true,
      },
    }),
  ],
});

// Example usage in popup or content script
async function exampleUsage() {
  try {
    // Query example - get active tab
    const activeTab = await trpc.tabs.getActive.query();
    console.log("Active tab:", activeTab);

    // Mutation example - save to storage
    await trpc.storage.set.mutate({
      key: "lastVisited",
      value: activeTab?.url,
    });

    // Query stored value
    const lastVisited = await trpc.storage.get.query("lastVisited");
    console.log("Last visited URL:", lastVisited);

    // Update preferences
    const preferences = await trpc.preferences.update.mutate({
      theme: "dark",
      notifications: false,
    });
    console.log("Updated preferences:", preferences);

    // Track analytics event
    await trpc.analytics.track.mutate({
      event: "popup_opened",
      properties: {
        tab_id: activeTab?.id,
        timestamp: Date.now(),
      },
    });

    // Show notification
    await trpc.notification.show.mutate({
      title: "Hello from tRPC",
      message: "Extension messaging is working!",
    });
  } catch (error) {
    console.error("tRPC client error:", error);
  }
}

// Run example on load
if (typeof window !== "undefined") {
  exampleUsage();
}
