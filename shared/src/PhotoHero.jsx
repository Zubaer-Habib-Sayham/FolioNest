import { sectionNames } from "./schema.js";

export function PhotoHero({ data, portrait, preview }) {
  const visible = data.sections.filter(
    (section) =>
      section.visible && ["about", "projects", "contact"].includes(section.id),
  );
  return (
    <header className="portfolio-hero photo-hero">
      <div className="portfolio-masthead">
        <span>{data.identity.location || "Selected portfolio"}</span>
        <nav className="portfolio-navigation" aria-label="Portfolio sections">
          {visible.map((section) => (
            <a key={section.id} href={`#section-${section.id}`}>
              {sectionNames[section.id]}
            </a>
          ))}
        </nav>
      </div>
      <div className="photo-introduction">
        <p className="portfolio-kicker">
          {data.theme === "halo"
            ? "Hey, hello."
            : data.theme === "atelier"
              ? "Hello."
              : "A little introduction"}
        </p>
        <h1>
          {data.theme === "portrait" ? (
            <>
              <span className="name-outline">
                {(data.identity.name || "Your name").split(" ")[0]}
              </span>{" "}
              {(data.identity.name || "Your name")
                .split(" ")
                .slice(1)
                .join(" ")}
            </>
          ) : (
            data.identity.name || "Your name"
          )}
        </h1>
      </div>
      <div className="photo-frame">
        <div className="photo-backdrop" aria-hidden="true" />
        {portrait ||
          (preview && (
            <p className="photo-placeholder">
              Add your portrait in Introduction.
            </p>
          ))}
      </div>
      <div className="photo-summary">
        <p className="hero-name">
          {data.identity.headline || "Add a headline to introduce your work."}
        </p>
        {data.sections.some(
          (section) => section.id === "projects" && section.visible,
        ) &&
          data.projects.length > 0 && (
            <a className="portfolio-action" href="#section-projects">
              Explore my work
            </a>
          )}
      </div>
    </header>
  );
}
