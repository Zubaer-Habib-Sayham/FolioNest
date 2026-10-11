import { useId, useState, useRef, useEffect } from "react";
import { rasterDimensions, validPhoto } from "@folionest/shared";
async function preparePhoto(file, transparent = false) {
  if (file.size > 5_000_000) throw new Error("Choose a photo under 5 MB.");
  const source = new Uint8Array(await file.arrayBuffer());
  const dimensions = rasterDimensions(source);
  if (
    !dimensions.width ||
    !dimensions.height ||
    dimensions.width * dimensions.height > 24_000_000 ||
    Math.max(dimensions.width, dimensions.height) > 12000
  )
    throw new Error(
      "Choose a photo under 24 megapixels and 12,000 pixels wide or high.",
    );
  const bitmap = await createImageBitmap(
    new Blob([source], { type: dimensions.type }),
  );
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot prepare photos.");
    if (!transparent) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (transparent) {
      for (const quality of [0.92, 0.86, 0.76, 0.62, 0.48]) {
        const photo = canvas.toDataURL("image/webp", quality);
        if (validPhoto(photo)) return photo;
      }
      for (const maximum of [
        1200, 960, 768, 600, 480, 384, 320, 256, 224, 192,
      ]) {
        const output = document.createElement("canvas");
        const resize = Math.min(
          1,
          maximum / Math.max(canvas.width, canvas.height),
        );
        output.width = Math.max(1, Math.round(canvas.width * resize));
        output.height = Math.max(1, Math.round(canvas.height * resize));
        output
          .getContext("2d")
          .drawImage(canvas, 0, 0, output.width, output.height);
        const photo = output.toDataURL("image/png");
        if (validPhoto(photo)) return photo;
      }
      throw new Error(
        "This cutout is too detailed to save. Keep the original or crop it and try again.",
      );
    }
    for (const quality of [0.86, 0.72, 0.55, 0.38, 0.24]) {
      const photo = canvas.toDataURL("image/jpeg", quality);
      if (validPhoto(photo)) return photo;
    }
    throw new Error(
      "This photo is too detailed to save safely. Crop or reduce it and try again.",
    );
  } finally {
    bitmap.close();
  }
}
export function PhotoUpload({
  label,
  value,
  onChange,
  backgroundRemoval = false,
  original = "",
  transparent = false,
}) {
  const id = useId();
  const latestChange = useRef(onChange);
  latestChange.current = onChange;
  const latestValue = useRef(value);
  latestValue.current = value;
  const operation = useRef(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      operation.current?.abort();
    };
  }, []);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function removeBackground() {
    const source = value;
    const controller = new AbortController();
    operation.current = controller;
    setBusy(true);
    setNotice("Loading portrait tools on your device…");
    try {
      const { removePortraitBackground } =
        await import("./background-removal.js");
      const blob = await removePortraitBackground(
        source,
        setNotice,
        controller.signal,
      );
      const cutout = await preparePhoto(blob, true);
      if (
        !mounted.current ||
        controller.signal.aborted ||
        latestValue.current !== source
      )
        return;
      latestChange.current(cutout, source);
      setNotice(
        "Background removed in the live preview. Keep it, or use the original photo below.",
      );
    } catch (error) {
      if (mounted.current && error.name !== "AbortError")
        setNotice(
          error.message || "Background removal failed. Your original is safe.",
        );
    } finally {
      operation.current = null;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <div className="field photo-upload">
      <label htmlFor={id}>{label}</label>
      <span className="field-hint" id={`${id}-hint`}>
        JPEG, PNG or WebP, up to 5 MB. Photos are resized on your device and
        included in your saved draft and exports.
      </span>
      {backgroundRemoval && (
        <p className="field-hint">
          For a person’s portrait, try Remove background to see a cutout live.
          Processing stays on your device; the first use loads portrait tools.
          You can return to the original.
        </p>
      )}
      {value && (
        <img src={value} alt={`${label} preview`} width="96" height="96" />
      )}
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        aria-describedby={`${id}-hint`}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setNotice("Preparing photo…");
          try {
            const photo = await preparePhoto(file, transparent);
            if (!mounted.current) return;
            latestChange.current(photo);
            setNotice("Photo added. Original file metadata is removed.");
          } catch (error) {
            setNotice(
              error instanceof Error
                ? error.message
                : "This photo could not be read. Choose another.",
            );
          } finally {
            setBusy(false);
          }
        }}
      />
      {backgroundRemoval && value && !original && (
        <button
          className="secondary"
          disabled={busy}
          onClick={removeBackground}
        >
          Remove background
        </button>
      )}
      {original && (
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            onChange(original, "");
            setNotice("Original photo restored.");
          }}
        >
          Use original photo
        </button>
      )}
      {busy && operation.current && (
        <button
          className="text-button"
          onClick={() => {
            operation.current.abort();
            setNotice("Cancelled. Original photo kept.");
          }}
        >
          Cancel background removal
        </button>
      )}
      {value && (
        <button
          className="text-button"
          disabled={busy}
          onClick={() => {
            onChange("");
            setNotice("Photo removed.");
          }}
        >
          Remove {label.toLowerCase()}
        </button>
      )}
      <span role="status">{notice}</span>
    </div>
  );
}
