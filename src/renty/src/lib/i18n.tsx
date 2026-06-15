import type { ReactNode } from "react";
import messages from "../translations/fr.json";

type Values = Record<string, string | number | boolean | null | undefined>;

function lookup(path: string) {
  return path.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

function interpolate(value: string, values?: Values) {
  if (!values) return value;
  return value.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

export function useTranslations(namespace?: string) {
  return (key: string, values?: Values) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const value = lookup(fullKey);
    return typeof value === "string" ? interpolate(value, values) : fullKey;
  };
}

export function useLocale() {
  return "fr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  return children;
}
