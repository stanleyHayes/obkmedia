import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { publicApi } from './api/public';
import type { SettingsSocial, SiteSettings } from './api/types';
import { BRAND, SOCIALS } from './content';
import { useThemeMode } from './ThemeModeContext';

interface SiteSettingsState {
  settings: SiteSettings | null;
  loading: boolean;
}

// Default (no provider / still loading) resolves to built-in content, so any
// component can read these hooks safely without crashing.
const SiteSettingsContext = createContext<SiteSettingsState>({ settings: null, loading: true });

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    publicApi
      .settings()
      .then((res) => {
        if (!cancelled) setSettings(res.settings);
      })
      .catch(() => {
        /* fall back to built-in content */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ settings, loading }), [settings, loading]);
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettingsState {
  return useContext(SiteSettingsContext);
}

/** A non-empty string from the DB, otherwise the provided fallback. */
function pick(value: string | undefined, fallback: string): string {
  return value && value.trim() ? value : fallback;
}

/** Brand, contact, location, and hero scalars merged over built-in defaults. */
export function useBrand() {
  const { settings: s } = useSiteSettings();
  const { mode } = useThemeMode();
  const logoLight = s?.logoLightUrl?.trim() || '';
  const logoDark = s?.logoDarkUrl?.trim() || '';
  // Dark theme shows the light-coloured (dark-theme) logo, and vice versa;
  // fall back to whichever one is set if only one was uploaded.
  const logoUrl = mode === 'dark' ? logoDark || logoLight : logoLight || logoDark;
  return {
    name: pick(s?.brandName, BRAND.name),
    tagline: pick(s?.tagline, BRAND.tagline),
    logoUrl,
    intro: BRAND.intro,
    heroHeadline: pick(s?.heroHeadline, BRAND.heroHeadline),
    heroSubheadline: pick(s?.heroSubheadline, BRAND.heroSubheadline),
    primaryCta: BRAND.primaryCta,
    secondaryCta: BRAND.secondaryCta,
    yearsExperience: BRAND.yearsExperience,
    seoKeyword: BRAND.seoKeyword,
    email: pick(s?.email, BRAND.email),
    phone: pick(s?.phone, BRAND.phone),
    phoneIntl: pick(s?.phoneIntl, BRAND.phoneIntl),
    whatsappUrl: pick(s?.whatsappUrl, BRAND.whatsappUrl),
    location: pick(s?.location, BRAND.location),
    areasServed: pick(s?.areasServed, BRAND.areasServed),
    mapsUrl: pick(s?.mapsUrl, BRAND.mapsUrl),
    hours: pick(s?.hours, BRAND.hours),
  };
}

/** Configured socials, or the built-in defaults when none are set. */
export function useSocials(): readonly SettingsSocial[] {
  const { settings } = useSiteSettings();
  return settings?.socials && settings.socials.length > 0 ? settings.socials : SOCIALS;
}
