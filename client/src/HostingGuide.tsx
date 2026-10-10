import { useId } from "react";

export default function HostingGuide({
  compact = false,
}: {
  compact?: boolean;
}) {
  const headingId = useId();
  const steps = [
    {
      image: "download",
      title: "Download your finished website",
      text: "In Review & export, choose Website ZIP. Keep the ZIP as it is: your pages, colors and photos are already inside. Check that you’re happy to share the visible content publicly.",
    },
    {
      image: "dashboard",
      title: "Open a free hosting account",
      text: "Sign up or sign in to Cloudflare in your browser. Open Workers & Pages, then Create application, Get started and Drag and drop your files. If you see a Pages tab, choose it for the website upload.",
    },
    {
      image: "upload",
      title: "Upload the ZIP and publish",
      text: "Give your site a name, then drop your Website ZIP into the upload area. Choose Deploy site, or Save and Deploy if prompted. Use the free Pages plan and the included pages.dev address.",
    },
    {
      image: "live",
      title: "Open your link and share it",
      text: "Open the pages.dev link shown after upload. Check your photos, links and phone layout. For updates, download a new ZIP and choose Create a new deployment in the same hosting project.",
    },
  ];
  const content = (
    <section className="hosting-guide" aria-labelledby={headingId}>
      {compact ? (
        <h3 id={headingId}>A free home for your portfolio</h3>
      ) : (
        <h2 id={headingId}>Your website. Your link. Ready to share.</h2>
      )}
      <p className="hosting-intro">
        Publish your downloaded portfolio with Cloudflare Pages using just your
        browser. You’ll need a free Cloudflare account. No extra app or code is
        needed.
      </p>
      <ol className="hosting-steps">
        {steps.map((step, i) => (
          <li key={step.image}>
            <img
              src={`/guides/${step.image}.svg`}
              width="720"
              height="400"
              loading="lazy"
              alt={`Step ${i + 1} illustration: ${step.title}`}
            />
            <span className="hosting-step-number" aria-hidden="true">
              0{i + 1}
            </span>
            {compact ? <h4>{step.title}</h4> : <h3>{step.title}</h3>}
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <p className="hosting-caption">
        Illustrations show the idea of each step; the hosting dashboard may look
        a little different. The free address is enough to share your work.
        Buying a custom domain is optional.
      </p>
      <div className="hosting-actions">
        <a
          className="button"
          href="https://dash.cloudflare.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Cloudflare
        </a>
        <a
          href="https://developers.cloudflare.com/pages/get-started/direct-upload/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Official upload instructions
        </a>
      </div>
      <p className="hosting-caption">
        Your ZIP is an independent portfolio website. Updating it on Cloudflare
        doesn’t update your saved FolioNest draft; keep your JSON backup for
        future edits.
      </p>
    </section>
  );
  return compact ? (
    <details className="hosting-details">
      <summary>Publish your ZIP for free — illustrated guide</summary>
      {content}
    </details>
  ) : (
    <div className="section" id="hosting">
      {content}
    </div>
  );
}
