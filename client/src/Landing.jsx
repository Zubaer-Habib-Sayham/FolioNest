import React from "react";
import { templates } from "../../shared/src/templates.js";
import previewDimensions from "./preview-dimensions.json";
import HostingGuide from "./HostingGuide.jsx";
export default function Landing() {
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> A little space for your big ideas
          </p>
          <h1>
            Your work.
            <br />
            Your story.
            <br />
            <em>Your little corner.</em>
          </h1>
          <p className="hero-description">
            Build a portfolio that feels like you.
            <br />
            Turn what you do into something worth sharing.
          </p>
          <a className="button" href="/builder">
            Create your portfolio
          </a>
          <p className="fine-print">
            No account needed · No code to write · Free to export
          </p>
        </div>
        <div
          className="hero-art"
          aria-label="Sample editorial portfolio preview"
        >
          <div className="art-top">
            <span>ZS / SELECTED WORK</span>
            <span>A sample of what’s possible</span>
          </div>
          <div className="art-title">
            Zubaer Habib
            <br />
            <em>Sayham.</em>
          </div>
          <p>Your projects. Your perspective. Your story.</p>
          <div className="art-grid">
            <div className="art-card art-lilac">
              <span>01 / SELECTED WORK</span>
              <div className="abstract-circle" />
              <strong>
                A softer kind
                <br />
                of digital.
              </strong>
            </div>
            <div className="art-card art-green">
              <span>02 / EXPLORATIONS</span>
              <div className="abstract-lines" />
              <strong>Room to grow.</strong>
            </div>
          </div>
          <span className="floating-note">Made of your ideas. ✦</span>
        </div>
      </section>
      <div className="promise-strip">
        <span>Built for every kind of story</span>
        <span>Designers & makers</span>
        <span>Students & fresh starts</span>
        <span>Builders & big thinkers</span>
      </div>
      <section id="templates" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A starting point, never a box</p>
            <h2>Find your kind of canvas.</h2>
          </div>
          <p>
            Distinct ways to show up.
            <br />
            Every one ready to make your own.
            <br />
            Hover or focus a card to explore the full design.
          </p>
        </div>
        <div className="template-gallery">
          {templates.map(({ id, name, description: copy }) => (
            <a
              className="template-card"
              href={`/builder?template=${id}`}
              key={id}
            >
              <div className={`mini-preview mini-${id}`}>
                <img
                  src={`/templates/${id}.png`}
                  alt={`${name} sample portfolio preview`}
                  width="960"
                  height={previewDimensions[id]}
                  loading="lazy"
                />
              </div>
              <div className="template-label">
                <h3>{name}</h3>
              </div>
              <p>{copy}</p>
            </a>
          ))}
        </div>
      </section>
      <section className="how section" id="how">
        <p className="eyebrow">From a blank page to a new beginning</p>
        <h2>
          Less figuring it out.
          <br />
          More putting yourself out there.
        </h2>
        <div className="steps-grid">
          {[
            [
              "01",
              "Choose your canvas",
              "Pick a design that speaks your language. Switch whenever inspiration strikes.",
            ],
            [
              "02",
              "Add your story",
              "A guided editor for your projects, skills and the experiences that got you here.",
            ],
            [
              "03",
              "Take it with you",
              "Download a CV, PDF, image or complete website. Sign in only if you want to publish.",
            ],
          ].map(([n, title, copy]) => (
            <article key={n}>
              <span className="step-number">{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="privacy section">
        <div>
          <p className="eyebrow">Your work belongs to you</p>
          <h2>
            Start here.
            <br />
            Go anywhere.
          </h2>
          <p>
            Your draft stays on this device until you choose to save it to the
            cloud. Export your work whenever you like, with no account and no
            strings attached.
          </p>
        </div>
        <div className="formats">
          {[
            "CV / PDF",
            "Portfolio / PDF",
            "Full-page / PNG",
            "Independent website / ZIP",
            "Editable backup / JSON",
          ].map((x) => (
            <div key={x}>
              <span>{x}</span>
            </div>
          ))}
        </div>
      </section>
      <HostingGuide />
      <section className="closing">
        <p className="eyebrow">There’s a place for your story</p>
        <h2>Let’s make it yours.</h2>
        <a className="button" href="/builder">
          Start your portfolio
        </a>
      </section>
    </main>
  );
}
