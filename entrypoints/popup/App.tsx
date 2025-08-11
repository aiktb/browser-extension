import reactLogo from "@/assets/react.svg";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { browser } from "wxt/browser";
import wxtLogo from "/wxt.svg";

function App() {
  const [count, setCount] = useState(0);
  const { t } = useTranslation();

  const openOptionsPage = () => {
    browser.runtime.openOptionsPage();
  };

  return (
    <div className="relative w-[350px] min-h-screen p-8 text-center bg-background dark:bg-[#242424] text-foreground dark:text-white/90 font-['Inter',_system-ui,_Avenir,_Helvetica,_Arial,_sans-serif]">
      {/* Settings button */}
      <Button
        onClick={openOptionsPage}
        className="absolute top-4 right-4"
        variant="ghost"
        aria-label="Settings"
      >
        <Settings />
      </Button>
      <div className="flex items-center justify-center mb-8">
        <a href="https://wxt.dev" target="_blank" rel="noreferrer">
          <img
            src={wxtLogo}
            className="h-24 p-6 will-change-[filter] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#54bc4ae0]"
            alt={t("logoAlt.wxt")}
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img
            src={reactLogo}
            className="h-24 p-6 will-change-[filter] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] motion-safe:animate-[spin_20s_linear_infinite]"
            alt={t("logoAlt.react")}
          />
        </a>
      </div>
      <h1 className="text-[3.2em] leading-[1.1] font-normal mb-8">
        {t("title")}
      </h1>
      <div className="flex flex-col gap-4">
        <Button
          onClick={() => setCount((count) => count + 1)}
          size="lg"
          id="counter"
          className="w-full"
        >
          {t("button.count", { count })}
        </Button>
        <Trans
          i18nKey="instructions.editCode"
          values={{ file: "src/App.tsx" }}
          components={{
            code: <code className="text-primary" />,
          }}
          className="text-muted-foreground"
        />
        <p className="text-muted-foreground">{t("instructions.learnMore")}</p>
      </div>
    </div>
  );
}

export default App;
