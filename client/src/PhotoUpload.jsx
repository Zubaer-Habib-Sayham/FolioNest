import { useId, useState, useRef, useEffect } from "react";
import { rasterDimensions, validPhoto } from "@folionest/shared";
async function preparePhoto(file) {
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
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
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
export function PhotoUpload({ label, value, onChange }) {
  const id = useId();
  const latestChange = useRef(onChange);
  latestChange.current = onChange;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <div className="field photo-upload">
      <label htmlFor={id}>{label}</label>
      <span className="field-hint" id={`${id}-hint`}>
        JPEG, PNG or WebP, up to 5 MB. Photos are resized on your device and
        included in your saved draft and exports.
      </span>
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
            const photo = await preparePhoto(file);
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
