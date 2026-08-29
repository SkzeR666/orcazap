"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CreateModal =
  | "quote"
  | "client"
  | "service"
  | "charge"
  | "invite"
  | null;

export type ThemeMode = "dark" | "light";
export type Accent = "zap" | "mint" | "ocean" | "coral" | "violet";

export const ACCENTS: {
  id: Accent;
  label: string;
  swatch: string;
  dark: string;
  light: string;
}[] = [
  { id: "zap", label: "Zap", swatch: "#c8f542", dark: "#c8f542", light: "#17633f" },
  { id: "mint", label: "Menta", swatch: "#34d399", dark: "#34d399", light: "#059669" },
  { id: "ocean", label: "Oceano", swatch: "#38bdf8", dark: "#38bdf8", light: "#0284c7" },
  { id: "coral", label: "Coral", swatch: "#fb7185", dark: "#fb7185", light: "#e11d48" },
  { id: "violet", label: "Violeta", swatch: "#a78bfa", dark: "#a78bfa", light: "#7c3aed" },
];

export function accentHex(accent: Accent, theme: ThemeMode) {
  const row = ACCENTS.find((a) => a.id === accent) ?? ACCENTS[0];
  return theme === "light" ? row.light : row.dark;
}

type ShellContextValue = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
  createModal: CreateModal;
  openCreate: (modal: Exclude<CreateModal, null>) => void;
  closeCreate: () => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

const KEY_SIDE = "orcazap.sidebar.collapsed";
const KEY_THEME = "orcazap.theme";
const KEY_ACCENT = "orcazap.accent";

function applyAppearance(theme: ThemeMode, accent: Accent) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.accent = accent;
  document.documentElement.style.colorScheme = theme;
}

function parseAccent(v: string | null): Accent {
  if (v && ACCENTS.some((a) => a.id === v)) return v as Accent;
  return "zap";
}

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [accent, setAccentState] = useState<Accent>("zap");
  const [ready, setReady] = useState(false);
  const [createModal, setCreateModal] = useState<CreateModal>(null);

  useEffect(() => {
    try {
      setCollapsedState(localStorage.getItem(KEY_SIDE) === "1");
      const nextTheme: ThemeMode =
        localStorage.getItem(KEY_THEME) === "light" ? "light" : "dark";
      const nextAccent = parseAccent(localStorage.getItem(KEY_ACCENT));
      setThemeState(nextTheme);
      setAccentState(nextAccent);
      applyAppearance(nextTheme, nextAccent);
    } catch {
      applyAppearance("dark", "zap");
    }
    setReady(true);
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      localStorage.setItem(KEY_SIDE, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const setTheme = useCallback(
    (t: ThemeMode) => {
      setThemeState(t);
      applyAppearance(t, accent);
      try {
        localStorage.setItem(KEY_THEME, t);
      } catch {
        /* ignore */
      }
    },
    [accent],
  );

  const setAccent = useCallback(
    (a: Accent) => {
      setAccentState(a);
      applyAppearance(theme, a);
      try {
        localStorage.setItem(KEY_ACCENT, a);
      } catch {
        /* ignore */
      }
    },
    [theme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const openCreate = useCallback((modal: Exclude<CreateModal, null>) => {
    setCreateModal(modal);
  }, []);

  const closeCreate = useCallback(() => setCreateModal(null), []);

  const value = useMemo(
    () => ({
      collapsed,
      toggle,
      setCollapsed,
      createModal,
      openCreate,
      closeCreate,
      theme,
      setTheme,
      toggleTheme,
      accent,
      setAccent,
    }),
    [
      collapsed,
      toggle,
      setCollapsed,
      createModal,
      openCreate,
      closeCreate,
      theme,
      setTheme,
      toggleTheme,
      accent,
      setAccent,
    ],
  );

  return (
    <ShellContext.Provider value={value}>
      <div
        className={ready ? undefined : "invisible"}
        style={
          {
            ["--side-w" as string]: collapsed ? "56px" : "280px",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}
