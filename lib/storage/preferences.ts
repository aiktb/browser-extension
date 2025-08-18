import type { SupportedLocale } from "@/lib/i18n";
import { storage } from "wxt/utils/storage";

export interface UserPreferences {
  language: SupportedLocale;
}

export const userPreferences = storage.defineItem<UserPreferences>(
  "local:userPreferences",
  {
    fallback: {
      language: "en",
    },
    version: 1,
  },
);
