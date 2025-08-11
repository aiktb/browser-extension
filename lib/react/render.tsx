import { i18n, listenForLanguageChanges, safeInitI18n } from "@/lib/i18n";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";

/**
 * Common rendering function for all extension entry points.
 * Handles i18n initialization with error recovery and renders the app.
 *
 * @param Component - The React component to render
 * @param rootId - The ID of the root DOM element (default: "root")
 */
export default function render(
  Component: React.ComponentType,
  rootId: string = "root",
) {
  // Initialize i18n with error handling, then render app
  safeInitI18n()
    .catch((error) => {
      console.error("Failed to initialize i18n:", error);
    })
    .finally(() => {
      // Always listen for language changes
      listenForLanguageChanges();

      // Render the app
      createRoot(document.getElementById(rootId)!).render(
        <StrictMode>
          <I18nextProvider i18n={i18n}>
            <Component />
          </I18nextProvider>
        </StrictMode>,
      );
    });
}
