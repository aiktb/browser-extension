/**
 * Example: tRPC router definition for background script
 */

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

// Initialize tRPC with transformer
const t = initTRPC.create({
  transformer: superjson,
  isServer: false,
  allowOutsideOfServer: true,
});

// Create router instance
export const appRouter = t.router({
  // Storage procedures
  storage: t.router({
    get: t.procedure.input(z.string()).query(async ({ input }) => {
      const result = await chrome.storage.local.get(input);
      return result[input];
    }),

    set: t.procedure
      .input(
        z.object({
          key: z.string(),
          value: z.unknown(),
        }),
      )
      .mutation(async ({ input }) => {
        await chrome.storage.local.set({ [input.key]: input.value });
        return { success: true };
      }),

    remove: t.procedure.input(z.string()).mutation(async ({ input }) => {
      await chrome.storage.local.remove(input);
      return { success: true };
    }),
  }),

  // Tab management procedures
  tabs: t.router({
    getActive: t.procedure.query(async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      return tab;
    }),

    create: t.procedure
      .input(
        z.object({
          url: z.string(),
          active: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const tab = await chrome.tabs.create(input);
        return tab;
      }),

    update: t.procedure
      .input(
        z.object({
          tabId: z.number(),
          updateProperties: z.object({
            url: z.string().optional(),
            active: z.boolean().optional(),
            pinned: z.boolean().optional(),
          }),
        }),
      )
      .mutation(async ({ input }) => {
        const tab = await chrome.tabs.update(
          input.tabId,
          input.updateProperties,
        );
        return tab;
      }),
  }),

  // Notifications
  notification: t.router({
    show: t.procedure
      .input(
        z.object({
          title: z.string(),
          message: z.string(),
          iconUrl: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const notificationId = await chrome.notifications.create({
          type: "basic",
          title: input.title,
          message: input.message,
          iconUrl: input.iconUrl || "/icon-128.png",
        });
        return { notificationId };
      }),
  }),

  // User preferences
  preferences: t.router({
    get: t.procedure.query(async () => {
      const prefs = await chrome.storage.sync.get("preferences");
      return prefs.preferences || {};
    }),

    update: t.procedure
      .input(
        z.object({
          theme: z.enum(["light", "dark", "auto"]).optional(),
          language: z.string().optional(),
          notifications: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const current = await chrome.storage.sync.get("preferences");
        const updated = { ...current.preferences, ...input };
        await chrome.storage.sync.set({ preferences: updated });
        return updated;
      }),
  }),

  // Analytics events
  analytics: t.router({
    track: t.procedure
      .input(
        z.object({
          event: z.string(),
          properties: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        // Log analytics event
        console.log("Analytics event:", input);
        return { tracked: true };
      }),
  }),
});

// Export type for use in client
export type AppRouter = typeof appRouter;
