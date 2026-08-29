"use client";

import { useServerInsertedHTML } from "next/navigation";

const THEME_INIT = `(function(){try{var t=localStorage.getItem('orcazap.theme');var a=localStorage.getItem('orcazap.accent');var v=t==='light'?'light':'dark';var ok=['zap','mint','ocean','coral','violet'];document.documentElement.dataset.theme=v;document.documentElement.dataset.accent=ok.indexOf(a)>=0?a:'zap';document.documentElement.style.colorScheme=v}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.dataset.accent='zap'}})();`;

/** Injects theme boot script outside the React client tree (no React 19 warning). */
export function ThemeInit() {
  useServerInsertedHTML(() => (
    <script
      id="orcazap-theme-init"
      dangerouslySetInnerHTML={{ __html: THEME_INIT }}
    />
  ));
  return null;
}
