"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings, queryKeys } from "@/lib/api";

export interface SiteSettingsData {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  showHeroBanner: boolean;
  showFeaturedSection: boolean;
  showTrendingSection: boolean;
  showAllComicsSection: boolean;
  showHowItWorks: boolean;
  showGenresSection: boolean;
  showNewsletter: boolean;
  showCreatorSection: boolean;
  heroTitle: string;
  heroSubtitle: string;
  footerText: string;
}

const defaultSettings: SiteSettingsData = {
  primaryColor: "#9dfb2b",
  secondaryColor: "#da009d",
  tertiaryColor: "#079ea8",
  showHeroBanner: true,
  showFeaturedSection: true,
  showTrendingSection: true,
  showAllComicsSection: true,
  showHowItWorks: true,
  showGenresSection: true,
  showNewsletter: true,
  showCreatorSection: true,
  heroTitle: "DISCOVER READ REMEMBER",
  heroSubtitle: "Where stories come alive, one panel at a time.",
  footerText: "Where stories come alive, one panel at a time.",
};

const SettingsContext = createContext<SiteSettingsData>(defaultSettings);

function applyThemeColors(data: SiteSettingsData) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const colors = [["primary", data.primaryColor], ["secondary", data.secondaryColor], ["tertiary", data.tertiaryColor]] as const;
  for (const [name, value] of colors) {
    if (!value) continue;
    root.style.setProperty(`--color-${name}`, value);
    const rgb = hexToRgb(value);
    if (rgb) root.style.setProperty(`--color-${name}-rgb`, rgb);
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: settings = defaultSettings } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => getSettings<SiteSettingsData>(),
    placeholderData: defaultSettings,
  });

  useEffect(() => {
    applyThemeColors(settings);
    const readerTheme = window.localStorage.getItem("mycomic:reader-theme");
    if (readerTheme && readerTheme !== "default") document.documentElement.setAttribute("data-reader-theme", readerTheme);
    else document.documentElement.removeAttribute("data-reader-theme");
  }, [settings]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

function hexToRgb(hex: string): string | null {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return null;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
