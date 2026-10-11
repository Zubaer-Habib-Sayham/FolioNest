import { useState } from "react";
import { templates } from "../../shared/src/templates.js";
import previewDimensions from "./preview-dimensions.json";
import { readSelection, saveSelection } from "./template-selection.js";

export const featuredIds = [
  "studio",
  "portrait",
  "cinema",
  "halo",
  "ember",
  "monograph",
  "atelier",
  "bento",
];
const categories = [
  "All",
  ...new Set(templates.map((template) => template.category || "Classic")),
];
const pageSize = 12;

export function TemplateCard({ template, selected, onSelect }) {
  const { id, name, description, previewImage, sampleImagery } = template;
  return (
    <article className="template-choice" id={`design-${id}`}>
      <a className="template-card" href={`/builder?template=${id}`}>
        <div className={`mini-preview mini-${id}`}>
          <img
            src={`/templates/${previewImage || `${id}.png`}`}
            alt={`${name} sample portfolio preview`}
            width="960"
            height={previewDimensions[id]}
            loading="lazy"
          />
        </div>
        <div className="template-label">
          <h3>{name}</h3>
        </div>
        <p>{description}</p>
        {(id === "studio" || sampleImagery) && (
          <p className="fine-print">AI-generated sample imagery</p>
        )}
      </a>
      <button
        type="button"
        className={`shortlist-toggle ${selected ? "selected" : ""}`}
        aria-pressed={selected}
        aria-label={`${selected ? "Remove" : "Shortlist"} ${name}`}
        onClick={() => onSelect(id)}
      >
        {selected ? "Shortlisted" : "Shortlist this design"}
      </button>
    </article>
  );
}

export default function TemplateGallery({ featured = false }) {
  const [selection, setSelection] = useState(readSelection);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [limit, setLimit] = useState(pageSize);
  const collection = featured
    ? featuredIds
        .map((id) => templates.find((t) => t.id === id))
        .filter(Boolean)
    : templates;
  const matches = collection.filter(
    (template) =>
      (category === "All" || (template.category || "Classic") === category) &&
      `${template.name} ${template.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const shown = featured ? matches : matches.slice(0, limit);
  function toggle(id) {
    if (!selection.includes(id) && selection.length === 4) {
      setNotice("You have four designs. Remove one before adding another.");
      return;
    }
    const next = selection.includes(id)
      ? selection.filter((item) => item !== id)
      : [...selection, id];
    setSelection(next);
    let saved = false;
    try {
      saved = saveSelection(window.localStorage, next);
    } catch {
      /* Selection remains usable during this visit. */
    }
    setNotice(
      saved
        ? ""
        : "Device storage is unavailable. You can still open and edit any design.",
    );
  }
  return (
    <>
      {!featured && (
        <div className="gallery-controls">
          <label>
            Find a design
            <input
              type="search"
              maxLength={80}
              value={query}
              placeholder="Search names or styles"
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(pageSize);
              }}
            />
          </label>
          <div className="gallery-filter">
            <label htmlFor="template-style">Style</label>
            <select
              id="template-style"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setLimit(pageSize);
              }}
            >
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <p role="status">
            {matches.length} {matches.length === 1 ? "design" : "designs"}
          </p>
        </div>
      )}
      <div className={`template-gallery ${featured ? "featured-gallery" : ""}`}>
        {shown.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={selection.includes(template.id)}
            onSelect={toggle}
          />
        ))}
      </div>
      {matches.length === 0 && (
        <p className="gallery-empty">
          No designs match. Try another name or style.
        </p>
      )}
      {!featured && limit < matches.length && (
        <button
          type="button"
          className="quiet gallery-more"
          onClick={() => setLimit(limit + pageSize)}
        >
          Show more designs
        </button>
      )}
      {featured && (
        <div className="gallery-more">
          <a className="button" href="/templates">
            See all templates
          </a>
          <p>Pick three or four favorites, then make them yours.</p>
        </div>
      )}
      <p className="selection-notice" role="status">
        {notice}
      </p>
      {selection.length > 0 && (
        <aside className="shortlist-bar" aria-label="Your template shortlist">
          <div>
            <strong>Your shortlist · {selection.length} / 4</strong>
            <p>One story. A few ways to tell it.</p>
          </div>
          <ul>
            {selection.map((id) => (
              <li key={id}>
                <span>{templates.find((t) => t.id === id).name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${templates.find((t) => t.id === id).name} from shortlist`}
                  onClick={() => toggle(id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <a
            className="button small"
            href={`/builder?template=${selection[0]}`}
          >
            Edit selected designs
          </a>
        </aside>
      )}
    </>
  );
}
