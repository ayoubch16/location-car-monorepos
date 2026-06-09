import { create } from "zustand";
import i18n from "i18n"; // adjust path

type Lang = "ar" | "en" | "fr";

interface LanguageState {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  hydrateLanguage: () => void;
}

export const useHandleLanguage = create<LanguageState>((set, get) => ({
  language: (localStorage.getItem("lang") as Lang) || "fr",

  setLanguage: (lang) => {
    const current = localStorage.getItem("lang") as Lang | null;
    if (current === lang) return;

    localStorage.setItem("lang", lang);
    set({ language: lang });
    i18n.changeLanguage(lang);
  },

  hydrateLanguage: () => {
    try {
      const stored = localStorage.getItem("lang") as Lang | null;
      if (!stored) {
        get().setLanguage("fr");
      } else {
        // keep Zustand in sync + ensure i18n uses it
        set({ language: stored });
        i18n.changeLanguage(stored);
      }
    } catch (e) {
      console.log(e);
    }
  },
}));

export const setLanguage = (language: Lang) =>
  useHandleLanguage.getState().setLanguage(language);

export const hydrateLanguage = () =>
  useHandleLanguage.getState().hydrateLanguage();
