import {
  portfolioSchema,
  portfolioBackground,
  publishableSchema,
  resumePortfolio,
  visiblePortfolio,
} from "@folionest/shared";
import {
  portfolioMarkup,
  staticWebsite,
  websiteBaseCss,
  websiteScript,
} from "../../shared/src/html.jsx";
import portfolioCss from "../../shared/src/portfolio.css?raw";
import resumeCss from "../../shared/src/resume.css?raw";
function download(blob, filename) {
  if (blob.size === 0 || blob.size > 30_000_000)
    throw new Error(
      "Export is empty or too large. Shorten your portfolio and try again.",
    );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function name(data) {
  return (
    data.identity.name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "portfolio"
  );
}
function paintPage(doc, background) {
  doc.saveGraphicsState();
  doc.setFillColor(background);
  doc.rect(0, 0, 210, 297, "F");
  doc.restoreGraphicsState();
}
async function capture(data, forPdf = false, resume = false) {
  const width = resume ? 794 : 960;
  const pixelRatio = resume ? 3 : 1;
  const iframe = document.createElement("iframe");
  iframe.title = "Preparing portfolio export";
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:100px;border:0;pointer-events:none`;
  document.body.append(iframe);
  try {
    const ready = new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Preview preparation timed out. Try again.")),
        10000,
      );
      iframe.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden}${portfolioCss}${resume ? resumeCss : ""}*{animation:none!important;transition:none!important}${forPdf && !resume ? ".portfolio-footer{display:none}.portfolio{padding-bottom:16px}" : ""}</style></head><body>${portfolioMarkup(data)}</body></html>`;
    await ready;
    const doc = iframe.contentDocument;
    const node = doc.querySelector(".portfolio");
    if (resume) {
      node.classList.add("portfolio-resume");
      for (const link of node.querySelectorAll("[data-contact-type]")) {
        link.textContent =
          link.dataset.contactType === "email"
            ? data.identity.email
            : data.identity.website.replace(/^https?:\/\//, "");
      }
      node.querySelector(".portfolio-footer a").textContent = "";
      const label = doc.createElement("span");
      label.textContent = "Résumé · Selected highlights";
      node.querySelector(".portfolio-footer").append(label);
    }
    await doc.fonts.ready;
    await Promise.all(
      [...node.querySelectorAll("img")].map((image) => image.decode()),
    );
    const height = Math.ceil(node.getBoundingClientRect().height);
    if (resume && height > 1123) return { height };
    if (height > 18000 || height * width * pixelRatio ** 2 > 18_000_000)
      throw new Error(
        "This portfolio is too long for a safe image export. Shorten it or export the website ZIP.",
      );
    iframe.style.height = `${height}px`;
    // Let the resized frame paint before cloning its computed layout.
    await new Promise((resolve) =>
      iframe.contentWindow.requestAnimationFrame(() =>
        iframe.contentWindow.requestAnimationFrame(resolve),
      ),
    );
    iframe.contentWindow.scrollTo(0, 0);
    const { toCanvas } = await import("html-to-image");
    let fontEmbedCSS = "";
    if (data.theme === "studio") {
      const response = await fetch("/fonts/BarlowCondensed-Black.ttf");
      if (!response.ok)
        throw new Error("The template font could not load. Try again.");
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      for (let start = 0; start < bytes.length; start += 8192)
        binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
      fontEmbedCSS = `@font-face{font-family:'Barlow Condensed';src:url(data:font/ttf;base64,${btoa(binary)}) format('truetype');font-weight:900}`;
    }
    const canvas = await toCanvas(node, {
      width,
      height,
      pixelRatio,
      skipFonts: true,
      fontEmbedCSS,
      backgroundColor: portfolioBackground(data),
    });
    const bounds = Array.from(
      node.querySelectorAll("section,article,p,h2,h3,li"),
    ).map((el) => {
      const rect = el.getBoundingClientRect();
      return { top: Math.floor(rect.top), bottom: Math.ceil(rect.bottom) };
    });
    if (
      canvas.width !== width * pixelRatio ||
      canvas.height !== height * pixelRatio
    )
      throw new Error(
        "Your browser could not capture the whole portfolio. Try a desktop browser or export the website ZIP.",
      );
    const links = resume
      ? [...node.querySelectorAll("a")]
          .filter(
            (link) =>
              link.getClientRects().length &&
              /^(https?:|mailto:)/.test(link.getAttribute("href")),
          )
          .map((link) => {
            const rect = link.getBoundingClientRect();
            return {
              url: link.getAttribute("href"),
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
            };
          })
      : [];
    return { canvas, bounds, links };
  } finally {
    iframe.remove();
  }
}
async function createResumePDF(data) {
  let page;
  for (let level = 0; level <= 3; level++) {
    page = await capture(resumePortfolio(data, level), true, true);
    if (page.canvas) break;
  }
  if (!page.canvas)
    throw new Error(
      "Your résumé needs shorter headings or contact details to fit one readable A4 page. Shorten them, or download Portfolio PDF for the complete version.",
    );
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({
    title: `${data.identity.name} — Résumé`,
    creator: "FolioNest",
  });
  paintPage(doc, portfolioBackground(data));
  doc.addImage(
    page.canvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    210,
    297,
    undefined,
    "FAST",
  );
  for (const link of page.links)
    doc.link(
      (link.x * 210) / 794,
      (link.y * 297) / 1123,
      (link.width * 210) / 794,
      (link.height * 297) / 1123,
      { url: link.url },
    );
  return doc.output("blob");
}
async function canvasBlob(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(
              new Error(
                "The image could not be created. Try a desktop browser.",
              ),
            ),
      "image/png",
    ),
  );
}
async function createPortfolioPDF(data) {
  const { canvas, bounds } = await capture(data, true);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({
    title: `${data.identity.name} — Portfolio`,
    creator: "FolioNest",
  });
  const maxHeight = Math.floor((297 / 210) * canvas.width);
  let start = 0;
  while (start < canvas.height) {
    if (start > 0) doc.addPage();
    paintPage(doc, portfolioBackground(data));
    const ideal = Math.min(start + maxHeight, canvas.height);
    let end = ideal;
    if (ideal < canvas.height) {
      const crossing = bounds.filter(
        (b) =>
          b.top < ideal &&
          b.bottom > ideal &&
          b.bottom - b.top < maxHeight * 0.7 &&
          b.top > start + maxHeight * 0.65,
      );
      if (crossing.length) end = Math.min(...crossing.map((b) => b.top));
    }
    end = Math.max(start + 1, end);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = end - start;
    const ctx = slice.getContext("2d");
    if (!ctx)
      throw new Error(
        "Your browser cannot create PDF pages. Try another browser.",
      );
    ctx.drawImage(
      canvas,
      0,
      start,
      canvas.width,
      end - start,
      0,
      0,
      canvas.width,
      end - start,
    );
    doc.addImage(
      slice.toDataURL("image/png"),
      "PNG",
      0,
      0,
      210,
      ((end - start) / canvas.width) * 210,
      undefined,
      "FAST",
    );
    start = end;
  }
  return doc.output("blob");
}
export async function exportPortfolio(format, input, _element) {
  const parsed = portfolioSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(
      "Fix the highlighted fields before exporting. Your existing draft is safe.",
    );
  const data = parsed.data;
  if (format === "json") {
    download(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      "portfolio-backup.json",
    );
    return;
  }
  if (!publishableSchema.safeParse(data).success)
    throw new Error(
      "Add your name and professional headline before exporting.",
    );
  switch (format) {
    case "resume_pdf":
      download(await createResumePDF(data), `${name(data)}-resume.pdf`);
      break;
    case "portfolio_pdf":
      download(await createPortfolioPDF(data), `${name(data)}-portfolio.pdf`);
      break;
    case "png":
      download(
        await canvasBlob((await capture(data)).canvas),
        `${name(data)}-portfolio.png`,
      );
      break;
    case "website_zip": {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      let html = staticWebsite(data);
      const visible = visiblePortfolio(data);
      const images = [
        visible.identity.photo,
        visible.identity.signature,
        ...visible.projects.map((p) => p.image),
      ].filter(Boolean);
      images.forEach((image, i) => {
        const asset = `assets/photo-${i + 1}.${image.startsWith("data:image/png;") ? "png" : image.startsWith("data:image/webp;") ? "webp" : "jpg"}`;
        zip.file(asset, image.slice(image.indexOf(",") + 1), { base64: true });
        html = html.replaceAll(image, asset);
      });
      zip.file("index.html", html);
      let exportedCss = portfolioCss;
      if (data.theme === "studio") {
        for (const asset of [
          "BarlowCondensed-Black.ttf",
          "BarlowCondensed-OFL.txt",
        ]) {
          const response = await fetch(`/fonts/${asset}`);
          if (!response.ok)
            throw new Error("The website font could not load. Try again.");
          const content = await response.arrayBuffer();
          zip.file(`fonts/${asset}`, content);
          if (asset.endsWith(".ttf")) {
            const bytes = new Uint8Array(content);
            let binary = "";
            for (let start = 0; start < bytes.length; start += 8192)
              binary += String.fromCharCode(
                ...bytes.subarray(start, start + 8192),
              );
            // An embedded font also works when index.html is opened offline via file://.
            exportedCss = exportedCss.replaceAll(
              "/fonts/BarlowCondensed-Black.ttf",
              `data:font/ttf;base64,${btoa(binary)}`,
            );
          }
        }
      }
      zip.file("styles.css", websiteBaseCss + "\n" + exportedCss);
      zip.file("script.js", websiteScript);
      zip.file(
        "README.txt",
        `Open index.html in a browser. No installation or connection to FolioNest is required.

FREE BROWSER-ONLY HOSTING: NETLIFY DROP
1. Sign up or sign in to Netlify, choosing the Free plan.
2. Open https://app.netlify.com/drop and drag this complete Website ZIP into the drop area.
3. Wait for the project page and a successful deployment. If private, choose Make public to share the visible portfolio content.
4. Open its .netlify.app address in a private browser window and on your phone to check it.

Netlify Free has a monthly usage limit; sites pause at that limit. An included address needs no custom-domain purchase.
Official instructions: https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/

UPDATING THE SAME NETLIFY ADDRESS
Download a fresh Website ZIP after editing in FolioNest. Extract it using your computer's built-in Extract All or unzip option. Open the same Netlify project and drop the extracted folder under Production deploys. The folder should contain index.html and styles.css directly inside. Keep assets and fonts alongside them.

ALREADY USING CLOUDFLARE PAGES?
Open Workers & Pages and select your Pages project. Choose Create a new deployment, select Production, upload this complete fresh ZIP and choose Save and Deploy. Wait for completion before opening the .pages.dev address.
For a new Pages project: Workers & Pages, Create application, Get started, Drag and drop your files. Name it, upload this ZIP and choose Deploy site.
Official instructions: https://developers.cloudflare.com/pages/get-started/direct-upload/

IF THE LINK IS BLANK OR HAS MISSING STYLES/PHOTOS
Check that the upload completed and open the full address shown by the host. Upload all files together. To check locally, extract this ZIP and open index.html. Compare the hosted page with Full preview at the same screen width.
Existing uploads never change automatically: replace the old deployment with a newly downloaded ZIP, then reload the page. Keep your FolioNest JSON backup for editing later.
External links only open when you click them.
`,
      );
      download(
        await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        }),
        `${name(data)}-website.zip`,
      );
      break;
    }
    default:
      throw new Error("Choose a supported export format.");
  }
}
