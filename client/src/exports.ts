import {
  portfolioSchema,
  publishableSchema,
  sectionNames,
  visiblePortfolio,
  type PortfolioData,
} from "@folionest/shared";
import {
  portfolioMarkup,
  staticWebsite,
  websiteBaseCss,
  websiteScript,
} from "../../shared/src/html";
import portfolioCss from "../../shared/src/portfolio.css?raw";
import type { jsPDF } from "jspdf";

export type ExportFormat =
  "json" | "cv_pdf" | "portfolio_pdf" | "png" | "website_zip";
function download(blob: Blob, filename: string) {
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
function name(data: PortfolioData) {
  return (
    data.identity.name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "portfolio"
  );
}
function paragraph(doc: jsPDF, text: string, y: number, size = 10) {
  if (!text.trim()) return y;
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(text, 170) as string[];
  const height = size * 0.47;
  for (const line of lines) {
    if (y + height > 278) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += height;
  }
  return y + 3;
}
async function createCV(data: PortfolioData) {
  data = visiblePortfolio(data);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const response = await fetch("/fonts/NotoSans-Regular.ttf");
  if (!response.ok)
    throw new Error(
      "The CV font could not load. Try again, or use Portfolio PDF.",
    );
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let start = 0; start < bytes.length; start += 8192)
    binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
  doc.addFileToVFS("NotoSans-Regular.ttf", btoa(binary));
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans", "normal");
  const metadata = doc.getFont().metadata as {
    characterToGlyph?: (code: number) => number;
  };
  const allText = JSON.stringify(data, (key, value) =>
    ["photo", "image", "imageAlt"].includes(key) ? "" : value,
  );
  if (
    metadata.characterToGlyph &&
    [...allText].some(
      (char) =>
        char.charCodeAt(0) > 31 &&
        metadata.characterToGlyph!(char.codePointAt(0)!) === 0,
    )
  )
    throw new Error(
      "The CV font does not support some characters. Use Portfolio PDF to preserve every script and symbol, or remove unsupported symbols.",
    );
  doc.setProperties({
    title: `${data.identity.name} — CV`,
    creator: "FolioNest",
  });
  let y = paragraph(doc, data.identity.name, 22, 23);
  y = paragraph(doc, data.identity.headline, y, 12);
  const contactVisible = data.sections.find((s) => s.id === "contact")?.visible;
  y = paragraph(
    doc,
    [
      data.identity.location,
      contactVisible ? data.identity.email : "",
      contactVisible ? data.identity.website : "",
    ]
      .filter(Boolean)
      .join(" · "),
    y,
    9,
  );
  y += 5;
  for (const section of data.sections.filter((s) => s.visible)) {
    let blocks: string[] = [];
    switch (section.id) {
      case "about":
        blocks = [data.about];
        break;
      case "skills":
        blocks = [data.skills.join(" · ")];
        break;
      case "projects":
        blocks = data.projects.map((p) =>
          [p.title, p.tags, p.description, p.url].filter(Boolean).join("\n"),
        );
        break;
      case "experience":
      case "education":
      case "achievements":
        blocks = data[section.id].map((p) =>
          [
            p.title,
            [p.organization, p.period].filter(Boolean).join(" · "),
            p.description,
          ]
            .filter(Boolean)
            .join("\n"),
        );
        break;
      case "links":
        blocks = data.links.map((p) =>
          [p.label, p.url].filter(Boolean).join(" — "),
        );
        break;
      case "contact":
        blocks = [data.contact];
        break;
    }
    if (!blocks.some((x) => x.trim())) continue;
    if (y > 245) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(190, 200, 186);
    doc.line(20, y, 190, y);
    y += 8;
    doc.setTextColor(48, 73, 54);
    y = paragraph(doc, sectionNames[section.id], y, 13);
    doc.setTextColor(38, 43, 39);
    for (const block of blocks) y = paragraph(doc, block, y, 10);
    y += 4;
  }
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(110, 115, 108);
    doc.text(`${page} / ${doc.getNumberOfPages()}`, 190, 289, {
      align: "right",
    });
  }
  return doc.output("blob");
}

async function capture(data: PortfolioData) {
  const iframe = document.createElement("iframe");
  iframe.title = "Preparing portfolio export";
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.style.cssText =
    "position:fixed;left:-20000px;top:0;width:960px;height:100px;border:0;pointer-events:none";
  document.body.append(iframe);
  try {
    const ready = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Preview preparation timed out. Try again.")),
        10000,
      );
      iframe.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}${portfolioCss}*{animation:none!important;transition:none!important}</style></head><body>${portfolioMarkup(data)}</body></html>`;
    await ready;
    const doc = iframe.contentDocument!;
    await doc.fonts.ready;
    const node = doc.querySelector<HTMLElement>(".portfolio")!;
    const height = Math.ceil(node.getBoundingClientRect().height);
    if (height > 18000 || height * 960 > 18_000_000)
      throw new Error(
        "This portfolio is too long for a safe image export. Shorten it or export the website ZIP.",
      );
    iframe.style.height = `${height}px`;
    const { toCanvas } = await import("html-to-image");
    const canvas = await toCanvas(node, {
      width: 960,
      height,
      pixelRatio: 1,
      skipFonts: true,
      backgroundColor: data.appearance === "dark" ? "#19231d" : "#f8f6f0",
    });
    const bounds = Array.from(
      node.querySelectorAll<HTMLElement>("section,article,p,h2,h3,li"),
    ).map((el) => {
      const rect = el.getBoundingClientRect();
      return { top: Math.floor(rect.top), bottom: Math.ceil(rect.bottom) };
    });
    if (canvas.width !== 960 || canvas.height !== height)
      throw new Error(
        "Your browser could not capture the whole portfolio. Try a desktop browser or export the website ZIP.",
      );
    return { canvas, bounds };
  } finally {
    iframe.remove();
  }
}
async function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
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
async function createPortfolioPDF(data: PortfolioData) {
  const { canvas, bounds } = await capture(data);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({
    title: `${data.identity.name} — Portfolio`,
    creator: "FolioNest",
  });
  const maxHeight = Math.floor((277 / 190) * canvas.width);
  let start = 0;
  while (start < canvas.height) {
    if (start > 0) doc.addPage();
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
      10,
      10,
      190,
      ((end - start) / canvas.width) * 190,
      undefined,
      "FAST",
    );
    start = end;
  }
  return doc.output("blob");
}

export async function exportPortfolio(
  format: string,
  input: PortfolioData,
  _element: HTMLElement | null,
) {
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
    case "cv_pdf":
      download(await createCV(data), `${name(data)}-cv.pdf`);
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
        ...visible.projects.map((p) => p.image),
      ].filter(Boolean);
      images.forEach((image, i) => {
        const asset = `assets/photo-${i + 1}.jpg`;
        zip.file(asset, image.slice(23), { base64: true });
        html = html.replaceAll(image, asset);
      });
      zip.file("index.html", html);
      zip.file("styles.css", websiteBaseCss + "\n" + portfolioCss);
      zip.file("script.js", websiteScript);
      zip.file(
        "README.txt",
        "Open index.html in a browser. Upload all files together to any static host. No installation, server, account or connection to FolioNest is required. External links only open when you click them.",
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
