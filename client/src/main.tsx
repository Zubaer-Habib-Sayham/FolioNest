import { Suspense, lazy, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import Landing from "./Landing";
import {
  analyticsConfigured,
  analyticsEnabled,
  setAnalyticsEnabled,
  hasDoNotTrack,
  track,
} from "./analytics";
const Builder = lazy(() => import("./Builder"));

function App() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("folionest-mode") === "dark";
    } catch {
      return false;
    }
  });
  const builder = location.pathname.replace(/\/$/, "") === "/builder";
  const [analyticsOn, setAnalyticsOn] = useState(analyticsEnabled);
  useEffect(() => {
    const clicked = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest("a") : null;
      if (!builder && link?.getAttribute("href")?.startsWith("/builder"))
        void track("landing_cta_clicked");
      const type = link?.getAttribute("data-contact-type");
      if (type) void track("contact_link_clicked", { type });
    };
    document.addEventListener("click", clicked);
    return () => document.removeEventListener("click", clicked);
  }, [builder]);
  function toggle() {
    setDark(!dark);
    try {
      localStorage.setItem("folionest-mode", dark ? "light" : "dark");
    } catch {
      /* Mode remains available for the current visit. */
    }
  }
  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="/">
          <img
            src="/brand/folionest-logo-icon.png"
            width="36"
            height="36"
            alt=""
          />
          FolioNest<span className="brand-dot">.</span>
        </a>
        <nav aria-label="Main navigation">
          {!builder && <a href="#templates">The templates</a>}
          <button
            className="quiet"
            onClick={toggle}
            aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
          >
            {dark ? "☀ Light" : "☾ Dark"}
          </button>
          {!builder && (
            <a className="button small" href="/builder">
              Start building <span aria-hidden="true">↗</span>
            </a>
          )}
        </nav>
      </header>
      {builder ? (
        <Suspense
          fallback={
            <main id="main" className="loading">
              Opening your workspace…
            </main>
          }
        >
          <Builder />
        </Suspense>
      ) : (
        <Landing />
      )}
      <footer className="site-footer">
        <a className="brand" href="/">
          FolioNest.
        </a>
        <span>Your story, beautifully online.</span>
        <span>Build freely. Make it yours.</span>
        <details className="privacy-details">
          <summary>Privacy & analytics</summary>
          <p>
            Your draft and photos stay on this device until you choose cloud
            saving. Publishing makes visible content public. Downloads belong to
            you.
          </p>
          <p>
            Optional usage analytics records template choices, completed steps
            and export formats. It never records your writing, photos, contact
            details or sign-in information. Do Not Track is respected.
          </p>
          {analyticsConfigured && !hasDoNotTrack() ? (
            <button
              className="quiet"
              onClick={() => {
                setAnalyticsEnabled(!analyticsOn);
                setAnalyticsOn(!analyticsOn);
              }}
            >
              Turn usage analytics {analyticsOn ? "off" : "on"}
            </button>
          ) : (
            <span>Usage analytics is off.</span>
          )}
          {analyticsConfigured && (
            <p>
              Usage analytics is {analyticsOn ? "on" : "off"}. Disabled by
              default.
            </p>
          )}
        </details>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
