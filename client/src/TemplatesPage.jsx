import TemplateGallery from "./TemplateGallery.jsx";
import { useEffect } from "react";

export default function TemplatesPage() {
  useEffect(() => {
    document.title = "Portfolio templates — FolioNest";
  }, []);
  return (
    <main id="main" className="templates-page section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Room for every kind of story</p>
          <h1>Find your next canvas.</h1>
        </div>
        <p>
          Shortlist up to four designs to compare in the editor.
          <br />
          Your content stays with you when you switch.
          <br />
          Hover or focus a preview to explore the full page.
        </p>
      </div>
      <section id="templates" aria-label="All portfolio templates">
        <TemplateGallery />
      </section>
    </main>
  );
}
