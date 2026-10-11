import { useId } from "react";
function PublishTutorial({ compact }) {
  const titleId = useId();
  const title = "Publish your portfolio, step by step";
  return (
    <section className="publish-tutorial" aria-labelledby={titleId}>
      <div>
        <p className="eyebrow">Watch the walkthrough</p>
        {compact ? (
          <h3 id={titleId}>{title}</h3>
        ) : (
          <h2 id={titleId}>{title}</h2>
        )}
        <p>
          Follow Zubaer Habib Sayham’s video to turn your downloaded Website ZIP
          into a link you can share.
        </p>
      </div>
      <a
        className="tutorial-video"
        href="https://youtu.be/2kCjUCnunng"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Watch FolioNest Website Publish Tutorial on YouTube (opens a new tab)"
      >
        <img
          src="/guides/publish-video.jpg"
          width="480"
          height="360"
          loading="lazy"
          alt="Thumbnail for FolioNest Website Publish Tutorial"
        />
        <span>Watch on YouTube</span>
      </a>
      <p className="hosting-caption">
        The video opens on YouTube when you choose to watch. The illustrated
        instructions are below.
      </p>
    </section>
  );
}
export default function HostingGuide({ compact = false }) {
  const headingId = useId();
  const steps = [
    {
      image: "download",
      title: "Download your finished website",
      text: "In Review & export, choose Website ZIP. Find the new file ending in -website.zip in Downloads. Your layout, colors and photos are inside. Keep a JSON backup for future editing.",
    },
    {
      image: "dashboard",
      title: "Sign in and open Netlify Drop",
      text: "Use the Open Netlify Drop button below. Sign up or sign in and choose the Free plan. Then open app.netlify.com/drop again. Signing in lets you keep and update this website.",
    },
    {
      image: "upload",
      title: "Drop your Website ZIP",
      text: "Drag the downloaded -website.zip onto the large drop area. Wait for the upload to finish and the project page to appear. Keep the complete ZIP together so the styles and photos arrive too.",
    },
    {
      image: "live",
      title: "Make public, then check your link",
      text: "If the project is private, choose Make public once its deployment succeeds. Open the address ending in .netlify.app. Check it in a private browser window and on your phone before sharing.",
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
        Give your downloaded portfolio a link with Netlify Drop using just your
        browser. Choose its Free plan. No extra app or code is needed.
      </p>
      <ol className="hosting-steps">
        {steps.map((step, i) => (
          <li key={step.image}>
            <a
              href={`/guides/${step.image}.svg`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open a larger illustration for step ${i + 1}: ${step.title}`}
            >
              <img
                src={`/guides/${step.image}.svg`}
                width="720"
                height="400"
                loading="lazy"
                alt={`Step ${i + 1} illustration: ${step.title}`}
              />
            </a>
            <span className="hosting-step-number" aria-hidden="true">
              0{i + 1}
            </span>
            {compact ? <h4>{step.title}</h4> : <h3>{step.title}</h3>}
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <p className="hosting-caption">
        Tap an illustration to view it larger. Illustrations show the idea of
        each step; the hosting dashboard may look a little different. The
        included address needs no domain purchase. Netlify Free has a monthly
        usage limit; sites pause if it is reached.
      </p>
      <div className="hosting-actions">
        <a
          className="button"
          href="https://app.netlify.com/drop"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Netlify Drop
        </a>
        <a
          href="https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Official upload instructions
        </a>
      </div>
      <details className="hosting-help">
        <summary>Update your link or fix an upload</summary>
        <dl>
          <dt>How do I update my existing website?</dt>
          <dd>
            Download a fresh Website ZIP after your edits. On Netlify, open the
            same project and find Production deploys. Extract the new ZIP using
            your computer’s built-in Extract All or unzip option, then drop that
            folder there. The folder should show index.html and styles.css
            directly inside. This replaces the site at the same address.
          </dd>
          <dt>My link asks visitors to sign in.</dt>
          <dd>
            On Netlify, choose Make public in the project. You can also open
            Project configuration, General, Visitor access, Project visibility
            and set production to Public. Confirm you want the visible portfolio
            content shared.
          </dd>
          <dt>I see a blank page, a 404, or missing photos.</dt>
          <dd>
            Wait until the upload has succeeded. Open the complete address the
            host shows. If files are missing, upload the entire fresh ZIP again;
            keep index.html, styles.css and the assets folder together.
            Extracting the ZIP and opening index.html locally lets you check the
            files before another upload.
          </dd>
          <dt>The hosted layout still looks like the old version.</dt>
          <dd>
            Existing uploads do not change when you edit here. Replace the old
            deployment with a newly downloaded ZIP, then reload the hosted page.
            Compare it with Full preview at the same screen width.
          </dd>
        </dl>
      </details>
      <details className="hosting-help">
        <summary>Already using Cloudflare Pages?</summary>
        <p>
          Keep your existing address: open Workers &amp; Pages, select your
          Pages project, then Create a new deployment. Choose Production, upload
          the fresh Website ZIP and select Save and Deploy. Wait for completion,
          then open the project’s .pages.dev address.
        </p>
        <p>
          For a new project, open Workers &amp; Pages, Create application, Get
          started, then Drag and drop your files. Enter a name, drop your
          Website ZIP and choose Deploy site. This upload path is for Pages.
          Follow the host’s labels if its dashboard changes.
        </p>
        <a
          href="https://developers.cloudflare.com/pages/get-started/direct-upload/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cloudflare Pages upload instructions
        </a>
      </details>
      <p className="hosting-caption">
        Your ZIP is an independent portfolio website. Updating it on a host
        doesn’t update your saved FolioNest draft; keep your JSON backup for
        future edits.
      </p>
    </section>
  );
  return compact ? (
    <>
      <PublishTutorial compact />
      <details className="hosting-details">
        <summary>Publish your ZIP for free — illustrated guide</summary>
        {content}
      </details>
    </>
  ) : (
    <div className="section" id="hosting">
      <PublishTutorial />
      {content}
    </div>
  );
}
