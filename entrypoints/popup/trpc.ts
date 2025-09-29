// popup/trpc.ts
import { extensionLink } from "@/lib/messaging";
import { createChromeAdapter } from "@/lib/messaging/adapters/chrome";
import { createTRPCClient } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../background/router";

// Create browser adapter
const adapter = createChromeAdapter();

export const trpc = createTRPCClient<AppRouter>({
  links: [
    extensionLink({
      adapter, // 🚨 REQUIRED: Adapter is now mandatory
      transformer: {
        serialize: (data) => superjson.serialize(data),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deserialize: (data) => superjson.deserialize(data as any),
      },
      // Optional: Request timeout (default: 30000ms)
      timeout: 60000,
      // Optional: Debug configuration
      debug: {
        enabled: import.meta.env.DEV,
        logPerformance: true,
      },
    }),
  ],
});
