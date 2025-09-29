// background/router.ts
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

const t = initTRPC.create({
  // SuperJSON transformer enables serialization of complex JavaScript types (Date, Map, Set, etc.)
  // that aren't natively supported by JSON, preserving type safety across message passing
  transformer: superjson,
  // Set to false since this runs in a browser extension environment, not a Node.js server
  isServer: false,
  // Required for tRPC to work in non-server environments like browser extensions
  // where traditional server context doesn't exist
  allowOutsideOfServer: true,
});

export const appRouter = t.router({
  storage: t.router({
    get: t.procedure.input(z.string()).query(async ({ input }) => {
      const result = await chrome.storage.local.get(input);
      return result[input];
    }),
    set: t.procedure
      .input(z.object({ key: z.string(), value: z.unknown() }))
      .mutation(async ({ input }) => {
        await chrome.storage.local.set({ [input.key]: input.value });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
