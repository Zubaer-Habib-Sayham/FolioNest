import { palettes, portfolioBackground, sectionNames } from "./schema.js";
function JourneyList({ items, quest }) {
  return (
    <div className={quest ? "journey-map" : "journey-list"}>
      {items.map((item, i) => (
        <article className="journey-item" key={item.id}>
          {quest && (
            <span className="journey-marker" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
          )}
          <div>
            <p className="portfolio-kicker">{item.period}</p>
            <h3>{item.title}</h3>
            <p className="organization">{item.organization}</p>
            <p className="portfolio-prose">{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
function Content({ id, data }) {
  switch (id) {
    case "about":
      return data.about ? (
        <p className="portfolio-prose about-prose">{data.about}</p>
      ) : null;
    case "skills":
      return data.skills.length ? (
        <ul className="skill-list">
          {data.skills.map((skill, i) => (
            <li key={`${skill}-${i}`}>{skill}</li>
          ))}
        </ul>
      ) : null;
    case "projects":
      return data.projects.length ? (
        <div className="project-grid">
          {data.projects.map((project, i) => (
            <article className="project-card" key={project.id}>
              {project.image ? (
                <img
                  className="project-photo"
                  src={project.image}
                  alt={project.imageAlt || project.title || "Project photo"}
                  width="1200"
                  height="800"
                />
              ) : (
                <div
                  className={`project-art project-art-${i % 3}`}
                  aria-hidden="true"
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <i />
                </div>
              )}
              <div className="project-body">
                <p className="portfolio-kicker">{project.tags}</p>
                <h3>{project.title || "Untitled project"}</h3>
                <p className="portfolio-prose">{project.description}</p>
                {project.url && (
                  <a
                    href={project.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Explore project
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : null;
    case "experience":
      return data.experience.length ? (
        <JourneyList items={data.experience} quest={data.theme === "quest"} />
      ) : null;
    case "education":
      return data.education.length ? (
        <JourneyList items={data.education} quest={data.theme === "quest"} />
      ) : null;
    case "achievements":
      return data.achievements.length ? (
        <JourneyList items={data.achievements} quest={data.theme === "quest"} />
      ) : null;
    case "links":
      return data.links.length ? (
        <ul className="portfolio-links">
          {data.links
            .filter((x) => x.url)
            .map((link) => (
              <li key={link.id}>
                <a href={link.url} rel="noopener noreferrer" target="_blank">
                  {link.label || "Website"}
                </a>
              </li>
            ))}
        </ul>
      ) : null;
    case "contact":
      return data.contact || data.identity.email || data.identity.website ? (
        <div>
          <p className="portfolio-prose">{data.contact}</p>
          <div className="contact-links">
            {data.identity.email && (
              <a
                data-contact-type="email"
                href={`mailto:${data.identity.email}`}
              >
                Email me
              </a>
            )}
            {data.identity.website && (
              <a
                data-contact-type="website"
                href={data.identity.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                My website
              </a>
            )}
          </div>
        </div>
      ) : null;
  }
}
export function Portfolio({ data, preview = false }) {
  const style = {
    "--accent": palettes[data.palette],
    "--paper": portfolioBackground(data),
  };
  const portrait = data.identity.photo ? (
    <img
      className="portfolio-portrait"
      src={data.identity.photo}
      alt={`Portrait of ${data.identity.name || "the portfolio owner"}`}
      width="240"
      height="240"
    />
  ) : null;
  return (
    <div className="portfolio-stage">
      <article
        className={`portfolio template-${data.theme} portfolio-${data.appearance} font-${data.font}${/^data:image\/(png|webp);/.test(data.identity.photo) ? " portrait-cutout" : ""}`}
        style={style}
        aria-label={
          preview ? "Portfolio preview" : `${data.identity.name} portfolio`
        }
      >
        <header className="portfolio-hero">
          <div className="portfolio-masthead">
            <span>{data.identity.name || "Your name"}</span>
            <span>{data.identity.location}</span>
          </div>
          {data.theme === "studio" && (
            <div className="studio-display" aria-hidden="true">
              PORTFOLIO
            </div>
          )}
          <div
            className={
              data.theme === "studio" ? "studio-introduction" : undefined
            }
          >
            {data.theme === "studio" && (
              <p className="portfolio-kicker">Hello, I’m</p>
            )}
            {data.theme === "quest" && (
              <p className="portfolio-kicker">
                A CAREER IN PROGRESS / THE JOURNEY SO FAR
              </p>
            )}
            <h1>{data.identity.name || "Your name"}</h1>
            <p className="hero-name">
              {data.identity.headline ||
                "Add a headline to introduce your work."}
            </p>
            {data.theme === "studio" && (
              <div className="studio-signature" aria-hidden="true">
                {data.identity.signature && (
                  <img
                    src={data.identity.signature}
                    alt=""
                    width="180"
                    height="70"
                  />
                )}
              </div>
            )}
          </div>
          {data.theme === "studio" ? (
            <div className="studio-photo-area">
              <div className="studio-photo-circle" aria-hidden="true" />
              {portrait}
              {!data.identity.photo && preview && (
                <p className="studio-photo-hint">
                  Your portrait goes here.
                  <br />
                  Add it in Introduction.
                </p>
              )}
            </div>
          ) : (
            portrait
          )}
          <span className="portfolio-hero-decoration" aria-hidden="true">
            {data.theme === "quest" ? "01" : "✦"}
          </span>
        </header>
        <div className="portfolio-sections">
          {data.sections
            .filter((s) => s.visible)
            .map((section, i) => {
              const content = Content({ id: section.id, data });
              if (!content) return null;
              return (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className={`portfolio-section section-${section.id}`}
                  style={{
                    "--section-accent": palettes[section.color],
                  }}
                >
                  <div className="portfolio-section-label">
                    <span aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2>{sectionNames[section.id]}</h2>
                  </div>
                  <div className="portfolio-section-content">{content}</div>
                </section>
              );
            })}
        </div>
        <footer className="portfolio-footer">
          <span>{data.identity.name || "Your name"}</span>
          <a href="#">Back to the top</a>
        </footer>
      </article>
    </div>
  );
}
