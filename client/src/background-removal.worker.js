// The isolated processor may only fetch local assets.
// This also disables the runtime's optional external diagnostic transport.
const localFetch = self.fetch.bind(self);
self.fetch = (input, options = {}) => {
  const url = new URL(
    input instanceof Request ? input.url : String(input),
    self.location.href,
  );
  const method =
    options.method || (input instanceof Request ? input.method : "GET");
  if (method !== "GET" || url.origin !== self.location.origin)
    return Promise.resolve(new Response(null, { status: 204 }));
  return localFetch(input, options);
};

self.onmessage = async ({ data: photo }) => {
  const logError = console.error;
  console.error = (...args) => {
    if (
      String(args[0]).startsWith(
        "INFO: Created TensorFlow Lite XNNPACK delegate for CPU.",
      )
    )
      console.info(...args);
    else logError(...args);
  };
  let segmenter;
  let bitmap;
  let result;
  try {
    const { FilesetResolver, ImageSegmenter } =
      await import("@mediapipe/tasks-vision");
    self.postMessage({ progress: "Loading portrait tools on your device…" });
    const vision = await FilesetResolver.forVisionTasks(
      new URL("/background-runtime", self.location.origin).href,
      true,
    );
    segmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: new URL(
          "/models/selfie-segmenter.tflite",
          self.location.origin,
        ).href,
        delegate: "CPU",
      },
      runningMode: "IMAGE",
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    });
    self.postMessage({ progress: "Removing the background…" });
    const match =
      /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(photo);
    if (!match || photo.length > 171000) throw new Error("Invalid portrait.");
    const bytes = Uint8Array.from(atob(match[2]), (character) =>
      character.charCodeAt(0),
    );
    bitmap = await createImageBitmap(new Blob([bytes], { type: match[1] }));
    result = segmenter.segment(bitmap);
    const mask = result.confidenceMasks?.[1] || result.confidenceMasks?.[0];
    if (!mask) throw new Error("The portrait could not be separated.");
    const confidence = mask.getAsFloat32Array();
    const alphaCanvas = new OffscreenCanvas(mask.width, mask.height);
    const alphaContext = alphaCanvas.getContext("2d");
    const alpha = alphaContext.createImageData(mask.width, mask.height);
    let person = 0;
    for (let i = 0; i < confidence.length; i++) {
      const opacity = Math.max(0, Math.min(1, (confidence[i] - 0.15) / 0.7));
      alpha.data[i * 4 + 3] = Math.round(opacity * 255);
      if (opacity > 0.5) person++;
    }
    if (person / confidence.length < 0.02)
      throw new Error(
        "No clear person was found. Keep the original or try a closer portrait.",
      );
    alphaContext.putImageData(alpha, 0, 0);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d");
    context.drawImage(bitmap, 0, 0);
    context.globalCompositeOperation = "destination-in";
    context.drawImage(alphaCanvas, 0, 0, canvas.width, canvas.height);
    const blob = await canvas.convertToBlob({ type: "image/png" });
    self.postMessage({ blob });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error && error.message.startsWith("No clear person")
          ? error.message
          : "Portrait processing could not finish. Your original is safe. Reload and try again, or choose another photo.",
    });
  } finally {
    result?.close();
    bitmap?.close();
    segmenter?.close();
    console.error = logError;
  }
};
