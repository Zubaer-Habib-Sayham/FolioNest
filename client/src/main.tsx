import { Suspense, lazy, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import Landing from "./Landing";
const Builder = lazy(() => import("./Builder"));

function App() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("folionest-mode") === "dark";
    } catch {
      return false;
    }
  });
  const builder = location.pathname === "/builder";
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
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
