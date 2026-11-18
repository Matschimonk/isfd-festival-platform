import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { l, type Locale } from "./content";

const name = l("Night theme", "Tema notte", "Nachtmodus");
export function FestivalTheme({ locale }: { locale: Locale }) {
  const [night, setNight] = useState(true);
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const update = () =>
      setNight(
        (document.documentElement.dataset.festivalTheme ??
          (query.matches ? "night" : "day")) === "night",
      );
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  function toggle() {
    const value = night ? "day" : "night";
    document.documentElement.dataset.festivalTheme = value;
    try {
      localStorage.setItem("isfd-theme", value);
    } catch {
      /* Current page still updates. */
    }
    setNight(!night);
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={night}
      aria-label={name[locale]}
      className="v3-theme"
      onClick={toggle}
    >
      {night ? (
        <Moon size={17} aria-hidden="true" />
      ) : (
        <Sun size={17} aria-hidden="true" />
      )}
    </button>
  );
}
