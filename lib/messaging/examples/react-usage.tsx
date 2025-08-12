/**
 * Example: Using tRPC in React components
 */

import { createTRPCClient } from "@trpc/client";
import { useEffect, useState } from "react";
import superjson from "superjson";
import { createChromeAdapter } from "../adapters/chrome";
import { extensionLink } from "../trpc";
import type { AppRouter } from "./router";

// Create adapter for Chrome extension
const adapter = createChromeAdapter();

// Create tRPC client
const trpc = createTRPCClient<AppRouter>({
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
      // Optional: Request timeout
      timeout: 30000,
      // Optional: Debug configuration
      debug: {
        enabled: import.meta.env?.DEV ?? false,
        logPerformance: true,
      },
    }),
  ],
});

/**
 * Custom hook for tRPC queries
 */
function useTRPCQuery<T>(queryFn: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await queryFn();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [queryFn]);

  return { data, loading, error };
}

/**
 * Example: Preferences component
 */
export function PreferencesPanel() {
  const {
    data: preferences,
    loading,
    error,
  } = useTRPCQuery(() => trpc.preferences.get.query());

  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");

  useEffect(() => {
    if (preferences?.theme) {
      setTheme(preferences.theme);
    }
  }, [preferences]);

  const handleThemeChange = async (newTheme: "light" | "dark" | "auto") => {
    try {
      await trpc.preferences.update.mutate({ theme: newTheme });
      setTheme(newTheme);

      // Track the change
      await trpc.analytics.track.mutate({
        event: "theme_changed",
        properties: { theme: newTheme },
      });
    } catch (err) {
      console.error("Failed to update theme:", err);
    }
  };

  if (loading) return <div>Loading preferences...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="preferences-panel">
      <h2>Preferences</h2>
      <div className="theme-selector">
        <label>Theme:</label>
        <select
          value={theme}
          onChange={(e) => handleThemeChange(e.target.value as typeof theme)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
    </div>
  );
}

/**
 * Example: Active tab display
 */
export function ActiveTabInfo() {
  const { data: tab, loading } = useTRPCQuery(() =>
    trpc.tabs.getActive.query(),
  );

  const handleOpenNewTab = async () => {
    try {
      const newTab = await trpc.tabs.create.mutate({
        url: "https://example.com",
        active: true,
      });

      await trpc.notification.show.mutate({
        title: "New Tab Opened",
        message: `Opened tab: ${newTab.title}`,
      });
    } catch (err) {
      console.error("Failed to open new tab:", err);
    }
  };

  if (loading) return <div>Loading tab info...</div>;

  return (
    <div className="tab-info">
      <h3>Active Tab</h3>
      {tab && (
        <div>
          <p>Title: {tab.title}</p>
          <p>URL: {tab.url}</p>
          <p>ID: {tab.id}</p>
        </div>
      )}
      <button onClick={handleOpenNewTab}>Open New Tab</button>
    </div>
  );
}

/**
 * Example: Storage manager component
 */
export function StorageManager() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [storedValue, setStoredValue] = useState<unknown>(null);

  const handleSave = async () => {
    if (!key || !value) return;

    try {
      await trpc.storage.set.mutate({
        key,
        value: JSON.parse(value),
      });

      alert("Value saved successfully!");
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save value");
    }
  };

  const handleLoad = async () => {
    if (!key) return;

    try {
      const result = await trpc.storage.get.query(key);
      setStoredValue(result);
    } catch (err) {
      console.error("Failed to load:", err);
    }
  };

  const handleRemove = async () => {
    if (!key) return;

    try {
      await trpc.storage.remove.mutate(key);
      setStoredValue(null);
      alert("Value removed successfully!");
    } catch (err) {
      console.error("Failed to remove:", err);
    }
  };

  return (
    <div className="storage-manager">
      <h3>Storage Manager</h3>
      <div>
        <input
          type="text"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <input
          type="text"
          placeholder="Value (JSON)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleLoad}>Load</button>
        <button onClick={handleRemove}>Remove</button>
      </div>
      {storedValue !== null && (
        <div>
          <h4>Stored Value:</h4>
          <pre>{JSON.stringify(storedValue, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Main App component
 */
export function App() {
  return (
    <div className="app">
      <h1>Extension Popup</h1>
      <PreferencesPanel />
      <ActiveTabInfo />
      <StorageManager />
    </div>
  );
}
