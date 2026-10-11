import { useEffect, useRef, useState, lazy, Suspense } from "react";
import {
  Portfolio,
  blankPortfolio,
  palettes,
  backgrounds,
  portfolioSchema,
  publishableSchema,
  recordIdSchema,
  samplePortfolio,
  sectionNames,
  templates,
  validateBackup,
} from "@folionest/shared";
import "@folionest/shared/portfolio.css";
import { loadDraft, saveDraft } from "./storage.js";
import "./builder.css";
import { ConfirmDialog } from "./Dialog.jsx";
import { PhotoUpload } from "./PhotoUpload.jsx";
import { track } from "./analytics.js";
import HostingGuide from "./HostingGuide.jsx";
import { readSelection } from "./template-selection.js";
import { photographicTemplates } from "../../shared/src/templates.js";
function SelectedDesigns({ ids, current, onSelect }) {
  if (!ids.length) return null;
  return (
    <section className="selected-designs" aria-label="Your selected designs">
      <h3>Your selected designs</h3>
      <p className="field-hint">
        Your text, photos and ordering stay with you. Exports use the active
        design.
      </p>
      <div>
        {ids.map((id) => {
          const template = templates.find((t) => t.id === id);
          return (
            <button
              type="button"
              key={id}
              className="quiet"
              aria-pressed={id === current}
              onClick={() => onSelect(id)}
            >
              Use {template.name}
            </button>
          );
        })}
      </div>
      <a href="/templates">Choose more designs</a>
    </section>
  );
}
const CloudPanel = lazy(() => import("./CloudPanel.jsx"));
const steps = [
  "Design",
  "Introduction",
  "About & skills",
  "Projects",
  "Experience",
  "Education & awards",
  "Links & contact",
  "Review & export",
];
const hints = [
  "Make yourself at home.",
  "A good hello goes a long way.",
  "What do you bring to the table?",
  "Give your work a little room.",
  "The things you’ve learned along the way.",
  "Every milestone matters.",
  "Make the next conversation easy.",
  "Ready for the world. On your terms.",
];
function initialDraft() {
  try {
    const loaded = loadDraft(localStorage);
    const theme = new URLSearchParams(location.search).get("template");
    const selected = templates.find((template) => template.id === theme);
    const selectedTheme = Boolean(
      selected && selected.id !== loaded.data.theme,
    );
    if (selected) loaded.data.theme = selected.id;
    return { ...loaded, selectedTheme };
  } catch {
    return {
      data: blankPortfolio(),
      selectedTheme: false,
      message: "Storage is unavailable. Download a JSON backup before leaving.",
    };
  }
}
function Field({
  label,
  value,
  onChange,
  multiline = false,
  hint,
  error,
  type = "text",
  max = 1600,
}) {
  const id = useRef(`field-${crypto.randomUUID()}`).current;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={max}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={max}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
        />
      )}{" "}
      {hint && (
        <span className="field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
function move(items, from, to) {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
function OrderButtons({ label, index, total, onMove }) {
  return (
    <span className="order-buttons">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        aria-label={`Move ${label} up`}
      >
        Up
      </button>
      <button
        type="button"
        disabled={index === total - 1}
        onClick={() => onMove(index + 1)}
        aria-label={`Move ${label} down`}
      >
        Down
      </button>
    </span>
  );
}
function JourneyEditor({ label, items, onChange }) {
  return (
    <div>
      {items.length === 0 && (
        <p className="empty">
          No entries yet. Add a role, course or milestone to tell this part of
          your story.
        </p>
      )}
      {items.map((item, index) => (
        <fieldset className="entry-card" key={item.id}>
          <legend>
            {label} {index + 1}
          </legend>
          <div className="entry-tools">
            <OrderButtons
              label={`${label} ${index + 1}`}
              index={index}
              total={items.length}
              onMove={(to) => onChange(move(items, index, to))}
            />
            <button
              type="button"
              className="text-button"
              onClick={() => onChange(items.filter((x) => x.id !== item.id))}
            >
              Remove {label.toLowerCase()} {index + 1}
            </button>
          </div>
          {["title", "organization", "period", "description"].map((key) => (
            <Field
              key={key}
              label={
                {
                  title: "Title / qualification",
                  organization: "Organization / institution",
                  period: "Dates",
                  description: "What you did or learned",
                }[key]
              }
              value={item[key]}
              onChange={(v) =>
                onChange(
                  items.map((x) => (x.id === item.id ? { ...x, [key]: v } : x)),
                )
              }
              max={key === "description" ? 1600 : key === "period" ? 100 : 120}
              multiline={key === "description"}
              hint={
                key === "period" ? "For example: 2023 — Present" : undefined
              }
            />
          ))}
        </fieldset>
      ))}
      <button
        type="button"
        className="secondary"
        disabled={items.length >= 12}
        onClick={() =>
          onChange([
            ...items,
            {
              id: crypto.randomUUID(),
              title: "",
              organization: "",
              period: "",
              description: "",
            },
          ])
        }
      >
        + Add {label.toLowerCase()}
      </button>
    </div>
  );
}
export default function Builder() {
  const [initial] = useState(initialDraft);
  const [data, setData] = useState(initial.data);
  const [saved, setSaved] = useState(initial.message);
  const [dirty, setDirty] = useState(initial.selectedTheme);
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState(false);
  const [previewWidth, setPreviewWidth] = useState("desktop");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [selectedDesigns] = useState(readSelection);
  const [designQuery, setDesignQuery] = useState("");
  const [designLimit, setDesignLimit] = useState(12);
  const [cloudOpen, setCloudOpen] = useState(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get("account") === "1" || params.has("code") || params.has("error")
    );
  });
  const [cloudLink, setCloudLink] = useState(() => {
    try {
      const value = JSON.parse(
        localStorage.getItem("folionest-cloud-link-v1") || "null",
      );
      return value &&
        recordIdSchema.safeParse(value.id).success &&
        recordIdSchema.safeParse(value.owner).success
        ? { id: value.id, owner: value.owner }
        : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    try {
      if (cloudLink)
        localStorage.setItem(
          "folionest-cloud-link-v1",
          JSON.stringify(cloudLink),
        );
      else localStorage.removeItem("folionest-cloud-link-v1");
    } catch {
      /* Cloud binding remains available for this visit. */
    }
  }, [cloudLink]);
  const previewRef = useRef(null);
  const titleRef = useRef(null);
  const fileRef = useRef(null);
  const [skillsText, setSkillsText] = useState(initial.data.skills.join(", "));
  const parsed = portfolioSchema.safeParse(data);
  const errors = new Map();
  if (!parsed.success)
    for (const issue of parsed.error.issues)
      errors.set(issue.path.join("."), issue.message);
  function change(next) {
    if (next.theme !== data.theme)
      void track("template_selected", { template: next.theme });
    setData({
      ...next,
      sample:
        next.sample && next.identity.name === samplePortfolio().identity.name,
    });
    setDirty(true);
    setSaved("Saving on this device…");
  }
  useEffect(() => {
    void track("builder_started");
    document.title = "Your workspace — FolioNest";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.append(meta);
    return () => meta.remove();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const persist = () => {
      if (!portfolioSchema.safeParse(data).success) {
        setSaved("Finish the highlighted fields to save your latest changes");
        return;
      }
      try {
        setSaved(saveDraft(localStorage, data));
      } catch {
        setSaved(
          "Storage is unavailable. Download a JSON backup before leaving.",
        );
      }
    };
    const timer = setTimeout(persist, 450);
    window.addEventListener("pagehide", persist);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", persist);
    };
  }, [data, dirty]);
  function navigate(to) {
    setStep(to);
    setNotice("");
    requestAnimationFrame(() => titleRef.current?.focus());
  }
  function next() {
    if (!parsed.success) {
      setNotice("Please fix the highlighted fields before continuing.");
      return;
    }
    if (step === 1) {
      const check = publishableSchema.safeParse(data);
      if (!check.success) {
        setNotice("Add your name and headline to continue.");
        return;
      }
    }
    void track("builder_step_completed", { step });
    navigate(Math.min(7, step + 1));
  }
  function identity(key, v) {
    change({ ...data, identity: { ...data.identity, [key]: v } });
  }
  async function importFile(file) {
    if (!file) return;
    try {
      if (file.size > 2000000) throw new Error("Maximum backup size is 2 MB.");
      const restored = validateBackup(await file.text());
      setPending({ data: restored, title: "Replace this device’s draft?" });
    } catch {
      setNotice(
        "This file is not a valid FolioNest backup. Choose a version 1 JSON backup under 2 MB. Your current draft is unchanged.",
      );
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  async function exportFile(format) {
    setNotice("");
    setBusy(true);
    try {
      const module = await import("./exports.js");
      if (format === "collection_zip")
        await module.exportWebsiteCollection(data, selectedDesigns);
      else await module.exportPortfolio(format, data, previewRef.current);
      void track("export_downloaded", {
        format: format === "collection_zip" ? "website_zip" : format,
      });
      setNotice("Your file is ready. Check your downloads.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Export failed. Try again or download a JSON backup.",
      );
    } finally {
      setBusy(false);
    }
  }
  const safeData = {
    ...data,
    identity: {
      ...data.identity,
      website: errors.has("identity.website") ? "" : data.identity.website,
      email: errors.has("identity.email") ? "" : data.identity.email,
    },
    projects: data.projects.map((p, i) => ({
      ...p,
      url: errors.has(`projects.${i}.url`) ? "" : p.url,
    })),
    links: data.links.map((p, i) => ({
      ...p,
      url: errors.has(`links.${i}.url`) ? "" : p.url,
    })),
  };
  return (
    <main id="main" className={`builder ${preview ? "show-preview" : ""}`}>
      <div className="workspace-bar">
        <div>
          <p className="eyebrow">Your own little workspace</p>
          <h1>Make room for your story.</h1>
        </div>
        <div className="workspace-actions">
          <span className="save-state" role="status">
            {saved}
          </span>
          <button className="secondary" onClick={() => setPreview(!preview)}>
            {preview ? "Back to editing" : "Preview"}
          </button>
        </div>
      </div>
      <div className="builder-layout">
        <aside className="step-sidebar" aria-label="Builder steps">
          <p className="sidebar-label">YOUR PORTFOLIO</p>
          <ol>
            {steps.map((name, i) => (
              <li key={name}>
                <button
                  aria-current={step === i ? "step" : undefined}
                  onClick={() => navigate(i)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {name}
                </button>
              </li>
            ))}
          </ol>
          <div className="sidebar-bottom">
            <p>Good things take a little editing.</p>
            <button
              className="text-button"
              onClick={() =>
                setPending({
                  data: samplePortfolio(),
                  title: "Try the sample portfolio?",
                })
              }
            >
              Try sample content
            </button>
            <button
              className="text-button"
              onClick={() =>
                setPending({
                  data: blankPortfolio(),
                  title: "Start a fresh portfolio?",
                })
              }
            >
              Start fresh
            </button>
          </div>
        </aside>
        <section className="editor-panel" aria-label="Portfolio editor">
          <div className="step-progress">
            <span>
              STEP {step + 1} OF {steps.length}
            </span>
            <progress
              value={step + 1}
              max={steps.length}
              aria-label="Builder progress"
            />
          </div>
          <h2 ref={titleRef} tabIndex={-1}>
            {steps[step]}
          </h2>
          <p className="step-intro">{hints[step]}</p>
          {data.sample && (
            <p className="sample-banner">
              You’re viewing sample content. Replace it with your own story.
            </p>
          )}
          {data.sample && step === 7 && (
            <label className="field-hint">
              <input
                type="checkbox"
                onChange={() => change({ ...data, sample: false })}
              />
              I have replaced the sample content with my own.
            </label>
          )}
          {step === 0 && (
            <>
              <SelectedDesigns
                ids={selectedDesigns}
                current={data.theme}
                onSelect={(theme) => change({ ...data, theme })}
              />
              <div className="field">
                <label htmlFor="design-search">Find an editor design</label>
                <input
                  id="design-search"
                  type="search"
                  maxLength={80}
                  value={designQuery}
                  onChange={(e) => {
                    setDesignQuery(e.target.value);
                    setDesignLimit(12);
                  }}
                />
              </div>
              <div className="design-options">
                {templates
                  .filter((template) =>
                    `${template.name} ${template.description}`
                      .toLowerCase()
                      .includes(designQuery.toLowerCase().trim()),
                  )
                  .slice(0, designLimit)
                  .map((template) => (
                    <button
                      key={template.id}
                      className={`design-option ${data.theme === template.id ? "selected" : ""}`}
                      onClick={() => change({ ...data, theme: template.id })}
                      aria-pressed={data.theme === template.id}
                    >
                      <div className="design-thumbnail" aria-hidden="true">
                        <img
                          src={`/templates/${template.previewImage || `${template.id}.png`}`}
                          alt=""
                          loading="lazy"
                        />
                      </div>
                      <strong>{template.name}</strong>
                      <small>{template.description}</small>
                    </button>
                  ))}
              </div>
              {templates.filter((template) =>
                `${template.name} ${template.description}`
                  .toLowerCase()
                  .includes(designQuery.toLowerCase().trim()),
              ).length > designLimit && (
                <button
                  className="secondary"
                  onClick={() => setDesignLimit(designLimit + 12)}
                >
                  More editor designs
                </button>
              )}
              <fieldset className="palette-field">
                <legend>Portfolio accent</legend>
                <div className="palette-options">
                  {Object.entries(palettes).map(([name, color]) => (
                    <button
                      key={name}
                      style={{ background: color }}
                      aria-label={`${name} palette`}
                      aria-pressed={data.palette === name}
                      className={data.palette === name ? "selected" : ""}
                      onClick={() =>
                        change({
                          ...data,
                          palette: name,
                          sections: data.sections.map((s) => ({
                            ...s,
                            color: name,
                          })),
                        })
                      }
                    >
                      {data.palette === name ? "✓" : ""}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="portfolio-font">Font style</label>
                  <select
                    id="portfolio-font"
                    value={data.font}
                    onChange={(e) =>
                      change({
                        ...data,
                        font: e.target.value,
                      })
                    }
                  >
                    <option value="sans">Clean sans serif</option>
                    <option value="serif">Classic serif</option>
                    <option value="mono">Modern monospace</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="portfolio-appearance">
                    Portfolio appearance
                  </label>
                  <select
                    id="portfolio-appearance"
                    value={data.appearance}
                    onChange={(e) =>
                      change({
                        ...data,
                        appearance: e.target.value,
                      })
                    }
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
              <fieldset className="palette-field background-field">
                <legend>Whole portfolio background</legend>
                <div className="background-options">
                  {Object.entries(backgrounds).map(([key, background]) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={data.background === key}
                      onClick={() =>
                        change({
                          ...data,
                          background: key,
                        })
                      }
                    >
                      <span
                        aria-hidden="true"
                        style={{ background: background[data.appearance] }}
                      />
                      {background.name}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p className="field-hint">
                Your portfolio colors are independent of the editor’s light or
                dark mode.
              </p>
            </>
          )}
          {step === 1 && (
            <>
              <Field
                label="Your name"
                value={data.identity.name}
                onChange={(v) => identity("name", v)}
                max={100}
                hint="The name you’d like people to know you by."
                error={errors.get("identity.name")}
              />
              <Field
                label="Professional headline"
                value={data.identity.headline}
                onChange={(v) => identity("headline", v)}
                max={160}
                hint="For example: Product designer turning complex ideas into simple experiences."
                error={errors.get("identity.headline")}
              />
              <Field
                label="Location (optional)"
                value={data.identity.location}
                onChange={(v) => identity("location", v)}
                max={120}
                hint="A city, a region, or simply ‘Working remotely’."
              />
              <PhotoUpload
                label="Portrait photo (optional)"
                value={data.identity.photo}
                backgroundRemoval={
                  data.theme === "studio" ||
                  photographicTemplates.includes(data.theme)
                }
                original={data.identity.photoOriginal}
                onChange={(photo, photoOriginal = "") =>
                  change({
                    ...data,
                    identity: { ...data.identity, photo, photoOriginal },
                  })
                }
              />
              {data.theme === "studio" && (
                <PhotoUpload
                  label="Signature image (optional)"
                  value={data.identity.signature}
                  transparent
                  onChange={(v) => identity("signature", v)}
                />
              )}
            </>
          )}
          {step === 2 && (
            <>
              <Field
                label="About you"
                value={data.about}
                onChange={(v) => change({ ...data, about: v })}
                multiline
                max={4000}
                hint="A few sentences about what you do, what you care about, and what’s next."
              />
              <Field
                label="Your skills"
                value={skillsText}
                onChange={(v) => {
                  setSkillsText(v);
                  change({
                    ...data,
                    skills: v
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  });
                }}
                hint="Separate skills with commas. Up to 40 skills, 60 characters each."
                error={
                  errors.get("skills") ||
                  [...errors.entries()].find(([k]) =>
                    k.startsWith("skills."),
                  )?.[1]
                }
              />
            </>
          )}
          {step === 3 && (
            <>
              {!data.projects.length && (
                <p className="empty">
                  A project can be client work, a class assignment or an idea
                  you brought to life. Tell people what you did and why it
                  matters.
                </p>
              )}
              {data.projects.map((project, i) => (
                <fieldset className="entry-card" key={project.id}>
                  <legend>Project {i + 1}</legend>
                  <div className="entry-tools">
                    <OrderButtons
                      label={`project ${i + 1}`}
                      index={i}
                      total={data.projects.length}
                      onMove={(to) =>
                        change({
                          ...data,
                          projects: move(data.projects, i, to),
                        })
                      }
                    />
                    <button
                      className="text-button"
                      onClick={() =>
                        change({
                          ...data,
                          projects: data.projects.filter(
                            (x) => x.id !== project.id,
                          ),
                        })
                      }
                    >
                      Remove project {i + 1}
                    </button>
                  </div>
                  {["title", "description", "tags", "url"].map((key) => (
                    <Field
                      key={key}
                      label={
                        {
                          title: "Project title",
                          description: "The story behind it",
                          tags: "Skills / tools used",
                          url: "Project link (optional)",
                        }[key]
                      }
                      value={project[key]}
                      onChange={(v) =>
                        change({
                          ...data,
                          projects: data.projects.map((x) =>
                            x.id === project.id ? { ...x, [key]: v } : x,
                          ),
                        })
                      }
                      multiline={key === "description"}
                      max={
                        {
                          title: 100,
                          description: 1600,
                          tags: 200,
                          url: 500,
                        }[key]
                      }
                      error={errors.get(`projects.${i}.${key}`)}
                      hint={
                        key === "url" ? "Use a full https:// link." : undefined
                      }
                    />
                  ))}
                  <PhotoUpload
                    label={`Project ${i + 1} photo (optional)`}
                    value={project.image}
                    onChange={(v) =>
                      change({
                        ...data,
                        projects: data.projects.map((x) =>
                          x.id === project.id ? { ...x, image: v } : x,
                        ),
                      })
                    }
                  />
                  {project.image && (
                    <Field
                      label="Photo description"
                      value={project.imageAlt}
                      onChange={(v) =>
                        change({
                          ...data,
                          projects: data.projects.map((x) =>
                            x.id === project.id ? { ...x, imageAlt: v } : x,
                          ),
                        })
                      }
                      max={160}
                      hint="Describe what the photo shows for people using screen readers."
                    />
                  )}
                </fieldset>
              ))}
              <button
                className="secondary"
                disabled={data.projects.length >= 12}
                onClick={() =>
                  change({
                    ...data,
                    projects: [
                      ...data.projects,
                      {
                        id: crypto.randomUUID(),
                        title: "",
                        description: "",
                        tags: "",
                        url: "",
                        image: "",
                        imageAlt: "",
                      },
                    ],
                  })
                }
              >
                + Add a project
              </button>
            </>
          )}
          {step === 4 && (
            <JourneyEditor
              label="Experience"
              items={data.experience}
              onChange={(items) => change({ ...data, experience: items })}
            />
          )}
          {step === 5 && (
            <>
              <h3>Education</h3>
              <JourneyEditor
                label="Education"
                items={data.education}
                onChange={(items) => change({ ...data, education: items })}
              />
              <h3 className="subheading">Certifications & achievements</h3>
              <JourneyEditor
                label="Achievement"
                items={data.achievements}
                onChange={(items) => change({ ...data, achievements: items })}
              />
            </>
          )}
          {step === 6 && (
            <>
              <Field
                label="Contact email (optional)"
                value={data.identity.email}
                onChange={(v) => identity("email", v)}
                max={254}
                error={errors.get("identity.email")}
                hint="This will be visible in your exports and if you publish."
              />
              <Field
                label="Your website (optional)"
                value={data.identity.website}
                onChange={(v) => identity("website", v)}
                max={500}
                error={errors.get("identity.website")}
                hint="Use a full https:// link."
              />
              <Field
                label="A little invitation"
                value={data.contact}
                onChange={(v) => change({ ...data, contact: v })}
                multiline
                max={1200}
                hint="For example: Open to collaborations and interesting conversations."
              />
              <h3>Links</h3>
              {data.links.map((link, i) => (
                <fieldset className="entry-card" key={link.id}>
                  <legend>Link {i + 1}</legend>
                  <Field
                    label="Link label"
                    value={link.label}
                    onChange={(v) =>
                      change({
                        ...data,
                        links: data.links.map((x) =>
                          x.id === link.id ? { ...x, label: v } : x,
                        ),
                      })
                    }
                    max={80}
                  />
                  <Field
                    label="Link address"
                    value={link.url}
                    onChange={(v) =>
                      change({
                        ...data,
                        links: data.links.map((x) =>
                          x.id === link.id ? { ...x, url: v } : x,
                        ),
                      })
                    }
                    max={500}
                    error={errors.get(`links.${i}.url`)}
                  />
                  <button
                    className="text-button"
                    onClick={() =>
                      change({
                        ...data,
                        links: data.links.filter((x) => x.id !== link.id),
                      })
                    }
                  >
                    Remove link {i + 1}
                  </button>
                </fieldset>
              ))}
              <button
                className="secondary"
                disabled={data.links.length >= 12}
                onClick={() =>
                  change({
                    ...data,
                    links: [
                      ...data.links,
                      { id: crypto.randomUUID(), label: "", url: "" },
                    ],
                  })
                }
              >
                + Add a link
              </button>
            </>
          )}
          {step === 7 && (
            <>
              <h3>Arrange your story</h3>
              <p className="field-hint">
                Hide sections you don’t need. Use the arrows to reorder them,
                and choose a color for each heading.
              </p>
              <div className="section-controls">
                {data.sections.map((section, i) => (
                  <div className="section-control" key={section.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={section.visible}
                        onChange={(e) =>
                          change({
                            ...data,
                            sections: data.sections.map((s) =>
                              s.id === section.id
                                ? { ...s, visible: e.target.checked }
                                : s,
                            ),
                          })
                        }
                      />
                      {sectionNames[section.id]}
                    </label>
                    <select
                      aria-label={`${sectionNames[section.id]} section color`}
                      value={section.color}
                      onChange={(e) =>
                        change({
                          ...data,
                          sections: data.sections.map((s) =>
                            s.id === section.id
                              ? { ...s, color: e.target.value }
                              : s,
                          ),
                        })
                      }
                    >
                      {Object.keys(palettes).map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                    <OrderButtons
                      label={`${sectionNames[section.id]} section`}
                      index={i}
                      total={data.sections.length}
                      onMove={(to) =>
                        change({
                          ...data,
                          sections: move(data.sections, i, to),
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              <h3 className="subheading">Take your story with you</h3>
              <SelectedDesigns
                ids={selectedDesigns}
                current={data.theme}
                onSelect={(theme) => change({ ...data, theme })}
              />
              <p className="field-hint">
                Exports work without an account. Add your name and headline
                before exporting. Your backup can include an unfinished draft.
              </p>
              <div className="export-grid">
                {[
                  [
                    "resume_pdf",
                    "Download résumé",
                    "Your template, compacted to one A4 page",
                  ],
                  [
                    "portfolio_pdf",
                    "Portfolio PDF",
                    "Your full portfolio on A4 pages",
                  ],
                  [
                    "png",
                    "Portfolio PNG",
                    "A full-page image of your portfolio",
                  ],
                  [
                    "website_zip",
                    "Website ZIP",
                    "An independent, ready-to-host website",
                  ],
                  [
                    "json",
                    "JSON backup",
                    "Keep an editable copy of your draft",
                  ],
                ].map(([format, label, hint]) => (
                  <button
                    className="export-option"
                    key={format}
                    disabled={busy}
                    onClick={() => void exportFile(format)}
                  >
                    <strong>{label}</strong>
                    <small>{hint}</small>
                  </button>
                ))}
              </div>
              {selectedDesigns.length > 1 && (
                <button
                  type="button"
                  className="secondary"
                  disabled={busy}
                  onClick={() => void exportFile("collection_zip")}
                >
                  Download selected websites ({selectedDesigns.length})
                </button>
              )}
              <p className="field-hint">
                The résumé uses shorter excerpts and leading items in your
                chosen order. It keeps your design and fits one A4 sheet.
                Portfolio PDF includes the full content; your saved draft is
                unchanged. Print on A4 in portrait orientation at Actual size.
              </p>
              <div className="backup-import">
                <input
                  type="file"
                  accept="application/json,.json"
                  ref={fileRef}
                  onChange={(e) => void importFile(e.target.files?.[0])}
                  aria-label="Choose a portfolio JSON backup"
                />
                <button
                  className="text-button"
                  onClick={() => fileRef.current?.click()}
                >
                  Restore a JSON backup
                </button>
              </div>
              <HostingGuide compact />
              <h3 className="subheading">A home on the web</h3>
              <p className="field-hint">
                Sign in only for cloud saving and online publishing. Publishing
                makes the information you include visible to anyone.
              </p>
              <button className="button" onClick={() => setCloudOpen(true)}>
                Save to cloud / Publish
              </button>
            </>
          )}
          {busy && (
            <p role="status" className="notice">
              Preparing your export… Keep this tab open.
            </p>
          )}
          {notice && (
            <p role="status" className="notice">
              {notice}
            </p>
          )}
          <div className="step-navigation">
            <button
              className="secondary"
              disabled={step === 0}
              onClick={() => navigate(step - 1)}
            >
              Back
            </button>
            {step < 7 ? (
              <button className="button" onClick={next}>
                Continue
              </button>
            ) : (
              <button className="secondary" onClick={() => setPreview(true)}>
                Full preview
              </button>
            )}
          </div>
        </section>
        <section
          className={`preview-panel preview-${previewWidth}`}
          aria-label="Live preview"
        >
          <div className="preview-toolbar">
            <span>
              <span className="status-dot" /> LIVE PREVIEW
            </span>
            <div>
              <button
                aria-pressed={previewWidth === "desktop"}
                onClick={() => setPreviewWidth("desktop")}
              >
                Desktop
              </button>
              <button
                aria-pressed={previewWidth === "mobile"}
                onClick={() => setPreviewWidth("mobile")}
              >
                Mobile
              </button>
            </div>
          </div>
          <div className="preview-scroll">
            <div ref={previewRef} className="preview-document">
              <Portfolio data={safeData} preview />
            </div>
          </div>
          <p className="preview-note">Your canvas. Change anything, anytime.</p>
        </section>
      </div>
      {pending && (
        <ConfirmDialog
          title={pending.title}
          onClose={() => setPending(null)}
          confirmLabel="Replace draft"
          onConfirm={() => {
            setData(pending.data);
            setCloudLink(null);
            setSkillsText(pending.data.skills.join(", "));
            setDirty(true);
            setPending(null);
            setNotice("Draft replaced. Save a JSON backup whenever you like.");
          }}
        >
          <p>
            This replaces the current local draft. Download a JSON backup first
            if you want to keep it.
          </p>
        </ConfirmDialog>
      )}
      {cloudOpen && (
        <Suspense fallback={<p role="status">Opening cloud panel…</p>}>
          <CloudPanel
            data={data}
            link={cloudLink}
            onLink={setCloudLink}
            onClose={() => setCloudOpen(false)}
            onLoad={(next, link) => {
              setData(next);
              setSkillsText(next.skills.join(", "));
              setDirty(true);
              setCloudLink(link);
            }}
          />
        </Suspense>
      )}
    </main>
  );
}
