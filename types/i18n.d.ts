import enTranslations from "@/lib/locales/en.json";
import "i18next";

// Define the resources type
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof enTranslations;
    };
  }
}
