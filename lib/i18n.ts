import { userPreferences, type UserPreferences } from "@/lib/storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { browser } from "wxt/browser";
import enTranslations from "./locales/en.json";
import jaTranslations from "./locales/ja.json";

// Define supported locales as a const assertion for type safety
export const SUPPORTED_LOCALES = ["en", "ja"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// Type guard to check if a value is a supported locale
function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === "string" &&
    SUPPORTED_LOCALES.includes(value as SupportedLocale)
  );
}

// Get browser's default language
export function getBrowserLanguage(): SupportedLocale {
  const uiLanguage = browser.i18n.getUILanguage();
  // Extract language code (e.g., "en-US" -> "en", "ja" -> "ja")
  const languageCode = uiLanguage ? uiLanguage.substring(0, 2) : "en";
  // Ensure we only return supported languages
  return isSupportedLocale(languageCode) ? languageCode : "en";
}

// Initialize i18next
async function initI18n() {
  // Get saved language preference from storage
  const preferences = await userPreferences.getValue();
  const savedLanguage = preferences.language;

  // Validate saved language and fall back to browser language if invalid
  const defaultLanguage = isSupportedLocale(savedLanguage)
    ? savedLanguage
    : getBrowserLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ja: {
        translation: jaTranslations,
      },
    },
    lng: defaultLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for extension context
    },
  });

  return defaultLanguage;
}

// Save language preference to storage
export async function saveLanguagePreference(language: SupportedLocale) {
  // Runtime validation to ensure only valid languages are saved
  if (!isSupportedLocale(language)) {
    console.error(`Invalid language code: ${language}`);
    return;
  }
  await userPreferences.setValue({ language });
}

// Listen for storage changes to sync language across extension pages
export function listenForLanguageChanges() {
  userPreferences.watch((newPreferences: UserPreferences | null) => {
    if (newPreferences?.language) {
      // Validate the new language value before changing
      if (isSupportedLocale(newPreferences.language)) {
        i18n.changeLanguage(newPreferences.language);
      } else {
        console.error(
          `Invalid language value from storage: ${newPreferences.language}`,
        );
      }
    }
  });
}

// Safe initialization function with error handling
export async function safeInitI18n(): Promise<void> {
  try {
    await initI18n();
  } catch (error) {
    console.error("i18n initialization failed, using defaults:", error);
    // Fallback to default configuration if initialization fails
    // This ensures the app still renders with default translations
    await i18n.use(initReactI18next).init({
      lng: "en",
      fallbackLng: "en",
      resources: {
        en: { translation: enTranslations },
        ja: { translation: jaTranslations },
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  }
}

export { i18n, initI18n };
