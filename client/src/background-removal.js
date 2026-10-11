export function removePortraitBackground(photo, progress, signal) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./background-removal.worker.js", import.meta.url),
      { type: "module" },
    );
    const finish = (error, blob) => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      worker.terminate();
      if (error) reject(error);
      else resolve(blob);
    };
    const cancel = () => finish(new DOMException("Cancelled", "AbortError"));
    const timer = setTimeout(
      () =>
        finish(
          new Error(
            "Portrait processing took too long. Your original is safe; try a smaller or closer photo.",
          ),
        ),
      45000,
    );
    signal?.addEventListener("abort", cancel, { once: true });
    worker.onmessage = ({ data }) => {
      if (data.progress) progress(data.progress);
      else if (data.blob) finish(null, data.blob);
      else
        finish(
          new Error(
            data.error || "Background removal failed. Your original is safe.",
          ),
        );
    };
    worker.onerror = () =>
      finish(
        new Error(
          "Portrait tools could not load. Keep the original, or reload and try again.",
        ),
      );
    if (signal?.aborted) cancel();
    else worker.postMessage(photo);
  });
}
