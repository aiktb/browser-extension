// background/index.ts
import { createExtensionHandler } from "@/lib/messaging";
import { createChromeAdapter } from "@/lib/messaging/adapters/chrome";
import superjson from "superjson";
import { appRouter } from "./router";

export default defineBackground(() => {
  // Create browser adapter
  const adapter = createChromeAdapter();

  createExtensionHandler({
    adapter, // 🚨 REQUIRED: Adapter is now mandatory
    router: appRouter,
    transformer: {
      serialize: (data) => superjson.serialize(data),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deserialize: (data) => superjson.deserialize(data as any),
    },
    // Optional: Error handling
    onError: ({ error, path }) => {
      console.error(`Error in ${path}:`, error);
    },
    // Optional: Debug configuration
    debug: {
      enabled: import.meta.env.DEV,
      logPerformance: true,
    },
  });
});
