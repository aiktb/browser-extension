/**
 * Example: Background script setup with tRPC
 */

/// <reference types="chrome"/>

import superjson from "superjson";
import { createChromeAdapter } from "../adapters/chrome";
import { createExtensionHandler } from "../trpc";
import { appRouter } from "./router";

// Create adapter for Chrome extension
const adapter = createChromeAdapter();

// Setup tRPC handler for background script
createExtensionHandler({
  adapter,
  router: appRouter,

  // Optional: Create context for each request
  createContext: async () => {
    // You can add user session, permissions, etc.
    return {
      timestamp: Date.now(),
      // user: await getCurrentUser(),
    };
  },

  // Optional: Error handler
  onError: ({ error, type, path }) => {
    console.error(`tRPC error in ${type} ${path}:`, error);

    // You can log to external service
    // logToSentry({ error, type, path });
  },

  // Use superjson transformer for Date, Map, Set support
  transformer: {
    serialize: (data: unknown) => superjson.serialize(data),
    deserialize: (data: unknown) => {
      const result = superjson.deserialize(
        data as Parameters<typeof superjson.deserialize>[0],
      );
      return result;
    },
  },

  // Optional: Debug configuration
  debug: {
    enabled: import.meta.env?.DEV ?? false,
    logPerformance: true,
    level: 4, // DEBUG level
  },
});

// Example: Listen for extension install
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details.reason);

  if (details.reason === "install") {
    // Set default preferences on first install
    chrome.storage.sync.set({
      preferences: {
        theme: "auto",
        language: "en",
        notifications: true,
      },
    });
  }
});

// Example: Handle browser action click
chrome.action?.onClicked.addListener((tab) => {
  console.log("Browser action clicked on tab:", tab.id);

  // Open popup or perform action
  chrome.tabs.create({
    url: chrome.runtime.getURL("popup.html"),
  });
});

console.log("Background script with tRPC initialized");
