import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  saveLanguagePreference,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/lib/i18n";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function App() {
  const { t, i18n } = useTranslation();
  const [saved, setSaved] = useState(false);

  // Normalize to base code and restrict to our supported set
  const normalizeLang = (lng: string): SupportedLocale => {
    const baseLang = (lng.split?.("-")[0] ?? "en") as SupportedLocale;
    // Ensure it's a supported locale
    return SUPPORTED_LOCALES.includes(baseLang) ? baseLang : "en";
  };

  const initial = normalizeLang(i18n.resolvedLanguage ?? i18n.language);
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLocale>(initial);
  const [pendingLanguage, setPendingLanguage] =
    useState<SupportedLocale>(initial);

  // Sync local selection if language changes elsewhere
  useEffect(() => {
    const handler = (lng: string) => {
      const n = normalizeLang(lng);
      setSelectedLanguage(n);
      setPendingLanguage(n);
    };
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, [i18n]);

  const handleLanguageSelect = (newLang: string) => {
    // Only update the pending selection, don't change language yet
    setPendingLanguage(newLang as SupportedLocale);
  };

  const handleSave = async () => {
    // Apply language change when Save is clicked
    if (pendingLanguage !== selectedLanguage) {
      await i18n.changeLanguage(pendingLanguage);
      await saveLanguagePreference(pendingLanguage);
      setSelectedLanguage(pendingLanguage);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    // Reset to current language
    setPendingLanguage(selectedLanguage);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t("options.title")}</h1>

        {/* Language Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {t("options.language.title")}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t("options.language.description")}
          </p>
          <div className="flex items-center gap-4">
            <label className="font-medium">
              {t("options.language.select")}
            </label>
            <Select
              value={pendingLanguage}
              onValueChange={handleLanguageSelect}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleSave}>{t("options.save")}</Button>
          <Button variant="outline" onClick={handleCancel}>
            {t("options.cancel")}
          </Button>
        </div>

        {/* Saved Message */}
        {saved && <p className="mt-4 text-green-600">{t("options.saved")}</p>}
      </div>
    </div>
  );
}

export default App;
